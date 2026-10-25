import React from "react";
import ImagemCatalogo from "./ImagemCatalogo";

function CartItem({
  item,
  onQuantidadeChange,
  onRemover,
}) {
  const subtotal =
    (item.preco + item.adicionaisTotal) *
    item.quantidade;

  return (
    <article className="cart-item">
      <div className="cart-item-image">
        <ImagemCatalogo
          src={item.imagem}
          alt={item.nome}
        />
      </div>

      <div className="cart-item-content">
        <div className="cart-item-main">
          <div>
            <span className="cart-item-category">
              {item.categoria}
            </span>

            <h2>{item.nome}</h2>{(item.ativo !== true || item.disponivel === false) && <p role="status">Produto indisponível. Remova antes de continuar.</p>}

            {item.adicionais.length > 0 && (
              <div className="cart-item-extras">
                {item.adicionais.map((adicional) => (
                  <span key={adicional.id}>
                    + {adicional.nome}
                  </span>
                ))}
              </div>
            )}

            {item.observacao && (
              <p className="cart-item-note">
                <strong>Obs.:</strong>{" "}
                {item.observacao}
              </p>
            )}
          </div>

          <button
            type="button"
            className="cart-remove-button"
            onClick={() => onRemover(item.id)}
          >
            Remover
          </button>
        </div>

        <div className="cart-item-footer">
          <div className="quantity-control">
            <button
              type="button"
              onClick={() =>
                onQuantidadeChange(
                  item.id,
                  Math.max(
                    1,
                    item.quantidade - 1
                  )
                )
              }
            >
              −
            </button>

            <strong>{item.quantidade}</strong>

            <button
              type="button"
              onClick={() =>
                onQuantidadeChange(
                  item.id,
                  Math.min(99,item.quantidade + 1)
                )
              }
            >
              +
            </button>
          </div>

          <strong className="cart-item-price">
            R${" "}
            {subtotal
              .toFixed(2)
              .replace(".", ",")}
          </strong>
        </div>
      </div>
    </article>
  );
}

export default CartItem;