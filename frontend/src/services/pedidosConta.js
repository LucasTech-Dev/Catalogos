import {auth,db,sessao} from '../lib/firebase';
import {configuracaoAplicacao} from '../lib/ambienteAplicacao';
import {criarServicoPedidos} from './pedidos';
const lojaId=configuracaoAplicacao(import.meta.env,window.location.hostname).lojaId;
export const {criarPedido,listarPedidos,buscarPedido,recuperarPedido,finalizarPedido}=criarServicoPedidos({db,auth,sessao,lojaId});
