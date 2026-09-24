import React from "react";

import Header from "./components/layout/Header";
import AdminLayout from "./components/admin/AdminLayout";

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
import PerfilPedidos from "./pages/Pedidos";
import PerfilPedidoDetalhes from "./pages/PedidoDetalhes";
import Dashboard from "./pages/admin/Dashboard";
import Pedidos from "./pages/admin/Pedidos";
import PedidoDetalhes from "./pages/admin/PedidoDetalhes";
import Produtos from "./pages/admin/Produtos";
import ProdutoForm from "./pages/admin/ProdutoForm";
import Categorias from "./pages/admin/Categorias";
import Clientes from "./pages/admin/Clientes";
import Configuracoes from "./pages/admin/Configuracoes";

function App() {
  const path = window.location.pathname;
  const isAdminRoute = path === "/admin" || path.startsWith("/admin/");

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
      page = <PerfilPedidos />;
      break;

    case "/perfil/pedido":
      page = <PerfilPedidoDetalhes />;
      break;

    case "/admin":
      page = <Dashboard />;
      break;

    case "/admin/pedidos":
      page = <Pedidos />;
      break;

    case "/admin/pedido":
      page = <PedidoDetalhes />;
      break;

    case "/admin/produto/novo":
      page = <ProdutoForm />;
      break;

    case "/admin/produto":
      page = <ProdutoForm />;
      break;

    case "/admin/produtos":
      page = <Produtos />;
      break;

    case "/admin/categorias":
      page = <Categorias />;
      break;

    case "/admin/clientes":
      page = <Clientes />;
      break;

    case "/admin/configuracoes":
      page = <Configuracoes />;
      break;

    default:
      page = <Home />;
  }

  if (isAdminRoute) {
    return (
      <AdminLayout currentPath={path}>
        {page}
      </AdminLayout>
    );
  }

  return (
    <>
      <Header />

      {page}
    </>
  );
}

export default App;
