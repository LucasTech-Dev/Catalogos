import React, { useState } from "react";

function Checkout() {
  const [tipoEntrega, setTipoEntrega] =
    useState("entrega");

  const [formaPagamento, setFormaPagamento] =
    useState("pix");

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [observacao, setObservacao] = useState("");

  const subtotal = 86.8;

  const taxaEntrega =
    tipoEntrega === "entrega" ? 5 : 0;

  const total = subtotal + taxaEntrega;

  const finalizarPedido = () => {
    const mensagem = `
Olá! Gostaria de fazer um pedido.

Nome: ${nome}
Telefone: ${telefone}

Tipo: ${
      tipoEntrega === "entrega"
        ? "Entrega"
        : "Retirada no local"
    }

${
  tipoEntrega === "entrega"
    ? `Endereço: ${endereco}, ${numero}
Bairro: ${bairro}`
    : ""
}

Forma de pagamento: ${formaPagamento}

Total: R$ ${total
      .toFixed(2)
      .replace(".", ",")}

${
  observacao
    ? `Observação: ${observacao}`
    : ""
}
    `.trim();

    const mensagemCodificada =
      encodeURIComponent(mensagem);

    const numeroWhatsApp =
      "5551995310123";

    window.open(
      `https://wa.me/${numeroWhatsApp}?text=${mensagemCodificada}`,
      "_blank"
    );
  };

  return (
    <main className="checkout-page">
      <section className="checkout-section">
        <div className="container">

          <div className="checkout-header">
            <span className="eyebrow">
              FINALIZAÇÃO
            </span>

            <h1>
              Quase lá.
            </h1>

            <p>
              Confirme seus dados para
              finalizar o pedido.
            </p>
          </div>

          <div className="checkout-layout">

            <div className="checkout-form">

              <section className="checkout-block">
                <div className="checkout-block-header">
                  <span>01</span>

                  <div>
                    <h2>
                      Seus dados
                    </h2>

                    <p>
                      Precisamos dessas
                      informações para
                      identificar seu pedido.
                    </p>
                  </div>
                </div>

                <div className="checkout-fields">

                  <div className="checkout-field">
                    <label htmlFor="nome">
                      Nome
                    </label>

                    <input
                      id="nome"
                      type="text"
                      value={nome}
                      onChange={(event) =>
                        setNome(
                          event.target.value
                        )
                      }
                      placeholder="Seu nome"
                    />
                  </div>

                  <div className="checkout-field">
                    <label htmlFor="telefone">
                      WhatsApp
                    </label>

                    <input
                      id="telefone"
                      type="tel"
                      value={telefone}
                      onChange={(event) =>
                        setTelefone(
                          event.target.value
                        )
                      }
                      placeholder="(51) 99999-9999"
                    />
                  </div>

                </div>
              </section>

              <section className="checkout-block">
                <div className="checkout-block-header">
                  <span>02</span>

                  <div>
                    <h2>
                      Como receber?
                    </h2>

                    <p>
                      Escolha entre receber
                      em casa ou retirar.
                    </p>
                  </div>
                </div>

                <div className="delivery-options">

                  <button
                    type="button"
                    className={
                      tipoEntrega ===
                      "entrega"
                        ? "delivery-option active"
                        : "delivery-option"
                    }
                    onClick={() =>
                      setTipoEntrega(
                        "entrega"
                      )
                    }
                  >
                    <strong>
                      Entrega
                    </strong>

                    <small>
                      Receba em seu endereço
                    </small>
                  </button>

                  <button
                    type="button"
                    className={
                      tipoEntrega ===
                      "retirada"
                        ? "delivery-option active"
                        : "delivery-option"
                    }
                    onClick={() =>
                      setTipoEntrega(
                        "retirada"
                      )
                    }
                  >
                    <strong>
                      Retirada
                    </strong>

                    <small>
                      Retire no local
                    </small>
                  </button>

                </div>

                {tipoEntrega ===
                  "entrega" && (
                  <div className="checkout-address">

                    <div className="checkout-field">
                      <label htmlFor="endereco">
                        Endereço
                      </label>

                      <input
                        id="endereco"
                        type="text"
                        value={endereco}
                        onChange={(event) =>
                          setEndereco(
                            event.target.value
                          )
                        }
                        placeholder="Rua / Avenida"
                      />
                    </div>

                    <div className="checkout-fields">

                      <div className="checkout-field">
                        <label htmlFor="numero">
                          Número
                        </label>

                        <input
                          id="numero"
                          type="text"
                          value={numero}
                          onChange={(event) =>
                            setNumero(
                              event.target.value
                            )
                          }
                          placeholder="123"
                        />
                      </div>

                      <div className="checkout-field">
                        <label htmlFor="bairro">
                          Bairro
                        </label>

                        <input
                          id="bairro"
                          type="text"
                          value={bairro}
                          onChange={(event) =>
                            setBairro(
                              event.target.value
                            )
                          }
                          placeholder="Seu bairro"
                        />
                      </div>

                    </div>

                  </div>
                )}
              </section>

              <section className="checkout-block">
                <div className="checkout-block-header">
                  <span>03</span>

                  <div>
                    <h2>
                      Pagamento
                    </h2>

                    <p>
                      O pagamento será
                      combinado através do
                      atendimento no WhatsApp.
                    </p>
                  </div>
                </div>

                <div className="payment-options">

                  <button
                    type="button"
                    className={
                      formaPagamento ===
                      "pix"
                        ? "payment-option active"
                        : "payment-option"
                    }
                    onClick={() =>
                      setFormaPagamento(
                        "pix"
                      )
                    }
                  >
                    <strong>
                      PIX
                    </strong>

                    <small>
                      Pagamento via PIX
                    </small>
                  </button>

                  <button
                    type="button"
                    className={
                      formaPagamento ===
                      "cartao"
                        ? "payment-option active"
                        : "payment-option"
                    }
                    onClick={() =>
                      setFormaPagamento(
                        "cartao"
                      )
                    }
                  >
                    <strong>
                      Cartão
                    </strong>

                    <small>
                      Crédito ou débito
                    </small>
                  </button>

                  <button
                    type="button"
                    className={
                      formaPagamento ===
                      "dinheiro"
                        ? "payment-option active"
                        : "payment-option"
                    }
                    onClick={() =>
                      setFormaPagamento(
                        "dinheiro"
                      )
                    }
                  >
                    <strong>
                      Dinheiro
                    </strong>

                    <small>
                      Pagamento na entrega
                    </small>
                  </button>

                </div>
              </section>

              <section className="checkout-block">
                <div className="checkout-block-header">
                  <span>04</span>

                  <div>
                    <h2>
                      Observações
                    </h2>

                    <p>
                      Alguma informação
                      adicional?
                    </p>
                  </div>
                </div>

                <textarea
                  className="checkout-observation"
                  value={observacao}
                  onChange={(event) =>
                    setObservacao(
                      event.target.value
                    )
                  }
                  placeholder="Ex.: tocar a campainha, retirar algum ingrediente..."
                  rows="4"
                />
              </section>

            </div>

            <aside className="checkout-summary">

              <div className="checkout-summary-header">
                <span>
                  SEU PEDIDO
                </span>

                <strong>
                  2 itens
                </strong>
              </div>

              <div className="checkout-product">
                <div>
                  <strong>
                    2x Classic Burger
                  </strong>

                  <small>
                    Bacon + Queijo
                  </small>
                </div>

                <strong>
                  R$ 67,80
                </strong>
              </div>

              <div className="checkout-product">
                <div>
                  <strong>
                    1x Batata da Casa
                  </strong>
                </div>

                <strong>
                  R$ 18,90
                </strong>
              </div>

              <div className="checkout-summary-divider" />

              <div className="checkout-summary-row">
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

              <div className="checkout-summary-row">
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

              <div className="checkout-summary-total">
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
                className="whatsapp-checkout-button"
                onClick={finalizarPedido}
              >
                Finalizar pelo WhatsApp
              </button>

              <p className="checkout-disclaimer">
                Ao continuar, seu pedido será
                enviado para o WhatsApp da
                loja para confirmação.
              </p>

            </aside>

          </div>
        </div>
      </section>
    </main>
  );
}

export default Checkout;