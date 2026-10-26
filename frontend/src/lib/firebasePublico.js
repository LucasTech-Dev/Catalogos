import {initializeApp} from 'firebase/app';
import {getFirestore,connectFirestoreEmulator,doc,collection,getDoc,getDocs,query,where} from 'firebase/firestore/lite';
import {validarFirebaseWeb} from './firebaseAmbiente';
import {modoDemo} from './runtimeDemo';
// Instância exclusiva de leitura pública: sem Auth, persistência ou streams.
// As mesmas Rules continuam autorizando somente projeções públicas ativas.
const env=import.meta.env;validarFirebaseWeb(env);
const app=!modoDemo(env) && env.VITE_FIREBASE_API_KEY && env.VITE_FIREBASE_PROJECT_ID?initializeApp({apiKey:env.VITE_FIREBASE_API_KEY,projectId:env.VITE_FIREBASE_PROJECT_ID,appId:env.VITE_FIREBASE_APP_ID},'catalogo-publico'):null;
export const dbPublico=app?getFirestore(app):null;
if(dbPublico && env.VITE_FIRESTORE_EMULATOR_HOST){const [host,port]=env.VITE_FIRESTORE_EMULATOR_HOST.split(':');connectFirestoreEmulator(dbPublico,host,Number(port));}
export const leituraPublica={doc,collection,getDocFromServer:getDoc,getDocsFromServer:getDocs,query,where};
