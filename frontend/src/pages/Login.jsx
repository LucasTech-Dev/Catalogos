import CampoSenha from '../components/ui/CampoSenha';
import React, {useState} from "react";
import {entrar,entrarGoogle,recuperar} from "../services/conta";

function Login() {
  const [conflito,setConflito]=useState(null);
  const [erro,setErro] = useState(''),[ocupado,setOcupado] = useState(false);
  async function autenticarGoogle(trocarConta=false) {
    if(ocupado)return;setOcupado(true);setErro('');setConflito(null);
    try {await entrarGoogle({trocarConta});window.location.assign('/perfil');}catch(e){setErro(e.message);if(e.code==='conta/convidado-separado')setConflito('google');}finally{setOcupado(false);}
  }
  async function handleSubmit(event,trocarConta=false) {
    event.preventDefault(); if (ocupado) return; setOcupado(true);setErro('');setConflito(null);
    try {await entrar(event.target.querySelector('#email').value,event.target.querySelector('#password').value,...(trocarConta?[{trocarConta:true}]:[]));window.location.assign('/perfil');} catch(e) {setErro(e.message);if(e.code==='conta/convidado-separado')setConflito('email');} finally {setOcupado(false);}
  }
  function confirmarTroca() {
    const form=document.querySelector('.login-form');
    if(form.reportValidity())handleSubmit({preventDefault(){},target:form},true);
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
          {conflito && <div className="account-conflict"><a href="/cadastro">Preservar histórico criando outra conta</a><button type="button" disabled={ocupado} onClick={()=>conflito==='google'?autenticarGoogle(true):confirmarTroca()}>Entendo, entrar na conta existente</button></div>}
          <form className="login-form" onSubmit={handleSubmit}>

            <div className="form-group">
              <label htmlFor="email">
                E-mail
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
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

              <CampoSenha id="password"

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
            <span>ou continue com</span>
          </div>

          <button type="button" className="button button-secondary google-login" disabled={ocupado} onClick={()=>autenticarGoogle()}>Continuar com Google</button>
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
