import React, { useState } from "react";
import ImagemCatalogo from "../components/ui/ImagemCatalogo";

import {useLoja, EstadoCatalogo, CatalogoPronto} from "../contexts/LojaContext";
function Produto() {
  const {produtos,adicionar,carregando,erro} = useLoja();
  const produto = produtos.find(p => p.id === new URLSearchParams(window.location.search).get("id"));
  const adicionais = [];
  const [quantidade, setQuantidade] = useState(1);
  const [adicionaisSelecionados, setAdicionaisSelecionados] = useState([]);
  const [observacao, setObservacao] = useState("");

  const alternarAdicional = (id) => {
    setAdicionaisSelecionados((atuais) =>
      atuais.includes(id)
        ? atuais.filter((item) => item !== id)
        : [...atuais, id]
    );
  };

  const totalAdicionais = adicionais
    .filter((adicional) =>
      adicionaisSelecionados.includes(adicional.id)
    )
    .reduce((total, adicional) => total + adicional.preco, 0);

  if (!produto) return <CatalogoPronto><main className="product-page"><EstadoCatalogo />{!carregando && !erro && <p>Produto não encontrado.</p>}<a href="/cardapio">Ver cardápio</a></main></CatalogoPronto>;
  const total = (produto.preco + totalAdicionais) * quantidade;

  return (<CatalogoPronto>
    <main className="product-page">
      <EstadoCatalogo />
      <section className="product-detail-section">
        <div className="container product-detail-grid">

          <div className="product-detail-image">
            <ImagemCatalogo
              src={produto.imagem}
              alt={produto.nome}
            />
          </div>

          <div className="product-detail-content">

            <span className="eyebrow">
              {produto.categoria}
            </span>

            <h1>{produto.nome}</h1>

            <p className="product-detail-description">
              {produto.descricao}
            </p>

            <strong className="product-detail-price">
              R$ {produto.preco.toFixed(2).replace(".", ",")}
            </strong>

            <div className="product-divider" />

            <div className="product-info-block">
              <h2>Ingredientes</h2>

              <div className="ingredients-list">
                {produto.ingredientes.map((ingrediente) => (
                  <span key={ingrediente}>
                    ✓ {ingrediente}
                  </span>
                ))}
              </div>
            </div>

            <div className="product-divider" />

            <div className="product-purchase">

              <div className="quantity-control">
                <button
                  type="button"
                  onClick={() =>
                    setQuantidade(
                      Math.max(1, quantidade - 1)
                    )
                  }
                >
                  −
                </button>

                <strong>{quantidade}</strong>

                <button
                  type="button"
                  onClick={() =>
                    setQuantidade(Math.min(99,quantidade + 1))
                  }
                >
                  +
                </button>
              </div>

              <button
                type="button"
                className="add-to-cart-button"
                disabled={produto.ativo !== true || produto.disponivel === false}
                onClick={() => {adicionar(produto, quantidade); window.location.assign("/carrinho");}}
              >
                <span>{produto.ativo === true && produto.disponivel !== false ? "Adicionar ao carrinho" : "Produto indisponível"}</span>
                <strong>
                  R$ {total.toFixed(2).replace(".", ",")}
                </strong>
              </button>

            </div>

          </div>
        </div>
      </section>
    </main></CatalogoPronto>
  );
}

export default Produto;
