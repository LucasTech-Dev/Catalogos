import {signInWithEmailAndPassword,createUserWithEmailAndPassword,linkWithCredential,EmailAuthProvider,signOut,sendPasswordResetEmail,reauthenticateWithCredential,updatePassword} from 'firebase/auth';
import {auth,db,sessao} from '../lib/firebase';
import {configuracaoAplicacao} from '../lib/ambienteAplicacao';
import {criarServicoPerfil,validarPerfil} from './perfil';
const lojaId=configuracaoAplicacao(import.meta.env,window.location.hostname).lojaId;
export const {buscarPerfil,salvarPerfil,listarEnderecos,salvarEndereco,excluirEndereco}=criarServicoPerfil({db,auth,sessao,lojaId});
function configurar() {if (!auth) throw new Error('Autenticação não configurada.');}
function mensagem(e) {return new Error({'auth/wrong-password':'E-mail ou senha inválidos.','auth/user-not-found':'E-mail ou senha inválidos.','auth/invalid-login-credentials':'E-mail ou senha inválidos.','auth/invalid-credential':'E-mail ou senha inválidos.','auth/email-already-in-use':'Este e-mail já possui conta.','auth/weak-password':'Use uma senha com pelo menos seis caracteres.','auth/operation-not-allowed':'Esta forma de autenticação ainda não está habilitada.','auth/network-request-failed':'Verifique sua conexão.','auth/too-many-requests':'Aguarde antes de tentar novamente.'}[e.code] || 'Não foi possível concluir a autenticação. Confira os dados e tente novamente.');}
export async function entrar(email,senha) {configurar();try {await signInWithEmailAndPassword(auth,email,senha);} catch(e) {throw mensagem(e);}}
export async function cadastrar({nome,telefone,email,senha}) {
  configurar(); validarPerfil({nome,telefone}); await auth.authStateReady();
  let usuario=auth.currentUser;
  try {if (usuario?.isAnonymous) usuario=(await linkWithCredential(usuario,EmailAuthProvider.credential(email,senha))).user;else if (usuario?.email?.toLowerCase() !== email.trim().toLowerCase()) usuario=(await createUserWithEmailAndPassword(auth,email,senha)).user;} catch(e) {throw mensagem(e);}
  await salvarPerfil({nome,telefone},usuario.uid);
}
export async function sair() {configurar();await signOut(auth);}
export async function recuperar(email) {configurar();try {await sendPasswordResetEmail(auth,email);} catch(e) {throw mensagem(e);}}
export async function trocarSenha(atual,nova) {configurar();const usuario=auth.currentUser;if (!usuario?.email) throw new Error('Entre em uma conta para alterar a senha.');try {await reauthenticateWithCredential(usuario,EmailAuthProvider.credential(usuario.email,atual));if(auth.currentUser?.uid!==usuario.uid)throw new Error('A sessão mudou. Entre novamente.');await updatePassword(usuario,nova);} catch(e) {throw mensagem(e);}}
