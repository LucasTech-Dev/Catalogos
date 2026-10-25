import MaterialIcon from "../components/ui/MaterialIcon";
import BotaoGoogle from '../components/ui/BotaoGoogle';
import {FeedbackAcao} from '../components/ui/ToastProvider';
import {notificarAoNavegar} from '../lib/notificacoes';
import CampoSenha from '../components/ui/CampoSenha';
import React, {useState} from "react";
import {entrar,recuperar} from "../services/conta";

function Login() {
  const [conflito,setConflito]=useState(null);
  const [erro,setErro] = useState(''),[ocupado,setOcupado] = useState(false);
  async function handleSubmit(event,trocarConta=false) {
    event.preventDefault(); if (ocupado) return; setOcupado(true);setErro('');setConflito(null);
    try {await entrar(event.target.querySelector('#email').value,event.target.querySelector('#password').value,...(trocarConta?[{trocarConta:true}]:[]));notificarAoNavegar('Você entrou na sua conta.');window.location.assign('/perfil');} catch(e) {setErro(e.message);if(e.code==='conta/convidado-separado')setConflito('email');} finally {setOcupado(false);}
  }
  async function recuperarSenha(event){
    event.preventDefault();if(ocupado)return;const email=document.getElementById('email');if(!email.reportValidity())return;
    setOcupado(true);setErro('');setConflito(null);
    try{await recuperar(email.value);setErro('Se houver uma conta com esse e-mail, você receberá instruções de recuperação.');}catch(e){setErro(e.message);}finally{setOcupado(false);}
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
              <MaterialIcon name="lunch_dining"/>
            </div>

            <span className="eyebrow">BEM-VINDO DE VOLTA</span>

            <h1>Entre na sua conta</h1>

            <p>
              Acesse seus pedidos, histórico e informações da sua conta.
            </p>
          </div>

          {erro && <FeedbackAcao mensagem={erro} tipo={erro.startsWith("Se houver")?"info":"erro"} persistente={Boolean(conflito)}/>}
          {conflito && <div className="account-conflict"><a href="/cadastro">Preservar histórico criando outra conta</a><button type="button" disabled={ocupado} onClick={confirmarTroca}>Entendo, entrar na conta existente</button></div>}
          <form aria-busy={ocupado} className="login-form" onSubmit={handleSubmit}>

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

                <a href="#recuperar" aria-disabled={ocupado} onClick={recuperarSenha}>
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

          <BotaoGoogle disabled={ocupado} onBusyChange={busy=>{setOcupado(busy);if(busy){setErro('');setConflito(null);}}}/>
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
              Continuar sem login <MaterialIcon name="arrow_forward"/>
            </a>
          </div>

        </div>
      </div>
    </main>
  );
}

export default Login;
