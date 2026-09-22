import React from "react";

import Header from "./components/layout/Header";

import Home from "./pages/Home";
import Cardapio from "./pages/Cardapio";
import Produto from "./pages/Produto";
import Carrinho from "./pages/Carrinho";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Perfil from "./pages/Perfil";
import DadosPessoais from "./pages/DadosPessoais";
import Enderecos from "./pages/Enderecos";
import Pedidos from "./pages/Pedidos";
import PedidoDetalhes from "./pages/PedidoDetalhes";

function App() {
  const path = window.location.pathname;

  let page;

  switch (path) {
    case "/":
      page = <Home />;
      break;

    case "/cardapio":
      page = <Cardapio />;
      break;

    case "/produto":
      page = <Produto />;
      break;

    case "/carrinho":
      page = <Carrinho />;
      break;

    case "/checkout":
      page = <Checkout />;
      break;

    case "/login":
      page = <Login />;
      break;

    case "/cadastro":
      page = <Cadastro />;
      break;

    case "/perfil":
      page = <Perfil />;
      break;

    case "/perfil/dados":
      page = <DadosPessoais />;
      break;

    case "/perfil/enderecos":
      page = <Enderecos />;
      break;

    case "/perfil/pedidos":
      page = <Pedidos />;
      break;

    case "/perfil/pedido":
      page = <PedidoDetalhes />;
      break;

    default:
      page = <Home />;
  }

  return (
    <>
      <Header />

      {page}
    </>
  );
}

export default App;