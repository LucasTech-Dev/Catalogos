import React from "react";

function CategoryFilter({
  categorias,
  categoriaAtiva,
  onCategoriaChange,
}) {
  return (
    <div className="category-filter">
      {categorias.map((categoria) => (
        <button
          key={categoria}
          type="button"
          className={
            categoriaAtiva === categoria
              ? "category-filter-button active"
              : "category-filter-button"
          }
          onClick={() => onCategoriaChange(categoria)}
        >
          {categoria}
        </button>
      ))}
    </div>
  );
}

export default CategoryFilter;