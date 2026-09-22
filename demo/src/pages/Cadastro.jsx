import React from "react";

function Cadastro() {
  function handleSubmit(event) {
    event.preventDefault();

    // Cadastro será conectado ao Firebase futuramente.
    console.log("Cadastro enviado");
  }

  return (
    <main className="account-page">
      <div className="account-container">
        <div className="account-card">

          <div className="account-header">
            <div className="account-logo">
              🍔
            </div>

            <span className="eyebrow">
              CRIE SUA CONTA
            </span>

            <h1>
              Tenha seu pedido sempre à mão.
            </h1>

            <p>
              Crie sua conta para acompanhar pedidos,
              consultar seu histórico e facilitar seus próximos pedidos.
            </p>
          </div>

          <form
            className="account-form"
            onSubmit={handleSubmit}
          >
            <div className="form-group">
              <label htmlFor="nome">
                Nome
              </label>

              <input
                id="nome"
                type="text"
                placeholder="Como podemos te chamar?"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="cadastro-email">
                E-mail
              </label>

              <input
                id="cadastro-email"
                type="email"
                placeholder="seuemail@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="telefone">
                Telefone
              </label>

              <input
                id="telefone"
                type="tel"
                placeholder="(51) 99999-9999"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="cadastro-senha">
                Senha
              </label>

              <input
                id="cadastro-senha"
                type="password"
                placeholder="Crie uma senha"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmar-senha">
                Confirmar senha
              </label>

              <input
                id="confirmar-senha"
                type="password"
                placeholder="Digite a senha novamente"
                required
              />
            </div>

            <label className="terms-checkbox">
              <input
                type="checkbox"
                required
              />

              <span>
                Concordo com os termos de uso e a política
                de privacidade.
              </span>
            </label>

            <button
              type="submit"
              className="button button-primary account-submit"
            >
              Criar minha conta
            </button>
          </form>

          <div className="account-footer">
            <span>
              Já possui uma conta?
            </span>

            <a href="/login">
              Entrar
            </a>
          </div>

          <div className="account-guest">
            <a href="/cardapio">
              Continuar sem criar conta →
            </a>
          </div>

        </div>
      </div>
    </main>
  );
}

export default Cadastro; 