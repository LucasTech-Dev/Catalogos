// Planejamento puro: não importa Auth, credenciais, ambiente ou acesso a rede.
import {createHash} from 'node:crypto';
import {validarLojaPatch} from '../../../frontend/src/services/adminGestao.js';
import {projetarRegistro} from '../../../frontend/src/services/projecaoPublica.js';
export const canonico = valor => Array.isArray(valor) ? valor.map(canonico) : valor && typeof valor === 'object' ? Object.fromEntries(Object.keys(valor).sort().map(k => [k, canonico(valor[k])])) : valor;
export const serializar = valor => JSON.stringify(canonico(valor));
export const sha256 = valor => createHash('sha256').update(typeof valor === 'string' ? valor : serializar(valor)).digest('hex');
function campos(obj, permitidos, nome) {
  if (!obj || Array.isArray(obj) || typeof obj !== 'object' || Object.keys(obj).some(k => !permitidos.includes(k))) throw Error(`${nome}: campos inválidos.`);
}
export function validarProjeto(projeto) {
  if (typeof projeto !== 'string' || !/^demo-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(projeto) || projeto.length > 30) throw Error('Somente projeto fictício demo- é permitido.');
  return projeto;
}
export function planejarProvisionamento(entrada) {
  campos(entrada, ['versao', 'ambiente', 'projetoId', 'lojaId', 'matrizVersao', 'administrador', 'loja'], 'Manifesto');
  if (entrada.versao !== 1 || entrada.ambiente !== 'emulator') throw Error('Manifesto v1 exclusivo do Emulator.');
  validarProjeto(entrada.projetoId);
  if (typeof entrada.lojaId !== 'string' || !/^[a-z][a-z0-9-]{1,62}$/.test(entrada.lojaId) || entrada.lojaId === 'loja-demo') throw Error('Identificador de nova loja inválido ou reservado à Demo.');
  if (typeof entrada.matrizVersao !== 'string' || !/^[a-zA-Z0-9._-]{1,100}$/.test(entrada.matrizVersao)) throw Error('Informe a versão da matriz.');
  campos(entrada.administrador, ['uid', 'confirmado'], 'Administrador');
  const {uid, confirmado} = entrada.administrador;
  if (typeof uid !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(uid) || confirmado !== true) throw Error('Administrador exige UID explícito e confirmado, nunca concessão por e-mail.');
  const dados = entrada.loja;
  campos(dados, ['nome','descricao','telefone','whatsapp','instagram','endereco','horarios','logo','imagem','corPrimaria','tempoMedio','pagamentos','entrega','retirada','pedidoMinimo'], 'Loja');
  for (const campo of ['nome','whatsapp','endereco','horarios','pagamentos','entrega','retirada','pedidoMinimo']) if (!Object.hasOwn(dados, campo)) throw Error(`Informe ${campo} explicitamente.`);
  const patch = validarLojaPatch(dados);
  if (typeof patch.endereco !== 'object' || ['rua','numero','bairro','cidade','uf'].some(k => !patch.endereco[k])) throw Error('Endereço comercial completo é obrigatório.');
  const dias = ['segunda','terca','quarta','quinta','sexta','sabado','domingo'];
  if (dias.some(dia => !patch.horarios[dia] || typeof patch.horarios[dia].fechado !== 'boolean' || patch.horarios[dia].fechado !== true && (!patch.horarios[dia].abertura || !patch.horarios[dia].fechamento || patch.horarios[dia].abertura === patch.horarios[dia].fechamento))) throw Error('Informe os sete dias com horários válidos ou fechado=true.');
  if (typeof patch.entrega.habilitada !== 'boolean' || !Object.hasOwn(patch.entrega,'taxa') || typeof patch.retirada.habilitada !== 'boolean' || !patch.entrega.habilitada && !patch.retirada.habilitada) throw Error('Informe entrega, taxa e retirada; ao menos uma modalidade habilitada.');
  if (!Object.values(patch.pagamentos).includes(true)) throw Error('Habilite ao menos uma forma de pagamento.');
  const loja = {descricao:'',telefone:'',instagram:'',logo:'',imagem:'',corPrimaria:'#f97316',tempoMedio:'',...patch,ativo:true};
  const base = `lojas/${entrada.lojaId}`;
  const documentos = [
    {caminho:base, dados:loja},
    {caminho:`catalogosPublicos/${entrada.lojaId}`, dados:projetarRegistro('loja',loja)},
    {caminho:`${base}/controleCompra/versao`, dados:{revisao:0,alteracao:null}},
    {caminho:`${base}/contadores/pedidos`, dados:{ultimo:0}},
    {caminho:`usuarios/${uid}`, dados:{role:'admin',ativo:true,lojaId:entrada.lojaId}}
  ];
  const plano = {versao:1, ambiente:'emulator', projetoId:entrada.projetoId, lojaId:entrada.lojaId, matrizVersao:entrada.matrizVersao, documentos};
  return {...plano, hash:sha256(plano), catalogoVazio:true, proximoPedido:1};
}
