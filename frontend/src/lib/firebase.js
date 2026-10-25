import {initializeApp} from 'firebase/app';
import {getFirestore, initializeFirestore, connectFirestoreEmulator} from 'firebase/firestore';
import {getAuth, connectAuthEmulator, signInAnonymously, onIdTokenChanged} from 'firebase/auth';
import {limparDadosDeOutraSessao} from './tentativaCheckout';
import {validarFirebaseWeb} from './firebaseAmbiente';
import {configuracaoAplicacao} from './ambienteAplicacao';
import {modoDemo} from './runtimeDemo';
const env = import.meta.env;
const demonstracao=modoDemo(env);
configuracaoAplicacao(env,window.location.hostname);
const emulatorUrl=validarFirebaseWeb(env);
export const firebaseConfigurado = Boolean(!demonstracao && env.VITE_FIREBASE_API_KEY && env.VITE_FIREBASE_PROJECT_ID);
if(firebaseConfigurado && env.VITE_FIREBASE_PROJECT_ID.startsWith('demo-') && !env.VITE_FIRESTORE_EMULATOR_HOST)throw new Error('Catálogo de teste exige Firestore Emulator local.');
// initializeApp reutiliza a aplicação padrão quando a configuração é idêntica.
const app = firebaseConfigurado ? initializeApp({apiKey:env.VITE_FIREBASE_API_KEY, authDomain:env.VITE_FIREBASE_AUTH_DOMAIN, projectId:env.VITE_FIREBASE_PROJECT_ID, appId:env.VITE_FIREBASE_APP_ID}) : null;
export const auth = app ? getAuth(app) : null;
// Emulação no navegador usa respostas curtas para evitar streams pendentes no loopback.
// Produção mantém o transporte padrão do SDK.
export const db = app ? (env.VITE_FIRESTORE_EMULATOR_HOST ? initializeFirestore(app,{experimentalForceLongPolling:true}) : getFirestore(app)) : null;
if(auth && emulatorUrl)connectAuthEmulator(auth,emulatorUrl,{disableWarnings:true});
if(db && env.VITE_FIRESTORE_EMULATOR_HOST) {
  const [host,port]=env.VITE_FIRESTORE_EMULATOR_HOST.split(':');
  connectFirestoreEmulator(db,host,Number(port));
}
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
