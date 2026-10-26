import React from 'react';
import {numeroPedido} from '../../lib/numeroPedido';
import {moeda} from '../../lib/compras';
import {FeedbackAcao} from '../ui/ToastProvider';
export default function ConfirmacaoPedido({pedido,url,erro,ocupado,onPreparar,onNovo}) {
 const formas={pix:'PIX',dinheiro:'Dinheiro',cartao_credito:'Cartão de crédito',cartao_debito:'Cartão de débito'};
 return <main className="checkout-page"><section className="checkout-section"><div className="container"><section className="checkout-confirmation" aria-labelledby="pedido-confirmado-titulo">
  <span className="eyebrow">PEDIDO REGISTRADO</span><h1 id="pedido-confirmado-titulo">Pedido registrado com sucesso!</h1>
  <p>O pedido foi salvo no sistema. Aguarde a confirmação do estabelecimento; o pagamento ainda depende de validação.</p>
  <p className="eyebrow">NÚMERO DO PEDIDO</p><p className="checkout-public-number">#{numeroPedido(pedido)}</p>
  <dl className="checkout-confirmation-details"><div><dt>Total definitivo</dt><dd>{moeda(pedido.total)}</dd></div><div><dt>Forma de pagamento</dt><dd>{formas[pedido.pagamento?.forma] || 'Não informada'}</dd></div><div><dt>Status do pagamento</dt><dd>{{pendente:'Pendente',confirmado:'Confirmado',recusado:'Recusado',cancelado:'Cancelado'}[pedido.pagamento?.status] || 'Não informado'}</dd></div><div><dt>Modalidade</dt><dd>{pedido.tipoEntrega==='retirada'?'Retirada':'Entrega'}</dd></div></dl>
  {erro && <FeedbackAcao mensagem={erro}/>}
  <div className="checkout-confirmation-actions">{url?<a className="whatsapp-checkout-button" href={url} target="_blank" rel="noopener noreferrer">Abrir WhatsApp</a>:<button className="whatsapp-checkout-button" type="button" onClick={onPreparar} disabled={ocupado}>{ocupado?'Preparando WhatsApp...':'Preparar WhatsApp novamente'}</button>}
  <a className="button" href={'/perfil/pedido?id='+encodeURIComponent(pedido.id)}>Ver detalhes do pedido</a><a className="button" href="/perfil/pedidos">Ver meus pedidos</a><button type="button" className="button" onClick={onNovo}>Iniciar novo pedido</button></div>
  <p>O WhatsApp abre com a mensagem preenchida. Confirme o envio no aplicativo.</p>
 </section></div></section></main>;
}
