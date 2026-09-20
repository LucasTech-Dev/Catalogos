import React, { useState } from "react";

import ProductCard from "../components/ui/ProductCard";
import CategoryFilter from "../components/ui/CategoryFilter";

const produtos = [
  {
    id: 1,
    categoria: "Hambúrgueres",
    nome: "Classic Burger",
    descricao: "Pão brioche, hambúrguer artesanal, queijo e molho especial.",
    preco: "R$ 28,90",
    imagem:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    categoria: "Hambúrgueres",
    nome: "Bacon Supreme",
    descricao: "Hambúrguer artesanal, cheddar, bacon crocante e molho da casa.",
    preco: "R$ 32,90",
    imagem:
      "https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    categoria: "Hambúrgueres",
    nome: "Chicken Crispy",
    descricao: "Frango crocante, queijo, alface e molho especial.",
    preco: "R$ 29,90",
    imagem:
      "https://images.unsplash.com/photo-1615297928064-24977384d0f8?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 4,
    categoria: "Porções",
    nome: "Batata da Casa",
    descricao: "Batatas crocantes acompanhadas do nosso molho especial.",
    preco: "R$ 18,90",
    imagem:
      "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 5,
    categoria: "Porções",
    nome: "Onion Rings",
    descricao: "Anéis de cebola empanados e crocantes.",
    preco: "R$ 21,90",
    imagem:
      "https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 6,
    categoria: "Bebidas",
    nome: "Refrigerante",
    descricao: "Refrigerante gelado para acompanhar seu pedido.",
    preco: "R$ 7,00",
    imagem:
      "https://images.unsplash.com/photo-1629203849820-fdd70d49c38e?auto=format&fit=crop&w=800&q=80",
  },
];

const categorias = ["Todos", "Hambúrgueres", "Porções", "Bebidas"];

function Cardapio() {
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos");

  const produtosFiltrados =
    categoriaAtiva === "Todos"
      ? produtos
      : produtos.filter((produto) => produto.categoria === categoriaAtiva);

  return (
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
          ) : (
            <p className="menu-empty">
              Nada nesta categoria por enquanto. Toque em “Todos” para ver o
              cardápio completo.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

export default Cardapio;