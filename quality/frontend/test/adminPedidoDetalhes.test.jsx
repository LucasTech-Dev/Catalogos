import React from 'react';
import {it,expect,vi,beforeEach,afterEach} from 'vitest';
import {render,screen,fireEvent,waitFor,cleanup,act} from '@testing-library/react';
const m=vi.hoisted(()=>({buscar:vi.fn(),status:vi.fn(),pagamento:vi.fn()}));
vi.mock('../../../frontend/src/services/admin',()=>({admin:m,rotulosStatus:{recebido:'Recebido',cancelado:'Cancelado',em_preparacao:'Em preparação',pronto:'Pronto'},dataTexto:()=> '25/10/2026'}));
import PedidoDetalhes from '../../../frontend/src/pages/admin/PedidoDetalhes';
import {ToastProvider} from '../../../frontend/src/components/ui/ToastProvider';
const base={id:'tecnico-privado',numeroPedido:12,revisaoAdministrativa:0,status:'em_preparacao',transicoesStatus:['pronto','cancelado'],transicoesPagamento:['confirmado','recusado'],tipoEntrega:'entrega',cliente:{nome:'Cliente A'},endereco:{rua:'Rua teste',numero:'3',cidade:'Cidade',uf:'RS'},pagamento:{forma:'pix',status:'pendente'},itens:[{nome:'Produto histórico',quantidade:2,precoUnitario:10,subtotal:20,observacao:'Sem cebola'}],subtotal:20,taxaEntrega:5,desconto:2,total:23};
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};
async function abrir(p=base){m.buscar.mockResolvedValue(p);render(<ToastProvider><PedidoDetalhes/></ToastProvider>);await screen.findByRole('heading',{name:p.numeroPedido?'Pedido #12':'Pedido sem número'});}
beforeEach(()=>{vi.resetAllMocks();history.replaceState({},'', '/admin/pedido?id=tecnico-privado');});
afterEach(cleanup);
it('releitura bloqueia cliques duplicados e aguarda antes do sucesso sem gravar',async()=>{
 await abrir();const d=deferred();m.buscar.mockReturnValue(d.promise);const b=screen.getByRole('button',{name:'Atualizar pedido'});fireEvent.click(b);fireEvent.click(b);expect(b.disabled).toBe(true);expect(screen.queryByText('Pedido atualizado.')).toBeNull();expect(m.buscar).toHaveBeenCalledTimes(2);await act(async()=>d.resolve({...base,status:'pronto'}));await screen.findByText('Pedido atualizado.');expect(m.status).not.toHaveBeenCalled();expect(m.pagamento).not.toHaveBeenCalled();expect(screen.getByRole('combobox').value).toBe('pronto');
});
it('falha mantém seleção e estado confirmado sem falso sucesso e permite repetir',async()=>{
 await abrir();fireEvent.change(screen.getByRole('combobox'),{target:{value:'pronto'}});m.status.mockRejectedValueOnce(new Error('Sem conexão'));fireEvent.click(screen.getByRole('button',{name:'Salvar status'}));await screen.findByRole('alert');expect(screen.getByRole('combobox').value).toBe('pronto');expect(screen.getByText('Em preparação',{selector:'span'})).toBeTruthy();expect(screen.queryByText('Status do pedido atualizado com sucesso!')).toBeNull();m.status.mockResolvedValue({...base,status:'pronto',revisaoAdministrativa:1,transicoesStatus:[]});fireEvent.click(screen.getByRole('button',{name:'Salvar status'}));await screen.findByText('Status do pedido atualizado com sucesso!');expect(screen.getByText('Pendente')).toBeTruthy();
});
it('uma única gravação usa revisão e aguarda resultado real',async()=>{
 await abrir();const d=deferred();m.status.mockReturnValue(d.promise);fireEvent.change(screen.getByRole('combobox'),{target:{value:'pronto'}});const b=screen.getByRole('button',{name:'Salvar status'});fireEvent.click(b);fireEvent.click(b);expect(m.status).toHaveBeenCalledExactlyOnceWith('tecnico-privado','pronto',0);expect(screen.getByRole('button',{name:'Salvando...'}).getAttribute('aria-busy')).toBe('true');expect(screen.queryByText('Status do pedido atualizado com sucesso!')).toBeNull();await act(async()=>d.resolve({...base,status:'pronto',transicoesStatus:[],revisaoAdministrativa:1}));await screen.findByText('Status do pedido atualizado com sucesso!');expect(screen.getByText('Pendente')).toBeTruthy();
});
it('cancelamento exige confirmação consciente e voltar não grava',async()=>{
 await abrir();fireEvent.change(screen.getByRole('combobox'),{target:{value:'cancelado'}});fireEvent.click(screen.getByRole('button',{name:'Salvar status'}));await screen.findByRole('dialog');expect(m.status).not.toHaveBeenCalled();fireEvent.click(screen.getByRole('button',{name:'Cancelar',exact:true}));await waitFor(()=>expect(screen.queryByRole('dialog')).toBeNull());expect(m.status).not.toHaveBeenCalled();m.status.mockResolvedValue({...base,status:'cancelado',transicoesStatus:[]});fireEvent.click(screen.getByRole('button',{name:'Salvar status'}));fireEvent.click(await screen.findByRole('button',{name:'Confirmar',exact:true}));await waitFor(()=>expect(m.status).toHaveBeenCalledExactlyOnceWith('tecnico-privado','cancelado',0));
});
it('conflito mantém seleção, não sobrescreve e orienta releitura',async()=>{
 await abrir();m.status.mockRejectedValue(Object.assign(new Error('O pedido foi alterado por outra operação. Atualize antes de confirmar novamente.'),{status:409}));fireEvent.change(screen.getByRole('combobox'),{target:{value:'pronto'}});fireEvent.click(screen.getByRole('button',{name:'Salvar status'}));expect((await screen.findByRole('alert')).textContent).toContain('outra operação');expect(screen.getByRole('combobox').value).toBe('pronto');expect(screen.queryByText('Status do pedido atualizado com sucesso!')).toBeNull();
});
it('financeiro confirmado manualmente após operação não modifica andamento',async()=>{
 await abrir();const d=deferred();m.pagamento.mockReturnValue(d.promise);fireEvent.click(screen.getByRole('button',{name:'Confirmar pagamento'}));await screen.findByRole('dialog');expect(m.pagamento).not.toHaveBeenCalled();fireEvent.click(screen.getByRole('button',{name:'Confirmar',exact:true}));expect(screen.getByRole('combobox').disabled).toBe(true);expect(screen.getByText('Pendente')).toBeTruthy();await act(async()=>d.resolve({...base,pagamento:{forma:'pix',status:'confirmado'},transicoesPagamento:[],revisaoAdministrativa:1}));await screen.findByText('Confirmado manualmente');expect(screen.getByText('Em preparação',{selector:'span'})).toBeTruthy();expect(m.status).not.toHaveBeenCalled();
});
it('falha de leitura sem sucesso; permissão revogada remove dados',async()=>{
 await abrir();m.buscar.mockRejectedValueOnce(new Error('Sem conexão'));fireEvent.click(screen.getByRole('button',{name:'Atualizar pedido'}));await screen.findByText('Não foi possível atualizar o pedido. Tente novamente.');expect(screen.queryByText('Pedido atualizado.')).toBeNull();m.buscar.mockRejectedValueOnce(Object.assign(new Error('Acesso negado'),{status:403}));fireEvent.click(screen.getByRole('button',{name:'Atualizar pedido'}));await waitFor(()=>expect(screen.queryByText('Cliente A')).toBeNull());
});
it('histórico mantém observações/valores e não usa ID como número comercial',async()=>{
 await abrir({...base,numeroPedido:undefined});expect(screen.getByText('Sem cebola')).toBeTruthy();expect(screen.getByText('Desconto')).toBeTruthy();expect(screen.getAllByText('Não informado').length).toBeGreaterThan(0);expect(document.body.textContent).not.toContain('tecnico-privado');expect(screen.getByText(/Pedido histórico sem número/)).toBeTruthy();
});

it('gravação confirmada remove erro de leitura anterior',async()=>{
 await abrir();m.buscar.mockRejectedValueOnce(new Error('Conexão temporariamente indisponível'));fireEvent.click(screen.getByRole('button',{name:'Atualizar pedido'}));await screen.findByText('Conexão temporariamente indisponível');m.status.mockResolvedValue({...base,status:'pronto',transicoesStatus:[],revisaoAdministrativa:1});fireEvent.change(screen.getByRole('combobox'),{target:{value:'pronto'}});fireEvent.click(screen.getByRole('button',{name:'Salvar status'}));await screen.findByText('Status do pedido atualizado com sucesso!');expect(screen.queryByText('Conexão temporariamente indisponível')).toBeNull();
});
