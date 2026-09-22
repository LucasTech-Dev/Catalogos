import React, { useEffect, useState } from "react";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Trava o scroll do body enquanto o menu mobile está aberto
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Fecha com ESC
  useEffect(() => {
    if (!menuOpen) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
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

        {/* Logo */}
        <a href="/" className="logo" onClick={closeMenu}>
          <span className="logo-mark" aria-hidden="true">
            🍔
          </span>

          <span className="logo-text">
            Lanche<span>ria</span>
          </span>
        </a>

        {/* Navegação Desktop */}
        <nav
          className="desktop-nav"
          aria-label="Navegação principal"
        >
          <a href="/">Início</a>
          <a href="/cardapio">Cardápio</a>
          <a href="#sobre">Sobre</a>
        </nav>

        {/* Ações do Header */}
        <div className="header-actions">

          {/* LOGIN — aparece somente no desktop */}
          <a
            href="/login"
            className="desktop-login-button"
            aria-label="Entrar na conta"
          >
            <span aria-hidden="true">👤</span>
            <span>Entrar</span>
          </a>

          <a
            href="/carrinho"
            className="desktop-cart-button"
            aria-label="Abrir carrinho"
          >
            <span aria-hidden="true">🛒</span>
            <span>Carrinho</span>
            <strong>0</strong>
          </a>

          {/* MENU MOBILE */}
          <button
            className="mobile-menu-toggle"
            type="button"
            aria-label={
              menuOpen ? "Fechar menu" : "Abrir menu"
            }
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span
              className={`hamburger-icon ${
                menuOpen ? "is-open" : ""
              }`}
            >
              {menuOpen ? "✕" : "☰"}
            </span>
          </button>

        </div>
      </div>

      {/* Menu Mobile */}
      <nav
        id="mobile-nav"
        className={`mobile-nav ${
          menuOpen ? "is-open" : ""
        }`}
        aria-label="Navegação mobile"
        aria-hidden={!menuOpen}
      >
        <div className="container mobile-nav-inner">

          {/* Navegação */}
          <div className="mobile-nav-links">

            <a href="/" onClick={closeMenu}>
              Início
            </a>

            <a href="/cardapio" onClick={closeMenu}>
              Cardápio
            </a>

            <a href="#sobre" onClick={closeMenu}>
              Sobre
            </a>

          </div>

          {/* Ações do usuário */}
          <div className="mobile-nav-footer">

            <a
              href="/login"
              className="mobile-menu-action"
              onClick={closeMenu}
            >
              <span className="mobile-menu-action-icon">
                👤
              </span>

              <span>
                Entrar
              </span>

              <span className="mobile-menu-arrow">
                →
              </span>
            </a>

            <a
              href="/carrinho"
              className="mobile-menu-action"
              onClick={closeMenu}
            >
              <span className="mobile-menu-action-icon">
                🛒
              </span>

              <span>
                Carrinho
              </span>

              <strong className="mobile-cart-count">
                0
              </strong>

              <span className="mobile-menu-arrow">
                →
              </span>
            </a>

          </div>

        </div>
      </nav>

      {/* Overlay */}
      {menuOpen && (
        <div
          className="mobile-nav-overlay"
          aria-hidden="true"
          onClick={closeMenu}
        />
      )}
    </header>
  );
}

export default Header;