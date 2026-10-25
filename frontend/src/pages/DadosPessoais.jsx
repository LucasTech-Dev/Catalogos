import MaterialIcon from "../components/ui/MaterialIcon";
import '../components/conta/areaCliente.css';
import {notificarAoNavegar} from '../lib/notificacoes';
import {FeedbackAcao} from '../components/ui/ToastProvider';
import CampoSenha from '../components/ui/CampoSenha';
import {PageBoundary} from '../components/ui/PageLoader';
import React, {useState} from "react";
import {useRecurso} from "../hooks/useRecurso";
import {trocarSenha,buscarPerfil,salvarPerfil} from "../services/conta";

function DadosPessoais() {
  const recurso=useRecurso(buscarPerfil);
  const {dados,erro:erroCarga,carregando,atualizar} = recurso;
  const [erro,setErro] = useState(''),[ocupado,setOcupado] = useState(false);
  async function handleSubmit(event) {
    event.preventDefault();if (ocupado) return;setOcupado(true);setErro('');const valor = id => event.target.querySelector('#'+id).value;
    try {
      if (dados?.senhaDisponivel && valor('nova-senha')) {if (valor('nova-senha') !== valor('confirmar-nova-senha')) throw new Error('As senhas devem ser iguais.');await trocarSenha(valor('senha-atual'),valor('nova-senha'));}
      await salvarPerfil({nome:valor('nome'),telefone:valor('telefone')},dados?.uid);setErro('Dados salvos.');atualizar();
    } catch(e) {setErro(e.message);} finally {setOcupado(false);}
  }

  return (<PageBoundary recursos={[recurso]}>
    <main className="account-data-page customer-page">
      <div className="account-data-container customer-container">

        {/* CABEÇALHO */}
        <div className="account-data-top">
          <a href="/perfil" className="back-link">
            <MaterialIcon name="arrow_back"/> Minha conta
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

        {erroCarga && <p role="alert">{erroCarga}</p>}{erro && <FeedbackAcao mensagem={erro} tipo={erro==="Dados salvos."?"sucesso":"erro"}/>}
        {/* FORMULÁRIO */}
        <form aria-busy={ocupado}
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
                  defaultValue={dados?.nome || ""}
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
                  defaultValue={dados?.telefone || ""}
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
                  readOnly defaultValue={dados?.email || ""}
                  placeholder="seuemail@email.com"
                />

                <small>
                  O e-mail está vinculado à sua conta.
                </small>
              </div>

            </div>
          </div>

          {/* SENHA */}
          {dados?.senhaDisponivel ? <div className="personal-data-section">

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

                <CampoSenha id="senha-atual"

                  placeholder="Digite sua senha atual"
                />
              </div>

              <div className="form-group">
                <label htmlFor="nova-senha">
                  Nova senha
                </label>

                <CampoSenha id="nova-senha"

                  placeholder="Nova senha"
                 autoComplete="new-password" minLength={6}/>
              </div>

              <div className="form-group">
                <label htmlFor="confirmar-nova-senha">
                  Confirmar nova senha
                </label>

                <CampoSenha id="confirmar-nova-senha"

                  placeholder="Digite novamente"
                 autoComplete="new-password" minLength={6}/>
              </div>

            </div>
          </div>

          : <p>A senha de uma conta Google é gerenciada diretamente no Google.</p>}

          {/* AÇÕES */}
          <div className="personal-data-actions">

            <a
              href="/perfil" onClick={()=>notificarAoNavegar("Edição cancelada.")}
              className="button button-secondary"
            >
              Cancelar
            </a>

            <button
              disabled={ocupado} type="submit"
              className="button button-primary"
            >
              Salvar alterações
            </button>

          </div>

        </form>

      </div>
    </main></PageBoundary>
  );
}

export default DadosPessoais;
