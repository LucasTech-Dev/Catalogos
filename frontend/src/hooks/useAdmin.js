import {useCallback,useEffect,useState,useRef} from 'react';
import {admin} from '../services/admin';
import {aguardarLeitura} from '../lib/carregamento';
export function useAdminRecurso(carregar) {
  const [dados,setDados]=useState(null),[erro,setErro]=useState(''),[carregando,setCarregando]=useState(true);
  const origemAtual=useRef(carregar),carregarAtual=useRef(carregar);carregarAtual.current=carregar;
  const versao=useRef(0);
  const [pronto,setPronto]=useState(false),[origem,setOrigem]=useState(()=>carregar);
  const emCurso=useRef(null);
  const atualizar=useCallback(()=>{
    const fonte=carregarAtual.current;
    if(emCurso.current?.origem===fonte && emCurso.current.versao===versao.current)return emCurso.current.promessa;
    const v=++versao.current;
    if(origemAtual.current!==fonte){origemAtual.current=fonte;setDados(null);setPronto(false);}
    setCarregando(true);setErro('');setOrigem(()=>fonte);
    const promessa=aguardarLeitura(fonte).then(resposta=>{
      if(v===versao.current){setDados(resposta);setPronto(true);return {ok:true};}return {ok:false,cancelado:true};
    }).catch(e=>{
      if(v===versao.current){if([401,403].includes(e.status)||e.code==='SESSION_CHANGED'){setDados(null);setPronto(false);}setErro(e.message);return {ok:false,mensagem:e.message,erroPersistente:true};}return {ok:false,cancelado:true};
    }).finally(()=>{if(v===versao.current)setCarregando(false);if(emCurso.current?.versao===v)emCurso.current=null;});
    emCurso.current={origem:fonte,versao:v,promessa};return promessa;
  },[]);
  useEffect(()=>{atualizar();return()=>{versao.current++;};},[atualizar,carregar]);return {dados:origem===carregar?dados:null,setDados,erro:origem===carregar?erro:'',setErro,carregando:origem!==carregar||carregando,pronto:origem===carregar&&pronto,atualizar};
}
export function useAdminLista(nome,filtros={}) {
  const chave=JSON.stringify(filtros),[estado,setEstado]=useState({nome,chave,cursor:'',historico:[]});
  const cursor=estado.nome===nome && estado.chave===chave ? estado.cursor : '';
  const historico=estado.nome===nome && estado.chave===chave ? estado.historico : [];
  const carregar=useCallback(()=>admin.listar(nome,{...JSON.parse(chave),...(cursor?{cursor}: {})}),[nome,chave,cursor]);
  const recurso=useAdminRecurso(carregar);

  return {...recurso,itens:recurso.dados?.itens || [],proximo:()=>{if(recurso.dados?.proximoCursor){setEstado({nome,chave,cursor:recurso.dados.proximoCursor,historico:[...historico,cursor]});}},anterior:()=>{setEstado({nome,chave,cursor:historico.at(-1) || '',historico:historico.slice(0,-1)});},temAnterior:historico.length>0,temProximo:Boolean(recurso.dados?.proximoCursor)};
}
