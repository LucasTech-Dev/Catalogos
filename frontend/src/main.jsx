import React from "react";
import ReactDOM from "react-dom/client";
import {modoDemo,modoFixtures,modoOriginalDemo} from './lib/runtimeDemo';

import "./styles.css";

import {PageLoader,PageBoundary} from './components/ui/PageLoader';
import {aguardarLeitura} from './lib/carregamento';
const root=ReactDOM.createRoot(document.getElementById('root'));
root.render(<PageLoader/>);
async function iniciar() {
  const {default:App}=await aguardarLeitura(() => (modoDemo(import.meta.env) && !modoOriginalDemo(import.meta.env)?(modoFixtures(import.meta.env)?import('./pages/DemoFixtures.jsx'):import('./pages/DemoPublica.jsx')):import('./App.jsx')));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
iniciar().catch(()=>{root.render(<PageBoundary recursos={[{pronto:false,erro:'Aplicação indisponível. Confira sua conexão ou a configuração da loja.',atualizar:()=>window.location.reload()}]}/>);});
