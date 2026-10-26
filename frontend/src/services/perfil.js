import {textoBemFormado} from '../lib/textoBemFormado.js';
import {collection,doc,getDocFromServer,getDocsFromServer,runTransaction} from 'firebase/firestore';

const falha=(message,status)=>Object.assign(new Error(message),{status});
const identificar=id=>{if(typeof id!=='string' || !id || id.length>128 || /[\/\\\u0000-\u001f\u007f-\u009f]/u.test(id) || ['.','..'].includes(id))throw falha('Identificador inválido.',400);return id;};
const selecionar=(d,campos)=>Object.fromEntries(campos.filter(k=>typeof d?.[k]==='string').map(k=>[k,d[k]]));
const camposEndereco=['apelido','rua','numero','bairro','cidade','uf','complemento','cep'];
function texto(v,n,obrigatorio=false,max=200){if(typeof v!=='string' || !textoBemFormado(v) || v.length>max || (obrigatorio && !v.trim()) || /[\u0000-\u001f\u007f-\u009f]/u.test(v))throw falha(n+' inválido.',400);return v.trim();}
function campos(d,permitidos){if(!d || typeof d!=='object' || Array.isArray(d) || Object.keys(d).some(k=>!permitidos.includes(k)))throw falha('Campo não permitido nesta operação.',400);}
export function validarPerfil(d){campos(d,['nome','telefone']);const nome=texto(d.nome,'Nome',true),telefone=texto(d.telefone,'Telefone',true,25),digitos=telefone.replace(/\D/g,'');if(!/^\+?[\d ()-]+$/.test(telefone) || digitos.length<10 || digitos.length>15 || /^0+$/.test(digitos))throw falha('Telefone inválido.',400);return {nome,telefone};}
export function validarEndereco(d){campos(d,camposEndereco);const saida={};for(const k of ['rua','numero','bairro','cidade'])saida[k]=texto(d[k],k,true);saida.uf=texto(d.uf,'UF',true,2).toUpperCase();if(!'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ').includes(saida.uf))throw falha('UF inválida.',400);for(const k of ['apelido','complemento'])if(d[k]!==undefined)saida[k]=texto(d[k],k);if(d.cep!==undefined){saida.cep=texto(d.cep,'CEP',false,9);if(saida.cep && !/^\d{5}-?\d{3}$/.test(saida.cep))throw falha('CEP inválido.',400);}return saida;}

// Dependências explícitas permitem testar o mesmo serviço contra Emulators.
// UID vem sempre da sessão; nenhum chamador escolhe o proprietário.
export function criarServicoPerfil({db,auth,sessao,lojaId}) {
  async function executar(operacao,expectedUid=auth?.currentUser?.uid){
    try {
      identificar(lojaId);if(!db)throw falha('Conta não configurada.',503);
      const user=await sessao(),uid=user.uid;
      const conferir=()=>{if(auth.currentUser?.uid!==uid || expectedUid && expectedUid!==uid)throw falha('A sessão mudou. Confira seus dados e tente novamente.',409);};
      conferir();const ref=doc(db,'lojas',lojaId,'clientes',uid);
      const resultado=await operacao({user,ref,conferir});conferir();return resultado;
    }catch(e){if(e.status)throw e;if(e.code==='permission-denied')throw falha('Acesso negado.',403);if(e.code==='not-found')throw falha('Endereço não encontrado.',404);throw falha('Não foi possível acessar sua conta. Verifique sua conexão e tente novamente.',503);}
  }
  return {
    buscarPerfil:()=>executar(async({user,ref,conferir})=>{const perfil=await getDocFromServer(ref);conferir();const origem=perfil.exists()?perfil:await getDocFromServer(doc(db,'usuarios',user.uid));return {...(user.displayName?{nome:user.displayName}:{}),...selecionar(origem.data(),['nome','telefone']),uid:user.uid,email:user.email || '',anonimo:user.isAnonymous,senhaDisponivel:user.providerData?.some(p=>p.providerId==='password') ?? false};}),
    salvarPerfil:(dados,expectedUid)=>{const perfil=validarPerfil(dados);return executar(async({user,ref,conferir})=>{await runTransaction(db,async t=>{conferir();t.set(ref,{...perfil,email:user.email || '',anonimo:user.isAnonymous},{merge:true});});return perfil;},expectedUid);},
    listarEnderecos:()=>executar(async({ref})=>{const lista=await getDocsFromServer(collection(ref,'enderecos'));return lista.docs.map(d=>({...selecionar(d.data(),[...camposEndereco,'logradouro']),id:d.id}));}),
    salvarEndereco:(id,dados,expectedUid)=>{const endereco=validarEndereco(dados);return executar(async({ref,conferir})=>{const destino=id?doc(ref,'enderecos',identificar(id)):doc(collection(ref,'enderecos'));conferir();if(id)await runTransaction(db,async t=>{const atual=await t.get(destino);conferir();if(!atual.exists())throw falha('Endereço não encontrado.',404);t.set(destino,endereco);});else await runTransaction(db,async t=>{conferir();t.set(destino,endereco);});return {...endereco,id:destino.id};},expectedUid);},
    excluirEndereco:(id,expectedUid)=>executar(async({ref,conferir})=>{const destino=doc(ref,'enderecos',identificar(id));await runTransaction(db,async t=>{conferir();t.delete(destino);});},expectedUid)
  };
}
