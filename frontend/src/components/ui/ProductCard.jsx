import MaterialIcon from "./MaterialIcon";
import React from "react";
import ImagemCatalogo from "./ImagemCatalogo";

import {moeda} from "../../lib/compras";
function ProductCard({ produto }) {
  const indisponivel = produto.ativo !== true || produto.disponivel === false;
  return (
    <article className={`product-card${indisponivel ? " product-card-unavailable" : ""}`}>
      <div className="product-image">
        {indisponivel && <span className="product-unavailable-badge">Indisponível</span>}
        <ImagemCatalogo
          src={produto.imagem}
          alt={produto.nome}
        />
      </div>

      <div className="product-content">
        <h3><a href={`/produto?id=${encodeURIComponent(produto.id)}`}>{produto.nome}</a></h3>

        <p>{produto.descricao}</p>

        <div className="product-footer">
          <strong>{moeda(produto.preco)}</strong>

          {indisponivel ? <span className="add-button add-button-unavailable" role="status" aria-label={`${produto.nome} indisponível — não pode ser adicionado ao carrinho`} title="Produto indisponível"><MaterialIcon name="block"/></span> : <a className="add-button" aria-label={`Ver ${produto.nome}`} href={`/produto?id=${encodeURIComponent(produto.id)}`}><MaterialIcon name="add"/></a>}
        </div>
      </div>
    </article>
  );
}

export default ProductCard;