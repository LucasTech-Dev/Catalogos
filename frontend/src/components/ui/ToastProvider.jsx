import React,{createContext,useContext,useEffect,useLayoutEffect,useRef,useState} from 'react';
import {CheckCircle2,AlertCircle,Info,TriangleAlert,X} from "./MaterialIcon";
import {DURACAO_TOAST,ouvirNotificacoes,consumirNotificacao,notificar,textoSeguro} from '../../lib/notificacoes';
import './ToastProvider.css';
const Context=createContext(null);
let pedirConfirmacao=null;
export function confirmarAcao(descricao,titulo='Confirmar alteração') {
 if(pedirConfirmacao)return pedirConfirmacao({descricao,titulo});
 return Promise.resolve(window.confirm(descricao));
}
export function ToastProvider({children}) {
 const [aviso,setAviso]=useState(null),[modal,setModal]=useState(null);
 const sequencia=useRef(0);
 const atual=useRef(null),card=useRef(null),dialog=useRef(null),pendente=useRef(null);
 function mostrar(novo){if(atual.current?.tipo===novo.tipo&&atual.current?.mensagem===novo.mensagem)return;const item={...novo,id:++sequencia.current,duracao:Math.min(DURACAO_TOAST,novo.expira?novo.expira-Date.now():DURACAO_TOAST),expira:novo.expira||Date.now()+DURACAO_TOAST};atual.current=item;setAviso(item);}
 function fechar(){atual.current=null;setAviso(null);}
 function decidir(valor){pendente.current?.(valor);pendente.current=null;setModal(null);if(!valor)notificar('info','Operação cancelada.');}
 useLayoutEffect(()=>{
  const cancelar=ouvirNotificacoes(mostrar);const navegacao=consumirNotificacao();if(navegacao)mostrar(navegacao);
  const pedir=dados=>new Promise(resolve=>{pendente.current?.(false);pendente.current=resolve;setModal(dados);});pedirConfirmacao=pedir;
  return()=>{cancelar();if(pedirConfirmacao===pedir)pedirConfirmacao=null;pendente.current?.(false);};
 },[]);
 useEffect(()=>{
  if(!aviso)return;const timer=setTimeout(fechar,Math.max(0,aviso.expira-Date.now()));
  const fora=e=>{if(card.current&&!card.current.contains(e.target))fechar();};
  document.addEventListener('pointerdown',fora,true);document.addEventListener('click',fora,true);
  return()=>{clearTimeout(timer);document.removeEventListener('pointerdown',fora,true);document.removeEventListener('click',fora,true);};
 },[aviso]);
 useEffect(()=>{
  if(!modal)return;const anterior=document.activeElement;dialog.current?.querySelector('button')?.focus();
  const teclado=e=>{if(e.key==='Escape'){e.preventDefault();decidir(false);}if(e.key==='Tab'){const botoes=[...dialog.current.querySelectorAll('button')];const primeiro=botoes[0],ultimo=botoes.at(-1);if(e.shiftKey&&document.activeElement===primeiro){e.preventDefault();ultimo.focus();}else if(!e.shiftKey&&document.activeElement===ultimo){e.preventDefault();primeiro.focus();}}};
  document.addEventListener('keydown',teclado);return()=>{document.removeEventListener('keydown',teclado);if(anterior?.isConnected)anterior.focus();};
 },[modal]);
 const Icon=({sucesso:CheckCircle2,erro:AlertCircle,aviso:TriangleAlert,info:Info})[aviso?.tipo]||Info;
 return <Context.Provider value={true}><div className="feedback-app" onSubmitCapture={fechar} onInvalidCapture={()=>notificar('aviso','Confira os campos obrigatórios antes de continuar.')}>
  {children}
  {aviso&&<div key={aviso.id} ref={card} style={{'--toast-duracao':aviso.duracao+'ms'}} className={'toast-card toast-'+aviso.tipo} role={aviso.tipo==='erro'?'alert':'status'} aria-live={aviso.tipo==='erro'?'assertive':'polite'} aria-atomic="true"><Icon size={22} aria-hidden="true"/><p>{aviso.mensagem}</p><button type="button" className="toast-close" aria-label="Fechar notificação" onClick={fechar}><X size={18} aria-hidden="true"/></button></div>}
  {modal&&<div className="confirm-backdrop"><section ref={dialog} className="confirm-card" role="dialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-description"><h2 id="confirm-title">{modal.titulo}</h2><p id="confirm-description">{modal.descricao}</p><div><button type="button" className="button button-secondary" onClick={()=>decidir(false)}>Cancelar</button><button type="button" className="button button-primary" onClick={()=>decidir(true)}>Confirmar</button></div></section></div>}
 </div></Context.Provider>;
}
// Mantém feedback inline útil ao reutilizar uma tela sem o provider da aplicação.
export function FeedbackAcao({mensagem,tipo='erro',persistente=false}) {
 const global=useContext(Context),manter=persistente||tipo==='erro';
 useEffect(()=>{if(global&&mensagem&&!manter)notificar(tipo,mensagem);},[global,mensagem,tipo,manter]);
 if(!mensagem||global&&!manter)return null;
 return <p className={tipo==='erro'?'action-error':'action-feedback'} role={tipo==='erro'?'alert':'status'}>{textoSeguro(mensagem,persistente?1000:240)}</p>;
}
