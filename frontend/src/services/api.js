import {modoDemo,modoOriginalDemo} from '../lib/runtimeDemo';
import {auth,sessao,sessaoExistente} from '../lib/firebase';
import {configuracaoAplicacao} from '../lib/ambienteAplicacao';
const configuracao=configuracaoAplicacao(import.meta.env,window.location.hostname);
export const lojaId = configuracao.lojaId;
const base = configuracao.base;
export const publico = `/publico/lojas/${encodeURIComponent(lojaId)}`;
export const pedidos = `/lojas/${encodeURIComponent(lojaId)}/pedidos`;
const credenciaisInvalidas = new Set(['auth/user-token-expired','auth/invalid-user-token','auth/user-disabled','auth/user-not-found']);
const mensagens = {
  400:'Confira os dados informados.',401:'Sessão expirada. Entre novamente.',403:'Acesso negado.',404:'Recurso não encontrado.',
  409:'Conflito na operação. Confira sua tentativa.',413:'Requisição excede o tamanho permitido.',415:'Formato não suportado.',
  429:'Limite de requisições excedido. Tente novamente mais tarde.',500:'Não foi possível concluir a operação.',503:'Serviço temporariamente indisponível. Tente novamente.',
};
const falha = (message,status,code,requestId) => Object.assign(new Error(message),{status,code,...(requestId?{requestId}:{})});

export async function api(path,{privado=true,method='GET',body,chave,signal,administrativo=false,expectedUid,timeoutMs=modoOriginalDemo(import.meta.env)?90000:20000}={}) {
  if(modoDemo(import.meta.env) && (path!=='/publico/lojas/loja-demo/catalogo' || method!=='GET' || privado || administrativo || body!==undefined))throw falha('Recurso indisponível nesta demonstração.',403,'DEMO_READONLY');
  const controller=new AbortController();
  const cancelada=()=>controller.abort();
  if(signal?.aborted)cancelada();else signal?.addEventListener('abort',cancelada,{once:true});
  let tempoEsgotado=false;
  const timer=setTimeout(()=>{tempoEsgotado=true;controller.abort();},timeoutMs);
  const erroAbort=()=>tempoEsgotado?falha('Tempo limite excedido. Tente novamente para recuperar sua tentativa.',503,'TIMEOUT'):new DOMException('Requisição cancelada.','AbortError');
  const abortada=new Promise((_,reject)=>{
    if(controller.signal.aborted)reject(erroAbort());
    else controller.signal.addEventListener('abort',()=>reject(erroAbort()),{once:true});
  });
  abortada.catch(()=>{});
  const aguardar=promise=>Promise.race([promise,abortada]);
  function conferirSessao(user) {
    if(controller.signal.aborted)throw erroAbort();
    if(user && ((expectedUid && user.uid!==expectedUid) || (auth && auth.currentUser?.uid!==user.uid)))throw falha('A sessão mudou. Confira seus dados e tente novamente.',409,'SESSION_CHANGED');
  }
  function falhaSessao(error) {
    if(error.code==='auth/network-request-failed')return falha('Não foi possível validar a sessão. Verifique sua conexão e tente novamente.',503,'AUTH_UNAVAILABLE');
    if(credenciaisInvalidas.has(error.code))return falha('Sessão expirada ou revogada. Entre novamente.',401,'AUTH_INVALID');
    if(error.status===401)return falha('Entre com uma conta administrativa.',401,'AUTH_INVALID');
    if(error.code==='TIMEOUT' || error.name==='AbortError')return error;
    return falha('Não foi possível validar a sessão. Tente novamente.',error.status===503?503:500,'AUTH_UNAVAILABLE');
  }
  try {
    conferirSessao(null);
    let user;const uidInicial=auth?.currentUser?.uid;
    try {user=privado?await aguardar(administrativo?sessaoExistente():sessao()):null;}
    catch(error){if(uidInicial && auth?.currentUser?.uid!==uidInicial)throw falha('A sessão mudou. Confira seus dados e tente novamente.',409,'SESSION_CHANGED');throw falhaSessao(error);}
    async function enviar(force=false) {
      conferirSessao(user);
      const headers={'Content-Type':'application/json'};
      if(user) {
        try {headers.Authorization=`Bearer ${await aguardar(user.getIdToken(force))}`;}
        catch(error){conferirSessao(user);throw falhaSessao(error);}
      }
      conferirSessao(user);
      if(chave)headers['Idempotency-Key']=chave;
      try {
        const resposta=await aguardar(fetch(base+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body),signal:controller.signal}));
        conferirSessao(user);return resposta;
      }catch(error) {
        if(controller.signal.aborted)throw erroAbort();
        if(error.code==='SESSION_CHANGED')throw error;
        throw falha('Não foi possível conectar. Verifique sua conexão e tente novamente.',503,'NETWORK');
      }
    }
    let response=await enviar();
    // Somente leitura ou POST de pedido protegido por nonce pode ser reenviado.
    const seguro=['GET','HEAD','OPTIONS'].includes(method) || (method==='POST' && chave && /^\/lojas\/[^/]+\/pedidos\/?$/.test(path));
    if(response.status===401 && user && seguro)response=await enviar(true);
    let data=null;
    if(response.status!==204) {
      try {data=await aguardar(response.json());}
      catch(error){if(controller.signal.aborted)throw erroAbort();if(response.ok)throw falha('Resposta inválida do servidor. Tente recuperar sua tentativa.',502,'RESPONSE_INVALID');}
    }
    conferirSessao(user);
    const id=response.headers?.get?.('X-Request-ID');
    const requestId=/^[\da-f-]{36}$/i.test(id || '')?id:undefined;
    if(!response.ok) {
      const mensagem=response.status<500 && typeof data?.error==='string' && data.error.length<=1000?data.error:mensagens[response.status] || 'Não foi possível concluir a operação.';
      throw falha(mensagem,response.status,'HTTP',requestId);
    }
    if(response.status!==204 && (!data || typeof data!=='object'))throw falha('Resposta inválida do servidor. Tente recuperar sua tentativa.',502,'RESPONSE_INVALID',requestId);
    return data;
  }catch(error) {
    // Somente rejeição efetiva da sessão atual remove o acesso administrativo.
    if(administrativo && [401,403].includes(error.status))window.dispatchEvent(new Event('admin:sessao-invalida'));
    throw error;
  }finally{clearTimeout(timer);signal?.removeEventListener('abort',cancelada);}
}
