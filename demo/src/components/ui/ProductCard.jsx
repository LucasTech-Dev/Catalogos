import React from "react";

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
        <h3>{produto.nome}</h3>

        <p>{produto.descricao}</p>

        <div className="product-footer">
          <strong>{produto.preco}</strong>

          <button
            className="add-button"
            type="button"
          >
            +
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;