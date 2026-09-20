import React from "react";

import Header from "./components/layout/Header";
import Home from "./pages/Home";
import Cardapio from "./pages/Cardapio";
import Produto from "./pages/Produto";
import Carrinho from "./pages/Carrinho";
import Checkout from "./pages/Checkout";

function App() {
  const caminho = window.location.pathname;

  return (
    <>
      <Header />

      {caminho === "/cardapio" ? (
        <Cardapio />
      ) : caminho === "/produto" ? (
        <Produto />
      ) : caminho === "/carrinho" ? (
        <Carrinho />
      ) : caminho === "/checkout" ? (
        <Checkout />
      ) : (
        <Home />
      )}
    </>
  );
}

export default App;