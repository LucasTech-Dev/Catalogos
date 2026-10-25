import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {initializeApp,deleteApp} from 'firebase/app';
import {getAuth,connectAuthEmulator,signInAnonymously,linkWithCredential,EmailAuthProvider,signOut,signInWithEmailAndPassword,updatePassword,reauthenticateWithCredential,GoogleAuthProvider,signInWithCredential} from 'firebase/auth';
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
  await signOut(auth);
  const convidadoGoogle=(await signInAnonymously(auth)).user,uidGoogle=convidadoGoogle.uid;
  const token=Buffer.from(JSON.stringify({alg:'none',typ:'JWT'})).toString('base64url')+'.'+Buffer.from(JSON.stringify({sub:crypto.randomUUID(),email:`google-${crypto.randomUUID()}@teste.local`,email_verified:true,name:'Cliente Google local',iss:'https://accounts.google.com',aud:projectId,iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')+'.';
  const credential=GoogleAuthProvider.credential(token);
  await linkWithCredential(convidadoGoogle,credential);assert.equal(auth.currentUser.uid,uidGoogle);assert.equal(auth.currentUser.isAnonymous,false);
  await signOut(auth);await signInWithCredential(auth,credential);assert.equal(auth.currentUser.uid,uidGoogle);
  await signOut(auth);const outro=(await signInAnonymously(auth)).user;
  await assert.rejects(()=>linkWithCredential(outro,credential),e=>e.code==='auth/credential-already-in-use');assert.equal(auth.currentUser.uid,outro.uid);assert.equal(auth.currentUser.isAnonymous,true);
  console.log('Google local: vinculação mantém UID, novo login mantém conta, colisão preserva convidado.');
  console.log('Firebase Web SDK: convidado, conversão em conta mantendo UID, login, troca de senha e renovação de token aprovados.');
} finally {await signOut(auth);await deleteApp(app);}
