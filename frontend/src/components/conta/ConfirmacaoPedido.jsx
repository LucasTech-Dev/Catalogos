import React from 'react';
import {numeroPedido} from '../../lib/numeroPedido';
import {moeda} from '../../lib/compras';
import {FeedbackAcao} from '../ui/ToastProvider';
import MaterialIcon from '../ui/MaterialIcon';
import './ConfirmacaoPedido.css';
export default function ConfirmacaoPedido({pedido,url,erro,ocupado,onPreparar,onNovo}) {
 const formas={pix:'PIX',dinheiro:'Dinheiro',cartao_credito:'Cartão de crédito',cartao_debito:'Cartão de débito'};
 return <main className="checkout-page checkout-confirmation-page"><section className="checkout-section"><div className="container"><section className="checkout-confirmation" aria-labelledby="pedido-confirmado-titulo">
  <header className="checkout-confirmation-header"><span className="checkout-success-icon"><MaterialIcon name="check_circle" size={32}/></span><span className="eyebrow">PEDIDO REGISTRADO</span><h1 id="pedido-confirmado-titulo">Pedido registrado com sucesso!</h1><p>Seu pedido foi salvo. Agora envie as informações para a loja pelo WhatsApp.</p></header>
  <div className="checkout-number-block"><span>Número do pedido</span><p className="checkout-public-number">#{numeroPedido(pedido)}</p></div>
  <div className="checkout-confirmation-total"><span>Total do pedido</span><strong>{moeda(pedido.total)}</strong></div>
  <dl className="checkout-confirmation-details"><div><dt>Forma de pagamento</dt><dd>{formas[pedido.pagamento?.forma] || 'Não informada'}</dd></div><div><dt>Status do pagamento</dt><dd>{{pendente:'Pendente',confirmado:'Confirmado',recusado:'Recusado',cancelado:'Cancelado'}[pedido.pagamento?.status] || 'Não informado'}</dd></div><div><dt>Modalidade</dt><dd>{pedido.tipoEntrega==='retirada'?'Retirada':'Entrega'}</dd></div></dl>
  {erro && <FeedbackAcao mensagem={erro}/>}
  <div className="checkout-confirmation-actions">{url?<a className="whatsapp-checkout-button" href={url} target="_blank" rel="noopener noreferrer"><MaterialIcon name="arrow_forward" size={20}/>Abrir WhatsApp</a>:<button className="whatsapp-checkout-button" type="button" onClick={onPreparar} disabled={ocupado} aria-busy={ocupado}>{ocupado?'Preparando WhatsApp...':'Preparar WhatsApp novamente'}</button>}
  {pedido.id && <a className="button checkout-view-order" href={'/perfil/pedido?id='+encodeURIComponent(pedido.id)}><MaterialIcon name="receipt_long" size={20}/>Ver meu pedido</a>}<button type="button" className="button checkout-new-order" onClick={onNovo}><MaterialIcon name="add" size={20}/>Iniciar novo pedido</button></div>
  <p className="checkout-confirmation-note">Confirme o envio no WhatsApp e aguarde o atendimento da loja. O envio da mensagem não confirma recebimento nem pagamento.</p>
 </section></div></section></main>;
}
