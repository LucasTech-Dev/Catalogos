import React, { useState, useRef, useEffect } from "react";

import {useLoja, EstadoCatalogo} from '../contexts/LojaContext';
import {api,publico,pedidos,lojaId} from '../services/api';
import {sessao} from '../lib/firebase';
import {moeda,urlWhatsapp} from '../lib/compras';
function Checkout() {
  const {loja,itens,subtotal,limpar} = useLoja();
  const [cidade,setCidade] = useState(''), [uf,setUf] = useState('');
  const [erro,setErro] = useState(''), [ocupado,setOcupado] = useState(false), [pedido,setPedido] = useState(null), [url,setUrl] = useState('');
  const trava = useRef(false), tentativaKey = useRef("");
  const [enderecosSalvos,setEnderecosSalvos] = useState([]), [enderecoSalvo,setEnderecoSalvo] = useState("");

  const [tipoEntrega, setTipoEntrega] =
    useState("entrega");

  const [formaPagamento, setFormaPagamento] =
    useState("pix");

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [observacao, setObservacao] = useState("");

  const taxaEntrega = pedido?.taxaEntrega ?? (tipoEntrega === 'entrega' ? Number(loja?.entrega?.taxa || 0) : 0);
  const subtotalExibido = pedido?.subtotal ?? subtotal;
  const itensExibidos = pedido?.itens?.map(i => ({...i,id:i.produtoId,preco:i.precoUnitario})) || itens;
  const total = pedido?.total ?? subtotal + taxaEntrega;
  const formas = Object.entries(loja?.pagamentos || {}).filter(([,ativa]) => ativa).map(([forma]) => forma);
  useEffect(() => {
    if (!loja) return;
    if (!loja.entrega?.habilitada) setTipoEntrega('retirada');
    setFormaPagamento(atual => loja.pagamentos?.[atual] ? atual : Object.keys(loja.pagamentos || {}).find(f => loja.pagamentos[f]) || '');
  },[loja]);
  useEffect(() => {
    let ativo = true;
    Promise.all([api(publico+'/me'),api(publico+'/me/enderecos')]).then(([perfil,lista]) => {
      if (!ativo) return;
      setNome(atual => atual || perfil.nome || '');setTelefone(atual => atual || perfil.telefone || '');
      setEnderecosSalvos(Array.isArray(lista) ? lista : []);
    }).catch(() => {});
    return () => {ativo = false;};
  },[]);
  const finalizarPedido = async () => {
    if (trava.current) return;
    trava.current = true; setOcupado(true); setErro('');
    let key;
    try {
      const user = await sessao();
      key = `catalogos:checkout:${lojaId}:${user.uid}`;
      tentativaKey.current = key;
      let tentativa = JSON.parse(localStorage.getItem(key) || 'null');
      if (tentativa && tentativa.uid !== user.uid) throw new Error('Há uma finalização de outra sessão. Entre na conta original para retomá-la.');
      if (!tentativa) {
        if (!itens.length || itens.some(i => i.ativo !== true || i.disponivel === false)) throw new Error('Revise o carrinho: há produtos indisponíveis ou nenhum item.');
        if (!nome.trim() || !telefone.trim()) throw new Error('Informe nome e telefone.');
        if (!formas.includes(formaPagamento)) throw new Error('Escolha uma forma de pagamento aceita pela loja.');
        if (tipoEntrega === 'entrega' && (!endereco.trim() || !numero.trim() || !bairro.trim() || !cidade.trim() || !uf.trim())) throw new Error('Preencha o endereço completo.');
        tentativa = {uid:user.uid,chave:crypto.randomUUID(),dados:{itens:itens.map(i => ({produtoId:i.id,quantidade:i.quantidade})),tipoEntrega,pagamento:{forma:formaPagamento},cliente:{nome,telefone},observacao},endereco:tipoEntrega === 'entrega' ? {rua:endereco,numero,bairro,cidade,uf} : null};
        if (tipoEntrega === "entrega" && enderecoSalvo) {tentativa.dados.enderecoId = enderecoSalvo; tentativa.endereco = null;}
        localStorage.setItem(key,JSON.stringify(tentativa));
      }
      if (!tentativa.pedido) {
        if (tentativa.endereco && !tentativa.dados.enderecoId) {
          const salvo = await api(publico + '/me/enderecos', {method:'POST',body:tentativa.endereco});
          tentativa.dados.enderecoId = salvo.id;
          localStorage.setItem(key,JSON.stringify(tentativa));
        }
        tentativa.pedido = await api(pedidos, {method:'POST',body:tentativa.dados,chave:tentativa.chave});
        localStorage.setItem(key,JSON.stringify(tentativa));
      }
      setPedido(tentativa.pedido); limpar();
      const finalizacao = await api(`${pedidos}/${encodeURIComponent(tentativa.pedido.id)}/whatsapp`);
      setUrl(urlWhatsapp(finalizacao.url));
    } catch(e) {
      if (e.status === 400 && !e.message.includes('Chave já utilizada')) {
        const tentativa = JSON.parse(localStorage.getItem(key) || 'null');
        if (tentativa && !tentativa.pedido) localStorage.removeItem(key);
      }
      setErro(e.message);
    } finally {trava.current = false; setOcupado(false);}
  };

  return (
    <main className="checkout-page">
      <section className="checkout-section">
        <div className="container">

          <div className="checkout-header">
            <span className="eyebrow">
              FINALIZAÇÃO
            </span>

            <h1>
              Quase lá.
            </h1>

            <p>
              Confirme seus dados para
              finalizar o pedido.
            </p>
          </div>

          <EstadoCatalogo /><div className="checkout-layout">

            <div className="checkout-form">

              <section className="checkout-block">
                <div className="checkout-block-header">
                  <span>01</span>

                  <div>
                    <h2>
                      Seus dados
                    </h2>

                    <p>
                      Precisamos dessas
                      informações para
                      identificar seu pedido.
                    </p>
                  </div>
                </div>

                <div className="checkout-fields">

                  <div className="checkout-field">
                    <label htmlFor="nome">
                      Nome
                    </label>

                    <input
                      id="nome"
                      type="text"
                      value={nome}
                      onChange={(event) =>
                        setNome(
                          event.target.value
                        )
                      }
                      placeholder="Seu nome"
                    />
                  </div>

                  <div className="checkout-field">
                    <label htmlFor="telefone">
                      WhatsApp
                    </label>

                    <input
                      id="telefone"
                      type="tel"
                      value={telefone}
                      onChange={(event) =>
                        setTelefone(
                          event.target.value
                        )
                      }
                      placeholder="(51) 99999-9999"
                    />
                  </div>

                </div>
              </section>

              <section className="checkout-block">
                <div className="checkout-block-header">
                  <span>02</span>

                  <div>
                    <h2>
                      Como receber?
                    </h2>

                    <p>
                      Escolha entre receber
                      em casa ou retirar.
                    </p>
                  </div>
                </div>

                <div className="delivery-options">

                  <button
                    type="button"
                    className={
                      tipoEntrega ===
                      "entrega"
                        ? "delivery-option active"
                        : "delivery-option"
                    }
                    disabled={!loja?.entrega?.habilitada}
                    onClick={() =>
                      setTipoEntrega(
                        "entrega"
                      )
                    }
                  >
                    <strong>
                      Entrega
                    </strong>

                    <small>
                      Receba em seu endereço
                    </small>
                  </button>

                  <button
                    type="button"
                    className={
                      tipoEntrega ===
                      "retirada"
                        ? "delivery-option active"
                        : "delivery-option"
                    }
                    disabled={!loja?.retirada?.habilitada}
                    onClick={() =>
                      setTipoEntrega(
                        "retirada"
                      )
                    }
                  >
                    <strong>
                      Retirada
                    </strong>

                    <small>
                      Retire no local
                    </small>
                  </button>

                </div>

                {tipoEntrega ===
                  "entrega" && (
                  <div className="checkout-address" onChangeCapture={event => {if (event.target.id !== 'endereco-salvo') setEnderecoSalvo('');}}>
                    {enderecosSalvos.length > 0 && <div className="checkout-field"><label htmlFor="endereco-salvo">Endereço cadastrado</label><select id="endereco-salvo" value={enderecoSalvo} onChange={event => {const id=event.target.value;setEnderecoSalvo(id);const salvo=enderecosSalvos.find(e => e.id===id);if(salvo){setEndereco(salvo.rua);setNumero(salvo.numero);setBairro(salvo.bairro);setCidade(salvo.cidade || '');setUf(salvo.uf || '');}}}><option value="">Novo endereço</option>{enderecosSalvos.map(e => <option key={e.id} value={e.id}>{e.apelido || e.rua}, {e.numero}</option>)}</select></div>}

                    <div className="checkout-fields"><div className="checkout-field"><label htmlFor="cidade">Cidade</label><input id="cidade" value={cidade} onChange={e => setCidade(e.target.value)} /></div><div className="checkout-field"><label htmlFor="uf">UF</label><input id="uf" maxLength={2} value={uf} onChange={e => setUf(e.target.value.toUpperCase())} /></div></div>


                    <div className="checkout-field">
                      <label htmlFor="endereco">
                        Endereço
                      </label>

                      <input
                        id="endereco"
                        type="text"
                        value={endereco}
                        onChange={(event) =>
                          setEndereco(
                            event.target.value
                          )
                        }
                        placeholder="Rua / Avenida"
                      />
                    </div>

                    <div className="checkout-fields">

                      <div className="checkout-field">
                        <label htmlFor="numero">
                          Número
                        </label>

                        <input
                          id="numero"
                          type="text"
                          value={numero}
                          onChange={(event) =>
                            setNumero(
                              event.target.value
                            )
                          }
                          placeholder="123"
                        />
                      </div>

                      <div className="checkout-field">
                        <label htmlFor="bairro">
                          Bairro
                        </label>

                        <input
                          id="bairro"
                          type="text"
                          value={bairro}
                          onChange={(event) =>
                            setBairro(
                              event.target.value
                            )
                          }
                          placeholder="Seu bairro"
                        />
                      </div>

                    </div>

                  </div>
                )}
              </section>

              <section className="checkout-block">
                <div className="checkout-block-header">
                  <span>03</span>

                  <div>
                    <h2>
                      Pagamento
                    </h2>

                    <p>
                      O pagamento será
                      combinado através do
                      atendimento no WhatsApp.
                    </p>
                  </div>
                </div>

                <div className="payment-options">{formas.map(forma => <button key={forma} type="button" className={formaPagamento === forma ? 'payment-option active' : 'payment-option'} onClick={() => setFormaPagamento(forma)}><strong>{{pix:'PIX',dinheiro:'Dinheiro',cartao_credito:'Cartão de crédito',cartao_debito:'Cartão de débito'}[forma]}</strong></button>)}</div>
              </section>

              <section className="checkout-block">
                <div className="checkout-block-header">
                  <span>04</span>

                  <div>
                    <h2>
                      Observações
                    </h2>

                    <p>
                      Alguma informação
                      adicional?
                    </p>
                  </div>
                </div>

                <textarea
                  className="checkout-observation"
                  value={observacao}
                  onChange={(event) =>
                    setObservacao(
                      event.target.value
                    )
                  }
                  placeholder="Ex.: tocar a campainha, retirar algum ingrediente..."
                  rows="4"
                />
              </section>

            </div>

            <aside className="checkout-summary">
              {erro && <p role="alert">{erro} Em falhas de conexão, repita a finalização para retomar a mesma tentativa.</p>}
              {pedido && <p role="status">Pedido #{pedido.id} registrado. Total definitivo: {moeda(pedido.total)}. Pagamento: {pedido.pagamento.status}.</p>}
              {url && <><a className="whatsapp-checkout-button" href={url} target="_blank" rel="noopener noreferrer">Abrir WhatsApp</a><p>Envie a mensagem e aguarde a confirmação da loja. Se o WhatsApp estiver indisponível, seu pedido continua registrado.</p><button onClick={() => {localStorage.removeItem(tentativaKey.current);window.location.assign('/cardapio');}}>Iniciar novo pedido</button></>}


              <div className="checkout-summary-header">
                <span>
                  SEU PEDIDO
                </span>

                <strong>{itensExibidos.length} itens</strong>
              </div>

              {itensExibidos.map(item => <div className="checkout-product" key={item.id}><strong>{item.quantidade}x {item.nome}</strong><strong>{moeda(item.preco*item.quantidade)}</strong></div>)}
              <div className="checkout-summary-divider" />

              <div className="checkout-summary-row">
                <span>
                  Subtotal
                </span>

                <strong>
                  R${" "}
                  {subtotalExibido
                    .toFixed(2)
                    .replace(".", ",")}
                </strong>
              </div>

              <div className="checkout-summary-row">
                <span>
                  Entrega
                </span>

                <strong>
                  R${" "}
                  {taxaEntrega
                    .toFixed(2)
                    .replace(".", ",")}
                </strong>
              </div>

              <div className="checkout-summary-total">
                <span>
                  Total
                </span>

                <strong>
                  R${" "}
                  {total
                    .toFixed(2)
                    .replace(".", ",")}
                </strong>
              </div>

              <button
                type="button"
                className="whatsapp-checkout-button"
                disabled={ocupado}
                onClick={finalizarPedido}
              >
                {ocupado ? "Registrando..." : "Registrar pedido e preparar WhatsApp"}
              </button>

              <p className="checkout-disclaimer">
                O servidor calcula o total definitivo. Abrir o WhatsApp não confirma recebimento pela loja nem pagamento.
              </p>

            </aside>

          </div>
        </div>
      </section>
    </main>
  );
}

export default Checkout;