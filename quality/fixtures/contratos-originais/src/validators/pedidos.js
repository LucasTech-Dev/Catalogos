const v=require('./base');
const {identificador}=require('../lib/identificadores');
function itens(dados) {
  if(!Array.isArray(dados) || !dados.length || dados.length>v.LIMITES.itensPedido)throw v.erro(`O pedido deve possuir entre 1 e ${v.LIMITES.itensPedido} itens.`);
  const ids=new Set();let quantidade=0;
  for(const item of dados) {
    // precoUnitario é uma dica legada: validada, nunca usada no cálculo.
    v.campos(item,['produtoId','quantidade','precoUnitario']);identificador(item.produtoId);
    if(!Number.isInteger(item.quantidade) || item.quantidade<1 || item.quantidade>v.LIMITES.quantidadeItem)throw v.erro('A quantidade de cada item deve ser um número inteiro de 1 a 99.');
    if(ids.has(item.produtoId))throw v.erro('Produtos repetidos no pedido.');ids.add(item.produtoId);
    quantidade+=item.quantidade;
    if(item.precoUnitario!==undefined)v.dinheiro(item.precoUnitario,'Preço informado');
  }
  if(quantidade>v.LIMITES.quantidadePedido)throw v.erro(`O pedido excede ${v.LIMITES.quantidadePedido} unidades.`);
  return dados;
}
function pagamento(dados) {
  v.objeto(dados);
  if(require('../services/pagamentoService').detectarDadosSensiveis(dados))throw v.erro('Dados sensíveis de pagamento não devem ser enviados.');
  v.campos(dados,['forma','status','valor']);
  require('../services/pagamentoService').normalizarFormaPagamento(dados.forma);
  if(dados.status!==undefined && dados.status!=='pendente')throw v.erro('O cliente não pode confirmar ou alterar o status do pagamento.');
  if(dados.valor!==undefined)v.dinheiro(dados.valor,'Valor de pagamento');
  return dados;
}
function pedido(dados,{publico=false}={}) {
  v.estrutura(dados);
  v.campos(dados,['itens','tipoEntrega','enderecoId','pagamento','formaPagamento','cliente','observacao','clienteId','taxaEntrega','desconto','total']);
  itens(dados.itens);
  const tipo=dados.tipoEntrega===undefined?'entrega':dados.tipoEntrega;
  if(!['entrega','retirada'].includes(tipo))throw v.erro('Tipo de entrega inválido.');
  if(tipo==='entrega' && !dados.enderecoId)throw v.erro('enderecoId é obrigatório para pedidos com entrega.');
  if(dados.enderecoId!==undefined && dados.enderecoId!==null)identificador(dados.enderecoId);
  if(tipo==='retirada' && dados.enderecoId)throw v.erro('Pedidos para retirada não devem possuir enderecoId.');
  if(dados.clienteId!==undefined && dados.clienteId!==null)identificador(dados.clienteId);
  for(const campo of ['taxaEntrega','desconto','total'])if(dados[campo]!==undefined)v.dinheiro(dados[campo],campo);
  if(publico && dados.desconto)throw v.erro('Desconto não autorizado.');
  if(tipo==='retirada' && dados.taxaEntrega)throw v.erro('Pedidos para retirada não podem possuir taxa de entrega.');
  if(dados.observacao!==undefined)v.texto(dados.observacao,'Observação',1000,false,true);
  if(dados.cliente!==undefined)require('./perfil').cliente(dados.cliente);
  if(dados.pagamento!==undefined)pagamento(dados.pagamento);
  else require('../services/pagamentoService').normalizarFormaPagamento(dados.formaPagamento);
  if(dados.formaPagamento!==undefined) {
    const forma=require('../services/pagamentoService').normalizarFormaPagamento(dados.formaPagamento);
    if(dados.pagamento && forma!==require('../services/pagamentoService').normalizarFormaPagamento(dados.pagamento.forma))throw v.erro('Formas de pagamento contraditórias.');
  }
  return dados;
}
function status(dados,financeiro=false) {
  v.campos(dados,['status']);
  if(financeiro)require('../services/pagamentoService').normalizarStatusPagamento(dados.status);
  else require('../services/pedidoStatusService').validarStatus(dados.status);
  return dados;
}
module.exports={itens,pagamento,pedido,status};
