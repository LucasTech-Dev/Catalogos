import './Categorias.css';
import {useAdminAcao} from '../../hooks/useAdminAcao';
import {useAdminModal} from '../../hooks/useAdminModal';
import {chaveCriacaoAdmin,limparCriacaoAdmin} from '../../lib/criacaoAdmin';
import MaterialIcon from "../../components/ui/MaterialIcon";
import {notificar} from '../../lib/notificacoes';
import {FeedbackAcao,confirmarAcao} from '../../components/ui/ToastProvider';
import {B03_BLOQUEADO} from '../../services/adminCatalogo';
import {PageBoundary} from '../../components/ui/PageLoader';
import React, { useState } from "react";

import {admin} from "../../services/admin";
import {useAdminLista} from "../../hooks/useAdmin";
import {AdminState,AdminPaginacao} from "../../components/admin/AdminState";
function Categorias() {
  const recurso=useAdminLista('categorias'),acao=useAdminAcao();
  const desativacaoHabilitada=import.meta.env.VITE_CATEGORIAS_DESATIVACAO==='true';
  const categorias=recurso.itens.map(c=>({...c,ativa:c.ativo!==false}));
  const [erro,setErro]=useState(''),[ocupado,setOcupado]=useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState(null);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");

  function abrirNovaCategoria() {
    if(acao.bloqueada())return;
    setCategoriaEditando(null);
    setNome("");
    setDescricao("");
    setModalAberto(true);
  }

  function abrirEdicao(categoria) {
    if(acao.bloqueada())return;
    setCategoriaEditando(categoria);
    setNome(categoria.nome);
    setDescricao(categoria.descricao || '');
    setModalAberto(true);
  }

  const modalRef=useAdminModal(modalAberto,ocupado,fecharModal);
  function fecharModal() {
    if(acao.bloqueada())return false;limparCriacaoAdmin('categoriaNova');setErro('');
    setModalAberto(false);
    setCategoriaEditando(null);
    setNome("");
    setDescricao("");return true;
  }

  async function salvarCategoria(event) {
    event.preventDefault();if(!acao.iniciar())return;setOcupado(true);setErro('');
    try{
      await admin.salvar('categorias',categoriaEditando?.id || null,{nome:nome.trim(),descricao:descricao.trim()},...(!categoriaEditando?[chaveCriacaoAdmin('categoriaNova')]:[]));
      if(!acao.ativa())return;
      notificar('sucesso',categoriaEditando?'Categoria atualizada no banco.':'Categoria criada no banco.');
      limparCriacaoAdmin('categoriaNova');await recurso.atualizar();
      if(acao.ativa()){setModalAberto(false);setCategoriaEditando(null);setNome('');setDescricao('');}
    }catch(e){if(acao.ativa())setErro(e.message || 'Não foi possível salvar a categoria.');}
    finally{acao.finalizar();if(acao.ativa())setOcupado(false);}
  }
  async function mudarAtivacao(categoria,ativar){
    if(!ativar&&!desativacaoHabilitada)return;
    if(categoria.ativa===ativar||!acao.iniciar())return;setOcupado(true);setErro('');
    try{
      if(!ativar&&!await confirmarAcao('Desativar esta categoria? Seus produtos ficarão ocultos no catálogo público, com registros preservados para reativação.','Desativar categoria'))return;
      if(!acao.ativa())return;
      await admin.salvar('categorias',categoria.id,{ativo:ativar});
      if(!acao.ativa())return;
      notificar('sucesso',ativar?'Categoria ativada no banco.':'Categoria desativada no banco. Dados preservados.');await recurso.atualizar();
    }catch(e){if(acao.ativa())setErro(e.message || 'Não foi possível atualizar a categoria.');}
    finally{acao.finalizar();if(acao.ativa())setOcupado(false);}
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

        <AdminState recurso={recurso}/>{erro && !modalAberto && <FeedbackAcao mensagem={erro}/>}
        <p className="admin-category-limitation" role="status">{desativacaoHabilitada?'Desativar oculta temporariamente a categoria e seus produtos, sem apagá-los.':'Desativar categorias aguarda atualização das permissões do Firebase. Editar e ativar continuam disponíveis.'} A exclusão definitiva permanece bloqueada para preservar produtos e pedidos.</p>
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
                      ? <button type="button" disabled={ocupado||!desativacaoHabilitada} title={!desativacaoHabilitada?"Desativação aguarda atualização das permissões da loja.":undefined} aria-busy={ocupado} onClick={()=>mudarAtivacao(categoria,false)}>{ocupado?"Salvando...":"Desativar"}</button>
                      : <button type="button" disabled={ocupado} aria-busy={ocupado} onClick={() => mudarAtivacao(categoria,true)}>{ocupado?'Salvando...':'Ativar'}</button>}
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
          <div ref={modalRef} className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="categoria-modal-titulo">
            <div className="admin-modal-header">
              <div>
                <span className="eyebrow">CATEGORIA</span>

                <h2 id="categoria-modal-titulo">
                  {categoriaEditando
                    ? "Editar categoria"
                    : "Nova categoria"}
                </h2>
              </div>

              <button
                type="button"
                className="admin-modal-close" aria-label="Fechar edição da categoria"
                disabled={ocupado} onClick={()=>{if(fecharModal())notificar("info","Edição cancelada.");}}
              >
                <MaterialIcon name="close"/>
              </button>
            </div>

            <form aria-busy={ocupado} onSubmit={salvarCategoria}><fieldset className="admin-form-fields" disabled={ocupado}>{erro && <FeedbackAcao mensagem={erro}/>}
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
                  type="button" disabled={ocupado}
                  className="admin-secondary-button"
                  onClick={()=>{if(fecharModal())notificar("info","Edição cancelada.");}}
                >
                  Cancelar
                </button>

                <button
                  disabled={ocupado} aria-busy={ocupado} type="submit"
                  className="admin-primary-button"
                >
                  {ocupado ? "Salvando..." : categoriaEditando ? "Salvar alterações" : "Criar categoria"}
                </button>
              </div>
            </fieldset></form>
          </div>
        </div>
      )}
    </main></PageBoundary>
  );
}

export default Categorias;