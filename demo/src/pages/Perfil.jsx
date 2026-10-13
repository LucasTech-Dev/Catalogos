import React from "react";

import {useRecurso} from "../hooks/useRecurso";
import {publico} from "../services/api";
import {sair} from "../services/conta";
function Perfil() {
  const {dados,erro,carregando} = useRecurso(publico + "/me");
  return (
    <main className="profile-page">
      <div className="container profile-container">

        {/* CABEÇALHO */}
        {erro && <p role="alert">{erro}</p>}{carregando && <p>Carregando...</p>}{dados?.anonimo && <p>Você está usando uma sessão de convidado. <a href="/cadastro">Crie uma conta para preservar seu histórico.</a></p>}<section className="profile-header">

          <div className="profile-avatar">
            👤
          </div>

          <div>
            <span className="eyebrow">
              MINHA CONTA
            </span>

            <h1>
              Olá, {dados?.nome || "visitante"} 👋
            </h1>

            <p>
              Gerencie seus dados e acompanhe seus pedidos.
            </p>
          </div>

        </section>

        {/* OPÇÕES DA CONTA */}
        <section className="profile-options">

          <a
            href="/perfil/dados"
            className="profile-option"
          >
            <div className="profile-option-icon">
              👤
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
              →
            </span>
          </a>


          <a
            href="/perfil/pedidos"
            className="profile-option"
          >
            <div className="profile-option-icon">
              📦
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
              →
            </span>
          </a>


          <a
            href="/perfil/enderecos"
            className="profile-option"
          >
            <div className="profile-option-icon">
              📍
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
              →
            </span>
          </a>

        </section>

        {/* AÇÕES */}
        <section className="profile-actions">

          <button
            type="button"
            className="profile-logout" onClick={async () => {await sair(); window.location.assign("/login");}}
          >
            Sair da conta
          </button>

        </section>

      </div>
    </main>
  );
}

export default Perfil;