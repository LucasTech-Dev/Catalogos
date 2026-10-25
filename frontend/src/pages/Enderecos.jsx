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
  async function excluir(id) {if (ocupado) return;setOcupado(true);try {setSucesso('');await excluirEndereco(id,uid);await atualizar();setSucesso('Endereço excluído.');} catch(e) {setErro(e.message);} finally {setOcupado(false);}}
  return (<PageBoundary recursos={[recurso]}>
    <>
      <main className="addresses-page">
        <div className="addresses-container">

          <div className="addresses-top">
            <a href="/perfil" className="back-link">
              ← Minha conta
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

            <button className="primary-button" onClick={() => setEdicao({})}>
              + Adicionar endereço
            </button>
          </div>

          {sucesso && <p role="status">{sucesso}</p>}{(erro || erroCarga) && <p role="alert">{erro || erroCarga}</p>}{carregando && <p>Carregando...</p>}
          {edicao && <form className="personal-data-card" onSubmit={salvar} key={edicao.id || 'novo'}><h2>{edicao.id ? 'Editar endereço' : 'Novo endereço'}</h2><div className="personal-data-grid">{['apelido','rua','numero','bairro','cidade','uf','complemento','cep'].map(campo => <div className="form-group" key={campo}><label htmlFor={'end-'+campo}>{campo}</label><input id={'end-'+campo} name={campo} defaultValue={edicao[campo] || ''} required={['rua','numero','bairro','cidade','uf'].includes(campo)} /></div>)}</div><button className="primary-button" disabled={ocupado}>Salvar endereço</button><button type="button" onClick={() => setEdicao(null)}>Cancelar</button></form>}
          {!carregando && !enderecos.length && <p>Nenhum endereço cadastrado.</p>}
          <section className="addresses-list">
            {enderecos.map((endereco) => (
              <article className="address-card" key={endereco.id}>

                <div className="address-card-header">
                  <div className="address-title">
                    <span className="address-icon">⌖</span>

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
            <a href="/perfil" className="secondary-button">
              Voltar para minha conta
            </a>
          </div>

        </div>
      </main>
    </></PageBoundary>
  );
}

export default Enderecos;
