import React, { useState } from "react";

function Configuracoes() {
  const [salvo, setSalvo] = useState(false);

  const [config, setConfig] = useState({
    nome: "Lancheria Demo",
    descricao:
      "Os melhores hambúrgueres artesanais da região.",
    telefone: "(51) 99999-9999",
    whatsapp: "(51) 99999-9999",
    instagram: "@lancheriademo",

    endereco: "Rua Principal, 120",
    bairro: "Centro",
    cidade: "Capão da Canoa - RS",

    segunda: true,
    terca: true,
    quarta: true,
    quinta: true,
    sexta: true,
    sabado: true,
    domingo: false,

    abertura: "18:00",
    fechamento: "23:30",

    retirada: true,
    entrega: true,
    taxaEntrega: "5,00",
    pedidoMinimo: "20,00",

    pix: true,
    dinheiro: true,
    cartao: true,
  });

  function alterarCampo(campo, valor) {
    setConfig((atual) => ({
      ...atual,
      [campo]: valor,
    }));

    setSalvo(false);
  }

  function salvarConfiguracoes(event) {
    event.preventDefault();

    console.log("Configurações da loja:", config);

    setSalvo(true);

    setTimeout(() => {
      setSalvo(false);
    }, 3000);
  }

  return (
    <main className="admin-settings-page">
      <div className="admin-container">
        <section className="admin-page-header">
          <div>
            <span className="eyebrow">LOJA</span>
            <h1>Configurações</h1>
            <p>
              Configure as informações e o funcionamento da
              sua loja.
            </p>
          </div>
        </section>

        <form onSubmit={salvarConfiguracoes}>
          {/* IDENTIDADE */}
          <section className="admin-settings-section">
            <div className="admin-settings-section-header">
              <div>
                <span className="eyebrow">IDENTIDADE</span>
                <h2>Informações da loja</h2>
                <p>
                  Dados exibidos para os clientes no catálogo.
                </p>
              </div>
            </div>

            <div className="admin-settings-grid">
              <div className="admin-form-group">
                <label htmlFor="nome">Nome da loja</label>

                <input
                  id="nome"
                  type="text"
                  value={config.nome}
                  onChange={(event) =>
                    alterarCampo("nome", event.target.value)
                  }
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="instagram">Instagram</label>

                <input
                  id="instagram"
                  type="text"
                  value={config.instagram}
                  onChange={(event) =>
                    alterarCampo(
                      "instagram",
                      event.target.value
                    )
                  }
                  placeholder="@sualoja"
                />
              </div>

              <div className="admin-form-group admin-settings-full">
                <label htmlFor="descricao">Descrição</label>

                <textarea
                  id="descricao"
                  rows="3"
                  value={config.descricao}
                  onChange={(event) =>
                    alterarCampo(
                      "descricao",
                      event.target.value
                    )
                  }
                />
              </div>
            </div>
          </section>

          {/* CONTATO */}
          <section className="admin-settings-section">
            <div className="admin-settings-section-header">
              <div>
                <span className="eyebrow">CONTATO</span>
                <h2>Contato da loja</h2>
                <p>
                  Informações utilizadas pelos clientes para
                  entrar em contato.
                </p>
              </div>
            </div>

            <div className="admin-settings-grid">
              <div className="admin-form-group">
                <label htmlFor="telefone">Telefone</label>

                <input
                  id="telefone"
                  type="text"
                  value={config.telefone}
                  onChange={(event) =>
                    alterarCampo(
                      "telefone",
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="whatsapp">WhatsApp</label>

                <input
                  id="whatsapp"
                  type="text"
                  value={config.whatsapp}
                  onChange={(event) =>
                    alterarCampo(
                      "whatsapp",
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="endereco">Endereço</label>

                <input
                  id="endereco"
                  type="text"
                  value={config.endereco}
                  onChange={(event) =>
                    alterarCampo(
                      "endereco",
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="bairro">Bairro</label>

                <input
                  id="bairro"
                  type="text"
                  value={config.bairro}
                  onChange={(event) =>
                    alterarCampo(
                      "bairro",
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="cidade">Cidade</label>

                <input
                  id="cidade"
                  type="text"
                  value={config.cidade}
                  onChange={(event) =>
                    alterarCampo(
                      "cidade",
                      event.target.value
                    )
                  }
                />
              </div>
            </div>
          </section>

          {/* FUNCIONAMENTO */}
          <section className="admin-settings-section">
            <div className="admin-settings-section-header">
              <div>
                <span className="eyebrow">FUNCIONAMENTO</span>
                <h2>Horário de atendimento</h2>
                <p>
                  Defina os dias e horários em que a loja
                  recebe pedidos.
                </p>
              </div>
            </div>

            <div className="admin-weekdays">
              {[
                ["segunda", "Segunda-feira"],
                ["terca", "Terça-feira"],
                ["quarta", "Quarta-feira"],
                ["quinta", "Quinta-feira"],
                ["sexta", "Sexta-feira"],
                ["sabado", "Sábado"],
                ["domingo", "Domingo"],
              ].map(([campo, nome]) => (
                <label
                  className="admin-weekday"
                  key={campo}
                >
                  <input
                    type="checkbox"
                    checked={config[campo]}
                    onChange={(event) =>
                      alterarCampo(
                        campo,
                        event.target.checked
                      )
                    }
                  />

                  <span>{nome}</span>
                </label>
              ))}
            </div>

            <div className="admin-settings-grid admin-settings-hours">
              <div className="admin-form-group">
                <label htmlFor="abertura">Abertura</label>

                <input
                  id="abertura"
                  type="time"
                  value={config.abertura}
                  onChange={(event) =>
                    alterarCampo(
                      "abertura",
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="fechamento">Fechamento</label>

                <input
                  id="fechamento"
                  type="time"
                  value={config.fechamento}
                  onChange={(event) =>
                    alterarCampo(
                      "fechamento",
                      event.target.value
                    )
                  }
                />
              </div>
            </div>
          </section>

          {/* ENTREGA */}
          <section className="admin-settings-section">
            <div className="admin-settings-section-header">
              <div>
                <span className="eyebrow">PEDIDOS</span>
                <h2>Entrega e retirada</h2>
                <p>
                  Defina como os clientes podem receber seus
                  pedidos.
                </p>
              </div>
            </div>

            <div className="admin-settings-options">
              <label className="admin-setting-toggle">
                <div>
                  <strong>Retirada no local</strong>
                  <span>
                    Permitir que o cliente retire o pedido.
                  </span>
                </div>

                <input
                  type="checkbox"
                  checked={config.retirada}
                  onChange={(event) =>
                    alterarCampo(
                      "retirada",
                      event.target.checked
                    )
                  }
                />
              </label>

              <label className="admin-setting-toggle">
                <div>
                  <strong>Entrega</strong>
                  <span>
                    Permitir pedidos para entrega.
                  </span>
                </div>

                <input
                  type="checkbox"
                  checked={config.entrega}
                  onChange={(event) =>
                    alterarCampo(
                      "entrega",
                      event.target.checked
                    )
                  }
                />
              </label>
            </div>

            <div className="admin-settings-grid">
              <div className="admin-form-group">
                <label htmlFor="taxaEntrega">
                  Taxa de entrega
                </label>

                <div className="admin-money-input">
                  <span>R$</span>

                  <input
                    id="taxaEntrega"
                    type="text"
                    value={config.taxaEntrega}
                    onChange={(event) =>
                      alterarCampo(
                        "taxaEntrega",
                        event.target.value
                      )
                    }
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label htmlFor="pedidoMinimo">
                  Pedido mínimo
                </label>

                <div className="admin-money-input">
                  <span>R$</span>

                  <input
                    id="pedidoMinimo"
                    type="text"
                    value={config.pedidoMinimo}
                    onChange={(event) =>
                      alterarCampo(
                        "pedidoMinimo",
                        event.target.value
                      )
                    }
                  />
                </div>
              </div>
            </div>
          </section>

          {/* PAGAMENTO */}
          <section className="admin-settings-section">
            <div className="admin-settings-section-header">
              <div>
                <span className="eyebrow">PAGAMENTO</span>
                <h2>Formas de pagamento</h2>
                <p>
                  Informe as formas de pagamento aceitas pela
                  loja.
                </p>
              </div>
            </div>

            <div className="admin-settings-options">
              <label className="admin-setting-toggle">
                <div>
                  <strong>PIX</strong>
                  <span>
                    Aceitar pagamento via PIX.
                  </span>
                </div>

                <input
                  type="checkbox"
                  checked={config.pix}
                  onChange={(event) =>
                    alterarCampo(
                      "pix",
                      event.target.checked
                    )
                  }
                />
              </label>

              <label className="admin-setting-toggle">
                <div>
                  <strong>Dinheiro</strong>
                  <span>
                    Aceitar pagamento em dinheiro.
                  </span>
                </div>

                <input
                  type="checkbox"
                  checked={config.dinheiro}
                  onChange={(event) =>
                    alterarCampo(
                      "dinheiro",
                      event.target.checked
                    )
                  }
                />
              </label>

              <label className="admin-setting-toggle">
                <div>
                  <strong>Cartão</strong>
                  <span>
                    Aceitar pagamento em cartão.
                  </span>
                </div>

                <input
                  type="checkbox"
                  checked={config.cartao}
                  onChange={(event) =>
                    alterarCampo(
                      "cartao",
                      event.target.checked
                    )
                  }
                />
              </label>
            </div>
          </section>

          {/* AÇÕES */}
          <div className="admin-settings-actions">
            {salvo && (
              <span className="admin-settings-saved">
                ✓ Alterações salvas
              </span>
            )}

            <button
              type="submit"
              className="admin-primary-button"
            >
              Salvar configurações
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default Configuracoes;