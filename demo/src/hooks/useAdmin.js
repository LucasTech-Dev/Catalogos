import {useCallback,useEffect,useState,useRef} from 'react';
import {admin} from '../services/admin';
export function useAdminRecurso(carregar) {
  const [dados,setDados]=useState(null),[erro,setErro]=useState(''),[carregando,setCarregando]=useState(true);
  const versao=useRef(0);
  const atualizar=useCallback(async()=>{const v=++versao.current;setCarregando(true);setErro('');try {const resposta=await carregar();if(v===versao.current)setDados(resposta);} catch(e){if(v===versao.current)setErro(e.message);} finally {if(v===versao.current)setCarregando(false);}},[carregar]);
  useEffect(()=>{atualizar();return()=>{versao.current++;};},[atualizar]);return {dados,setDados,erro,setErro,carregando,atualizar};
}
export function useAdminLista(nome,filtros={}) {
  const chave=JSON.stringify(filtros),[estado,setEstado]=useState({nome,chave,cursor:'',historico:[]});
  const cursor=estado.nome===nome && estado.chave===chave ? estado.cursor : '';
  const historico=estado.nome===nome && estado.chave===chave ? estado.historico : [];
  const carregar=useCallback(()=>admin.listar(nome,{...JSON.parse(chave),...(cursor?{cursor}: {})}),[nome,chave,cursor]);
  const recurso=useAdminRecurso(carregar);

  return {...recurso,itens:recurso.dados?.itens || [],proximo:()=>{if(recurso.dados?.proximoCursor){setEstado({nome,chave,cursor:recurso.dados.proximoCursor,historico:[...historico,cursor]});}},anterior:()=>{setEstado({nome,chave,cursor:historico.at(-1) || '',historico:historico.slice(0,-1)});},temAnterior:historico.length>0,temProximo:Boolean(recurso.dados?.proximoCursor)};
}
