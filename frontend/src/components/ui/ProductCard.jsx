import React from "react";

import {moeda} from "../../lib/compras";
function ProductCard({ produto }) {
  return (
    <article className="product-card">
      <div className="product-image">
        <img
          src={produto.imagem}
          alt={produto.nome}
        />
      </div>

      <div className="product-content">
        <h3><a href={`/produto?id=${encodeURIComponent(produto.id)}`}>{produto.nome}</a></h3>

        <p>{produto.descricao}</p>

        <div className="product-footer">
          <strong>{moeda(produto.preco)}</strong>

          <a className="add-button" aria-label={produto.ativo === true && produto.disponivel !== false ? `Ver ${produto.nome}` : `${produto.nome} indisponível`} href={`/produto?id=${encodeURIComponent(produto.id)}`}>{produto.ativo === true && produto.disponivel !== false ? "+" : "−"}</a>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;