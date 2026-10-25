import React,{useRef,useState} from 'react';
import {entrarGoogle} from '../../services/conta';
import {FeedbackAcao} from './ToastProvider';
import {notificarAoNavegar} from '../../lib/notificacoes';
export default function BotaoGoogle({disabled=false,onBusyChange}) {
 const [ocupado,setOcupado]=useState(false),[erro,setErro]=useState(''),[conflito,setConflito]=useState(false);const trava=useRef(false);
 async function entrar(trocarConta=false){
  if(trava.current||disabled)return;trava.current=true;setOcupado(true);onBusyChange?.(true);setErro('');setConflito(false);
  try{await entrarGoogle({trocarConta});notificarAoNavegar('Você entrou na sua conta.');window.location.assign('/perfil');}
  catch(e){setErro(e.message);setConflito(e.code==='conta/convidado-separado');}
  finally{trava.current=false;setOcupado(false);onBusyChange?.(false);}
 }
 return <><button type="button" className="button button-secondary google-login" disabled={disabled||ocupado} aria-busy={ocupado} onClick={()=>entrar()}>{ocupado?'Conectando ao Google…':'Continuar com Google'}</button>{erro&&<FeedbackAcao mensagem={erro} persistente={conflito}/>} {conflito&&<div className="account-conflict"><a href="/cadastro">Preservar histórico criando outra conta</a><button type="button" disabled={disabled||ocupado} onClick={()=>entrar(true)}>Entendo, entrar na conta existente</button></div>}</>;
}
