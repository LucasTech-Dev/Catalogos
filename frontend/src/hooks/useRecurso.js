import {useCallback,useEffect,useRef,useState} from 'react';
import {onIdTokenChanged} from 'firebase/auth';
import {auth} from '../lib/firebase';
import {api} from '../services/api';
export function useRecurso(path,initial=null) {
  const [dados,setDados]=useState(initial),[erro,setErro]=useState(''),[carregando,setCarregando]=useState(true);
  const versao=useRef(0),inicial=useRef(initial);
  const atualizar=useCallback(async()=>{
    const v=++versao.current;setCarregando(true);setErro('');
    try{const resultado=await (typeof path==='function'?path():api(path));if(v===versao.current)setDados(resultado);}
    catch(e){if(v===versao.current){setDados(inicial.current);setErro(e.message);}}
    finally{if(v===versao.current)setCarregando(false);}
  },[path]);
  useEffect(()=>{
    let uidAnterior;
    const trocar=user=>{const uid=user?.uid || null;if(uid===uidAnterior)return;uidAnterior=uid;versao.current++;setDados(inicial.current);setErro('');atualizar();};
    const cancelar=auth?onIdTokenChanged(auth,trocar):null;if(!auth)atualizar();
    return()=>{versao.current++;cancelar?.();};
  },[atualizar]);
  return {dados,erro,carregando,atualizar,uid:auth?.currentUser?.uid};
}
