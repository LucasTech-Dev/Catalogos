import {notificar} from '../lib/notificacoes';
import {FeedbackAcao} from '../components/ui/ToastProvider';
import {PageBoundary} from '../components/ui/PageLoader';
import {aguardarLeitura,LIMITE_LEITURA_MS} from '../lib/carregamento';
import React, { useState, useRef, useEffect } from "react";

import {useLoja, EstadoCatalogo} from '../contexts/LojaContext';
import {lojaId} from '../services/api';
import {buscarPerfil,listarEnderecos} from '../services/conta';
import {criarPedido,buscarPedido,recuperarPedido,finalizarPedido as prepararFinalizacao} from '../services/pedidosConta';
import {CRIACAO_BLOQUEADA} from '../services/pedidos';
import {calcularPrevia,validarPreviaCompra} from '../lib/previaCompra';
import {auth,sessao} from '../lib/firebase';
import {onIdTokenChanged} from 'firebase/auth';
import {carregarTentativa,salvarTentativa,removerTentativa,limparDadosDeOutraSessao} from '../lib/tentativaCheckout';
import {moeda,urlWhatsapp,compraDoCarrinho} from '../lib/compras';
function Checkout() {
  const catalogo=useLoja();
  const {loja,itens,subtotal,limpar,carregando:carregandoCatalogo,erro:erroCatalogo} = catalogo;
  const [clientePronto,setClientePronto]=useState(false),[erroCliente,setErroCliente]=useState(''),[tentativaCarga,setTentativaCarga]=useState(0);
  const [cidade,setCidade] = useState(''), [uf,setUf] = useState('');
  const [erro,setErro] = useState(''), [ocupado,setOcupado] = useState(false), [pedido,setPedido] = useState(null), [url,setUrl] = useState('');
  const trava = useRef(false), tentativaKey = useRef(""), versaoSessao=useRef(0);
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
  const total = pedido?.total ?? calcularPrevia(itens,taxaEntrega).total;
  const formas = Object.entries(loja?.pagamentos || {}).filter(([,ativa]) => ativa).map(([forma]) => forma);
  useEffect(() => {
    if (!loja) return;
    if (!loja.entrega?.habilitada) setTipoEntrega('retirada');
    setFormaPagamento(atual => loja.pagamentos?.[atual] ? atual : Object.keys(loja.pagamentos || {}).find(f => loja.pagamentos[f]) || '');
  },[loja]);
  useEffect(()=>{
    let ativo=true,uidAnterior;
    const timer=setTimeout(()=>{if(ativo)setErroCliente('Não foi possível verificar sua sessão. Tente novamente.');},LIMITE_LEITURA_MS);
    function trocar(user){clearTimeout(timer);
      const uid=user?.uid || null;if(uid===uidAnterior)return;uidAnterior=uid;const v=++versaoSessao.current;
      setClientePronto(false);setErroCliente('');limparDadosDeOutraSessao(uid);setNome('');setTelefone('');setEndereco('');setNumero('');setBairro('');setCidade('');setUf('');setObservacao('');setEnderecosSalvos([]);setEnderecoSalvo('');setPedido(null);setUrl('');setErro('');
      aguardarLeitura(()=>Promise.all([buscarPerfil(),listarEnderecos()])).then(([perfil,lista])=>{
        if(!ativo || v!==versaoSessao.current)return;
        setClientePronto(true);setNome(atual=>atual || perfil.nome || '');setTelefone(atual=>atual || perfil.telefone || '');setEnderecosSalvos(Array.isArray(lista)?lista:[]);
      }).catch(e=>{if(ativo&&v===versaoSessao.current)setErroCliente(e.message);});
    }
    const cancelar=auth?onIdTokenChanged(auth,trocar):null;if(!auth)trocar(null);
    return()=>{clearTimeout(timer);ativo=false;versaoSessao.current++;cancelar?.();};
  },[tentativaCarga]);
  const finalizarPedido = async () => {
    if (trava.current) return;
    trava.current = true; setOcupado(true); setErro('');
    let key,uid;let v=versaoSessao.current;
    try {
      const user = await sessao();
      uid=user.uid;v=versaoSessao.current;
      const conferirResultado=async(operacao)=>{const resultado=await operacao;if(v!==versaoSessao.current || (auth && auth.currentUser?.uid!==uid))throw Object.assign(new Error('A sessão mudou.'),{status:409});return resultado;};
      key = `catalogos:checkout:${lojaId}:${user.uid}`;
      tentativaKey.current = key;
      let tentativa=carregarTentativa(key,user.uid);
      if(tentativa?.pedido?.id || tentativa?.pedidoId)tentativa.pedido=await conferirResultado(buscarPedido(tentativa.pedido?.id || tentativa.pedidoId,uid));
      if(tentativa && !tentativa.dados && !tentativa.pedido) {
        try{tentativa.pedido=await conferirResultado(recuperarPedido(tentativa.chave,uid));salvarTentativa(key,tentativa);}
        catch(e){if(e.status!==404)throw e;}
      }
      if (tentativa && tentativa.uid !== user.uid) throw new Error('Há uma finalização de outra sessão. Entre na conta original para retomá-la.');
      if (!tentativa?.dados && !tentativa?.pedido) {
        const compra=compraDoCarrinho(itens,observacao);
        validarPreviaCompra({loja,itens:compra.itens,tipoEntrega,cliente:{nome,telefone},endereco:{rua:endereco,numero,bairro,cidade,uf},enderecoId:tipoEntrega==='entrega'?enderecoSalvo:null,forma:formaPagamento,observacao:compra.observacao});
        tentativa = {uid:user.uid,chave:tentativa?.chave || crypto.randomUUID(),dados:{itens:compra.itens.map(i => ({produtoId:i.id,quantidade:i.quantidade})),tipoEntrega,pagamento:{forma:formaPagamento},cliente:{nome,telefone},observacao:compra.observacao},endereco:tipoEntrega === 'entrega' ? {rua:endereco,numero,bairro,cidade,uf} : null};
        if (tipoEntrega === "entrega" && enderecoSalvo) {tentativa.dados.enderecoId = enderecoSalvo; tentativa.endereco = null;}
        salvarTentativa(key,tentativa);
      }
      if (!tentativa.pedido) {
        tentativa.pedido = await conferirResultado(criarPedido(tentativa.dados,{chave:tentativa.chave,expectedUid:uid,endereco:tentativa.endereco}));
        salvarTentativa(key,tentativa);
      }
      if(v!==versaoSessao.current || (auth && auth.currentUser?.uid!==user.uid))return;
      setPedido(tentativa.pedido); limpar();
      const finalizacao = await conferirResultado(prepararFinalizacao(tentativa.pedido.id,uid));
      if(v===versaoSessao.current && (!auth || auth.currentUser?.uid===user.uid)){setUrl(urlWhatsapp(finalizacao.url));notificar('sucesso','Pedido registrado. Confira os detalhes antes de enviar pelo WhatsApp.');}
    } catch(e) {
      if(v!==versaoSessao.current)return;
      if (e.status === 400 && !e.message.includes('Chave já utilizada')) {
        const tentativa=key?carregarTentativa(key,uid):null;
        if (tentativa && !tentativa.pedido) removerTentativa(key);
      }
      if(e.code==='PEDIDO_CRIACAO_BLOQUEADA' && key)removerTentativa(key);
      if(v===versaoSessao.current)setErro(e.message);
    } finally {trava.current = false; setOcupado(false);}
  };

  return (<PageBoundary loja={loja} recursos={[{...catalogo,pronto:catalogo.pronto ?? Boolean(loja)},{pronto:clientePronto,erro:erroCliente,atualizar:()=>setTentativaCarga(v=>v+1)}]}>
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
              {erro && <><FeedbackAcao mensagem={erro} persistente={erro===CRIACAO_BLOQUEADA}/>{erro!==CRIACAO_BLOQUEADA && <p>Em falhas de conexão, repita a finalização para retomar a mesma tentativa.</p>}</>}
              {pedido && <p role="status">Pedido #{pedido.id} registrado. Total definitivo: {moeda(pedido.total)}. Pagamento: {pedido.pagamento.status}.</p>}
              {url && <><a className="whatsapp-checkout-button" href={url} target="_blank" rel="noopener noreferrer">Abrir WhatsApp</a><p>Envie a mensagem e aguarde a confirmação da loja. Se o WhatsApp estiver indisponível, seu pedido continua registrado.</p><button onClick={() => {removerTentativa(tentativaKey.current);window.location.assign('/cardapio');}}>Iniciar novo pedido</button></>}


              <div className="checkout-summary-header">
                <span>
                  SEU PEDIDO
                </span>

                <strong>{itensExibidos.length} itens</strong>
              </div>

              {itensExibidos.map(item => <div className="checkout-product" key={item.chave || item.id}><strong>{item.quantidade}x {item.nome}</strong><strong>{moeda(item.preco*item.quantidade)}</strong></div>)}
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
                disabled={ocupado || carregandoCatalogo || Boolean(erroCatalogo)}
                aria-busy={ocupado} onClick={finalizarPedido}
              >
                {ocupado ? "Registrando..." : "Registrar pedido e preparar WhatsApp"}
              </button>

              <p className="checkout-disclaimer">
                O pedido só é confirmado após validação dos valores e gravação. Abrir o WhatsApp não confirma recebimento pela loja nem pagamento.
              </p>

            </aside>

          </div>
        </div>
      </section>
    </main></PageBoundary>
  );
}

export default Checkout;