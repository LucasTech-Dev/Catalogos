import {useCallback,useEffect,useRef,useState} from 'react';
import {onIdTokenChanged} from 'firebase/auth';
import {auth} from '../lib/firebase';
import {api} from '../services/api';
import {aguardarLeitura,LIMITE_LEITURA_MS} from '../lib/carregamento';
export function useRecurso(path,initial=null) {
  const [dados,setDados]=useState(initial),[erro,setErro]=useState(''),[carregando,setCarregando]=useState(true);
  const origemAtual=useRef(path);
  const versao=useRef(0),inicial=useRef(initial);
  const [pronto,setPronto]=useState(false),[origem,setOrigem]=useState(()=>path);
  const emCurso=useRef(null);
  const atualizar=useCallback(()=>{
    if(emCurso.current?.origem===path && emCurso.current.versao===versao.current)return emCurso.current.promessa;
    const v=++versao.current;
    if(origemAtual.current!==path){origemAtual.current=path;setDados(inicial.current);setPronto(false);}
    setCarregando(true);setErro('');setOrigem(()=>path);
    const promessa=aguardarLeitura(()=>typeof path==='function'?path():api(path)).then(resultado=>{
      if(v===versao.current){setDados(resultado);setPronto(true);}
    }).catch(e=>{
      if(v===versao.current){if([401,403,409].includes(e.status)){setDados(inicial.current);setPronto(false);}setErro(e.message);}
    }).finally(()=>{if(v===versao.current)setCarregando(false);if(emCurso.current?.versao===v)emCurso.current=null;});
    emCurso.current={origem:path,versao:v,promessa};return promessa;
  },[path]);
  useEffect(()=>{
    let uidAnterior;
    const timer=setTimeout(()=>{setCarregando(false);setErro('Não foi possível verificar sua sessão. Tente novamente.');},LIMITE_LEITURA_MS);
    const trocar=user=>{clearTimeout(timer);const uid=user?.uid || null;if(uid===uidAnterior)return;uidAnterior=uid;versao.current++;setDados(inicial.current);setPronto(false);setErro('');atualizar();};
    const cancelar=auth?onIdTokenChanged(auth,trocar):null;if(!auth){clearTimeout(timer);atualizar();}
    return()=>{clearTimeout(timer);versao.current++;cancelar?.();};
  },[atualizar]);
  return {dados:origem===path?dados:inicial.current,erro:origem===path?erro:'',carregando:origem!==path||carregando,pronto:origem===path&&pronto,atualizar,uid:auth?.currentUser?.uid};
}
