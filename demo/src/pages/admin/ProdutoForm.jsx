import React, { useState } from "react";

function ProdutoForm() {
  const params = new URLSearchParams(window.location.search);
  const produtoId = params.get("id");
  const editando = Boolean(produtoId);

  const [produto, setProduto] = useState({
    nome: editando ? "Classic Burger" : "",
    descricao: editando
      ? "Pão brioche, hambúrguer artesanal e queijo"
      : "",
    categoria: editando ? "Hambúrgueres" : "",
    preco: editando ? "28.90" : "",
    ativo: true,
    imagem: "",
  });

  const [adicionais, setAdicionais] = useState(
    editando
      ? [
          {
            id: 1,
            nome: "Bacon",
            preco: "5.00",
            ativo: true,
          },
          {
            id: 2,
            nome: "Cheddar",
            preco: "4.00",
            ativo: true,
          },
        ]
      : []
  );

  const categorias = [
    "Hambúrgueres",
    "Porções",
    "Bebidas",
    "Combos",
  ];

  const atualizarCampo = (campo, valor) => {
    setProduto((atual) => ({
      ...atual,
      [campo]: valor,
    }));
  };

  const adicionarAdicional = () => {
    setAdicionais((atual) => [
      ...atual,
      {
        id: Date.now(),
        nome: "",
        preco: "",
        ativo: true,
      },
    ]);
  };

  const atualizarAdicional = (id, campo, valor) => {
    setAdicionais((atual) =>
      atual.map((adicional) =>
        adicional.id === id
          ? {
              ...adicional,
              [campo]: valor,
            }
          : adicional
      )
    );
  };

  const removerAdicional = (id) => {
    setAdicionais((atual) =>
      atual.filter((adicional) => adicional.id !== id)
    );
  };

  const salvarProduto = (event) => {
    event.preventDefault();

    console.log("Produto mock:", {
      ...produto,
      adicionais,
    });

    alert(
      editando
        ? "Produto atualizado com sucesso (mock)."
        : "Produto criado com sucesso (mock)."
    );
  };

  return (
    <main className="admin-product-form-page">
      <div className="admin-container">

        {/* VOLTAR */}

        <div className="admin-details-back">
          <a href="/admin/produtos">
            ← Voltar para produtos
          </a>
        </div>

        {/* CABEÇALHO */}

        <section className="admin-page-header">

          <div>
            <span className="eyebrow">
              CATÁLOGO
            </span>

            <h1>
              {editando
                ? "Editar produto"
                : "Novo produto"}
            </h1>

            <p>
              {editando
                ? "Atualize as informações deste produto."
                : "Cadastre um novo produto no catálogo."}
            </p>
          </div>

        </section>

        <form
          className="admin-product-form"
          onSubmit={salvarProduto}
        >

          {/* INFORMAÇÕES BÁSICAS */}

          <section className="admin-panel">

            <div className="admin-panel-header">
              <div>
                <span className="eyebrow">
                  PRODUTO
                </span>

                <h2>Informações básicas</h2>
              </div>
            </div>

            <div className="admin-form-content">

              <div className="admin-form-group">

                <label htmlFor="nome">
                  Nome do produto
                </label>

                <input
                  id="nome"
                  type="text"
                  value={produto.nome}
                  onChange={(event) =>
                    atualizarCampo(
                      "nome",
                      event.target.value
                    )
                  }
                  placeholder="Ex.: Classic Burger"
                  required
                />

              </div>

              <div className="admin-form-group">

                <label htmlFor="descricao">
                  Descrição
                </label>

                <textarea
                  id="descricao"
                  rows="4"
                  value={produto.descricao}
                  onChange={(event) =>
                    atualizarCampo(
                      "descricao",
                      event.target.value
                    )
                  }
                  placeholder="Descreva o produto..."
                />

              </div>

              <div className="admin-form-row">

                <div className="admin-form-group">

                  <label htmlFor="categoria">
                    Categoria
                  </label>

                  <select
                    id="categoria"
                    value={produto.categoria}
                    onChange={(event) =>
                      atualizarCampo(
                        "categoria",
                        event.target.value
                      )
                    }
                    required
                  >
                    <option value="">
                      Selecione uma categoria
                    </option>

                    {categorias.map((item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    ))}
                  </select>

                </div>

                <div className="admin-form-group">

                  <label htmlFor="preco">
                    Preço
                  </label>

                  <div className="admin-price-input">

                    <span>R$</span>

                    <input
                      id="preco"
                      type="number"
                      step="0.01"
                      min="0"
                      value={produto.preco}
                      onChange={(event) =>
                        atualizarCampo(
                          "preco",
                          event.target.value
                        )
                      }
                      placeholder="0,00"
                      required
                    />

                  </div>

                </div>

              </div>

            </div>

          </section>

          {/* IMAGEM */}

          <section className="admin-panel">

            <div className="admin-panel-header">
              <div>
                <span className="eyebrow">
                  VISUAL
                </span>

                <h2>Imagem do produto</h2>
              </div>
            </div>

            <div className="admin-form-content">

              <div className="admin-image-upload">

                <div className="admin-image-preview">
                  {produto.imagem ? (
                    <img
                      src={produto.imagem}
                      alt={produto.nome}
                    />
                  ) : (
                    <span>🍔</span>
                  )}
                </div>

                <div className="admin-image-upload-info">

                  <h3>
                    Foto do produto
                  </h3>

                  <p>
                    Adicione uma imagem para
                    apresentar melhor o produto
                    no catálogo.
                  </p>

                  <button
                    type="button"
                    className="admin-secondary-button"
                  >
                    Escolher imagem
                  </button>

                </div>

              </div>

            </div>

          </section>

          {/* ADICIONAIS */}

          <section className="admin-panel">

            <div className="admin-panel-header">

              <div>
                <span className="eyebrow">
                  PERSONALIZAÇÃO
                </span>

                <h2>Adicionais</h2>

                <p className="admin-panel-description">
                  Permita que o cliente personalize
                  este produto.
                </p>
              </div>

              <button
                type="button"
                className="admin-secondary-button"
                onClick={adicionarAdicional}
              >
                + Adicionar
              </button>

            </div>

            <div className="admin-addons-list">

              {adicionais.length === 0 ? (

                <div className="admin-addons-empty">

                  <span>＋</span>

                  <p>
                    Nenhum adicional cadastrado.
                  </p>

                  <button
                    type="button"
                    onClick={adicionarAdicional}
                  >
                    Adicionar primeiro adicional
                  </button>

                </div>

              ) : (

                adicionais.map((adicional) => (

                  <div
                    className="admin-addon-row"
                    key={adicional.id}
                  >

                    <div className="admin-addon-field">

                      <label>
                        Nome
                      </label>

                      <input
                        type="text"
                        value={adicional.nome}
                        onChange={(event) =>
                          atualizarAdicional(
                            adicional.id,
                            "nome",
                            event.target.value
                          )
                        }
                        placeholder="Ex.: Bacon"
                      />

                    </div>

                    <div className="admin-addon-field">

                      <label>
                        Preço
                      </label>

                      <div className="admin-price-input">

                        <span>R$</span>

                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={adicional.preco}
                          onChange={(event) =>
                            atualizarAdicional(
                              adicional.id,
                              "preco",
                              event.target.value
                            )
                          }
                        />

                      </div>

                    </div>

                    <button
                      type="button"
                      className="admin-addon-remove"
                      onClick={() =>
                        removerAdicional(adicional.id)
                      }
                    >
                      Remover
                    </button>

                  </div>

                ))

              )}

            </div>

          </section>

          {/* DISPONIBILIDADE */}

          <section className="admin-panel">

            <div className="admin-panel-header">
              <div>
                <span className="eyebrow">
                  DISPONIBILIDADE
                </span>

                <h2>Status do produto</h2>
              </div>
            </div>

            <div className="admin-availability">

              <label className="admin-switch-row">

                <input
                  type="checkbox"
                  checked={produto.ativo}
                  onChange={(event) =>
                    atualizarCampo(
                      "ativo",
                      event.target.checked
                    )
                  }
                />

                <span className="admin-switch"></span>

                <span>
                  <strong>
                    Produto ativo
                  </strong>

                  <small>
                    O produto ficará disponível
                    no catálogo da loja.
                  </small>
                </span>

              </label>

            </div>

          </section>

          {/* AÇÕES */}

          <div className="admin-product-form-actions">

            <a
              href="/admin/produtos"
              className="admin-secondary-button"
            >
              Cancelar
            </a>

            <button
              type="submit"
              className="admin-primary-button"
            >
              {editando
                ? "Salvar alterações"
                : "Criar produto"}
            </button>

          </div>

        </form>

      </div>
    </main>
  );
}

export default ProdutoForm;