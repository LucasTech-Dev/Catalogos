import React from "react";
import ReactDOM from "react-dom/client";
import {modoDemo,modoFixtures,modoOriginalDemo} from './lib/runtimeDemo';

import "./styles.css";

import {PageLoader,PageBoundary} from './components/ui/PageLoader';
import {iniciarInterface} from './lib/inicializacao';
const root=ReactDOM.createRoot(document.getElementById('root'));
root.render(<PageLoader/>);
iniciarInterface({
  carregar:()=>modoDemo(import.meta.env) && !modoOriginalDemo(import.meta.env)?(modoFixtures(import.meta.env)?import('./pages/DemoFixtures.jsx'):import('./pages/DemoPublica.jsx')):import('./App.jsx'),
  mostrar:({default:App})=>root.render(<React.StrictMode><App/></React.StrictMode>),
  mostrarErro:()=>root.render(<PageBoundary recursos={[{pronto:false,erro:'O carregamento ainda não terminou. Verifique sua conexão; você pode tentar novamente.',atualizar:()=>window.location.reload()}]}/> )
});
