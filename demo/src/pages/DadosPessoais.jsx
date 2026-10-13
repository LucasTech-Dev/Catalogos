import React, {useState} from "react";
import {useRecurso} from "../hooks/useRecurso";
import {api,publico} from "../services/api";
import {trocarSenha} from "../services/conta";

function DadosPessoais() {
  const {dados,erro:erroCarga,carregando,atualizar} = useRecurso(publico + '/me');
  const [erro,setErro] = useState(''),[ocupado,setOcupado] = useState(false);
  async function handleSubmit(event) {
    event.preventDefault();if (ocupado) return;setOcupado(true);setErro('');const valor = id => event.target.querySelector('#'+id).value;
    try {
      if (valor('nova-senha')) {if (valor('nova-senha') !== valor('confirmar-nova-senha')) throw new Error('As senhas devem ser iguais.');await trocarSenha(valor('senha-atual'),valor('nova-senha'));}
      await api(publico+'/me',{method:'PUT',body:{nome:valor('nome'),telefone:valor('telefone')}});setErro('Dados salvos.');atualizar();
    } catch(e) {setErro(e.message);} finally {setOcupado(false);}
  }
  if (carregando) return <main className="account-data-page"><p>Carregando...</p></main>;
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

        {(erro || erroCarga) && <p role="status">{erro || erroCarga}</p>}
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
              disabled={ocupado} type="submit"
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