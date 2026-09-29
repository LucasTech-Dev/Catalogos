import React, { useMemo, useState } from "react";

function Produtos() {
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("Todas");

  const produtos = [
    {
      id: "1",
      nome: "Classic Burger",
      descricao: "Pão brioche, hambúrguer artesanal e queijo",
      categoria: "Hambúrgueres",
      preco: "R$ 28,90",
      ativo: true,
    },
    {
      id: "2",
      nome: "Bacon Burger",
      descricao: "Hambúrguer artesanal, queijo, bacon e molho especial",
      categoria: "Hambúrgueres",
      preco: "R$ 32,90",
      ativo: true,
    },
    {
      id: "3",
      nome: "Batata Frita",
      descricao: "Porção individual de batatas crocantes",
      categoria: "Porções",
      preco: "R$ 12,90",
      ativo: true,
    },
    {
      id: "4",
      nome: "Batata com Cheddar",
      descricao: "Batata frita, cheddar cremoso e bacon",
      categoria: "Porções",
      preco: "R$ 22,90",
      ativo: true,
    },
    {
      id: "5",
      nome: "Coca-Cola Lata",
      descricao: "Refrigerante Coca-Cola 350ml",
      categoria: "Bebidas",
      preco: "R$ 6,00",
      ativo: true,
    },
    {
      id: "6",
      nome: "Guaraná Lata",
      descricao: "Refrigerante Guaraná 350ml",
      categoria: "Bebidas",
      preco: "R$ 6,00",
      ativo: false,
    },
    {
      id: "7",
      nome: "Combo Classic",
      descricao: "Classic Burger + batata frita + refrigerante",
      categoria: "Combos",
      preco: "R$ 39,90",
      ativo: true,
    },
  ];

  const categorias = [
    "Todas",
    "Hambúrgueres",
    "Porções",
    "Bebidas",
    "Combos",
  ];

  const produtosFiltrados = useMemo(() => {
    return produtos.filter((produto) => {
      const correspondeBusca =
        produto.nome
          .toLowerCase()
          .includes(busca.toLowerCase()) ||
        produto.descricao
          .toLowerCase()
          .includes(busca.toLowerCase());

      const correspondeCategoria =
        categoria === "Todas" ||
        produto.categoria === categoria;

      return correspondeBusca && correspondeCategoria;
    });
  }, [busca, categoria]);

  return (
    <main className="admin-products-page">
      <div className="admin-container">

        {/* CABEÇALHO */}
        <section className="admin-page-header">

          <div>
            <span className="eyebrow">
              CATÁLOGO
            </span>

            <h1>Produtos</h1>

            <p>
              Gerencie os produtos disponíveis na sua loja.
            </p>
          </div>

          <a
            href="/admin/produto/novo"
            className="admin-primary-button"
          >
            + Novo produto
          </a>

        </section>

        {/* CONTROLES */}
        <section className="admin-products-controls">

          <div className="admin-products-search">

            <span>⌕</span>

            <input
              type="text"
              placeholder="Buscar produto..."
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
            />

          </div>

          <div className="admin-products-category">

            <select
              value={categoria}
              onChange={(event) => setCategoria(event.target.value)}
            >
              {categorias.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

          </div>

        </section>

        {/* RESULTADOS */}

        <section className="admin-panel">

          <div className="admin-products-header">

            <div>
              <span className="eyebrow">
                CATÁLOGO
              </span>

              <h2>
                {produtosFiltrados.length} produtos
              </h2>
            </div>

          </div>

          <div className="admin-products-list">

            {produtosFiltrados.map((produto) => (

              <article
                className="admin-product-row"
                key={produto.id}
              >

                {/* IMAGEM MOCK */}

                <div className="admin-product-image">
                  🍔
                </div>

                {/* INFORMAÇÕES */}

                <div className="admin-product-info">

                  <div className="admin-product-title">

                    <h3>
                      {produto.nome}
                    </h3>

                    {produto.ativo ? (
                      <span className="admin-product-status active">
                        Ativo
                      </span>
                    ) : (
                      <span className="admin-product-status inactive">
                        Inativo
                      </span>
                    )}

                  </div>

                  <p>
                    {produto.descricao}
                  </p>

                  <span className="admin-product-category">
                    {produto.categoria}
                  </span>

                </div>

                {/* PREÇO */}

                <div className="admin-product-price">
                  {produto.preco}
                </div>

                {/* AÇÕES */}

                <div className="admin-product-actions">

                  <a
                    href={`/admin/produto?id=${produto.id}`}
                    className="admin-product-edit"
                  >
                    Editar
                  </a>

                  <button
                    type="button"
                    className="admin-product-toggle"
                  >
                    {produto.ativo
                      ? "Desativar"
                      : "Ativar"}
                  </button>

                </div>

              </article>

            ))}

          </div>

          {/* ESTADO VAZIO */}

          {produtosFiltrados.length === 0 && (

            <div className="admin-products-empty">

              <span>🔎</span>

              <h2>
                Nenhum produto encontrado
              </h2>

              <p>
                Tente alterar sua busca ou categoria.
              </p>

            </div>

          )}

        </section>

      </div>
    </main>
  );
}

export default Produtos;