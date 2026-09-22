import React from "react";

function Enderecos() {
  const enderecos = [
    {
      id: 1,
      apelido: "Casa",
      rua: "Rua Principal, 120",
      complemento: "Apartamento 302",
      bairro: "Centro",
      cidade: "Capão da Canoa - RS",
      principal: true,
    },
    {
      id: 2,
      apelido: "Trabalho",
      rua: "Av. Paraguassu, 850",
      complemento: "Sala 04",
      bairro: "Centro",
      cidade: "Capão da Canoa - RS",
      principal: false,
    },
  ];

  return (
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

            <button className="primary-button">
              + Adicionar endereço
            </button>
          </div>

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
                    <button>Editar</button>
                    <button>Excluir</button>
                  </div>
                </div>

                <div className="address-content">
                  <p>{endereco.rua}</p>
                  <p>{endereco.complemento}</p>
                  <p>{endereco.bairro}</p>
                  <p>{endereco.cidade}</p>
                </div>

                {!endereco.principal && (
                  <button className="address-default-button">
                    Definir como principal
                  </button>
                )}

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
    </>
  );
}

export default Enderecos;