import {numeroPedido} from './numeroPedido.js';
import {moeda,urlWhatsapp} from './compras.js';
// Compatibilidade da finalização existente. Chamador consulta o pedido autorizado;
// mensagem/URL não confirmam pagamento nem criam pedido.
export function mensagemPedido(loja,pedido){
  if(!pedido.itens?.length || ['cancelado','pagamento_recusado'].includes(pedido.status))throw new Error('Pedido indisponível para finalização.');
  let numero=String(loja.whatsapp || '').replace(/\D/g,'');if(numero.startsWith('00'))numero=numero.slice(2);if([10,11].includes(numero.length))numero='55'+numero;if(numero.length<12 || numero.length>15 || /^0+$/.test(numero))throw new Error('WhatsApp da loja possui formato inválido.');
  if(pedido.tipoEntrega==='entrega' && !pedido.endereco)throw new Error('Endereço do pedido não encontrado para finalização.');
  const numeroComercial=numeroPedido(pedido);
  const titulo=numeroComercial==='Sem número'?'*PEDIDO ANTIGO — sem número comercial*':`*PEDIDO #${numeroComercial}*`;
  const linhas=[titulo,`Loja: ${loja.nome || 'Estabelecimento'}`,''];
  if(pedido.cliente?.nome)linhas.push(`Cliente: ${pedido.cliente.nome}`);if(pedido.cliente?.telefone)linhas.push(`Telefone: ${pedido.cliente.telefone}`);
  linhas.push('','*Itens*');for(const i of pedido.itens)linhas.push(`• ${i.quantidade}x ${i.nome || 'Produto'}`,`  ${moeda(i.precoUnitario)} cada · ${moeda(i.subtotal)}`);
  linhas.push('',`Subtotal: ${moeda(pedido.subtotal)}`,`Entrega: ${moeda(pedido.taxaEntrega)}`,`Desconto: ${moeda(pedido.desconto)}`,`*Total: ${moeda(pedido.total)}*`,'',`Tipo: ${pedido.tipoEntrega==='retirada'?'Retirada':'Entrega'}`);
  if(pedido.tipoEntrega==='entrega'){const e=pedido.endereco;linhas.push('Endereço: '+[e.rua || e.logradouro,e.numero,e.bairro,e.cidade,e.uf].filter(Boolean).join(', '));}
  if(pedido.observacao)linhas.push('',`*Observações*`,pedido.observacao);
  const formas={pix:'PIX',dinheiro:'Dinheiro',cartao_credito:'Cartão de crédito',cartao_debito:'Cartão de débito'},status={pendente:'Pendente',confirmado:'Confirmado',recusado:'Recusado',cancelado:'Cancelado'};
  const pagamento=pedido.pagamento || {};
  const statusFinanceiro=pagamento.status==='confirmado'
    ? pagamento.origem==='manual_estabelecimento'
      ? 'Confirmado manualmente pelo estabelecimento (não é confirmação bancária)'
      : 'Marcado como confirmado no sistema — solicitar verificação ao estabelecimento'
    : status[pagamento.status] || pagamento.status || 'Não informado';
  linhas.push('',`Pagamento: ${formas[pagamento.forma] || pagamento.forma || 'Não informado'}`,`Status do pagamento: ${statusFinanceiro}`);
  linhas.push('','Aguardo a confirmação do estabelecimento.');
  return {url:urlWhatsapp(`https://wa.me/${numero}?text=${encodeURIComponent(linhas.join('\n'))}`)};
}
