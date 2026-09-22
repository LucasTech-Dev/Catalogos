import React from "react";

function Login() {
  function handleSubmit(event) {
    event.preventDefault();

    // Login ainda será conectado ao Firebase futuramente.
    console.log("Login enviado");
  }

  return (
    <main className="login-page">
      <div className="login-container">
        <div className="login-card">

          <div className="login-header">
            <div className="login-logo">
              🍔
            </div>

            <span className="eyebrow">BEM-VINDO DE VOLTA</span>

            <h1>Entre na sua conta</h1>

            <p>
              Acesse seus pedidos, histórico e informações da sua conta.
            </p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>

            <div className="form-group">
              <label htmlFor="email">
                E-mail
              </label>

              <input
                id="email"
                type="email"
                placeholder="seuemail@email.com"
                required
              />
            </div>

            <div className="form-group">
              <div className="form-label-row">
                <label htmlFor="password">
                  Senha
                </label>

                <a href="#recuperar">
                  Esqueci minha senha
                </a>
              </div>

              <input
                id="password"
                type="password"
                placeholder="Digite sua senha"
                required
              />
            </div>

            <button
              type="submit"
              className="button button-primary login-submit"
            >
              Entrar
            </button>
          </form>

          <div className="login-divider">
            <span>ou</span>
          </div>

          <div className="login-register">
            <p>
              Ainda não possui uma conta?
            </p>

            <a href="/cadastro" className="register-link">
              Criar minha conta
            </a>
          </div>

          <div className="login-guest">
            <span>Você também pode comprar sem criar uma conta.</span>

            <a href="/cardapio">
              Continuar sem login →
            </a>
          </div>

        </div>
      </div>
    </main>
  );
} 

export default Login;