import MaterialIcon from "../../components/ui/MaterialIcon";
import {notificarAoNavegar} from '../../lib/notificacoes';
import {FeedbackAcao} from '../../components/ui/ToastProvider';
import {PageBoundary} from '../../components/ui/PageLoader';
import React, { useState, useLayoutEffect, useCallback, useRef } from "react";

import {admin} from "../../services/admin";
import {useAdminRecurso,useAdminLista} from "../../hooks/useAdmin";
import {AdminState} from "../../components/admin/AdminState";
function ProdutoForm() {
  const params = new URLSearchParams(window.location.search);
  const produtoId = params.get("id");
  const [idSalvo,setIdSalvo]=useState(produtoId || '');const editando=Boolean(idSalvo);
  const [produto,setProduto]=useState({nome:'',descricao:'',categoriaId:'',preco:'',ativo:true,disponivel:true,imagem:''});
  const [erro,setErro]=useState(''),[salvo,setSalvo]=useState(false),[ocupado,setOcupado]=useState(false);const trava=useRef(false);
  const carregar=useCallback(()=>produtoId?admin.buscar('produtos',produtoId):Promise.resolve(null),[produtoId]);
  const recurso=useAdminRecurso(carregar),categoriasRecurso=useAdminLista('categorias',{limite:100,contagem:'0'});const categorias=categoriasRecurso.itens;
  useLayoutEffect(()=>{if(recurso.dados)setProduto({...recurso.dados,preco:String(recurso.dados.preco),disponivel:recurso.dados.disponivel!==false});},[recurso.dados]);
  const atualizarCampo=(campo,valor)=>{setProduto(a=>({...a,[campo]:valor}));setSalvo(false);};
  async function salvarProduto(event){
    event.preventDefault();if(trava.current)return;trava.current=true;setOcupado(true);setErro('');setSalvo(false);
    try {if(produto.preco==='')throw new Error('Informe o preço.');const dados={nome:produto.nome,descricao:produto.descricao,categoriaId:produto.categoriaId,preco:Number(produto.preco),ativo:produto.ativo,disponivel:produto.disponivel,imagem:produto.imagem};const resultado=await admin.salvar('produtos',idSalvo || null,dados);setIdSalvo(resultado.id);setProduto({...resultado,preco:String(resultado.preco),disponivel:resultado.disponivel!==false});setSalvo(true);}catch(e){setErro(e.message);}finally{trava.current=false;setOcupado(false);}
  }
  return (<PageBoundary recursos={[recurso,categoriasRecurso]}>
    <main className="admin-product-form-page">
      <div className="admin-container">

        {/* VOLTAR */}

        <div className="admin-details-back">
          <a href="/admin/produtos">
            <MaterialIcon name="arrow_back"/> Voltar para produtos
          </a>
        </div>

        {/* CABEÇALHO */}

        <section className="admin-page-header">

          <div>
            <span className="eyebrow">
              CATÁLOGO
            </span>

            <h1>
              {editando
                ? "Editar produto"
                : "Novo produto"}
            </h1>

            <p>
              {editando
                ? "Atualize as informações deste produto."
                : "Cadastre um novo produto no catálogo."}
            </p>
          </div>

        </section>

        <AdminState recurso={recurso}/><AdminState recurso={categoriasRecurso}/>{erro && <FeedbackAcao mensagem={erro}/>}{salvo && <><FeedbackAcao mensagem="Produto salvo." tipo="sucesso"/><a href="/admin/produtos">Ver produtos</a></>}
        <form aria-busy={ocupado}
          className="admin-product-form"
          onSubmit={salvarProduto}
        >

          {/* INFORMAÇÕES BÁSICAS */}

          <section className="admin-panel">

            <div className="admin-panel-header">
              <div>
                <span className="eyebrow">
                  PRODUTO
                </span>

                <h2>Informações básicas</h2>
              </div>
            </div>

            <div className="admin-form-content">

              <div className="admin-form-group">

                <label htmlFor="nome">
                  Nome do produto
                </label>

                <input
                  id="nome"
                  type="text"
                  value={produto.nome}
                  onChange={(event) =>
                    atualizarCampo(
                      "nome",
                      event.target.value
                    )
                  }
                  placeholder="Ex.: Classic Burger"
                  required
                />

              </div>

              <div className="admin-form-group">

                <label htmlFor="descricao">
                  Descrição
                </label>

                <textarea
                  id="descricao"
                  rows="4"
                  value={produto.descricao}
                  onChange={(event) =>
                    atualizarCampo(
                      "descricao",
                      event.target.value
                    )
                  }
                  placeholder="Descreva o produto..."
                />

              </div>

              <div className="admin-form-row">

                <div className="admin-form-group">

                  <label htmlFor="categoria">
                    Categoria
                  </label>

                  <select
                    id="categoria"
                    value={produto.categoriaId}
                    onChange={(event) =>
                      atualizarCampo(
                        "categoriaId",
                        event.target.value
                      )
                    }
                    required
                  >
                    <option value="">
                      Selecione uma categoria
                    </option>

                    {produto.categoriaId && !categorias.some(c=>c.id===produto.categoriaId) && <option value={produto.categoriaId}>Categoria atual</option>}
                    {categorias.map((item) => (
                      <option
                        key={item.id}
                        value={item.id} disabled={item.ativo === false && produto.categoriaId !== item.id}
                      >
                        {item.nome}
                      </option>
                    ))}
                  </select>{categoriasRecurso.temProximo && <button type="button" onClick={categoriasRecurso.proximo}>Mais categorias</button>}{categoriasRecurso.temAnterior && <button type="button" onClick={categoriasRecurso.anterior}>Categorias anteriores</button>}

                </div>

                <div className="admin-form-group">

                  <label htmlFor="preco">
                    Preço
                  </label>

                  <div className="admin-price-input">

                    <span>R$</span>

                    <input
                      id="preco"
                      type="number"
                      step="0.01"
                      min="0"
                      value={produto.preco}
                      onChange={(event) =>
                        atualizarCampo(
                          "preco",
                          event.target.value
                        )
                      }
                      placeholder="0,00"
                      required
                    />

                  </div>

                </div>

              </div>

            </div>

          </section>

          {/* IMAGEM */}

          <section className="admin-panel">

            <div className="admin-panel-header">
              <div>
                <span className="eyebrow">
                  VISUAL
                </span>

                <h2>Imagem do produto</h2>
              </div>
            </div>

            <div className="admin-form-content">

              <div className="admin-image-upload">

                <div className="admin-image-preview">
                  {produto.imagem ? (
                    <img
                      src={produto.imagem}
                      alt={produto.nome}
                    />
                  ) : (
                    <span><MaterialIcon name="lunch_dining"/></span>
                  )}
                </div>

                <div className="admin-image-upload-info">

                  <h3>
                    Foto do produto
                  </h3>

                  <p>
                    Adicione uma imagem para
                    apresentar melhor o produto
                    no catálogo.
                  </p>

                  <label htmlFor="imagem-url">URL da imagem</label><input id="imagem-url" type="url" value={produto.imagem} onChange={e=>atualizarCampo('imagem',e.target.value)} placeholder="https://..."/>
                </div>

              </div>

            </div>

          </section>

          {/* DISPONIBILIDADE */}

          <section className="admin-panel">

            <div className="admin-panel-header">
              <div>
                <span className="eyebrow">
                  DISPONIBILIDADE
                </span>

                <h2>Status do produto</h2>
              </div>
            </div>

            <div className="admin-availability">

              <label className="admin-switch-row">

                <input
                  type="checkbox"
                  checked={produto.ativo}
                  onChange={(event) =>
                    atualizarCampo(
                      "ativo",
                      event.target.checked
                    )
                  }
                />

                <span className="admin-switch"></span>

                <span>
                  <strong>
                    Produto ativo
                  </strong>

                  <small>
                    O produto ficará disponível
                    no catálogo da loja.
                  </small>
                </span>

              </label>

            <label className="admin-switch-row"><input type="checkbox" checked={produto.disponivel} onChange={e=>atualizarCampo("disponivel",e.target.checked)}/><span className="admin-switch"/><span>Disponível para pedidos</span></label></div>

          </section>

          {/* AÇÕES */}

          <div className="admin-product-form-actions">

            <a
              href="/admin/produtos" onClick={()=>notificarAoNavegar("Edição cancelada.")}
              className="admin-secondary-button"
            >
              Cancelar
            </a>

            <button
              disabled={ocupado || recurso.carregando || Boolean(recurso.erro)} type="submit"
              className="admin-primary-button"
            >
              {editando
                ? "Salvar alterações"
                : "Criar produto"}
            </button>

          </div>

        </form>

      </div>
    </main></PageBoundary>
  );
}

export default ProdutoForm;