import BotaoGoogle from '../components/ui/BotaoGoogle';
import {FeedbackAcao} from '../components/ui/ToastProvider';
import {notificarAoNavegar} from '../lib/notificacoes';
import CampoSenha from '../components/ui/CampoSenha';
import React, {useState} from "react";
import {cadastrar} from "../services/conta";

function Cadastro() {
  const [erro,setErro] = useState(''),[ocupado,setOcupado] = useState(false);
  async function handleSubmit(event) {
    event.preventDefault(); if (ocupado) return;setOcupado(true);setErro('');
    const valor = id => event.target.querySelector('#' + id).value;
    try {
      if (valor('cadastro-senha') !== valor('confirmar-senha')) throw new Error('As senhas devem ser iguais.');
      await cadastrar({nome:valor('nome'),telefone:valor('telefone'),email:valor('cadastro-email'),senha:valor('cadastro-senha')});notificarAoNavegar('Conta criada com sucesso.');window.location.assign('/perfil');
    } catch(e) {setErro(e.message);} finally {setOcupado(false);}
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

          {erro && <FeedbackAcao mensagem={erro}/>}
          <form aria-busy={ocupado}
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
                autoComplete="email"
                placeholder="seuemail@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="telefone">
                Telefone (opcional)
              </label>

              <input
                id="telefone"
                type="tel"
                placeholder="(51) 99999-9999"
              />
            </div>

            <div className="form-group">
              <label htmlFor="cadastro-senha">
                Senha
              </label>

              <CampoSenha id="cadastro-senha"

                placeholder="Crie uma senha"
                required
               autoComplete="new-password" minLength={6}/>
            </div>

            <div className="form-group">
              <label htmlFor="confirmar-senha">
                Confirmar senha
              </label>

              <CampoSenha id="confirmar-senha"

                placeholder="Digite a senha novamente"
                required
               autoComplete="new-password" minLength={6}/>
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
              disabled={ocupado} type="submit"
              className="button button-primary account-submit"
            >
              Criar minha conta
            </button>
          </form>

          <div className="login-divider"><span>ou continue com</span></div><BotaoGoogle disabled={ocupado} onBusyChange={busy=>{setOcupado(busy);if(busy){setErro('');}}}/>
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
