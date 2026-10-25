import {notificar} from '../../lib/notificacoes';
import CampoSenha from '../ui/CampoSenha';
import {PageLoader} from '../ui/PageLoader';
import {aguardarLeitura,LIMITE_LEITURA_MS} from '../../lib/carregamento';
import React,{createContext,useContext,useEffect,useState,useRef} from 'react';
import {onIdTokenChanged} from 'firebase/auth';
import {auth} from '../../lib/firebase';
import {admin} from '../../services/admin';
import {entrar,sair} from '../../services/conta';
const Context=createContext(null);
export const useAdminSessao=()=>useContext(Context);
function AdminGate({children}) {
  const [sessao,setSessao]=useState(null),[erro,setErro]=useState(''),[carregando,setCarregando]=useState(true),[ocupado,setOcupado]=useState(false);
  const uidAutorizado=useRef(null),loginSolicitado=useRef(false);
  useEffect(()=>{
    let ativo=true,versao=0;
    const timer=setTimeout(()=>{if(ativo){versao++;setCarregando(false);setErro('Não foi possível verificar sua sessão. Tente novamente.');}},LIMITE_LEITURA_MS);
    async function verificar(user=auth?.currentUser) {
      clearTimeout(timer);const atual=++versao;setErro('');if(!user || user.uid!==uidAutorizado.current){uidAutorizado.current=null;setSessao(null);setCarregando(true);}
      try {if (!auth) throw new Error('Autenticação não configurada.');if(!user || user.isAnonymous)throw new Error('Entre com uma conta administrativa.');const dados=await aguardarLeitura(async()=>{await auth.authStateReady?.();return admin.sessao();});if(ativo && atual===versao){uidAutorizado.current=user.uid;setSessao(dados);if(loginSolicitado.current){loginSolicitado.current=false;notificar('sucesso','Acesso ao painel autorizado.');}}} catch(e){if(ativo && atual===versao){uidAutorizado.current=null;setSessao(null);if(loginSolicitado.current){loginSolicitado.current=false;setErro('');notificar('erro',e.message);}else setErro(e.message);}} finally {if(ativo && atual===versao)setCarregando(false);}
    }
    const cancelar=auth?onIdTokenChanged(auth,verificar):null;if(!auth)verificar();
    const invalidar=()=>{versao++;uidAutorizado.current=null;setSessao(null);setCarregando(false);if(loginSolicitado.current){loginSolicitado.current=false;setErro('');notificar('erro','Acesso negado ao painel administrativo.');}else setErro('Sessão inválida ou acesso negado. Entre novamente com um administrador da loja.');};
    const foco=()=>verificar();window.addEventListener('admin:sessao-invalida',invalidar);window.addEventListener('focus',foco);
    return()=>{clearTimeout(timer);ativo=false;versao++;cancelar?.();window.removeEventListener('admin:sessao-invalida',invalidar);window.removeEventListener('focus',foco);};
  },[]);
  async function login(event) {event.preventDefault();if(ocupado)return;setOcupado(true);setErro('');loginSolicitado.current=true;try{const form=new FormData(event.target);await entrar(form.get('email'),form.get('senha'),...(auth?.currentUser?.isAnonymous?[{trocarConta:true}]:[]));}catch(e){loginSolicitado.current=false;setErro('');notificar('erro',e.message);}finally{setOcupado(false);}}
  if(carregando)return <PageLoader/>;
  if(sessao)return <Context.Provider value={{...sessao,atualizarLoja:loja=>setSessao(atual=>atual && atual.uid===sessao.uid ? {...atual,loja:{id:loja.id,nome:loja.nome}} : atual),sair:async()=>{uidAutorizado.current=null;setSessao(null);try{await sair();notificar('sucesso','Você saiu da sua conta.');}catch(e){setErro('');notificar('erro','Não foi possível sair. Tente novamente.');}}}}>{children}</Context.Provider>;
  return <main className="login-page"><div className="login-container"><div className="login-card"><div className="login-header"><h1>Acesso administrativo</h1><p>Entre com a conta autorizada para esta loja.</p></div>{carregando?<p role="status">Verificando acesso...</p>:<>{erro && <p role="alert">{erro} <button type="button" onClick={()=>window.dispatchEvent(new Event('focus'))}>Tentar novamente</button></p>}<p>Ao entrar, o histórico de convidado permanece separado da conta administrativa. Para preservá-lo, crie uma conta de cliente antes de trocar de sessão.</p><form aria-busy={ocupado} className="login-form" onSubmit={login}><div className="form-group"><label htmlFor="admin-email">E-mail</label><input id="admin-email" name="email" type="email" autoComplete="username" required/></div><div className="form-group"><label htmlFor="admin-senha">Senha</label><CampoSenha id="admin-senha" name="senha"  autoComplete="current-password" required/></div><button type="submit" className="button button-primary" disabled={ocupado}>Entrar no painel</button></form><a href="/">Voltar ao catálogo</a></>}</div></div></main>;
}
export default AdminGate;
