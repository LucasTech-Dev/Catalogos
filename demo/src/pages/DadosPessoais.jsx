import React from "react";

function DadosPessoais() {
  function handleSubmit(event) {
    event.preventDefault();

    // Futuramente os dados serão atualizados no Firebase.
    console.log("Dados pessoais atualizados");
  }

  return (
    <main className="account-data-page">
      <div className="container account-data-container">

        {/* CABEÇALHO */}
        <div className="account-data-top">
          <a href="/perfil" className="back-link">
            ← Minha conta
          </a>

          <span className="eyebrow">
            MEUS DADOS
          </span>

          <h1>
            Dados pessoais
          </h1>

          <p>
            Mantenha suas informações atualizadas para facilitar
            seus próximos pedidos.
          </p>
        </div>

        {/* FORMULÁRIO */}
        <form
          className="personal-data-card"
          onSubmit={handleSubmit}
        >

          <div className="personal-data-section">
            <div className="personal-data-section-heading">
              <h2>
                Informações básicas
              </h2>

              <p>
                Informações utilizadas na sua conta.
              </p>
            </div>

            <div className="personal-data-grid">

              <div className="form-group">
                <label htmlFor="nome">
                  Nome completo
                </label>

                <input
                  id="nome"
                  type="text"
                  defaultValue="Lucas Sant'Ana"
                  placeholder="Seu nome completo"
                />
              </div>

              <div className="form-group">
                <label htmlFor="telefone">
                  Telefone
                </label>

                <input
                  id="telefone"
                  type="tel"
                  defaultValue="(51) 99999-9999"
                  placeholder="(51) 99999-9999"
                />
              </div>

              <div className="form-group personal-data-full">
                <label htmlFor="email">
                  E-mail
                </label>

                <input
                  id="email"
                  type="email"
                  defaultValue="lucas@email.com"
                  placeholder="seuemail@email.com"
                />

                <small>
                  O e-mail está vinculado à sua conta.
                </small>
              </div>

            </div>
          </div>

          {/* SENHA */}
          <div className="personal-data-section">

            <div className="personal-data-section-heading">
              <h2>
                Segurança
              </h2>

              <p>
                Altere sua senha sempre que precisar.
              </p>
            </div>

            <div className="personal-data-grid">

              <div className="form-group personal-data-full">
                <label htmlFor="senha-atual">
                  Senha atual
                </label>

                <input
                  id="senha-atual"
                  type="password"
                  placeholder="Digite sua senha atual"
                />
              </div>

              <div className="form-group">
                <label htmlFor="nova-senha">
                  Nova senha
                </label>

                <input
                  id="nova-senha"
                  type="password"
                  placeholder="Nova senha"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmar-nova-senha">
                  Confirmar nova senha
                </label>

                <input
                  id="confirmar-nova-senha"
                  type="password"
                  placeholder="Digite novamente"
                />
              </div>

            </div>
          </div>

          {/* AÇÕES */}
          <div className="personal-data-actions">

            <a
              href="/perfil"
              className="button button-secondary"
            >
              Cancelar
            </a>

            <button
              type="submit"
              className="button button-primary"
            >
              Salvar alterações
            </button>

          </div>

        </form>

      </div>
    </main>
  );
}

export default DadosPessoais;