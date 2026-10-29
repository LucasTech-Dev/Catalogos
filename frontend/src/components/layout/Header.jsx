import ImagemCatalogo from "../ui/ImagemCatalogo";
import MaterialIcon from "../ui/MaterialIcon";
import React, { useEffect, useState } from "react";

import {useLoja} from "../../contexts/LojaContext";

import {useAcessoConta} from '../../hooks/useAcessoConta';

function Header() {
  const {usuario,carregando:sessaoPendente,administrador}=useAcessoConta();
  const conectado=Boolean(usuario && !usuario.isAnonymous);
  const contaUrl=administrador?'/admin':conectado?'/perfil':'/login';
  const contaTexto=sessaoPendente?'Verificando conta…':administrador?'Painel administrativo':conectado?'Minha conta':'Entrar';
  const {loja,itens} = useLoja();
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
            {loja?.logo ? <ImagemCatalogo src={loja.logo} alt="" style={{width:32,height:32,objectFit:"contain"}} /> : <MaterialIcon name="lunch_dining"/>}
          </span>

          <span className="logo-text">
            {loja?.nome || "Catálogo"}
          </span>
        </a>

        {/* Navegação Desktop */}
        <nav
          className="desktop-nav"
          aria-label="Navegação principal"
        >
          <a href="/">Início</a>
          <a href="/cardapio">Cardápio</a>
          <a href="/#sobre">Sobre</a>
        </nav>

        {/* Ações do Header */}
        <div className="header-actions">

          {/* LOGIN — aparece somente no desktop */}
          <a
            href={contaUrl}
            className="desktop-login-button"
            aria-label={contaTexto}
          >
            <span aria-hidden="true"><MaterialIcon name="person"/></span>
            <span>{contaTexto}</span>
          </a>

          <a
            href="/carrinho"
            className="desktop-cart-button"
            aria-label="Abrir carrinho"
          >
            <span aria-hidden="true"><MaterialIcon name="shopping_cart"/></span>
            <span>Carrinho</span>
            <strong>{itens.reduce((s,i) => s+i.quantidade,0)}</strong>
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
              <MaterialIcon name={menuOpen ? "close" : "menu"}/>
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

            <a href="/#sobre" onClick={closeMenu}>
              Sobre
            </a>

          </div>

          {/* Ações do usuário */}
          <div className="mobile-nav-footer">

            <a
              href={contaUrl}
              className="mobile-menu-action"
              onClick={closeMenu}
            >
              <span className="mobile-menu-action-icon">
                <MaterialIcon name="person"/>
              </span>

              <span>
                {contaTexto}
              </span>

              <span className="mobile-menu-arrow">
                <MaterialIcon name="arrow_forward"/>
              </span>
            </a>

            <a
              href="/carrinho"
              className="mobile-menu-action"
              onClick={closeMenu}
            >
              <span className="mobile-menu-action-icon">
                <MaterialIcon name="shopping_cart"/>
              </span>

              <span>
                Carrinho
              </span>

              <strong className="mobile-cart-count">
                {itens.reduce((s,i) => s+i.quantidade,0)}
              </strong>

              <span className="mobile-menu-arrow">
                <MaterialIcon name="arrow_forward"/>
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
