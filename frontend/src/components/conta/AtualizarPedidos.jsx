import React,{useRef,useState} from 'react';
import {RefreshCw} from "../ui/MaterialIcon";
import {atualizarComFeedback} from '../../lib/notificacoes';
export default function AtualizarPedidos({recurso,detalhe=false}){
 const [ocupado,setOcupado]=useState(false),trava=useRef(false);
 async function atualizar(){if(trava.current||recurso.carregando)return;trava.current=true;setOcupado(true);try{await atualizarComFeedback(recurso);}finally{trava.current=false;setOcupado(false);}}
 const carregando=ocupado||recurso.carregando;
 return <button type="button" className="button button-secondary orders-refresh" disabled={carregando} aria-busy={carregando} onClick={atualizar}><RefreshCw size={17} aria-hidden="true"/>{carregando?'Atualizando…':detalhe?'Atualizar pedido':'Atualizar pedidos'}</button>;
}
