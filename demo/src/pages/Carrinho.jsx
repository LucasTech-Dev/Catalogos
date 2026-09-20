import React, { useState } from "react";

import CartItem from "../components/ui/CartItem";

const carrinhoInicial = [
  {
    id: 1,
    categoria: "Hambúrgueres",
    nome: "Classic Burger",
    preco: 28.9,
    quantidade: 2,
    imagem:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
    adicionaisTotal: 9,
    adicionais: [
      {
        id: 1,
        nome: "Bacon crocante",
      },
      {
        id: 2,
        nome: "Queijo extra",
      },
    ],
    observacao: "Sem cebola",
  },
  {
    id: 2,
    categoria: "Porções",
    nome: "Batata da Casa",
    preco: 18.9,
    quantidade: 1,
    imagem:
      "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80",
    adicionaisTotal: 0,
    adicionais: [],
    observacao: "",
  },
];

const taxaEntrega = 5;

function Carrinho() {
  const [itens, setItens] =
    useState(carrinhoInicial);

  const alterarQuantidade = (
    id,
    quantidade
  ) => {
    setItens((itensAtuais) =>
      itensAtuais.map((item) =>
        item.id === id
          ? {
              ...item,
              quantidade,
            }
          : item
      )
    );
  };

  const removerItem = (id) => {
    setItens((itensAtuais) =>
      itensAtuais.filter(
        (item) => item.id !== id
      )
    );
  };

  const subtotal = itens.reduce(
    (total, item) =>
      total +
      (item.preco + item.adicionaisTotal) *
        item.quantidade,
    0
  );

  const total = subtotal + taxaEntrega;

  return (
    <main className="cart-page">
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

          <div className="cart-layout">

            <div className="cart-items">

              {itens.length > 0 ? (
                itens.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onQuantidadeChange={
                      alterarQuantidade
                    }
                    onRemover={removerItem}
                  />
                ))
              ) : (
                <div className="cart-empty">
                  <span>🛒</span>

                  <h2>
                    Seu carrinho está vazio.
                  </h2>

                  <p>
                    Adicione alguns produtos
                    para continuar.
                  </p>

                  <button
                    type="button"
                    className="continue-shopping-button"
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
                >
                  Continuar para checkout
                </button>

                <button
                  type="button"
                  className="continue-shopping-button"
                >
                  Continuar comprando
                </button>

              </aside>
            )}

          </div>
        </div>
      </section>
    </main>
  );
}

export default Carrinho;