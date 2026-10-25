import React, {useState} from "react";
import {entrar,recuperar} from "../services/conta";

function Login() {
  const [erro,setErro] = useState(''),[ocupado,setOcupado] = useState(false);
  async function handleSubmit(event) {
    event.preventDefault(); if (ocupado) return; setOcupado(true);setErro('');
    try {await entrar(event.target.querySelector('#email').value,event.target.querySelector('#password').value);window.location.assign('/perfil');} catch(e) {setErro(e.message);} finally {setOcupado(false);}
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

          {erro && <p role="alert">{erro}</p>}
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

                <a href="#recuperar" onClick={async e => {e.preventDefault();try {await recuperar(document.getElementById("email").value);setErro("Se houver uma conta com esse e-mail, você receberá instruções de recuperação.");} catch(err) {setErro(err.message);}}}>
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
              disabled={ocupado} type="submit"
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
