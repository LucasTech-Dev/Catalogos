import MaterialIcon from "../../components/ui/MaterialIcon";
import {FeedbackAcao} from '../../components/ui/ToastProvider';
import {PageBoundary} from '../../components/ui/PageLoader';
import React, { useMemo, useState } from "react";

import {admin} from "../../services/admin";
import {useAdminLista} from "../../hooks/useAdmin";
import {AdminState,AdminPaginacao} from "../../components/admin/AdminState";
function Clientes() {
  const [busca, setBusca] = useState("");

  const recurso=useAdminLista('clientes');
  const clientes=recurso.itens.map(c=>({...c,nome:c.nome || (c.anonimo?'Convidado':'Cliente'),email:c.email || 'Não informado',pedidos:'—',totalGasto:'—',ultimoPedido:'—',status:c.anonimo?'Convidado':'Cliente'}));
  const [detalhe,setDetalhe]=useState(null),[erro,setErro]=useState(''),[ocupado,setOcupado]=useState(false);
  async function abrir(id){if(ocupado)return;setOcupado(true);setErro('');try{setDetalhe(await admin.buscar('clientes',id));}catch(e){setErro(e.message);}finally{setOcupado(false);}}
  const clientesFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();

    if (!termo) {
      return clientes;
    }

    return clientes.filter((cliente) =>
      `${cliente.nome} ${cliente.email} ${cliente.telefone}`
        .toLowerCase()
        .includes(termo)
    );
  }, [busca, clientes]);

  return (<PageBoundary recursos={[recurso]}>
    <main className="admin-customers-page">
      <div className="admin-container">
        <section className="admin-page-header">
          <div>
            <span className="eyebrow">RELACIONAMENTO</span>
            <h1>Clientes</h1>
            <p>Consulte os clientes que realizaram pedidos.</p>
          </div>
        </section>

        <AdminState recurso={recurso}/>{erro && <FeedbackAcao mensagem={erro}/>}<AdminPaginacao recurso={recurso}/><p>Dados dos clientes desta loja. Totais históricos não são calculados nesta lista.</p><section className="admin-customers-panel">
          <div className="admin-customers-toolbar">
            <div className="admin-customers-search">
              <span>⌕</span>

              <input
                type="search"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Buscar nesta página por nome, e-mail ou telefone..."
              />
            </div>

            <span className="admin-customers-count">
              {clientesFiltrados.length}{" "}
              {clientesFiltrados.length === 1
                ? "cliente"
                : "clientes"}
            </span>
          </div>

          {clientesFiltrados.length > 0 ? (
            <div className="admin-customers-list">
              <div className="admin-customers-table-header">
                <span>Cliente</span>
                <span>Pedidos</span>
                <span>Total gasto</span>
                <span>Último pedido</span>
                <span>Status</span>
                <span></span>
              </div>

              {clientesFiltrados.map((cliente) => (
                <article
                  className="admin-customer-row"
                  key={cliente.id}
                >
                  <div className="admin-customer-main">
                    <div className="admin-customer-avatar">
                      {cliente.nome.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <h2>{cliente.nome}</h2>
                      <p>{cliente.email}</p>
                      <span>{cliente.telefone}</span>
                    </div>
                  </div>

                  <div className="admin-customer-stat">
                    <strong>{cliente.pedidos}</strong>
                    <span>
                      {cliente.pedidos === 1
                        ? "pedido"
                        : "pedidos"}
                    </span>
                  </div>

                  <div className="admin-customer-stat">
                    <strong>{cliente.totalGasto}</strong>
                    <span>total</span>
                  </div>

                  <div className="admin-customer-last-order">
                    {cliente.ultimoPedido}
                  </div>

                  <div>
                    <span
                      className={
                        cliente.status === "Ativo"
                          ? "admin-status active"
                          : "admin-status inactive"
                      }
                    >
                      {cliente.status}
                    </span>
                  </div>

                  <div className="admin-customer-actions">
                    <button type="button" disabled={ocupado} aria-busy={ocupado} onClick={()=>abrir(cliente.id)}>
                      Ver cliente
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="admin-empty-state">
              <div className="admin-empty-icon"><MaterialIcon name="person"/></div>

              <h2>Nenhum cliente encontrado</h2>

              <p>
                Tente buscar utilizando outro nome, e-mail ou
                telefone.
              </p>
            </div>
          )}
        </section>
      </div>
    {detalhe && <div className="admin-modal-overlay"><div className="admin-modal" role="dialog" aria-modal="true" aria-label="Dados do cliente"><h2>{detalhe.nome || "Convidado"}</h2><p>{detalhe.email || "E-mail não informado"}</p><p>{detalhe.telefone}</p><p>{detalhe.anonimo ? "Compra como convidado" : "Cliente"}</p><button onClick={()=>setDetalhe(null)}>Fechar</button></div></div>}
    </main></PageBoundary>
  );
}

export default Clientes;