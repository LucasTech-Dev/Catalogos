import {useCallback,useEffect,useState,useRef} from 'react';
import {admin} from '../services/admin';
import {aguardarLeitura} from '../lib/carregamento';
export function useAdminRecurso(carregar) {
  const [dados,setDados]=useState(null),[erro,setErro]=useState(''),[carregando,setCarregando]=useState(true);
  const origemAtual=useRef(carregar);
  const versao=useRef(0);
  const [pronto,setPronto]=useState(false),[origem,setOrigem]=useState(()=>carregar);
  const emCurso=useRef(null);
  const atualizar=useCallback(()=>{
    if(emCurso.current?.origem===carregar && emCurso.current.versao===versao.current)return emCurso.current.promessa;
    const v=++versao.current;
    if(origemAtual.current!==carregar){origemAtual.current=carregar;setDados(null);setPronto(false);}
    setCarregando(true);setErro('');setOrigem(()=>carregar);
    const promessa=aguardarLeitura(carregar).then(resposta=>{
      if(v===versao.current){setDados(resposta);setPronto(true);}
    }).catch(e=>{
      if(v===versao.current){if([401,403].includes(e.status)||e.code==='SESSION_CHANGED'){setDados(null);setPronto(false);}setErro(e.message);}
    }).finally(()=>{if(v===versao.current)setCarregando(false);if(emCurso.current?.versao===v)emCurso.current=null;});
    emCurso.current={origem:carregar,versao:v,promessa};return promessa;
  },[carregar]);
  useEffect(()=>{atualizar();return()=>{versao.current++;};},[atualizar]);return {dados:origem===carregar?dados:null,setDados,erro:origem===carregar?erro:'',setErro,carregando:origem!==carregar||carregando,pronto:origem===carregar&&pronto,atualizar};
}
export function useAdminLista(nome,filtros={}) {
  const chave=JSON.stringify(filtros),[estado,setEstado]=useState({nome,chave,cursor:'',historico:[]});
  const cursor=estado.nome===nome && estado.chave===chave ? estado.cursor : '';
  const historico=estado.nome===nome && estado.chave===chave ? estado.historico : [];
  const carregar=useCallback(()=>admin.listar(nome,{...JSON.parse(chave),...(cursor?{cursor}: {})}),[nome,chave,cursor]);
  const recurso=useAdminRecurso(carregar);

  return {...recurso,itens:recurso.dados?.itens || [],proximo:()=>{if(recurso.dados?.proximoCursor){setEstado({nome,chave,cursor:recurso.dados.proximoCursor,historico:[...historico,cursor]});}},anterior:()=>{setEstado({nome,chave,cursor:historico.at(-1) || '',historico:historico.slice(0,-1)});},temAnterior:historico.length>0,temProximo:Boolean(recurso.dados?.proximoCursor)};
}
