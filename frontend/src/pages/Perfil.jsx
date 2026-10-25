import MaterialIcon from "../components/ui/MaterialIcon";
import '../components/conta/areaCliente.css';
import {notificarAoNavegar} from '../lib/notificacoes';
import {FeedbackAcao} from '../components/ui/ToastProvider';
import {PageBoundary} from '../components/ui/PageLoader';
import React,{useState} from "react";

import {useRecurso} from "../hooks/useRecurso";
import {sair,buscarPerfil} from "../services/conta";
function Perfil() {
  const [erroSaida,setErroSaida]=useState(''),[saindo,setSaindo]=useState(false);
  const recurso=useRecurso(buscarPerfil);
  const {dados,erro,carregando} = recurso;
  return (<PageBoundary recursos={[recurso]}>
    <main className="profile-page customer-page">
      <div className="profile-container customer-container">

        {/* CABEÇALHO */}
        {erro && <p role="alert">{erro}</p>}{carregando && <p>Carregando...</p>}{dados?.anonimo && <p>Você está usando uma sessão de convidado. <a href="/cadastro">Crie uma conta para preservar seu histórico.</a></p>}<section className="profile-header">

          <div className="profile-avatar">
            <MaterialIcon name="person"/>
          </div>

          <div>
            <span className="eyebrow">
              MINHA CONTA
            </span>

            <h1>
              Olá, {dados?.nome || "visitante"}
            </h1>

            <p>
              Gerencie seus dados e acompanhe seus pedidos.
            </p>
            <p>{dados?.email}</p>{dados?.telefone && <p>{dados.telefone}</p>}
          </div>
        </section>

        {/* OPÇÕES DA CONTA */}
        <section className="profile-options">

          <a
            href="/perfil/dados"
            className="profile-option"
          >
            <div className="profile-option-icon">
              <MaterialIcon name="person"/>
            </div>

            <div className="profile-option-content">
              <h2>
                Dados pessoais
              </h2>

              <p>
                Nome, e-mail e telefone
              </p>
            </div>

            <span className="profile-option-arrow">
              <MaterialIcon name="arrow_forward"/>
            </span>
          </a>


          <a
            href="/perfil/pedidos"
            className="profile-option"
          >
            <div className="profile-option-icon">
              <MaterialIcon name="inventory_2"/>
            </div>

            <div className="profile-option-content">
              <h2>
                Meus pedidos
              </h2>

              <p>
                Consulte seu histórico de pedidos
              </p>
            </div>

            <span className="profile-option-arrow">
              <MaterialIcon name="arrow_forward"/>
            </span>
          </a>


          <a
            href="/perfil/enderecos"
            className="profile-option"
          >
            <div className="profile-option-icon">
              <MaterialIcon name="location_on"/>
            </div>

            <div className="profile-option-content">
              <h2>
                Meus endereços
              </h2>

              <p>
                Gerencie seus endereços de entrega
              </p>
            </div>

            <span className="profile-option-arrow">
              <MaterialIcon name="arrow_forward"/>
            </span>
          </a>

        </section>

        {/* AÇÕES */}
        <section className="profile-actions">{erroSaida && <FeedbackAcao mensagem={erroSaida}/>}

          <button
            type="button"
            className="profile-logout" disabled={saindo} onClick={async () => {if(saindo)return;setSaindo(true);try{await sair();notificarAoNavegar("Você saiu da sua conta.");window.location.assign("/login");}catch{setErroSaida("Não foi possível sair. Tente novamente.");setSaindo(false);}}}
          >
            Sair da conta
          </button>

        </section>

      </div>
    </main></PageBoundary>
  );
}

export default Perfil;
