import {useEffect,useState} from 'react';
import {onIdTokenChanged} from 'firebase/auth';
import {auth} from '../lib/firebase';
export function useSessao() {
  const [estado,setEstado]=useState({usuario:null,carregando:Boolean(auth)});
  useEffect(()=>{if(!auth)return;return onIdTokenChanged(auth,usuario=>setEstado({usuario,carregando:false}),()=>setEstado({usuario:null,carregando:false}));},[]);
  return estado;
}
