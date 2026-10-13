const {getFirestore,AggregateField} = require('firebase-admin/firestore');
const v = require('./adminValidacaoService');
const {selecionar} = require('./publicoService');
const {STATUS_VALIDOS,TRANSICOES_PERMITIDAS} = require('./pedidoStatusService');
const {TRANSICOES_PAGAMENTO} = require('./pagamentoService');
const db=getFirestore();
const lojaRef=id=>db.collection('lojas').doc(v.id(id));
const colecao=(loja,nome)=>lojaRef(loja).collection(nome);
async function existeLoja(loja) {if (!(await lojaRef(loja).get()).exists) throw v.erro('Loja não encontrada.',404);}
async function buscar(loja,nome,id) {const doc=await colecao(loja,nome).doc(v.id(id)).get();if (!doc.exists) throw v.erro('Registro não encontrado.',404);return {...doc.data(),id:doc.id};}
async function listar(loja,nome,opcoes={}) {
  await existeLoja(loja);
  const limite=Number(opcoes.limite || 25);if (!Number.isInteger(limite) || limite<1 || limite>100) throw v.erro('Limite deve estar entre 1 e 100.');
  let query=colecao(loja,nome);
  if (nome==='pedidos' && opcoes.status) {if (!STATUS_VALIDOS.includes(opcoes.status)) throw v.erro('Status inválido.');query=query.where('status','==',opcoes.status);}
  if (nome==='produtos' && opcoes.categoriaId) query=query.where('categoriaId','==',v.id(opcoes.categoriaId));
  query=query.orderBy(nome==='pedidos'?'criadoEm':'__name__',nome==='pedidos'?'desc':'asc');
  if (opcoes.cursor) {const cursor=await colecao(loja,nome).doc(v.id(opcoes.cursor)).get();if (!cursor.exists) throw v.erro('Cursor inválido.');query=query.startAfter(cursor);}
  const docs=(await query.limit(limite+1).get()).docs;
  const itens=docs.slice(0,limite).map(doc=>({...doc.data(),id:doc.id}));
  if (nome==='clientes') for(const item of itens) {const id=item.id;const seguro=selecionar(item,['nome','telefone','email','anonimo','atualizadoEm']);Object.keys(item).forEach(k=>delete item[k]);Object.assign(item,seguro,{id});}
  if (nome==='categorias' && opcoes.contagem!=='0') await Promise.all(itens.map(async c=>{c.produtos=(await colecao(loja,'produtos').where('categoriaId','==',c.id).count().get()).data().count;}));
  return {itens,proximoCursor:docs.length>limite ? itens.at(-1).id : null};
}
async function salvarProduto(loja,id,dados) {
  const valores=v.produto(dados,Boolean(id));await existeLoja(loja);
  const ref=id ? colecao(loja,'produtos').doc(v.id(id)) : colecao(loja,'produtos').doc();
  await db.runTransaction(async tx=>{
    const atual=id?await tx.get(ref):null;if(id && !atual.exists) throw v.erro('Produto não encontrado.',404);
    const produto={...(atual?.data() || {}),...valores};
    if (!produto.categoriaId && produto.ativo === false) {tx.set(ref,{...valores,atualizadoEm:new Date()},{merge:true});return;}
    const catRef=colecao(loja,'categorias').doc(v.id(produto.categoriaId));const categoria=await tx.get(catRef);
    if (!categoria.exists || (produto.ativo===true && categoria.data().ativo===false)) throw v.erro('Categoria não encontrada ou inativa.');
    // Escrita no documento da categoria serializa criação/ativação e remoção da categoria.
    tx.update(catRef,{atualizadoEm:new Date()});
    tx.set(ref,{...valores,atualizadoEm:new Date(),...(!id?{criadoEm:new Date()}: {})},{merge:true});
  });
  return buscar(loja,'produtos',ref.id);
}
async function desativarProduto(loja,id) {const ref=colecao(loja,'produtos').doc(v.id(id));if (!(await ref.get()).exists) throw v.erro('Produto não encontrado.',404);await ref.update({ativo:false,disponivel:false,atualizadoEm:new Date()});return buscar(loja,'produtos',id);}
async function salvarCategoria(loja,id,dados) {
  const valores=v.categoria(dados,Boolean(id));await existeLoja(loja);const ref=id ? colecao(loja,'categorias').doc(v.id(id)) : colecao(loja,'categorias').doc();
  await db.runTransaction(async tx=>{
    const atual=id?await tx.get(ref):null;if(id&&!atual.exists) throw v.erro('Categoria não encontrada.',404);
    if (id && valores.ativo===false) {
      const ligados=await tx.get(colecao(loja,'produtos').where('categoriaId','==',id).where('ativo','==',true).limit(1));
      if (!ligados.empty) throw v.erro('Desative os produtos ativos antes de desativar a categoria.',409);
    }
    tx.set(ref,{...valores,atualizadoEm:new Date()},{merge:true});
  });return buscar(loja,'categorias',ref.id);
}
async function excluirCategoria(loja,id) {
  const ref=colecao(loja,'categorias').doc(v.id(id));
  await db.runTransaction(async tx=>{const atual=await tx.get(ref);const produtos=await tx.get(colecao(loja,'produtos').where('categoriaId','==',id).limit(1));if(!atual.exists)throw v.erro('Categoria não encontrada.',404);if(!produtos.empty)throw v.erro('Categoria possui produtos vinculados. Mova-os antes de excluir.',409);tx.delete(ref);});
}
async function buscarLoja(loja) {const doc=await lojaRef(loja).get();if(!doc.exists)throw v.erro('Loja não encontrada.',404);return {...selecionar(doc.data(),v.CAMPOS_LOJA),id:doc.id};}
async function salvarLoja(loja,dados) {const valores=v.loja(dados);await existeLoja(loja);await lojaRef(loja).update({...valores,atualizadoEm:new Date()});return buscarLoja(loja);}
function periodo(opcoes) {
  const hoje=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const inicio=opcoes.inicio || hoje,fim=opcoes.fim || inicio;
  const data=value=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(value))throw v.erro('Data inválida.');const d=new Date(value+'T00:00:00-03:00');if(!Number.isFinite(d.getTime()) || d.toISOString().slice(0,10)!==value)throw v.erro('Data inválida.');return d;};
  const de=data(inicio),ate=data(fim);ate.setUTCDate(ate.getUTCDate()+1);
  if(ate<=de || ate-de>31*86400000)throw v.erro('Selecione um período de até 31 dias.');return {inicio,fim,de,ate};
}
async function dashboard(loja,opcoes={}) {
  await existeLoja(loja);const p=periodo(opcoes),pedidos=colecao(loja,'pedidos').where('criadoEm','>=',p.de).where('criadoEm','<',p.ate);
  const count=async q=>(await q.count().get()).data().count;
  const soma=async q=>(await q.aggregate({total:AggregateField.sum('total')}).get()).data().total || 0;
  const [total,valorPedidos,valorConfirmado,porStatus,totalProdutos,recentes]=await Promise.all([
    count(pedidos),soma(pedidos),soma(pedidos.where('pagamento.status','==','confirmado').where('status','!=','cancelado').orderBy('criadoEm').orderBy('status')),
    Promise.all(STATUS_VALIDOS.map(async status=>[status,await count(pedidos.where('status','==',status))])),
    count(colecao(loja,'produtos')),pedidos.orderBy('criadoEm','desc').limit(5).get()
  ]);
  // Produtos legados sem campo disponivel são disponíveis quando ativos; consulta adicional evita excluí-los.
  const ativos=await count(colecao(loja,'produtos').where('ativo','==',true));
  const explicitamenteIndisponiveis=await count(colecao(loja,'produtos').where('ativo','==',true).where('disponivel','==',false));
  return {periodo:{inicio:p.inicio,fim:p.fim,fuso:'America/Sao_Paulo'},pedidos:total,porStatus:Object.fromEntries(porStatus),valorPedidos,valorPagamentosConfirmados:valorConfirmado,produtos:{disponiveis:ativos-explicitamenteIndisponiveis,indisponiveis:totalProdutos-(ativos-explicitamenteIndisponiveis)},recentes:recentes.docs.map(d=>({...d.data(),id:d.id})),criterio:'Pedidos criados no período. Pagamentos confirmados manualmente, excluindo pedidos cancelados; não representa liquidação de gateway.'};
}
async function detalhePedido(loja,id) {
  const pedido=await buscar(loja,'pedidos',id);
  if (!pedido.endereco && pedido.enderecoId && pedido.clienteId) {
    const doc=await colecao(loja,'clientes').doc(v.id(pedido.clienteId)).collection('enderecos').doc(v.id(pedido.enderecoId)).get();pedido.endereco=doc.exists ? selecionar(doc.data(),['rua','numero','bairro','cidade','uf','complemento','cep']) : null;
  }
  return {...pedido,transicoesStatus:TRANSICOES_PERMITIDAS[pedido.status] || [],transicoesPagamento:pedido.status==='cancelado'?[]:TRANSICOES_PAGAMENTO[pedido.pagamento?.status] || []};
}
module.exports={listar,buscar,buscarLoja,salvarLoja,salvarProduto,desativarProduto,salvarCategoria,excluirCategoria,dashboard,detalhePedido,periodo};
