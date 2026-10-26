import {useEffect,useState} from 'react';
import {useSessao} from './useSessao';
import {destinoConta} from '../services/acessoConta';
export function useAcessoConta() {
  const {usuario,carregando}=useSessao(),[acesso,setAcesso]=useState(null);
  useEffect(()=>{
    let ativo=true;
    const atualizar=()=>{if(usuario && !usuario.isAnonymous)destinoConta(usuario).then(destino=>{if(ativo)setAcesso({uid:usuario.uid,destino});});};
    atualizar();window.addEventListener('focus',atualizar);
    return()=>{ativo=false;window.removeEventListener('focus',atualizar);};
  },[usuario]);
  return {usuario,carregando,administrador:Boolean(usuario && !usuario.isAnonymous && acesso?.uid===usuario.uid && acesso.destino==='/admin')};
}
