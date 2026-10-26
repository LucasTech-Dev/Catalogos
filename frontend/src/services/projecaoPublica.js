import {textoBemFormado} from '../lib/textoBemFormado.js';
import {doc, runTransaction,serverTimestamp} from 'firebase/firestore';

// Contrato público explícito, inclusive folhas de mapas. Nunca copiar dados por spread.
export const CAMPOS_PUBLICOS = Object.freeze({
  "loja": {
    "nome": "",
    "descricao": "",
    "telefone": "",
    "whatsapp": "",
    "logo": "",
    "imagem": "",
    "corPrimaria": "",
    "tempoMedio": "",
    "instagram": "",
    "ativo": true,
    "endereco": {
      "rua": "",
      "logradouro": "",
      "numero": "",
      "bairro": "",
      "cidade": "",
      "uf": "",
      "complemento": "",
      "cep": ""
    },
    "horarios": {
      "segunda": "",
      "terca": "",
      "quarta": "",
      "quinta": "",
      "sexta": "",
      "sabado": "",
      "domingo": ""
    },
    "pagamentos": {
      "pix": false,
      "dinheiro": false,
      "cartao": false,
      "cartao_credito": false,
      "cartao_debito": false
    },
    "entrega": {
      "habilitada": false,
      "taxa": 0
    },
    "retirada": {
      "habilitada": true
    },
    "pedidoMinimo": 0
  },
  "categorias": {
    "nome": "",
    "descricao": "",
    "icone": "",
    "ordem": 0,
    "ativo": true
  },
  "produtos": {
    "nome": "",
    "descricao": "",
    "categoriaId": "",
    "preco": 0,
    "ativo": true,
    "disponivel": true,
    "imagem": "",
    "ingredientes": []
  }

});
const idValido=id=>typeof id==='string' && Boolean(id.trim()) && id.length<=128 && textoBemFormado(id) && !/[\/\\\u0000-\u001f\u007f-\u009f]/.test(id) && !['.','..'].includes(id);
function selecionar(dados,modelo,caminho='') {
  const saida={};
  for(const [campo,padrao] of Object.entries(modelo)) {
    let valor=dados?.[campo] ?? (caminho==='horarios'?dados?.[campo==='terca'?'terça':campo==='sabado'?'sábado':campo]:undefined) ?? padrao;
    if(caminho==='' && campo==='horarios')valor=dados?.horarios ?? dados?.horarioFuncionamento ?? padrao;
    if(caminho==='horarios' && valor && typeof valor==='object' && !Array.isArray(valor)){
      if(typeof (valor.abertura ?? '')!=='string' || typeof (valor.fechamento ?? '')!=='string' || typeof (valor.fechado ?? false)!=='boolean')throw Error('Horário público inválido.');
      valor=valor.fechado===true?'Fechado':[(valor.abertura || ''),(valor.fechamento || '')].filter(Boolean).join(' às ') || 'Consulte a loja';
    }
    if(caminho==='entrega' && campo==='taxa')valor=dados?.taxa ?? padrao;
    if((campo==='endereco' || campo==='horarios' || caminho==='horarios') && typeof valor==='string'){saida[campo]=valor;continue;}
    if(Array.isArray(padrao)) {
      if(!Array.isArray(valor) || valor.length>50 || !valor.every(v=>typeof v==='string'))throw Error('Lista pública inválida: '+campo);
      saida[campo]=[...valor];
    } else if(padrao && typeof padrao==='object') {
      if(!valor || typeof valor!=='object' || Array.isArray(valor))throw Error('Mapa público inválido: '+campo);
      saida[campo]=selecionar(valor,padrao,campo);
    } else {
      if(typeof valor!==typeof padrao || typeof valor==='number' && !Number.isFinite(valor))throw Error('Campo público inválido: '+campo);
      saida[campo]=valor;
    }
  }
  return saida;
}
export function projetarRegistro(tipo,dados) {
  if(!Object.hasOwn(CAMPOS_PUBLICOS,tipo))throw Error('Tipo público inválido.');
  if(tipo==='produtos' && (!Number.isFinite(dados?.preco) || dados.preco<0 || dados.preco>1000000))throw Error('Preço público inválido.');
  if(tipo==='loja')dados={...dados,entrega:{...dados?.entrega,taxa:dados?.entrega?.taxa ?? dados?.taxaEntrega ?? 0}};
  return selecionar(dados,CAMPOS_PUBLICOS[tipo]);
}
function mesclar(origem,patch) {
  const resultado={...origem};
  for(const [k,v] of Object.entries(patch))resultado[k]=v && typeof v==='object' && !Array.isArray(v) && Object.keys(v).length?mesclar(origem?.[k] && typeof origem[k]==='object'?origem[k]:{},v):v;
  return resultado;
}
// Gravador compartilhado do painel: origem, projeção e revisão mudam atomicamente.
// Patch limitado aos campos públicos. Campos privados existentes da origem são preservados.
export async function salvarComProjecao(db,lojaId,tipo,id,patch={},opcoes={}) {
  if(!idValido(lojaId) || !Object.hasOwn(CAMPOS_PUBLICOS,tipo) || tipo!=='loja' && !idValido(id))throw Error('Registro inválido.');
  if(!patch || typeof patch!=='object' || Object.keys(patch).some(k=>!Object.hasOwn(CAMPOS_PUBLICOS[tipo],k)))throw Error('Alteração fora do contrato público.');
  const sufixo=tipo==='loja'?'':`/${tipo}/${id}`;
  const origem=doc(db,`lojas/${lojaId}${sufixo}`),publico=doc(db,`catalogosPublicos/${lojaId}${sufixo}`);
  return runTransaction(db,async tx=>{
    const atual=await tx.get(origem);
    const controle=doc(db,`lojas/${lojaId}/controleCompra/versao`);
    const revisao=await tx.get(controle);
    opcoes.conferir?.();
    if(opcoes.modo==='criar' && atual.exists())throw Object.assign(new Error('Identificador já utilizado.'),{status:409});
    if(opcoes.modo==='editar' && !atual.exists())throw Object.assign(new Error('Registro não encontrado.'),{status:404});
    const valores=opcoes.preparar?opcoes.preparar(atual.data(),patch):patch;
    const dados=mesclar(atual.exists()?atual.data():{},valores);
    const projecao=projetarRegistro(tipo,dados);
    if(Object.keys(valores).length)tx.set(origem,{...valores,...(opcoes.registrarDatas?{atualizadoEm:serverTimestamp(),...(!atual.exists() && tipo==='produtos'?{criadoEm:serverTimestamp()}: {})}: {})},{merge:true});
    else if(!atual.exists())throw Error('Origem inexistente.');
    // A revisão é opcional para lojas ainda não habilitadas para compras.
    // As Rules exigem o avanço atômico; não dependem desta comparação JS.
    const canonico=v=>Array.isArray(v)?v.map(canonico):v && typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonico(v[k])])):v;
    if(revisao.exists() && (opcoes.registrarDatas || JSON.stringify(canonico(atual.data()))!==JSON.stringify(canonico(dados))))
      tx.set(controle,{revisao:revisao.data().revisao+1,alteracao:{tipo,id:tipo==='loja'?'loja':id}});
    tx.set(publico,projecao);
    return projecao;
  });
}
