import MaterialIcon from "../components/ui/MaterialIcon";
import React from "react";

import CartItem from "../components/ui/CartItem";

import {useLoja, EstadoCatalogo, CatalogoPronto} from "../contexts/LojaContext";
import {modoOriginalDemo} from '../lib/runtimeDemo';
function Carrinho() {
  const demonstrativo=modoOriginalDemo(import.meta.env);
  const {itens,alterarQuantidade,removerItem,subtotal,loja} = useLoja();
  const taxaEntrega = loja?.entrega?.habilitada ? Number(loja.entrega.taxa || 0) : 0;
  const total = subtotal + taxaEntrega;
  return (<CatalogoPronto>
    <main className={`cart-page${itens.length === 0 ? " cart-page--empty" : ""}`}>
      <section className="cart-section">
        <div className="container">

          <div className="cart-header">
            <span className="eyebrow">
              SEU PEDIDO
            </span>

            <h1>
              Seu carrinho.
            </h1>

            <p>
              Confira seus itens antes de
              continuar.
            </p>
          </div>

          <EstadoCatalogo />
          <p className="cart-notice">{demonstrativo?'Carrinho demonstrativo. Nenhum pedido será enviado.':'Valores estimados. O total é confirmado somente após validação e gravação do pedido.'}</p>
          <div className={`cart-layout${itens.length === 0 ? " cart-layout--empty" : ""}`}>

            <div className="cart-items">

              {itens.length > 0 ? (
                itens.map((item) => (
                  <CartItem
                    key={item.chave || item.id}
                    item={item}
                    onQuantidadeChange={
                      alterarQuantidade
                    }
                    onRemover={removerItem}
                  />
                ))
              ) : (
                <div className="cart-empty">
                  <span><MaterialIcon name="shopping_cart"/></span>

                  <h2>
                    Seu carrinho está vazio.
                  </h2>

                  <p>
                    Adicione alguns produtos
                    para continuar.
                  </p>

                  <button
                    type="button"
                    className="continue-shopping-button" onClick={() => window.location.assign("/cardapio")}
                  >
                    Ver cardápio
                  </button>
                </div>
              )}

            </div>

            {itens.length > 0 && (
              <aside className="cart-summary">

                <h2>
                  Resumo do pedido
                </h2>

                <div className="summary-row">
                  <span>
                    Subtotal
                  </span>

                  <strong>
                    R${" "}
                    {subtotal
                      .toFixed(2)
                      .replace(".", ",")}
                  </strong>
                </div>

                <div className="summary-row">
                  <span>
                    Entrega
                  </span>

                  <strong>
                    R${" "}
                    {taxaEntrega
                      .toFixed(2)
                      .replace(".", ",")}
                  </strong>
                </div>

                <div className="summary-divider" />

                <div className="summary-total">
                  <span>
                    Total
                  </span>

                  <strong>
                    R${" "}
                    {total
                      .toFixed(2)
                      .replace(".", ",")}
                  </strong>
                </div>

                <button
                  type="button"
                  className="checkout-button"
                  disabled={demonstrativo}
                  onClick={() => window.location.assign("/checkout")}
                >
                  {demonstrativo?'Checkout indisponível na demonstração':'Continuar para checkout'}
                </button>

                <button
                  type="button"
                  className="continue-shopping-button" onClick={() => window.location.assign("/cardapio")}
                >
                  Continuar comprando
                </button>

              </aside>
            )}

          </div>
        </div>
      </section>
    </main></CatalogoPronto>
  );
}

export default Carrinho;
