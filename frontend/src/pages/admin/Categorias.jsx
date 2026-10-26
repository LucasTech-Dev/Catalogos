import './Categorias.css';
import MaterialIcon from "../../components/ui/MaterialIcon";
import {notificar} from '../../lib/notificacoes';
import {FeedbackAcao} from '../../components/ui/ToastProvider';
import {B03_BLOQUEADO} from '../../services/adminCatalogo';
import {PageBoundary} from '../../components/ui/PageLoader';
import React, { useState } from "react";

import {admin} from "../../services/admin";
import {useAdminLista} from "../../hooks/useAdmin";
import {AdminState,AdminPaginacao} from "../../components/admin/AdminState";
function Categorias() {
  const recurso=useAdminLista('categorias');
  const categorias=recurso.itens.map(c=>({...c,ativa:c.ativo!==false}));
  const [erro,setErro]=useState(''),[ocupado,setOcupado]=useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState(null);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");

  function abrirNovaCategoria() {
    setCategoriaEditando(null);
    setNome("");
    setDescricao("");
    setModalAberto(true);
  }

  function abrirEdicao(categoria) {
    setCategoriaEditando(categoria);
    setNome(categoria.nome);
    setDescricao(categoria.descricao || '');
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setCategoriaEditando(null);
    setNome("");
    setDescricao("");
  }

  async function salvarCategoria(event) {
    event.preventDefault();if(ocupado)return;setOcupado(true);setErro('');
    try{await admin.salvar('categorias',categoriaEditando?.id || null,{nome:nome.trim(),descricao:descricao.trim()});notificar('sucesso',categoriaEditando?'Categoria atualizada no banco.':'Categoria criada no banco.');await recurso.atualizar();fecharModal();}catch(e){setErro(e.message || 'Não foi possível salvar a categoria.');}finally{setOcupado(false);}
  }
  async function ativarCategoria(categoria) {
    if(ocupado || categoria.ativa)return;
    setOcupado(true);setErro('');
    try {
      await admin.salvar('categorias',categoria.id,{ativo:true});
      notificar('sucesso','Categoria ativada no banco.');
      await recurso.atualizar();
    } catch(e){setErro(e.message || 'Não foi possível ativar a categoria.');}
    finally{setOcupado(false);}
  }
  return (<PageBoundary recursos={[recurso]}>
    <main className="admin-categories-page">
      <div className="admin-container">
        <section className="admin-page-header">
          <div>
            <span className="eyebrow">CATÁLOGO</span>
            <h1>Categorias</h1>
            <p>Organize os produtos do seu catálogo.</p>
          </div>

          <button
            type="button"
            className="admin-primary-button"
            disabled={ocupado} onClick={abrirNovaCategoria}
          >
            <MaterialIcon name="add"/> Nova categoria
          </button>
        </section>

        <AdminState recurso={recurso}/>{erro && <FeedbackAcao mensagem={erro}/>}
        <p className="admin-category-limitation" role="status">Criar, editar e ativar categorias estão disponíveis. Desativar e excluir permanecem indisponíveis enquanto a regra de segurança B-03 não permitir comprovar a ausência de produtos vinculados. Nenhuma categoria será apagada por engano.</p>
        <AdminPaginacao recurso={recurso}/><section className="admin-categories-panel">
          {categorias.length > 0 ? (
            <div className="admin-categories-list">
              {categorias.map((categoria) => (
                <article
                  className="admin-category-row"
                  key={categoria.id}
                  aria-busy={ocupado}
                >
                  <div className="admin-category-icon">
                    <MaterialIcon name="menu"/>
                  </div>

                  <div className="admin-category-info">
                    <h2>{categoria.nome}</h2>
                    <p>{categoria.descricao}</p>
                  </div>

                  <div className="admin-category-products">
                    <strong>{categoria.produtos}</strong>
                    <span>
                      {categoria.produtos === 1
                        ? "produto"
                        : "produtos"}
                    </span>
                  </div>

                  <div className="admin-category-status">
                    <span
                      className={
                        categoria.ativa
                          ? "admin-status active"
                          : "admin-status inactive"
                      }
                    >
                      {categoria.ativa ? "Ativa" : "Inativa"}
                    </span>
                  </div>

                  <div className="admin-category-actions">
                    <button
                      type="button"
                      disabled={ocupado} onClick={() => abrirEdicao(categoria)}
                    >
                      Editar
                    </button>

                    {categoria.ativa
                      ? <button type="button" disabled title={B03_BLOQUEADO}>Desativar</button>
                      : <button type="button" disabled={ocupado} onClick={() => ativarCategoria(categoria)}>{ocupado?'Salvando...':'Ativar'}</button>}
                    <button type="button" className="admin-category-action-danger" disabled title={B03_BLOQUEADO}>Excluir</button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="admin-empty-state">
              <div className="admin-empty-icon"><MaterialIcon name="menu"/></div>

              <h2>Nenhuma categoria cadastrada</h2>

              <p>
                Crie sua primeira categoria para começar a
                organizar os produtos.
              </p>

              <button
                type="button"
                className="admin-primary-button"
                onClick={abrirNovaCategoria}
              >
                Criar primeira categoria
              </button>
            </div>
          )}
        </section>
      </div>

      {modalAberto && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <div>
                <span className="eyebrow">CATEGORIA</span>

                <h2>
                  {categoriaEditando
                    ? "Editar categoria"
                    : "Nova categoria"}
                </h2>
              </div>

              <button
                type="button"
                className="admin-modal-close"
                disabled={ocupado} onClick={()=>{fecharModal();notificar("info","Edição cancelada.");}}
              >
                <MaterialIcon name="close"/>
              </button>
            </div>

            <form aria-busy={ocupado} onSubmit={salvarCategoria}>{erro && <FeedbackAcao mensagem={erro}/>}
              <div className="admin-form-group">
                <label htmlFor="categoria-nome">
                  Nome da categoria
                </label>

                <input
                  id="categoria-nome"
                  required
                  maxLength={200}
                  type="text"
                  value={nome}
                  onChange={(event) => setNome(event.target.value)}
                  placeholder="Ex.: Hambúrgueres"
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="categoria-descricao">
                  Descrição
                </label>

                <textarea
                  id="categoria-descricao"
                  maxLength={2000}
                  value={descricao}
                  onChange={(event) =>
                    setDescricao(event.target.value)
                  }
                  placeholder="Descreva brevemente a categoria"
                  rows="4"
                />
              </div>

              <div className="admin-product-form-actions">
                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={()=>{fecharModal();notificar("info","Edição cancelada.");}}
                >
                  Cancelar
                </button>

                <button
                  disabled={ocupado} type="submit"
                  className="admin-primary-button"
                >
                  {ocupado ? "Salvando..." : categoriaEditando ? "Salvar alterações" : "Criar categoria"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main></PageBoundary>
  );
}

export default Categorias;