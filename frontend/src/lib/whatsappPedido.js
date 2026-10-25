import {moeda,urlWhatsapp} from './compras.js';
// Compatibilidade da finalização existente. Chamador consulta o pedido autorizado;
// mensagem/URL não confirmam pagamento nem criam pedido.
export function mensagemPedido(loja,pedido){
  if(!pedido.itens?.length || ['cancelado','pagamento_recusado'].includes(pedido.status))throw new Error('Pedido indisponível para finalização.');
  let numero=String(loja.whatsapp || '').replace(/\D/g,'');if(numero.startsWith('00'))numero=numero.slice(2);if([10,11].includes(numero.length))numero='55'+numero;if(numero.length<12 || numero.length>15 || /^0+$/.test(numero))throw new Error('WhatsApp da loja possui formato inválido.');
  if(pedido.tipoEntrega==='entrega' && !pedido.endereco)throw new Error('Endereço do pedido não encontrado para finalização.');
  const linhas=[`Olá! Gostaria de finalizar o pedido #${pedido.id}.`,'',`Loja: ${loja.nome || pedido.lojaId}`];
  if(pedido.cliente?.nome)linhas.push(`Cliente: ${pedido.cliente.nome}`);if(pedido.cliente?.telefone)linhas.push(`Telefone: ${pedido.cliente.telefone}`);
  linhas.push('','Itens:');for(const i of pedido.itens)linhas.push(`${i.quantidade}x ${i.nome || i.produtoId || 'Produto'} - ${moeda(i.precoUnitario)} = ${moeda(i.subtotal)}`);
  linhas.push('',`Subtotal: ${moeda(pedido.subtotal)}`,`Entrega: ${moeda(pedido.taxaEntrega)}`,`Desconto: ${moeda(pedido.desconto)}`,`Total: ${moeda(pedido.total)}`,'',`Tipo: ${pedido.tipoEntrega==='retirada'?'Retirada':'Entrega'}`);
  if(pedido.tipoEntrega==='entrega'){const e=pedido.endereco;linhas.push('Endereço: '+[e.rua || e.logradouro,e.numero,e.bairro,e.cidade,e.uf].filter(Boolean).join(', '));}
  if(pedido.observacao)linhas.push('',`Observação: ${pedido.observacao}`);
  const formas={pix:'PIX',dinheiro:'Dinheiro',cartao_credito:'Cartão de crédito',cartao_debito:'Cartão de débito'},status={pendente:'Pendente',confirmado:'Confirmado',recusado:'Recusado',cancelado:'Cancelado'};
  linhas.push('',`Pagamento: ${formas[pedido.pagamento?.forma] || pedido.pagamento?.forma || 'Não informado'}`,`Status do pagamento: ${status[pedido.pagamento?.status] || pedido.pagamento?.status || 'Não informado'}`);
  return {url:urlWhatsapp(`https://wa.me/${numero}?text=${encodeURIComponent(linhas.join('\n'))}`)};
}
