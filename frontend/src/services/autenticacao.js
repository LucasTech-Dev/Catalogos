import {signInWithEmailAndPassword,createUserWithEmailAndPassword,linkWithCredential,EmailAuthProvider,signOut,sendPasswordResetEmail,reauthenticateWithCredential,updatePassword,GoogleAuthProvider,signInWithPopup,linkWithPopup,updateProfile} from 'firebase/auth';
import {validarPerfil} from './perfil.js';
const ocupadas=new WeakSet();
export function criarServicoConta({auth,salvarPerfil}) {
function configurar() {if (!auth) throw new Error('Autenticação não configurada.');}
function mensagem(e) {return new Error({'auth/popup-blocked':'O navegador bloqueou a janela do Google. Permita pop-ups para este site e tente novamente.','auth/popup-closed-by-user':'A entrada com Google foi cancelada. Você pode tentar novamente.','auth/cancelled-popup-request':'Há outra janela de login aberta. Conclua ou feche essa janela.','auth/account-exists-with-different-credential':'Este e-mail utiliza outra forma de acesso. Entre com e-mail e senha para preservar sua conta.','auth/unauthorized-domain':'Este domínio ainda não está autorizado para entrar com Google. Avise o estabelecimento.','auth/invalid-email':'Digite um e-mail válido.','auth/wrong-password':'E-mail ou senha inválidos.','auth/user-not-found':'E-mail ou senha inválidos.','auth/invalid-login-credentials':'E-mail ou senha inválidos.','auth/invalid-credential':'E-mail ou senha inválidos.','auth/email-already-in-use':'Este e-mail já possui conta.','auth/weak-password':'Use uma senha com pelo menos seis caracteres.','auth/operation-not-allowed':'Esta forma de autenticação ainda não está habilitada.','auth/network-request-failed':'Verifique sua conexão.','auth/too-many-requests':'Aguarde antes de tentar novamente.'}[e.code] || 'Não foi possível concluir a autenticação. Confira os dados e tente novamente.');}
const conflitoAnonimo=e=>['auth/credential-already-in-use','auth/email-already-in-use'].includes(e.code);
function preservarConvidado() {return Object.assign(new Error('Seu histórico de convidado permanece separado. Para manter acesso a ele, crie primeiro uma conta com outro e-mail. Se entrar na conta existente agora, o histórico de convidado não será transferido e poderá ficar inacessível após sair desta sessão.'),{code:'conta/convidado-separado'});}
async function entrar(email,senha,{trocarConta=false}={}) {
  configurar();await auth.authStateReady();
  try {
    if(auth.currentUser?.isAnonymous && !trocarConta)throw preservarConvidado();
    await signInWithEmailAndPassword(auth,email.trim(),senha);
  } catch(e) {throw e.code==='conta/convidado-separado'?e:mensagem(e);}
}
async function entrarGoogle({trocarConta=false}={}) {
  configurar();await auth.authStateReady();
  const provider=new GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account'});
  try {
    if(auth.currentUser?.isAnonymous && !trocarConta) {
      try {return (await linkWithPopup(auth.currentUser,provider)).user;}
      catch(e) {if(conflitoAnonimo(e))throw preservarConvidado();throw e;}
    }
    return (await signInWithPopup(auth,provider)).user;
  } catch(e) {throw e.code==='conta/convidado-separado'?e:mensagem(e);}
}
async function cadastrar({nome,telefone='',email,senha}) {
  configurar(); nome=nome.trim();telefone=telefone.trim();if(!nome || nome.length>200 || /[\u0000-\u001f]/u.test(nome))throw new Error('Informe seu nome.');if(telefone)validarPerfil({nome,telefone}); await auth.authStateReady();
  let usuario=auth.currentUser;
  if(usuario && !usuario.isAnonymous)throw new Error('Você já está conectado. Acesse Minha conta ou saia antes de criar outra conta.');
  try {if (usuario?.isAnonymous) usuario=(await linkWithCredential(usuario,EmailAuthProvider.credential(email,senha))).user;else if (usuario?.email?.toLowerCase() !== email.trim().toLowerCase()) usuario=(await createUserWithEmailAndPassword(auth,email,senha)).user;} catch(e) {throw mensagem(e);}
  if(auth.currentUser?.uid!==usuario.uid)throw new Error('A sessão mudou. Entre novamente.');
  await updateProfile(usuario,{displayName:nome});
  if(auth.currentUser?.uid!==usuario.uid)throw new Error('A sessão mudou. Entre novamente.');
  if(telefone)await salvarPerfil({nome,telefone},usuario.uid);
}
async function sair() {configurar();await signOut(auth);}
async function recuperar(email) {configurar();try {await sendPasswordResetEmail(auth,email);} catch(e) {throw mensagem(e);}}
async function trocarSenha(atual,nova) {configurar();const usuario=auth.currentUser;if (!usuario?.email) throw new Error('Entre em uma conta para alterar a senha.');try {await reauthenticateWithCredential(usuario,EmailAuthProvider.credential(usuario.email,atual));if(auth.currentUser?.uid!==usuario.uid)throw new Error('A sessão mudou. Entre novamente.');await updatePassword(usuario,nova);} catch(e) {throw mensagem(e);}}

  // Protege os mesmos serviços quando chamados por páginas/lojas concorrentes.
  const proteger=fn=>async(...args)=>{
    configurar();if(ocupadas.has(auth))throw new Error('Há outra operação de autenticação em andamento.');
    ocupadas.add(auth);try{return await fn(...args);}finally{ocupadas.delete(auth);}
  };
  return {entrar:proteger(entrar),entrarGoogle:proteger(entrarGoogle),cadastrar:proteger(cadastrar),sair:proteger(sair),recuperar:proteger(recuperar),trocarSenha:proteger(trocarSenha)};
}
