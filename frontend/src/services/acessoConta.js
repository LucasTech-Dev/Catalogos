import {doc,getDocFromServer} from 'firebase/firestore';
import {auth,db} from '../lib/firebase';
import {lojaId} from './api';
// Decide apenas a navegação. O AdminGate e as Rules continuam validando cada acesso.
export async function destinoConta(usuario=auth?.currentUser) {
  if(!usuario || usuario.isAnonymous || !db)return '/perfil';
  try {
    const registro=await getDocFromServer(doc(db,'usuarios',usuario.uid)),dados=registro.data();
    return auth.currentUser?.uid===usuario.uid && dados?.role==='admin' && dados.ativo===true && dados.lojaId===lojaId?'/admin':'/perfil';
  }catch{return '/perfil';}
}
