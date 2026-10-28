import MaterialIcon from "../components/ui/MaterialIcon";
import {notificarAoNavegar} from '../lib/notificacoes';
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
  const indisponivel = produto.ativo !== true || produto.disponivel === false;

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
            {indisponivel && <p className="product-detail-unavailable" role="status">Produto indisponível no momento</p>}

            <p className="product-detail-description">
              {produto.descricao}
            </p>

            <strong className="product-detail-price">
              R$ {produto.preco.toFixed(2).replace(".", ",")}
            </strong>

            <div className="product-divider" />

            <div className="product-info-block">
              <h2>Ingredientes</h2>

              {produto.ingredientes.length > 0 ? <ul className="ingredients-list" aria-label="Ingredientes do produto">
                {produto.ingredientes.map((ingrediente, indice) => (
                  <li key={`${indice}-${ingrediente}`}>
                    <MaterialIcon name="check"/> {ingrediente}
                  </li>
                ))}
              </ul> : <p className="product-ingredients-help">Ingredientes não informados pelo estabelecimento.</p>}
            </div>

            <div className="product-divider" />

            <div className="product-observation">
              <div className="product-observation-heading">
                <label htmlFor="observacao-produto">Observações do produto</label>
                <span className="product-observation-optional">Opcional</span>
              </div>
              <p id="observacao-produto-ajuda" className="product-observation-help">
                Quer ajustar algum detalhe? Conte pra gente.
              </p>
              <textarea
                id="observacao-produto"
                className="product-observation-input"
                aria-describedby="observacao-produto-ajuda observacao-produto-limite"
                placeholder="Ex.: sem cebola, molho à parte…"
                rows={4}
                value={observacao}
                maxLength={1000}
                onChange={event => setObservacao(event.target.value)}
              />
              <span id="observacao-produto-limite" className="product-observation-count">
                {observacao.length} / 1000 caracteres
              </span>
            </div>
            <div className="product-purchase">

              <div className="quantity-control">
                <button
                  type="button" aria-label="Diminuir quantidade"
                  onClick={() =>
                    setQuantidade(
                      Math.max(1, quantidade - 1)
                    )
                  }
                >
                  <MaterialIcon name="remove"/>
                </button>

                <strong>{quantidade}</strong>

                <button
                  type="button" aria-label="Aumentar quantidade"
                  onClick={() =>
                    setQuantidade(Math.min(99,quantidade + 1))
                  }
                >
                  <MaterialIcon name="add"/>
                </button>
              </div>

              <button
                type="button"
                className="add-to-cart-button"
                disabled={indisponivel}
                onClick={() => {if(adicionar(produto, quantidade, observacao)!==false){notificarAoNavegar("Produto adicionado ao carrinho.");window.location.assign("/carrinho");}}}
              >
                <span>{indisponivel ? "Produto indisponível" : "Adicionar ao carrinho"}</span>
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
