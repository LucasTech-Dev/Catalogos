import React from "react";
import ReactDOM from "react-dom/client";
import {modoDemo,modoFixtures} from './lib/runtimeDemo';

import "./styles.css";

async function iniciar() {
  const {default:App}=await (modoDemo(import.meta.env)?(modoFixtures(import.meta.env)?import('./pages/DemoFixtures.jsx'):import('./pages/DemoPublica.jsx')):import('./App.jsx'));
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
iniciar().catch(()=>{document.getElementById('root').textContent='Aplicação indisponível. Confira a configuração da demonstração.';});
