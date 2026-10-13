import {signInWithEmailAndPassword,createUserWithEmailAndPassword,linkWithCredential,EmailAuthProvider,signOut,sendPasswordResetEmail,reauthenticateWithCredential,updatePassword} from 'firebase/auth';
import {auth} from '../lib/firebase';
import {api,publico} from './api';
function configurar() {if (!auth) throw new Error('Autenticação não configurada.');}
function mensagem(e) {return new Error({'auth/invalid-credential':'E-mail ou senha inválidos.','auth/email-already-in-use':'Este e-mail já possui conta.','auth/weak-password':'Use uma senha com pelo menos seis caracteres.','auth/operation-not-allowed':'Esta forma de autenticação ainda não está habilitada.','auth/network-request-failed':'Verifique sua conexão.','auth/too-many-requests':'Aguarde antes de tentar novamente.'}[e.code] || 'Não foi possível concluir a autenticação. Confira os dados e tente novamente.');}
export async function entrar(email,senha) {configurar();try {await signInWithEmailAndPassword(auth,email,senha);} catch(e) {throw mensagem(e);}}
export async function cadastrar({nome,telefone,email,senha}) {
  configurar(); await auth.authStateReady();
  try {if (auth.currentUser?.isAnonymous) await linkWithCredential(auth.currentUser,EmailAuthProvider.credential(email,senha));else if (auth.currentUser?.email?.toLowerCase() !== email.trim().toLowerCase()) await createUserWithEmailAndPassword(auth,email,senha);} catch(e) {throw mensagem(e);}
  await api(publico + '/me',{method:'PUT',body:{nome,telefone}});
}
export async function sair() {configurar();await signOut(auth);}
export async function recuperar(email) {configurar();try {await sendPasswordResetEmail(auth,email);} catch(e) {throw mensagem(e);}}
export async function trocarSenha(atual,nova) {configurar();if (!auth.currentUser?.email) throw new Error('Entre em uma conta para alterar a senha.');try {await reauthenticateWithCredential(auth.currentUser,EmailAuthProvider.credential(auth.currentUser.email,atual));await updatePassword(auth.currentUser,nova);} catch(e) {throw mensagem(e);}}
