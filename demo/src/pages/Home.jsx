import React from "react";

const categorias = [
  {
    nome: "Hambúrgueres",
    icone: "🍔",
  },
  {
    nome: "Porções",
    icone: "🍟",
  },
  {
    nome: "Bebidas",
    icone: "🥤",
  },
  {
    nome: "Combos",
    icone: "🍱",
  },
];

const produtos = [
  {
    nome: "Classic Burger",
    descricao: "Pão brioche, hambúrguer artesanal, queijo e molho especial.",
    preco: "R$ 28,90",
    imagem:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
  },
  {
    nome: "Bacon Supreme",
    descricao: "Hambúrguer artesanal, cheddar, bacon crocante e molho da casa.",
    preco: "R$ 32,90",
    imagem:
      "https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=800&q=80",
  },
  {
    nome: "Chicken Crispy",
    descricao: "Frango crocante, queijo, alface e molho especial.",
    preco: "R$ 29,90",
    imagem:
      "https://images.unsplash.com/photo-1615297928064-24977384d0f8?auto=format&fit=crop&w=800&q=80",
  },
];

function Home() {
  return (
    <main>
      {/* HERO */}
      <section className="hero">
        <div className="container hero-content">
          <div className="hero-text">
            <span className="eyebrow">LANCHERIA • ARTESANAL</span>

            <h1>
              O sabor que
              <span> você estava esperando.</span>
            </h1>

            <p>
              Lanches preparados na hora, ingredientes selecionados e aquele
              sabor que faz você querer pedir de novo.
            </p>

            <div className="hero-actions">
              <a href="#cardapio" className="button button-primary">
                Ver cardápio
              </a>

              <a href="#sobre" className="button button-secondary">
                Conheça a loja
              </a>
            </div>

            <div className="hero-info">
              <div>
                <strong>★ 4,9</strong>
                <span>Avaliação</span>
              </div>

              <div>
                <strong>30 min</strong>
                <span>Tempo médio</span>
              </div>

              <div>
                <strong>Aberto</strong>
                <span>Hoje até 23h</span>
              </div>
            </div>
          </div>

          <div className="hero-image">
            <div className="hero-image-card">
              <img
                src={produtos[0].imagem}
                alt={produtos[0].nome}
              />
            </div>

            <div className="hero-badge">
              <span>🔥</span>
              <div>
                <strong>Mais pedido</strong>
                <small>Classic Burger</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIAS */}
      <section className="section categories-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">ESCOLHA O QUE VOCÊ QUER</span>
              <h2>Encontre seu favorito</h2>
            </div>
          </div>

          <div className="categories-grid">
            {categorias.map((categoria) => (
              <button
                className="category-card"
                key={categoria.nome}
              >
                <span className="category-icon">{categoria.icone}</span>
                <span>{categoria.nome}</span>
                <span className="category-arrow">→</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUTOS */}
      <section className="section products-section" id="cardapio">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">OS QUERIDINHOS</span>
              <h2>Mais pedidos</h2>
            </div>

            <a href="#cardapio" className="section-link">
              Ver cardápio completo →
            </a>
          </div>

          <div className="products-grid">
            {produtos.map((produto) => (
              <article className="product-card" key={produto.nome}>
                <div className="product-image">
                  <img src={produto.imagem} alt={produto.nome} />
                </div>

                <div className="product-content">
                  <h3>{produto.nome}</h3>

                  <p>{produto.descricao}</p>

                  <div className="product-footer">
                    <strong>{produto.preco}</strong>

                    <button className="add-button" type="button">
                      +
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* PROMOÇÃO */}
      <section className="promo-section">
        <div className="container">
          <div className="promo-card">
            <div>
              <span className="eyebrow">COMBO DA CASA</span>

              <h2>
                Seu lanche completo
                <br />
                em um só pedido.
              </h2>

              <p>
                Escolha seu hambúrguer, acompanhamento e bebida.
              </p>

              <button className="button button-light" type="button">
                Ver combos
              </button>
            </div>

            <div className="promo-decoration">
              🍔
            </div>
          </div>
        </div>
      </section>

      {/* SOBRE */}
      <section className="section about-section" id="sobre">
        <div className="container about-grid">
          <div className="about-image">
            <img
              src="https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1000&q=80"
              alt="Interior de uma lancheria"
            />
          </div>

          <div className="about-content">
            <span className="eyebrow">SOBRE A CASA</span>

            <h2>
              Comida simples,
              <br />
              feita com cuidado.
            </h2>

            <p>
              Somos uma lancheria focada em preparar comida gostosa, com
              ingredientes de qualidade e atendimento próximo.
            </p>

            <p>
              Nosso objetivo é transformar aquele pedido rápido em uma
              experiência que você queira repetir.
            </p>

            <a href="#sobre" className="text-link">
              Conheça nossa história →
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="final-cta">
        <div className="container">
          <span className="eyebrow">FICOU COM FOME?</span>

          <h2>Seu próximo lanche está a poucos cliques.</h2>

          <a href="#cardapio" className="button button-light">
            Começar pedido
          </a>
        </div>
      </section>
    </main>
  );
}

export default Home;