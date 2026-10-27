import React from 'react';
import {it,expect,vi,beforeEach,afterEach} from 'vitest';
import {render,screen,fireEvent,waitFor,cleanup,act,within} from '@testing-library/react';
const m=vi.hoisted(()=>Object.fromEntries(['listar','buscar','salvar','excluir','loja','configurar','historicoPedido'].map(k=>[k,vi.fn()])));
vi.mock('../../../frontend/src/services/admin',()=>({admin:m,rotulosStatus:{recebido:'Recebido',pronto:'Pronto'},dataTexto:()=> '26/10/2026'}));
vi.mock('../../../frontend/src/components/admin/AdminGate',()=>({useAdminSessao:()=>null}));
import Categorias from '../../../frontend/src/pages/admin/Categorias';
import Produtos from '../../../frontend/src/pages/admin/Produtos';
import ProdutoForm from '../../../frontend/src/pages/admin/ProdutoForm';
import Clientes from '../../../frontend/src/pages/admin/Clientes';
import Configuracoes from '../../../frontend/src/pages/admin/Configuracoes';
import PedidoDetalhes from '../../../frontend/src/pages/admin/PedidoDetalhes';
import {useAdminRecurso} from '../../../frontend/src/hooks/useAdmin';
import {ToastProvider,FeedbackAcao} from '../../../frontend/src/components/ui/ToastProvider';
const cat={id:'c',nome:'Categoria013',ativo:true,produtos:2},produto={id:'p',nome:'Produto013',categoriaId:'c',ativo:true,disponivel:true,preco:10};
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};
beforeEach(()=>{vi.stubEnv('VITE_CATEGORIAS_DESATIVACAO','true');vi.resetAllMocks();history.replaceState({},'', '/admin');m.listar.mockImplementation(async nome=>({itens:nome==='categorias'?[cat]:nome==='produtos'?[produto]:[{id:'cliente',nome:'Cliente013'}],proximoCursor:null}));m.historicoPedido.mockResolvedValue([]);});
afterEach(()=>{cleanup();vi.useRealTimers();});
it('dois submits no mesmo evento criam categoria uma vez e não permitem fechar durante gravação',async()=>{
 const d=deferred();m.salvar.mockReturnValue(d.promise);render(<ToastProvider><Categorias/></ToastProvider>);await screen.findByText(cat.nome);fireEvent.click(screen.getByRole('button',{name:'Nova categoria'}));fireEvent.change(screen.getByLabelText('Nome da categoria'),{target:{value:'Nova013'}});const form=screen.getByRole('button',{name:'Criar categoria'}).closest('form');
 act(()=>{fireEvent.submit(form);fireEvent.submit(form);fireEvent.click(screen.getByRole('button',{name:'Cancelar'}));});expect(m.salvar).toHaveBeenCalledTimes(1);expect(m.salvar.mock.calls[0][3]).toMatch(/^[a-f0-9-]{36}$/);expect(screen.getByRole('button',{name:'Cancelar'}).disabled).toBe(true);fireEvent.keyDown(document,{key:'Escape'});expect(screen.getByRole('dialog')).toBeTruthy();await act(async()=>d.resolve({id:'novo'}));await waitFor(()=>expect(screen.queryByRole('dialog')).toBeNull());
});
it('trava inclui confirmação; cancelar não grava e permite nova tentativa',async()=>{
 render(<ToastProvider><Categorias/></ToastProvider>);await screen.findByText(cat.nome);const b=screen.getByRole('button',{name:'Desativar'});act(()=>{fireEvent.click(b);fireEvent.click(b);});expect(screen.getAllByRole('dialog')).toHaveLength(1);expect(m.salvar).not.toHaveBeenCalled();fireEvent.click(screen.getByRole('button',{name:'Cancelar'}));await screen.findByRole('button',{name:'Desativar'});expect(m.salvar).not.toHaveBeenCalled();
});
it('produtos distintos trabalham em paralelo, mas repetição no mesmo produto não grava duas vezes',async()=>{
 const d=deferred();m.salvar.mockReturnValue(d.promise);m.listar.mockImplementation(async nome=>({itens:nome==='categorias'?[cat]:[produto,{...produto,id:'p2',nome:'Segundo013'}],proximoCursor:null}));render(<Produtos/>);await screen.findByText(produto.nome);const buttons=screen.getAllByRole('button',{name:'Desativar'});act(()=>{fireEvent.click(buttons[0]);fireEvent.click(buttons[0]);fireEvent.click(buttons[1]);});expect(m.salvar).toHaveBeenCalledTimes(2);expect(m.salvar.mock.calls.map(c=>c[1]).sort()).toEqual(['p','p2']);await act(async()=>d.resolve({...produto,ativo:false}));
});
it('detalhe de cliente não duplica consulta nem aparece depois de abandonar a página',async()=>{
 const d=deferred();m.buscar.mockReturnValue(d.promise);const view=render(<Clientes/>);await screen.findByText('Cliente013');const b=screen.getByRole('button',{name:'Ver cliente'});act(()=>{fireEvent.click(b);fireEvent.click(b);});expect(m.buscar).toHaveBeenCalledTimes(1);view.unmount();await act(async()=>d.resolve({id:'cliente',nome:'Cliente013'}));expect(screen.queryByRole('dialog')).toBeNull();
});
it('configurações bloqueiam submits concorrentes e preservam o formulário na falha',async()=>{
 const d=deferred();m.loja.mockResolvedValue({nome:'Loja013',pagamentos:{pix:true},horarios:{}});m.configurar.mockReturnValue(d.promise);render(<ToastProvider><Configuracoes/></ToastProvider>);await waitFor(()=>expect(screen.getByLabelText('Nome da loja').value).toBe('Loja013'));const form=screen.getByRole('button',{name:'Salvar configurações'}).closest('form');act(()=>{fireEvent.submit(form);fireEvent.submit(form);});expect(m.configurar).toHaveBeenCalledTimes(1);expect(screen.getByLabelText('Nome da loja').matches(':disabled')).toBe(true);await act(async()=>d.reject(new Error('Gravação recusada.')));expect(screen.getByRole('alert').textContent).toContain('Gravação recusada.');expect(screen.getByLabelText('Nome da loja').value).toBe('Loja013');expect(screen.queryByText('Alterações salvas')).toBeNull();
});
it('recarregar após resposta perdida mantém o identificador de criação para uma retomada segura',async()=>{
 m.salvar.mockRejectedValue(new Error('Não foi possível confirmar.'));let view=render(<ProdutoForm/>);async function preencher(){await screen.findByRole('option',{name:cat.nome});fireEvent.change(screen.getByLabelText('Nome do produto'),{target:{value:'Novo013'}});fireEvent.change(screen.getByLabelText('Preço'),{target:{value:'12'}});fireEvent.change(screen.getByLabelText('Categoria'),{target:{value:'c'}});fireEvent.submit(screen.getByRole('button',{name:'Criar produto'}).closest('form'));await screen.findByRole('alert');}
 await preencher();const chave=m.salvar.mock.calls[0][3];view.unmount();view=render(<ProdutoForm/>);await preencher();expect(m.salvar.mock.calls[1][3]).toBe(chave);expect(m.salvar).toHaveBeenCalledTimes(2);
});
it('refresh capturado antes da troca de filtro recarrega o filtro atual, sem prender loading',async()=>{
 const a=vi.fn(async()=> 'A'),b=vi.fn(async()=> 'B');let antigo,recurso;
 function Tela({carregar}){recurso=useAdminRecurso(carregar);antigo ||= recurso.atualizar;return <p>{recurso.carregando?'Aguarde':recurso.dados}</p>;}
 const view=render(<Tela carregar={a}/>);await screen.findByText('A');view.rerender(<Tela carregar={b}/>);await screen.findByText('B');await act(async()=>antigo());expect(a).toHaveBeenCalledTimes(1);expect(b).toHaveBeenCalledTimes(2);expect(screen.getByText('B')).toBeTruthy();expect(recurso.carregando).toBe(false);
});
it('erro importante permanece após os cinco segundos da notificação',async()=>{
 vi.useFakeTimers();render(<ToastProvider><FeedbackAcao mensagem="Falha recuperável."/></ToastProvider>);await act(async()=>vi.advanceTimersByTimeAsync(6000));expect(screen.getByRole('alert').textContent).toContain('Falha recuperável.');expect(document.querySelector('.toast-card')).toBeNull();
});
it('detalhe mostra histórico persistido com separação financeira e sem expor UID',async()=>{
 history.replaceState({},'', '/admin/pedido?id=p');m.buscar.mockResolvedValue({id:'p',numeroPedido:1,status:'recebido',itens:[],pagamento:{status:'confirmado'},transicoesStatus:[],transicoesPagamento:[]});m.historicoPedido.mockResolvedValue([{tipo:'pagamento',anterior:'pendente',novo:'confirmado',revisao:1}]);render(<PedidoDetalhes/>);await screen.findByText('Histórico de alterações');await screen.findByText(/Pagamento: Pendente → Confirmado manualmente/);expect(m.historicoPedido).toHaveBeenCalledWith('p');
});
it('desativação sem Rules liberadas é explicada e não envia gravação',async()=>{
 vi.stubEnv('VITE_CATEGORIAS_DESATIVACAO','false');render(<Categorias/>);await screen.findByText(cat.nome);const b=screen.getByRole('button',{name:'Desativar'});expect(b.disabled).toBe(true);fireEvent.click(b);expect(m.salvar).not.toHaveBeenCalled();expect(screen.getByText(/aguarda atualização das permissões do Firebase/)).toBeTruthy();
});
it.each([0,1,28])('clientes renderizam %i registros sem inventar totais ou consultar por tecla',async quantidade=>{
 m.listar.mockResolvedValue({itens:Array.from({length:quantidade},(_,n)=>({id:'cliente'+n,nome:'Pessoa013-'+n})),proximoCursor:null});render(<Clientes/>);
 await waitFor(()=>expect(document.querySelectorAll('.admin-customer-row')).toHaveLength(quantidade));await waitFor(()=>expect(screen.queryByText('Carregando...')).toBeNull());
 if(!quantidade)expect(screen.getByText('Nenhum cliente encontrado')).toBeTruthy();
 fireEvent.change(screen.getByRole('searchbox'),{target:{value:'Nome ausente'}});expect(document.querySelectorAll('.admin-customer-row')).toHaveLength(0);expect(m.listar).toHaveBeenCalledTimes(1);
});
