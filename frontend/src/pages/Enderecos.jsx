import MaterialIcon from "../components/ui/MaterialIcon";
import '../components/conta/areaCliente.css';
import {notificar} from '../lib/notificacoes';
import {FeedbackAcao,confirmarAcao} from '../components/ui/ToastProvider';
import {PageBoundary} from '../components/ui/PageLoader';
import React, {useState,useEffect} from "react";
import {useRecurso} from "../hooks/useRecurso";
import {listarEnderecos,salvarEndereco,excluirEndereco} from "../services/conta";

function Enderecos() {
  const recurso=useRecurso(listarEnderecos,[]);
  const {dados:enderecos,erro:erroCarga,carregando,atualizar,uid} = recurso;
  const [edicao,setEdicao] = useState(null),[erro,setErro] = useState(''),[ocupado,setOcupado] = useState(false),[sucesso,setSucesso]=useState('');
  useEffect(()=>{if(carregando){setEdicao(null);setErro('');}},[carregando]);
  async function salvar(event) {
    event.preventDefault();if (ocupado) return;setOcupado(true);setErro('');setSucesso('');
    const dados = Object.fromEntries(new FormData(event.target));
    try {await salvarEndereco(edicao.id,dados,uid);setEdicao(null);await atualizar();setSucesso('Endereço salvo.');} catch(e) {setErro(e.message);} finally {setOcupado(false);}
  }
  async function excluir(id) {if (ocupado || !await confirmarAcao('Excluir este endereço? Os pedidos anteriores serão preservados.','Excluir endereço')) return;setOcupado(true);try {setSucesso('');await excluirEndereco(id,uid);await atualizar();setSucesso('Endereço excluído.');} catch(e) {setErro(e.message);} finally {setOcupado(false);}}
  return (<PageBoundary recursos={[recurso]}>
    <>
      <main className="addresses-page customer-page">
        <div className="addresses-container customer-container">

          <div className="addresses-top">
            <a href="/perfil" className="back-link">
              <MaterialIcon name="arrow_back"/> Minha conta
            </a>
          </div>

          <div className="addresses-heading">
            <div>
              <span className="section-label">MINHA CONTA</span>
              <h1>Meus endereços</h1>
              <p>
                Gerencie os endereços utilizados para suas entregas.
              </p>
            </div>

            <button className="button button-primary primary-button" onClick={() => setEdicao({})}>
              <MaterialIcon name="add"/> Adicionar endereço
            </button>
          </div>

          {sucesso && <FeedbackAcao mensagem={sucesso} tipo="sucesso"/>}{erroCarga && <p role="alert">{erroCarga}</p>}{erro && <FeedbackAcao mensagem={erro}/>}{carregando && <p>Carregando...</p>}
          {edicao && <form aria-busy={ocupado} className="personal-data-card address-form" onSubmit={salvar} key={edicao.id || 'novo'}><h2>{edicao.id ? 'Editar endereço' : 'Novo endereço'}</h2><div className="personal-data-grid">{['apelido','rua','numero','bairro','cidade','uf','complemento','cep'].map(campo => <div className="form-group" key={campo}><label htmlFor={'end-'+campo}>{campo}</label><input id={'end-'+campo} name={campo} defaultValue={edicao[campo] || ''} required={['rua','numero','bairro','cidade','uf'].includes(campo)} /></div>)}</div><button className="button button-primary primary-button" disabled={ocupado}>Salvar endereço</button><button type="button" className="button button-secondary" onClick={() => {setEdicao(null);notificar("info","Edição cancelada.");}}>Cancelar</button></form>}
          {!carregando && !enderecos.length && <section className="orders-empty"><h2>Nenhum endereço cadastrado</h2><p>Adicione um endereço para facilitar suas próximas entregas.</p></section>}
          <section className="addresses-list">
            {enderecos.map((endereco) => (
              <article className="address-card" key={endereco.id}>

                <div className="address-card-header">
                  <div className="address-title">
                    <span className="address-icon"><MaterialIcon name="location_on"/></span>

                    <div>
                      <h2>{endereco.apelido}</h2>

                      {endereco.principal && (
                        <span className="address-primary-badge">
                          Principal
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="address-actions">
                    <button onClick={() => setEdicao(endereco)}>Editar</button>
                    <button disabled={ocupado} onClick={() => excluir(endereco.id)}>Excluir</button>
                  </div>
                </div>

                <div className="address-content">
                  <p>{endereco.rua}, {endereco.numero}</p>
                  <p>{endereco.complemento}</p>
                  <p>{endereco.bairro}</p>
                  <p>{endereco.cidade}</p>
                </div>



              </article>
            ))}
          </section>

          <div className="addresses-bottom">
            <a href="/perfil" className="button button-secondary secondary-button">
              Voltar para minha conta
            </a>
          </div>

        </div>
      </main>
    </></PageBoundary>
  );
}

export default Enderecos;
