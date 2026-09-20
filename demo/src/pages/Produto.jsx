import React, { useState } from "react";

const produto = {
  nome: "Classic Burger",
  categoria: "Hambúrgueres",
  descricao:
    "Um hambúrguer artesanal preparado com ingredientes selecionados, pão brioche macio, queijo derretido e nosso molho especial.",
  preco: 28.9,
  imagem:
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=80",
  ingredientes: [
    "Pão brioche",
    "Hambúrguer artesanal",
    "Queijo cheddar",
    "Molho especial",
    "Alface",
    "Tomate",
  ],
};

const adicionais = [
  {
    id: 1,
    nome: "Bacon crocante",
    preco: 5,
  },
  {
    id: 2,
    nome: "Queijo extra",
    preco: 4,
  },
  {
    id: 3,
    nome: "Molho especial",
    preco: 2,
  },
];

function Produto() {
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

  const total = (produto.preco + totalAdicionais) * quantidade;

  return (
    <main className="product-page">
      <section className="product-detail-section">
        <div className="container product-detail-grid">

          <div className="product-detail-image">
            <img
              src={produto.imagem}
              alt={produto.nome}
            />
          </div>

          <div className="product-detail-content">

            <span className="eyebrow">
              {produto.categoria}
            </span>

            <h1>{produto.nome}</h1>

            <div className="product-rating">
              <span>★★★★★</span>
              <small>4,9 • 128 avaliações</small>
            </div>

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

            <div className="product-info-block">
              <h2>Adicionais</h2>

              <div className="extras-list">
                {adicionais.map((adicional) => {
                  const selecionado =
                    adicionaisSelecionados.includes(
                      adicional.id
                    );

                  return (
                    <button
                      key={adicional.id}
                      type="button"
                      className={
                        selecionado
                          ? "extra-option selected"
                          : "extra-option"
                      }
                      onClick={() =>
                        alternarAdicional(adicional.id)
                      }
                    >
                      <span>
                        <strong>{adicional.nome}</strong>
                        <small>
                          + R${" "}
                          {adicional.preco
                            .toFixed(2)
                            .replace(".", ",")}
                        </small>
                      </span>

                      <span className="extra-check">
                        {selecionado ? "✓" : "+"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="product-info-block">
              <h2>Observações</h2>

              <textarea
                value={observacao}
                onChange={(event) =>
                  setObservacao(event.target.value)
                }
                placeholder="Ex.: sem cebola, molho à parte..."
                rows="4"
              />
            </div>

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
                    setQuantidade(quantidade + 1)
                  }
                >
                  +
                </button>
              </div>

              <button
                type="button"
                className="add-to-cart-button"
              >
                <span>Adicionar ao carrinho</span>
                <strong>
                  R$ {total.toFixed(2).replace(".", ",")}
                </strong>
              </button>

            </div>

          </div>
        </div>
      </section>
    </main>
  );
}

export default Produto;