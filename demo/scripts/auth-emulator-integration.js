import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {initializeApp,deleteApp} from 'firebase/app';
import {getAuth,connectAuthEmulator,signInAnonymously,linkWithCredential,EmailAuthProvider,signOut,signInWithEmailAndPassword,updatePassword,reauthenticateWithCredential} from 'firebase/auth';
const projectId=process.env.GCLOUD_PROJECT || 'demo-catalogos-emulator';
const host=process.env.FIREBASE_AUTH_EMULATOR_HOST;
if (!projectId.startsWith('demo-') || !/^(localhost|127\.0\.0\.1):\d+$/.test(host || '')) throw new Error('Teste exige Auth Emulator local e projeto demo-.');
const app=initializeApp({projectId,apiKey:'fake-api-key',authDomain:projectId+'.firebaseapp.com'}),auth=getAuth(app);
connectAuthEmulator(auth,'http://'+host,{disableWarnings:true});
try {
  const anon=await signInAnonymously(auth);const uid=anon.user.uid;
  assert.equal(anon.user.isAnonymous,true);
  const email=`sdk-${crypto.randomUUID()}@teste.local`,senha=`Senha-${crypto.randomUUID()}1!`;
  await linkWithCredential(anon.user,EmailAuthProvider.credential(email,senha));assert.equal(auth.currentUser.uid,uid);assert.equal(auth.currentUser.isAnonymous,false);
  await signOut(auth);const login=await signInWithEmailAndPassword(auth,email,senha);assert.equal(login.user.uid,uid);
  await reauthenticateWithCredential(login.user,EmailAuthProvider.credential(email,senha));await updatePassword(login.user,senha+'nova');
  await signOut(auth);await signInWithEmailAndPassword(auth,email,senha+'nova');
  assert.ok(await auth.currentUser.getIdToken(true));
  console.log('Firebase Web SDK: convidado, conversão em conta mantendo UID, login, troca de senha e renovação de token aprovados.');
} finally {await signOut(auth);await deleteApp(app);}
