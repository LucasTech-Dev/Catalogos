import {useCallback,useEffect,useRef,useState} from 'react';

// A trava muda antes do próximo render; chaves diferentes podem trabalhar juntas.
export function useAdminAcao() {
  const travas=useRef(new Set()),ativo=useRef(true);
  const [chaves,setChaves]=useState([]);
  useEffect(()=>{ativo.current=true;return()=>{ativo.current=false;};},[]);
  const iniciar=useCallback((chave='principal')=>{
    if(!ativo.current || travas.current.has(chave))return false;
    travas.current.add(chave);setChaves([...travas.current]);return true;
  },[]);
  const finalizar=useCallback((chave='principal')=>{
    travas.current.delete(chave);if(ativo.current)setChaves([...travas.current]);
  },[]);
  return {iniciar,finalizar,bloqueada:(chave='principal')=>travas.current.has(chave),ativa:()=>ativo.current,ocupada:(chave='principal')=>chaves.includes(chave)};
}
