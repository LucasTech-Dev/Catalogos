import {initializeApp} from 'firebase/app';
import {getAuth, connectAuthEmulator, signInAnonymously, onIdTokenChanged} from 'firebase/auth';
import {limparDadosDeOutraSessao} from './tentativaCheckout';
import {validarFirebaseWeb} from './firebaseAmbiente';
import {configuracaoAplicacao} from './ambienteAplicacao';
const env = import.meta.env;
configuracaoAplicacao(env,window.location.hostname);
const emulatorUrl=validarFirebaseWeb(env);
export const firebaseConfigurado = Boolean(env.VITE_FIREBASE_API_KEY && env.VITE_FIREBASE_PROJECT_ID);
export const auth = firebaseConfigurado ? getAuth(initializeApp({apiKey:env.VITE_FIREBASE_API_KEY, authDomain:env.VITE_FIREBASE_AUTH_DOMAIN, projectId:env.VITE_FIREBASE_PROJECT_ID, appId:env.VITE_FIREBASE_APP_ID})) : null;
if(auth && emulatorUrl)connectAuthEmulator(auth,emulatorUrl,{disableWarnings:true});
// Limpeza também ao sair/trocar conta em páginas fora do checkout.
if(auth)onIdTokenChanged(auth,user=>limparDadosDeOutraSessao(user?.uid || null));
let entrando;
export async function sessao() {
  if (!auth) throw new Error('Autenticação não configurada. Entre em contato com a loja.');
  await auth.authStateReady();
  if (auth.currentUser) return auth.currentUser;
  entrando ||= signInAnonymously(auth).finally(() => {entrando = null;});
  return (await entrando).user;
}
export async function sessaoExistente() {
  if (!auth) throw Object.assign(new Error('Autenticação não configurada.'),{status:503});
  await auth.authStateReady();
  if (!auth.currentUser || auth.currentUser.isAnonymous) throw Object.assign(new Error('Entre com uma conta administrativa.'),{status:401});
  return auth.currentUser;
}
