import './Produtos.css';
import {useAdminAcao} from '../../hooks/useAdminAcao';
import MaterialIcon from "../../components/ui/MaterialIcon";
import ImagemCatalogo from "../../components/ui/ImagemCatalogo";
import {notificar} from '../../lib/notificacoes';
import {FeedbackAcao,confirmarAcao} from '../../components/ui/ToastProvider';
import {PageBoundary} from '../../components/ui/PageLoader';
import React, { useMemo, useState } from "react";

import {admin} from "../../services/admin";
import {useAdminLista} from "../../hooks/useAdmin";
import {AdminState,AdminPaginacao} from "../../components/admin/AdminState";
import {moeda} from "../../lib/compras";
function Produtos() {
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("Todas");
  const [categoriaNome,setCategoriaNome]=useState("");

  const recurso=useAdminLista('produtos',categoria==='Todas'?{}:{categoriaId:categoria});
  const categoriasRecurso=useAdminLista('categorias',{limite:100,contagem:'0'});
  const [erro,setErro]=useState(''),acao=useAdminAcao();
  const produtos=recurso.itens.map(p=>({...p,categoria:categoriasRecurso.itens.find(c=>c.id===p.categoriaId)?.nome || (p.categoriaId ? 'Categoria cadastrada' : 'Sem categoria'),preco:moeda(p.preco)}));
  const categorias=[{id:'Todas',nome:'Todas'},...categoriasRecurso.itens,...(categoria!=='Todas' && !categoriasRecurso.itens.some(c=>c.id===categoria)?[{id:categoria,nome:categoriaNome || 'Categoria selecionada'}]:[])];
  async function alternar(produto){
    if(!acao.iniciar(produto.id))return;setErro('');
    const ativar=produto.ativo===false || produto.disponivel===false;
    try {
      await admin.salvar('produtos',produto.id,ativar?{ativo:true,disponivel:true}:{ativo:false});
      if(!acao.ativa())return;notificar('sucesso',ativar?'Produto ativado no catálogo.':'Produto desativado no catálogo.');
      await recurso.atualizar();
    } catch(e){if(acao.ativa())setErro(e.message || 'Não foi possível atualizar o produto.');}
    finally {acao.finalizar(produto.id);}
  }
  async function remover(produto){
    if(!acao.iniciar(produto.id))return;setErro('');
    try {
      if(!await confirmarAcao('Remover este produto do catálogo público? O registro e os pedidos anteriores serão preservados.','Remover do catálogo'))return;
      if(!acao.ativa())return;
      // Exclusão lógica intencional: preserva produtos referenciados por pedidos históricos.
      await admin.excluir('produtos',produto.id);
      if(!acao.ativa())return;notificar('sucesso','Produto removido do catálogo. Histórico preservado.');
      await recurso.atualizar();
    } catch(e){if(acao.ativa())setErro(e.message || 'Não foi possível remover o produto.');}
    finally {acao.finalizar(produto.id);}
  }
  const produtosFiltrados = useMemo(() => {
    return produtos.filter((produto) => {
      const correspondeBusca =
        produto.nome
          .toLowerCase()
          .includes(busca.toLowerCase()) ||
        (produto.descricao || '')
          .toLowerCase()
          .includes(busca.toLowerCase());

      const correspondeCategoria =
        categoria === "Todas" ||
        produto.categoriaId === categoria;

      return correspondeBusca && correspondeCategoria;
    });
  }, [busca, categoria, recurso.dados, categoriasRecurso.dados]);

  return (<PageBoundary recursos={[recurso,categoriasRecurso]}>
    <main className="admin-products-page">
      <div className="admin-container">

        {/* CABEÇALHO */}
        <section className="admin-page-header">

          <div>
            <span className="eyebrow">
              CATÁLOGO
            </span>

            <h1>Produtos</h1>

            <p>
              Gerencie os produtos disponíveis na sua loja.
            </p>
          </div>

          <a
            href="/admin/produto/novo"
            className="admin-primary-button"
          >
            <MaterialIcon name="add"/> Novo produto
          </a>

        </section>

        {/* CONTROLES */}
        <section className="admin-products-controls">

          <div className="admin-products-search">

            <span>⌕</span>

            <input
              type="text"
              placeholder="Buscar produto nesta página..."
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
            />

          </div>

          <div className="admin-products-category">

            <select
              value={categoria}
              onChange={(event) => {setCategoria(event.target.value);setCategoriaNome(event.target.selectedOptions[0]?.textContent || "");}}
            >
              {categorias.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nome}
                </option>
              ))}
            </select>

          </div>

        </section>

        <AdminState recurso={recurso}/><AdminState recurso={categoriasRecurso}/>{erro && <FeedbackAcao mensagem={erro}/>}<AdminPaginacao recurso={recurso}/>{categoriasRecurso.temAnterior&&<button type="button" disabled={categoriasRecurso.carregando} className="admin-more-categories" onClick={categoriasRecurso.anterior}>Categorias anteriores</button>}{categoriasRecurso.temProximo && <button type="button" disabled={categoriasRecurso.carregando} className="admin-more-categories" onClick={categoriasRecurso.proximo}>Mais categorias</button>}
        {/* RESULTADOS */}

        <section className="admin-panel">

          <div className="admin-products-header">

            <div>
              <span className="eyebrow">
                CATÁLOGO
              </span>

              <h2>
                {produtosFiltrados.length} produtos
              </h2>
            </div>

          </div>

          <div className="admin-products-list">

            {produtosFiltrados.map((produto) => (

              <article
                className="admin-product-row"
                key={produto.id}
                aria-busy={acao.ocupada(produto.id)}
              >

                {/* IMAGEM DO PRODUTO */}

                <div className="admin-product-image">
                  <ImagemCatalogo src={produto.imagem} alt={produto.nome} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                </div>

                {/* INFORMAÇÕES */}

                <div className="admin-product-info">

                  <div className="admin-product-title">

                    <h3>
                      {produto.nome}
                    </h3>

                    {produto.ativo && produto.disponivel !== false ? (
                      <span className="admin-product-status active">
                        Disponível
                      </span>
                    ) : (
                      <span className="admin-product-status inactive">
                        Indisponível
                      </span>
                    )}

                  </div>

                  <p>
                    {produto.descricao}
                  </p>

                  <span className="admin-product-category">
                    {produto.categoria}
                  </span>

                </div>

                {/* PREÇO */}

                <div className="admin-product-price">
                  {produto.preco}
                </div>

                {/* AÇÕES */}

                <div className="admin-product-actions">

                  <a
                    href={`/admin/produto?id=${produto.id}`}
                    className="admin-product-edit"
                  >
                    Editar
                  </a>
                  <button type="button" className="admin-product-remove" aria-busy={acao.ocupada(produto.id)} disabled={acao.ocupada(produto.id)||!produto.ativo} onClick={()=>remover(produto)}>{acao.ocupada(produto.id)?'Aguarde...':produto.ativo?'Remover do catálogo':'Removido'}</button>

                  <button
                    type="button"
                    className="admin-product-toggle" aria-busy={acao.ocupada(produto.id)} disabled={acao.ocupada(produto.id)} onClick={()=>alternar(produto)}
                  >
                    {acao.ocupada(produto.id) ? "Salvando..." : produto.ativo!==false && produto.disponivel!==false ? "Desativar" : "Ativar"}
                  </button>

                </div>

              </article>

            ))}

          </div>

          {/* ESTADO VAZIO */}

          {produtosFiltrados.length === 0 && (

            <div className="admin-products-empty">

              <span><MaterialIcon name="search"/></span>

              <h2>
                Nenhum produto encontrado
              </h2>

              <p>
                Tente alterar sua busca ou categoria.
              </p>

            </div>

          )}

        </section>

      </div>
    </main></PageBoundary>
  );
}

export default Produtos;
