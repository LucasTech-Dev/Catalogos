import MaterialIcon from "./MaterialIcon";
import React from "react";
import ImagemCatalogo from "./ImagemCatalogo";
import ObservacaoItem from "./ObservacaoItem";

function CartItem({
  item,
  onQuantidadeChange,
  onRemover,
  onObservacaoChange,
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

            <ObservacaoItem item={item} onSalvar={onObservacaoChange} />
          </div>

          <button
            type="button"
            className="cart-remove-button"
            onClick={() => onRemover(item.chave || item.id)}
          >
            Remover
          </button>
        </div>

        <div className="cart-item-footer">
          <div className="quantity-control">
            <button
              type="button" aria-label="Diminuir quantidade"
              onClick={() =>
                onQuantidadeChange(
                  item.chave || item.id,
                  Math.max(
                    1,
                    item.quantidade - 1
                  )
                )
              }
            >
              <MaterialIcon name="remove"/>
            </button>

            <strong>{item.quantidade}</strong>

            <button
              type="button" aria-label="Aumentar quantidade"
              onClick={() =>
                onQuantidadeChange(
                  item.chave || item.id,
                  Math.min(99,item.quantidade + 1)
                )
              }
            >
              <MaterialIcon name="add"/>
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
