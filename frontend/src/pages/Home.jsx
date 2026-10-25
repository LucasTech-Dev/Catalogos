import {CategoryIcon} from "../components/ui/MaterialIcon";
import MaterialIcon from "../components/ui/MaterialIcon";
import React from "react";
import ImagemCatalogo from "../components/ui/ImagemCatalogo";

import {useLoja, EstadoCatalogo, CatalogoPronto} from "../contexts/LojaContext";
import {moeda,horariosTexto} from "../lib/compras";
function Home() {
  const {loja,categorias,produtos} = useLoja();
  const destaque = produtos.find(produto => produto.imagem?.trim());
  return (<CatalogoPronto>
    <main>
      {/* HERO */}
      <section className="hero">
        <div className="container hero-content">
          <div className="hero-text">
            <span className="eyebrow">{loja?.nome || "CATÁLOGO"}</span>

            <h1>
              O sabor que
              <span> você estava esperando.</span>
            </h1>

            <p>{loja?.descricao}</p><EstadoCatalogo />

            <div className="hero-actions">
              <a href="#cardapio" className="button button-primary">
                Ver cardápio
              </a>

              <a href="#sobre" className="button button-secondary">
                Conheça a loja
              </a>
            </div>

            <div className="hero-info"><div><strong>{loja?.tempoMedio || ""}</strong><span>Tempo estimado</span></div><div><strong>{loja?.telefone || ""}</strong><span>Contato</span></div></div>
          </div>

          <div className="hero-image">
            <div className="hero-image-card">
              <ImagemCatalogo
                src={destaque?.imagem || loja?.imagem}
                alt={destaque?.nome || loja?.nome}
              />
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
                key={categoria.id} onClick={() => window.location.assign("/cardapio")}
              >
                <span className="category-icon"><CategoryIcon categoria={categoria}/></span>
                <span>{categoria.nome}</span>
                <span className="category-arrow"><MaterialIcon name="arrow_forward"/></span>
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
              <span className="eyebrow">NOSSO CARDÁPIO</span>
              <h2>Produtos</h2>
            </div>

            <a href="/cardapio" className="section-link">
              Ver cardápio completo <MaterialIcon name="arrow_forward"/>
            </a>
          </div>

          <div className="products-grid">
            {produtos.map((produto) => (
              <article className="product-card" key={produto.nome}>
                <div className="product-image">
                  <ImagemCatalogo src={produto.imagem} alt={produto.nome} />
                </div>

                <div className="product-content">
                  <h3>{produto.nome}</h3>

                  <p>{produto.descricao}</p>

                  <div className="product-footer">
                    <strong>{moeda(produto.preco)}</strong>

                    <button className="add-button" type="button" aria-label={`Ver ${produto.nome}`} onClick={() => window.location.assign(`/produto?id=${encodeURIComponent(produto.id)}`)}>
                      <MaterialIcon name="add"/>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* SOBRE */}
      <section className="section about-section" id="sobre">
        <div className="container about-grid">
          <div className="about-image">
            <ImagemCatalogo
              src="https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1000&q=80"
              alt="Interior de uma lancheria"
            />
          </div>

          <div className="about-content">
            <span className="eyebrow">SOBRE A CASA</span>

            <h2>{loja?.nome}</h2><p>{loja?.descricao}</p><p>{typeof loja?.endereco === 'string' ? loja.endereco : Object.values(loja?.endereco || {}).join(', ')}</p><p>WhatsApp: {loja?.whatsapp || 'Não informado'}</p><p>Horários: {horariosTexto(loja?.horarios || loja?.horarioFuncionamento)}</p>
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
    </main></CatalogoPronto>
  );
}

export default Home;