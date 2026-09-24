import React, { useState } from "react";

function Categorias() {
  const [categorias, setCategorias] = useState([
    {
      id: 1,
      nome: "Hambúrgueres",
      descricao: "Hambúrgueres artesanais da casa",
      produtos: 8,
      ativa: true,
    },
    {
      id: 2,
      nome: "Porções",
      descricao: "Porções e acompanhamentos",
      produtos: 5,
      ativa: true,
    },
    {
      id: 3,
      nome: "Bebidas",
      descricao: "Refrigerantes, sucos e outras bebidas",
      produtos: 12,
      ativa: true,
    },
    {
      id: 4,
      nome: "Combos",
      descricao: "Combinações especiais",
      produtos: 4,
      ativa: false,
    },
  ]);

  const [modalAberto, setModalAberto] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState(null);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");

  function abrirNovaCategoria() {
    setCategoriaEditando(null);
    setNome("");
    setDescricao("");
    setModalAberto(true);
  }

  function abrirEdicao(categoria) {
    setCategoriaEditando(categoria);
    setNome(categoria.nome);
    setDescricao(categoria.descricao);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setCategoriaEditando(null);
    setNome("");
    setDescricao("");
  }

  function salvarCategoria(event) {
    event.preventDefault();

    if (!nome.trim()) {
      alert("Informe o nome da categoria.");
      return;
    }

    if (categoriaEditando) {
      setCategorias((categoriasAtuais) =>
        categoriasAtuais.map((categoria) =>
          categoria.id === categoriaEditando.id
            ? {
                ...categoria,
                nome: nome.trim(),
                descricao: descricao.trim(),
              }
            : categoria
        )
      );
    } else {
      const novaCategoria = {
        id: Date.now(),
        nome: nome.trim(),
        descricao: descricao.trim(),
        produtos: 0,
        ativa: true,
      };

      setCategorias((categoriasAtuais) => [
        ...categoriasAtuais,
        novaCategoria,
      ]);
    }

    fecharModal();
  }

  function alternarStatus(id) {
    setCategorias((categoriasAtuais) =>
      categoriasAtuais.map((categoria) =>
        categoria.id === id
          ? {
              ...categoria,
              ativa: !categoria.ativa,
            }
          : categoria
      )
    );
  }

  return (
    <main className="admin-categories-page">
      <div className="admin-container">
        <section className="admin-page-header">
          <div>
            <span className="eyebrow">CATÁLOGO</span>
            <h1>Categorias</h1>
            <p>Organize os produtos do seu catálogo.</p>
          </div>

          <button
            type="button"
            className="admin-primary-button"
            onClick={abrirNovaCategoria}
          >
            + Nova categoria
          </button>
        </section>

        <section className="admin-categories-panel">
          {categorias.length > 0 ? (
            <div className="admin-categories-list">
              {categorias.map((categoria) => (
                <article
                  className="admin-category-row"
                  key={categoria.id}
                >
                  <div className="admin-category-icon">
                    ☰
                  </div>

                  <div className="admin-category-info">
                    <h2>{categoria.nome}</h2>
                    <p>{categoria.descricao}</p>
                  </div>

                  <div className="admin-category-products">
                    <strong>{categoria.produtos}</strong>
                    <span>
                      {categoria.produtos === 1
                        ? "produto"
                        : "produtos"}
                    </span>
                  </div>

                  <div className="admin-category-status">
                    <span
                      className={
                        categoria.ativa
                          ? "admin-status active"
                          : "admin-status inactive"
                      }
                    >
                      {categoria.ativa ? "Ativa" : "Inativa"}
                    </span>
                  </div>

                  <div className="admin-category-actions">
                    <button
                      type="button"
                      onClick={() => abrirEdicao(categoria)}
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() => alternarStatus(categoria.id)}
                    >
                      {categoria.ativa ? "Desativar" : "Ativar"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="admin-empty-state">
              <div className="admin-empty-icon">☰</div>

              <h2>Nenhuma categoria cadastrada</h2>

              <p>
                Crie sua primeira categoria para começar a
                organizar os produtos.
              </p>

              <button
                type="button"
                className="admin-primary-button"
                onClick={abrirNovaCategoria}
              >
                Criar primeira categoria
              </button>
            </div>
          )}
        </section>
      </div>

      {modalAberto && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <div>
                <span className="eyebrow">CATEGORIA</span>

                <h2>
                  {categoriaEditando
                    ? "Editar categoria"
                    : "Nova categoria"}
                </h2>
              </div>

              <button
                type="button"
                className="admin-modal-close"
                onClick={fecharModal}
              >
                ×
              </button>
            </div>

            <form onSubmit={salvarCategoria}>
              <div className="admin-form-group">
                <label htmlFor="categoria-nome">
                  Nome da categoria
                </label>

                <input
                  id="categoria-nome"
                  type="text"
                  value={nome}
                  onChange={(event) => setNome(event.target.value)}
                  placeholder="Ex.: Hambúrgueres"
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="categoria-descricao">
                  Descrição
                </label>

                <textarea
                  id="categoria-descricao"
                  value={descricao}
                  onChange={(event) =>
                    setDescricao(event.target.value)
                  }
                  placeholder="Descreva brevemente a categoria"
                  rows="4"
                />
              </div>

              <div className="admin-product-form-actions">
                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={fecharModal}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="admin-primary-button"
                >
                  {categoriaEditando
                    ? "Salvar alterações"
                    : "Criar categoria"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default Categorias;