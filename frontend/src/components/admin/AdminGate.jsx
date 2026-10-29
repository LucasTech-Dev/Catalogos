import {useIdentidadeLoja} from '../../hooks/useIdentidadeLoja';
import MaterialIcon from '../ui/MaterialIcon';
import './AdminGate.css';
import {notificar} from '../../lib/notificacoes';
import BotaoGoogle from '../ui/BotaoGoogle';
import CampoSenha from '../ui/CampoSenha';
import {PageLoader} from '../ui/PageLoader';
import {aguardarLeitura,LIMITE_LEITURA_MS} from '../../lib/carregamento';
import React,{createContext,useContext,useEffect,useState,useRef} from 'react';
import {onIdTokenChanged} from 'firebase/auth';
import {auth} from '../../lib/firebase';
import {admin} from '../../services/admin';
import {entrar,sair} from '../../services/conta';
// Apenas mensagens de apresentação; a autorização continua no serviço/Rules.
function avisoAcesso(e,login=false){
 if(e.status===403||e.code==='permission-denied')return {mensagem:'Esta conta não possui acesso administrativo a esta loja.',recuperavel:false};
 if(e.status===503||['LEITURA_TIMEOUT','auth/network-request-failed','unavailable'].includes(e.code)||/conexão|conectar/i.test(e.message || ''))return {mensagem:'Não foi possível conectar. Tente novamente.',recuperavel:!login};
 return {mensagem:login?'Não foi possível entrar. Confira seus dados e tente novamente.':'Não foi possível verificar o acesso. Entre com uma conta autorizada.',recuperavel:false};
}
const Context=createContext(null);
export const useAdminSessao=()=>useContext(Context);
function AdminGate({children}) {
  const travaSaida=useRef(false);
  const [sessao,setSessao]=useState(null),[erro,setErro]=useState(''),[carregando,setCarregando]=useState(true),[ocupado,setOcupado]=useState(false),[recuperavel,setRecuperavel]=useState(false);
  const lojaVisual = useIdentidadeLoja(sessao?.loja);
  const uidAutorizado=useRef(null),loginSolicitado=useRef(false),travaLogin=useRef(false);
  useEffect(()=>{
    let ativo=true,versao=0,consulta=null;
    const timer=setTimeout(()=>{if(ativo){versao++;setCarregando(false);setErro('Não foi possível conectar. Tente novamente.');setRecuperavel(true);}},LIMITE_LEITURA_MS);
    async function verificar(user=auth?.currentUser) {
      if(user&&travaSaida.current)return;
      if(user&&consulta?.uid===user.uid)return consulta.promessa;
      let promessa;
      clearTimeout(timer);const atual=++versao;setErro('');setRecuperavel(false);if(!user || user.uid!==uidAutorizado.current){uidAutorizado.current=null;setSessao(null);setCarregando(true);}
      try {if (!auth) throw new Error('Autenticação não configurada.');if(!user || user.isAnonymous)throw new Error('Entre com uma conta administrativa.');promessa=aguardarLeitura(()=>admin.sessao());consulta={uid:user.uid,promessa};const dados=await promessa;if(ativo && atual===versao&&!travaSaida.current){uidAutorizado.current=user.uid;setSessao(dados);if(loginSolicitado.current){loginSolicitado.current=false;notificar('sucesso','Acesso ao painel autorizado.');}}} catch(e){if(ativo && atual===versao){uidAutorizado.current=null;setSessao(null);const aviso=avisoAcesso(e);loginSolicitado.current=false;setErro(!user&&auth?'':aviso.mensagem);setRecuperavel(Boolean(user)&&aviso.recuperavel);}} finally {if(consulta?.promessa===promessa)consulta=null;if(ativo && atual===versao)setCarregando(false);}
    }
    const cancelar=auth?onIdTokenChanged(auth,verificar):null;if(!auth)verificar();
    const invalidar=()=>{versao++;uidAutorizado.current=null;setSessao(null);setCarregando(false);loginSolicitado.current=false;setRecuperavel(false);setErro('Esta conta não possui acesso administrativo a esta loja.');};
    const foco=()=>verificar();window.addEventListener('admin:sessao-invalida',invalidar);window.addEventListener('focus',foco);
    return()=>{clearTimeout(timer);ativo=false;versao++;cancelar?.();window.removeEventListener('admin:sessao-invalida',invalidar);window.removeEventListener('focus',foco);};
  },[]);
  async function login(event) {event.preventDefault();if(travaLogin.current||ocupado)return;travaLogin.current=true;setOcupado(true);setErro('');setRecuperavel(false);loginSolicitado.current=true;try{const form=new FormData(event.target);await entrar(form.get('email'),form.get('senha'),...(auth?.currentUser?.isAnonymous?[{trocarConta:true}]:[]));}catch(e){loginSolicitado.current=false;const aviso=avisoAcesso(e,true);setErro(aviso.mensagem);setRecuperavel(false);}finally{travaLogin.current=false;setOcupado(false);}}
  if(carregando)return <PageLoader/>;
  if(sessao)return <Context.Provider value={{...sessao,loja:lojaVisual,atualizarLoja:loja=>setSessao(atual=>atual && atual.uid===sessao.uid ? {...atual,loja:{id:loja.id,nome:loja.nome}} : atual),sair:async()=>{if(travaSaida.current)return;travaSaida.current=true;setOcupado(true);uidAutorizado.current=null;setSessao(null);try{await sair();notificar('sucesso','Você saiu da sua conta.');}catch(e){setErro('Não foi possível sair. Tente novamente.');}finally{travaSaida.current=false;setOcupado(false);}}}}>{children}</Context.Provider>;
  return <main className="login-page admin-access-page"><div className="login-container"><section className="login-card" aria-labelledby="admin-access-title">
    <header className="login-header"><div className="admin-access-icon"><MaterialIcon name="storefront" size={28}/></div><h1 id="admin-access-title">Acesso administrativo</h1><p>Entre com uma conta autorizada para esta loja</p></header>
    {erro&&<div className="admin-access-alert" role="alert"><MaterialIcon name="error" size={20}/><div><p>{erro}</p>{recuperavel&&<button type="button" className="button button-secondary" disabled={ocupado} onClick={()=>window.dispatchEvent(new Event('focus'))}>Tentar novamente</button>}</div></div>}
    <form aria-busy={ocupado} className="login-form" onSubmit={login}><div className="form-group"><label htmlFor="admin-email">E-mail</label><input id="admin-email" name="email" type="email" autoComplete="username" placeholder="seuemail@email.com" required disabled={ocupado}/></div><div className="form-group"><label htmlFor="admin-senha">Senha</label><CampoSenha id="admin-senha" name="senha" autoComplete="current-password" placeholder="Digite sua senha" required disabled={ocupado}/></div><button type="submit" className="button button-primary login-submit" disabled={ocupado} aria-busy={ocupado}>{ocupado&&<span className="admin-access-spinner" aria-hidden="true"/>}{ocupado?(travaSaida.current?'Saindo...':'Entrando...'):'Entrar no painel'}</button></form>
    <div className="login-divider"><span>ou continue com</span></div>
    <BotaoGoogle destino="/admin" disabled={ocupado} textoOcupado="Entrando..." formatarErro={e=>avisoAcesso(e,true).mensagem} onBusyChange={busy=>{setOcupado(busy);if(busy){setErro('');setRecuperavel(false);}}}/>
    <a className="admin-access-back" href="/"><MaterialIcon name="arrow_back" size={18}/>Voltar ao catálogo</a>
    <aside className="admin-access-info"><MaterialIcon name="info" size={20}/><p>O histórico de convidado fica separado da conta administrativa. Para preservá-lo, crie uma conta de cliente antes de trocar de sessão.</p></aside>
  </section></div></main>;
}
export default AdminGate;
