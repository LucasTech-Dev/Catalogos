import React, { useState } from "react";

import ProductCard from "../components/ui/ProductCard";
import CategoryFilter from "../components/ui/CategoryFilter";

import {useLoja, EstadoCatalogo, CatalogoPronto} from "../contexts/LojaContext";
function Cardapio() {
  const {produtos,categorias:lista,carregando,erro} = useLoja();
  const categorias = ["Todos", ...lista.map(c => c.nome)];
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos");

  const produtosFiltrados =
    categoriaAtiva === "Todos"
      ? produtos
      : produtos.filter((produto) => produto.categoria === categoriaAtiva);

  return (<CatalogoPronto>
    <main>
      <section className="menu-hero">
        <div className="container">
          <span className="eyebrow">NOSSO CARDÁPIO</span>

          <h1>
            Escolha seu próximo
            <span> favorito.</span>
          </h1>

          <p>
            Lanches preparados na hora, acompanhamentos e bebidas para completar
            seu pedido.
          </p>
        </div>
      </section>

      <section className="section menu-section" id="cardapio">
        <div className="container">
          <EstadoCatalogo />
          <CategoryFilter
            categorias={categorias}
            categoriaAtiva={categoriaAtiva}
            onCategoriaChange={setCategoriaAtiva}
          />

          {/* no mobile a lista fica longe dos filtros: avisa quantos itens sobraram */}
          <p className="menu-count" aria-live="polite">
            {produtosFiltrados.length}{" "}
            {produtosFiltrados.length === 1 ? "item" : "itens"}
            {categoriaAtiva !== "Todos" && ` em ${categoriaAtiva}`}
          </p>

          {produtosFiltrados.length > 0 ? (
            <div className="menu-products">
              {produtosFiltrados.map((produto) => (
                <ProductCard key={produto.id} produto={produto} />
              ))}
            </div>
          ) : !carregando && !erro ? (
            <p className="menu-empty">
              Nada nesta categoria por enquanto. Toque em “Todos” para ver o
              cardápio completo.
            </p>
          ) : null}
        </div>
      </section>
    </main></CatalogoPronto>
  );
}

export default Cardapio;
