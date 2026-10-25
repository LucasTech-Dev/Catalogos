import {FeedbackAcao} from '../../components/ui/ToastProvider';
import {PageBoundary} from '../../components/ui/PageLoader';
import React, { useState, useLayoutEffect } from "react";

import {admin} from "../../services/admin";
import {useAdminRecurso} from "../../hooks/useAdmin";
import {AdminState} from "../../components/admin/AdminState";
import {useAdminSessao} from "../../components/admin/AdminGate";
import {horariosTexto} from "../../lib/compras";
const dias=["segunda","terca","quarta","quinta","sexta","sabado","domingo"];
function Configuracoes() {
  const sessao=useAdminSessao();
  const [salvo, setSalvo] = useState(false);

  const recurso=useAdminRecurso(admin.loja),[erro,setErro]=useState(''),[ocupado,setOcupado]=useState(false);
  const vazio={nome:'',descricao:'',telefone:'',whatsapp:'',instagram:'',endereco:'',bairro:'',cidade:'',numero:'',uf:'',logo:'',imagem:'',corPrimaria:'#f97316',tempoMedio:'',horarios:{},retirada:true,entrega:false,taxaEntrega:'0',pedidoMinimo:'0',pix:false,dinheiro:false,cartao_credito:false,cartao_debito:false};
  const [config,setConfig]=useState(vazio);
  function adaptar(dados) {const endereco=typeof dados.endereco==='string'?{rua:dados.endereco}:dados.endereco || {};return {...vazio,...dados,endereco:endereco.rua || endereco.logradouro || '',numero:endereco.numero || '',uf:endereco.uf || '',bairro:endereco.bairro || '',cidade:endereco.cidade || '',horarios:typeof dados.horarios==='object' && dados.horarios ? Object.fromEntries(Object.entries(dados.horarios).map(([dia,h])=>[dia==='terça'?'terca':dia==='sábado'?'sabado':dia,h])) : {},retirada:dados.retirada?.habilitada!==false,entrega:dados.entrega?.habilitada===true,taxaEntrega:String(dados.entrega?.taxa ?? 0),pedidoMinimo:String(dados.pedidoMinimo ?? 0),pix:dados.pagamentos?.pix===true,dinheiro:dados.pagamentos?.dinheiro===true,cartao_credito:dados.pagamentos?.cartao_credito===true || dados.pagamentos?.cartao===true,cartao_debito:dados.pagamentos?.cartao_debito===true || dados.pagamentos?.cartao===true};}
  useLayoutEffect(()=>{if(recurso.dados)setConfig(adaptar(recurso.dados));},[recurso.dados]);
  const horario=(dia,campo,valor)=>{setConfig(a=>({...a,horarios:{...a.horarios,[dia]:{...(typeof a.horarios[dia]==='object'?a.horarios[dia]:{fechado:true}),[campo]:valor}}}));setSalvo(false);};
  function alterarCampo(campo, valor) {
    setConfig((atual) => ({
      ...atual,
      [campo]: valor,
    }));

    setSalvo(false);
  }

  async function salvarConfiguracoes(event) {
    event.preventDefault();if(ocupado)return;setOcupado(true);setErro('');setSalvo(false);
    try {
      const numero=v=>{if(String(v).trim()==='')throw new Error('Informe os valores monetários.');return Number(String(v).replace(',','.'));};
      const dados={nome:config.nome,descricao:config.descricao,telefone:config.telefone,whatsapp:config.whatsapp,instagram:config.instagram,endereco:{...Object.fromEntries(Object.entries(typeof recurso.dados?.endereco === "object" ? recurso.dados.endereco : {}).filter(([k])=>["cep","complemento"].includes(k))),rua:config.endereco,numero:config.numero,bairro:config.bairro,cidade:config.cidade,uf:config.uf},logo:config.logo || '',imagem:config.imagem || '',corPrimaria:config.corPrimaria,tempoMedio:config.tempoMedio || '',entrega:{habilitada:config.entrega,taxa:numero(config.taxaEntrega)},retirada:{habilitada:config.retirada},pedidoMinimo:numero(config.pedidoMinimo),pagamentos:Object.fromEntries(['pix','dinheiro','cartao_credito','cartao_debito'].map(f=>[f,config[f]]))};
      if(Object.keys(config.horarios).length && Object.values(config.horarios).every(h=>h && typeof h==='object'))dados.horarios=config.horarios;
      const salvo=await admin.configurar(dados);recurso.setDados(salvo);sessao?.atualizarLoja(salvo);setConfig(adaptar(salvo));setSalvo(salvo.salvamento?.atomico===false?'Horários e configurações salvos em etapas.':'Alterações salvas');
    }catch(e){setErro(e.message);}finally{setOcupado(false);}
  }
  return (<PageBoundary recursos={[recurso]}>
    <main className="admin-settings-page">
      <div className="admin-container">
        <section className="admin-page-header">
          <div>
            <span className="eyebrow">LOJA</span>
            <h1>Configurações</h1>
            <p>
              Configure as informações e o funcionamento da
              sua loja.
            </p>
          </div>
        </section>

        <AdminState recurso={recurso}/>{erro && <FeedbackAcao mensagem={erro} persistente={erro.startsWith("Salvamento em etapas")}/>}<form aria-busy={ocupado} onSubmit={salvarConfiguracoes}>
          {/* IDENTIDADE */}
          <section className="admin-settings-section">
            <div className="admin-settings-section-header">
              <div>
                <span className="eyebrow">IDENTIDADE</span>
                <h2>Informações da loja</h2>
                <p>
                  Dados exibidos para os clientes no catálogo.
                </p>
              </div>
            </div>

            <div className="admin-settings-grid">
              <div className="admin-form-group">
                <label htmlFor="nome">Nome da loja</label>

                <input
                  id="nome"
                  type="text"
                  value={config.nome}
                  onChange={(event) =>
                    alterarCampo("nome", event.target.value)
                  }
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="instagram">Instagram</label>

                <input
                  id="instagram"
                  type="text"
                  value={config.instagram}
                  onChange={(event) =>
                    alterarCampo(
                      "instagram",
                      event.target.value
                    )
                  }
                  placeholder="@sualoja"
                />
              </div>

              <div className="admin-form-group admin-settings-full">
                <label htmlFor="descricao">Descrição</label>

                <textarea
                  id="descricao"
                  rows="3"
                  value={config.descricao}
                  onChange={(event) =>
                    alterarCampo(
                      "descricao",
                      event.target.value
                    )
                  }
                />
              </div>
            </div>
          </section>

          {/* CONTATO */}
          <section className="admin-settings-section">
            <div className="admin-settings-section-header">
              <div>
                <span className="eyebrow">CONTATO</span>
                <h2>Contato da loja</h2>
                <p>
                  Informações utilizadas pelos clientes para
                  entrar em contato.
                </p>
              </div>
            </div>

            <div className="admin-settings-grid">
              <div className="admin-form-group">
                <label htmlFor="telefone">Telefone</label>

                <input
                  id="telefone"
                  type="text"
                  value={config.telefone}
                  onChange={(event) =>
                    alterarCampo(
                      "telefone",
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="whatsapp">WhatsApp</label>

                <input
                  id="whatsapp"
                  type="text"
                  value={config.whatsapp}
                  onChange={(event) =>
                    alterarCampo(
                      "whatsapp",
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="endereco">Endereço</label>

                <input
                  id="endereco"
                  type="text"
                  value={config.endereco}
                  onChange={(event) =>
                    alterarCampo(
                      "endereco",
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="bairro">Bairro</label>

                <input
                  id="bairro"
                  type="text"
                  value={config.bairro}
                  onChange={(event) =>
                    alterarCampo(
                      "bairro",
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="cidade">Cidade</label>

                <input
                  id="cidade"
                  type="text"
                  value={config.cidade}
                  onChange={(event) =>
                    alterarCampo(
                      "cidade",
                      event.target.value
                    )
                  }
                />
              </div>
            </div>
          </section>

          {/* FUNCIONAMENTO */}
          <section className="admin-settings-section">
            <div className="admin-settings-section-header">
              <div>
                <span className="eyebrow">FUNCIONAMENTO</span>
                <h2>Horário de atendimento</h2>
                <p>
                  Defina os dias e horários em que a loja
                  recebe pedidos.
                </p>
              </div>
            </div>

            {typeof recurso.dados?.horarios === "string" && <p>Horários atuais: {horariosTexto(recurso.dados.horarios)}</p>}<div className="admin-settings-grid">{dias.map(dia=>{const h=typeof config.horarios[dia]==='object'?config.horarios[dia]:{fechado:true};return <div className="admin-form-group" key={dia}><label><input type="checkbox" checked={h?.fechado===false} onChange={e=>horario(dia,'fechado',!e.target.checked)}/>{dia}</label><label htmlFor={'abertura-'+dia}>Abertura {dia}</label><input id={'abertura-'+dia} type="time" value={h?.abertura || ''} onChange={e=>horario(dia,'abertura',e.target.value)}/><label htmlFor={'fechamento-'+dia}>Fechamento {dia}</label><input id={'fechamento-'+dia} type="time" value={h?.fechamento || ''} onChange={e=>horario(dia,'fechamento',e.target.value)}/></div>;})}</div>
          </section>

          {/* ENTREGA */}
          <section className="admin-settings-section">
            <div className="admin-settings-section-header">
              <div>
                <span className="eyebrow">PEDIDOS</span>
                <h2>Entrega e retirada</h2>
                <p>
                  Defina como os clientes podem receber seus
                  pedidos.
                </p>
              </div>
            </div>

            <div className="admin-settings-options">
              <label className="admin-setting-toggle">
                <div>
                  <strong>Retirada no local</strong>
                  <span>
                    Permitir que o cliente retire o pedido.
                  </span>
                </div>

                <input
                  type="checkbox"
                  checked={config.retirada}
                  onChange={(event) =>
                    alterarCampo(
                      "retirada",
                      event.target.checked
                    )
                  }
                />
              </label>

              <label className="admin-setting-toggle">
                <div>
                  <strong>Entrega</strong>
                  <span>
                    Permitir pedidos para entrega.
                  </span>
                </div>

                <input
                  type="checkbox"
                  checked={config.entrega}
                  onChange={(event) =>
                    alterarCampo(
                      "entrega",
                      event.target.checked
                    )
                  }
                />
              </label>
            </div>

            <div className="admin-settings-grid">
              <div className="admin-form-group">
                <label htmlFor="taxaEntrega">
                  Taxa de entrega
                </label>

                <div className="admin-money-input">
                  <span>R$</span>

                  <input
                    id="taxaEntrega"
                    type="text"
                    value={config.taxaEntrega}
                    onChange={(event) =>
                      alterarCampo(
                        "taxaEntrega",
                        event.target.value
                      )
                    }
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label htmlFor="pedidoMinimo">
                  Pedido mínimo
                </label>

                <div className="admin-money-input">
                  <span>R$</span>

                  <input
                    id="pedidoMinimo"
                    type="text"
                    value={config.pedidoMinimo}
                    onChange={(event) =>
                      alterarCampo(
                        "pedidoMinimo",
                        event.target.value
                      )
                    }
                  />
                </div>
              </div>
            </div>
          </section>

          {/* PAGAMENTO */}
          <section className="admin-settings-section">
            <div className="admin-settings-section-header">
              <div>
                <span className="eyebrow">PAGAMENTO</span>
                <h2>Formas de pagamento</h2>
                <p>
                  Informe as formas de pagamento aceitas pela
                  loja.
                </p>
              </div>
            </div>

            <div className="admin-settings-options">
              <label className="admin-setting-toggle">
                <div>
                  <strong>PIX</strong>
                  <span>
                    Aceitar pagamento via PIX.
                  </span>
                </div>

                <input
                  type="checkbox"
                  checked={config.pix}
                  onChange={(event) =>
                    alterarCampo(
                      "pix",
                      event.target.checked
                    )
                  }
                />
              </label>

              <label className="admin-setting-toggle">
                <div>
                  <strong>Dinheiro</strong>
                  <span>
                    Aceitar pagamento em dinheiro.
                  </span>
                </div>

                <input
                  type="checkbox"
                  checked={config.dinheiro}
                  onChange={(event) =>
                    alterarCampo(
                      "dinheiro",
                      event.target.checked
                    )
                  }
                />
              </label>

              {['cartao_credito','cartao_debito'].map(forma=><label className="admin-setting-toggle" key={forma}><div><strong>{forma==='cartao_credito'?'Cartão de crédito':'Cartão de débito'}</strong></div><input type="checkbox" checked={config[forma]} onChange={e=>alterarCampo(forma,e.target.checked)}/></label>)}
            </div>
          </section>

          <section className="admin-settings-section"><h2>Identidade visual e endereço</h2><div className="admin-settings-grid">{[['numero','Número'],['uf','UF'],['logo','URL do logo'],['imagem','URL da imagem'],['corPrimaria','Cor principal'],['tempoMedio','Tempo médio']].map(([campo,nome])=><div className="admin-form-group" key={campo}><label htmlFor={'loja-'+campo}>{nome}</label><input id={'loja-'+campo} value={config[campo] || ''} onChange={e=>alterarCampo(campo,e.target.value)}/></div>)}</div></section>
          {/* AÇÕES */}
          <div className="admin-settings-actions">
            {salvo && (
              <FeedbackAcao mensagem={salvo} tipo={salvo.includes("etapas")?"aviso":"sucesso"}/>
            )}

            <button
              disabled={ocupado || recurso.carregando || Boolean(recurso.erro)} type="submit"
              className="admin-primary-button"
            >
              Salvar configurações
            </button>
          </div>
        </form>
      </div>
    </main></PageBoundary>
  );
}

export default Configuracoes;
