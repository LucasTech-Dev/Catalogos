import {auth,db,sessao} from '../lib/firebase';
import {configuracaoAplicacao} from '../lib/ambienteAplicacao';
import {criarServicoPerfil} from './perfil';
import {criarServicoConta} from './autenticacao';
const lojaId=configuracaoAplicacao(import.meta.env,window.location.hostname).lojaId;
const perfil=criarServicoPerfil({db,auth,sessao,lojaId});
export const {buscarPerfil,salvarPerfil,listarEnderecos,salvarEndereco,excluirEndereco}=perfil;
export const {entrar,entrarGoogle,cadastrar,sair,recuperar,trocarSenha}=criarServicoConta({auth,salvarPerfil});
