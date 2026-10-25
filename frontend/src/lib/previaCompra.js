import {validarPerfil} from '../services/perfil.js';
const dinheiro=(v,n)=>{if(typeof v!=='number' || !Number.isFinite(v) || v<0 || v>1000000 || Math.abs(v*100-Math.round(v*100))>Number.EPSILON*Math.max(1,Math.abs(v*100))*4)throw new Error(n+' inválido.');return Number(v.toFixed(2));};
// Mesma aritmética por item e total de pedidoCalculoService; somente prévia.
export function calcularPrevia(itens,taxa=0){const subtotal=Number(itens.reduce((s,i)=>s+Number((i.preco*i.quantidade).toFixed(2)),0).toFixed(2));return {subtotal,taxaEntrega:Number(taxa.toFixed(2)),total:Number((subtotal+taxa).toFixed(2))};}
export function validarPreviaCompra({loja,itens,tipoEntrega,cliente,endereco,enderecoId,forma,observacao=''}) {
  if(!loja || loja.ativo===false)throw new Error('Loja indisponível.');
  if(!['entrega','retirada'].includes(tipoEntrega))throw new Error('Tipo de entrega inválido.');
  if(!Array.isArray(itens) || !itens.length || itens.length>50)throw new Error('O pedido deve possuir entre 1 e 50 itens.');
  const ids=new Set();let unidades=0;
  for(const i of itens){if(ids.has(i.id) || i.ativo!==true || i.disponivel===false || !Number.isInteger(i.quantidade) || i.quantidade<1 || i.quantidade>99)throw new Error('Revise o carrinho: há produtos indisponíveis ou quantidades inválidas.');ids.add(i.id);unidades+=i.quantidade;dinheiro(i.preco,'Preço');}
  if(unidades>500)throw new Error('O pedido excede 500 unidades.');
  validarPerfil(cliente);
  if(!['pix','dinheiro','cartao_credito','cartao_debito'].includes(forma) || loja.pagamentos?.[forma]!==true)throw new Error('Escolha uma forma de pagamento aceita pela loja.');
  let taxa=0;
  if(tipoEntrega==='entrega'){
    if(loja.entrega?.habilitada!==true)throw new Error('Entrega indisponível.');taxa=dinheiro(loja.entrega.taxa,'Taxa de entrega');
    if(!endereco || ['rua','numero','bairro','cidade','uf'].some(k=>typeof endereco[k]!=='string' || !endereco[k].trim()))throw new Error('Preencha o endereço completo.');
    if(!'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ').includes(endereco.uf))throw new Error('UF inválida.');
  }else{if(loja.retirada?.habilitada===false)throw new Error('Retirada indisponível.');if(enderecoId)throw new Error('Retirada não utiliza endereço.');}
  if(typeof observacao!=='string' || observacao.length>1000)throw new Error('Observação inválida.');
  const previa=calcularPrevia(itens,taxa);if(previa.subtotal<(loja.pedidoMinimo || 0))throw new Error('Pedido abaixo do valor mínimo da loja.');return previa;
}
