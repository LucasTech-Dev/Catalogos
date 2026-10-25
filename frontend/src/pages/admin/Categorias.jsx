import MaterialIcon from "../../components/ui/MaterialIcon";
import {notificar} from '../../lib/notificacoes';
import {FeedbackAcao,confirmarAcao} from '../../components/ui/ToastProvider';
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
    setDescricao(categoria.descricao);
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
    try{await admin.salvar('categorias',categoriaEditando?.id,{nome:nome.trim(),descricao:descricao.trim()});notificar("sucesso",categoriaEditando?"Categoria atualizada.":"Categoria criada.");await recurso.atualizar();fecharModal();}catch(e){setErro(e.message);}finally{setOcupado(false);}
  }
  async function alternarStatus(id) {
    if(ocupado)return;setOcupado(true);setErro('');
    try{const categoria=categorias.find(c=>c.id===id);await admin.salvar('categorias',id,{ativo:!categoria.ativa});notificar('sucesso',categoria.ativa?'Categoria desativada.':'Categoria ativada.');await recurso.atualizar();}catch(e){setErro(e.message);}finally{setOcupado(false);}
  }
  async function excluir(id){if(ocupado || !await confirmarAcao('Excluir esta categoria? A exclusão só será permitida se não houver produtos vinculados.','Excluir categoria'))return;setOcupado(true);setErro('');try{await admin.excluir('categorias',id);notificar('sucesso','Categoria excluída.');await recurso.atualizar();}catch(e){setErro(e.message);}finally{setOcupado(false);}}
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
            onClick={abrirNovaCategoria}
          >
            <MaterialIcon name="add"/> Nova categoria
          </button>
        </section>

        <AdminState recurso={recurso}/>{erro && <FeedbackAcao mensagem={erro}/>}<AdminPaginacao recurso={recurso}/><section className="admin-categories-panel">
          {categorias.length > 0 ? (
            <div className="admin-categories-list">
              {categorias.map((categoria) => (
                <article
                  className="admin-category-row"
                  key={categoria.id}
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
                      onClick={() => abrirEdicao(categoria)}
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      disabled={ocupado} onClick={() => alternarStatus(categoria.id)}
                    >
                      {categoria.ativa ? "Desativar" : "Ativar"}
                    </button><button disabled={ocupado} onClick={()=>excluir(categoria.id)}>Excluir</button>
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
                onClick={()=>{fecharModal();notificar("info","Edição cancelada.");}}
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
                  {categoriaEditando
                    ? "Salvar alterações"
                    : "Criar categoria"}
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