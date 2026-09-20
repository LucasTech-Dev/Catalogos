import React, { useEffect, useState } from "react";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  // trava o scroll do body enquanto o menu mobile está aberto
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // fecha com ESC (teclado / teclados externos em tablet)
  useEffect(() => {
    if (!menuOpen) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="site-header">
      <div className="container header-content">
        <a href="/" className="logo" onClick={closeMenu}>
          <span className="logo-mark" aria-hidden="true">
            B
          </span>

          <span className="logo-text">
            Bella<span>Food</span>
          </span>
        </a>

        <nav className="desktop-nav" aria-label="Navegação principal">
          <a href="/">Início</a>
          <a href="#cardapio">Cardápio</a>
          <a href="#sobre">Sobre</a>
        </nav>

        <button className="cart-button" type="button" aria-label="Abrir carrinho">
          <span aria-hidden="true">🛒</span>
          <span>Carrinho</span>
          <strong>0</strong>
        </button>

        <button
          className="mobile-menu"
          type="button"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      <nav
        id="mobile-nav"
        className={`mobile-nav${menuOpen ? " is-open" : ""}`}
        aria-label="Navegação mobile"
        hidden={!menuOpen}
      >
        <div className="container mobile-nav-inner">
          <a href="/" onClick={closeMenu}>
            Início
          </a>
          <a href="#cardapio" onClick={closeMenu}>
            Cardápio
          </a>
          <a href="#sobre" onClick={closeMenu}>
            Sobre
          </a>
        </div>
      </nav>

      {menuOpen && (
        <button
          className="mobile-nav-overlay"
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={closeMenu}
        />
      )}
    </header>
  );
}

export default Header;