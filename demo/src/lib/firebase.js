import {initializeApp} from 'firebase/app';
import {getAuth, connectAuthEmulator, signInAnonymously} from 'firebase/auth';
const env = import.meta.env;
export const firebaseConfigurado = Boolean(env.VITE_FIREBASE_API_KEY && env.VITE_FIREBASE_PROJECT_ID);
export const auth = firebaseConfigurado ? getAuth(initializeApp({apiKey:env.VITE_FIREBASE_API_KEY, authDomain:env.VITE_FIREBASE_AUTH_DOMAIN, projectId:env.VITE_FIREBASE_PROJECT_ID, appId:env.VITE_FIREBASE_APP_ID})) : null;
if (auth && env.VITE_FIREBASE_AUTH_EMULATOR_URL) {
  const url = new URL(env.VITE_FIREBASE_AUTH_EMULATOR_URL);
  if (!['localhost','127.0.0.1'].includes(url.hostname) || !env.VITE_FIREBASE_PROJECT_ID.startsWith('demo-')) throw new Error('Emulador exige projeto demo e host local.');
  connectAuthEmulator(auth, url.origin, {disableWarnings:true});
}
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
