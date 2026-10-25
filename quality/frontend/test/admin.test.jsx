import React from 'react';
import {it,describe,expect,vi,beforeEach,afterEach} from 'vitest';
import {render,screen,fireEvent,waitFor,cleanup,act} from '@testing-library/react';
const m=vi.hoisted(()=>({auth:{currentUser:null},listener:null,entrar:vi.fn(),sair:vi.fn(),admin:Object.fromEntries(['sessao','loja','dashboard','listar','buscar','salvar','excluir','configurar','status','pagamento'].map(k=>[k,vi.fn()]))}));
vi.mock('../../../frontend/src/lib/firebase',()=>({auth:m.auth}));
vi.mock('firebase/auth',()=>({onIdTokenChanged:(auth,callback)=>{m.listener=callback;queueMicrotask(()=>callback(auth.currentUser));return ()=>{m.listener=null;};}}));
vi.mock('../../../frontend/src/services/conta',()=>({entrar:m.entrar,sair:m.sair}));
vi.mock('../../../frontend/src/services/admin',()=>({admin:m.admin,classeStatus:{recebido:'received',em_preparacao:'preparing',pronto:'ready',entregue:'delivered'},rotulosStatus:{recebido:'Recebido',pagamento_confirmado:'Pagamento confirmado',pagamento_recusado:'Pagamento recusado',em_preparacao:'Em preparação',pronto:'Pronto',saiu_para_entrega:'Saiu para entrega',entregue:'Entregue',cancelado:'Cancelado'},dataTexto:()=> '13/10/2026'}));
import AdminGate,{useAdminSessao} from '../../../frontend/src/components/admin/AdminGate';
import Dashboard from '../../../frontend/src/pages/admin/Dashboard';
import Produtos from '../../../frontend/src/pages/admin/Produtos';
import ProdutoForm from '../../../frontend/src/pages/admin/ProdutoForm';
import Categorias from '../../../frontend/src/pages/admin/Categorias';
import Clientes from '../../../frontend/src/pages/admin/Clientes';
import Configuracoes from '../../../frontend/src/pages/admin/Configuracoes';
import PedidoDetalhes from '../../../frontend/src/pages/admin/PedidoDetalhes';
import {moeda} from '../../../frontend/src/lib/compras';
const sessao={uid:'adm',email:'adm@teste.local',role:'admin',lojaId:'loja-demo',loja:{id:'loja-demo',nome:'Loja real'}};
const cat={id:'cat',nome:'Categoria real',ativo:true,produtos:1};
const produto={id:'produto',nome:'Produto real',descricao:'Descrição real',categoriaId:'cat',preco:18.5,ativo:true,disponivel:true,imagem:''};
beforeEach(()=>{vi.resetAllMocks();m.auth.currentUser=null;window.history.replaceState({},'', '/admin');m.admin.sessao.mockResolvedValue(sessao);m.admin.listar.mockImplementation(async nome=>({itens:nome==='categorias'?[cat]:nome==='produtos'?[produto]:[],proximoCursor:null}));});
afterEach(()=>{cleanup();vi.restoreAllMocks();});
function Conteudo(){const sessao=useAdminSessao();return <><p>Conteúdo protegido</p><button onClick={sessao.sair}>Sair do painel</button></>;}
describe('acesso administrativo',()=>{
  it('exige login antes de exibir conteúdo e valida sessão no backend',async()=>{
    m.entrar.mockImplementation(async()=>{m.auth.currentUser={uid:'adm',isAnonymous:false};m.listener(m.auth.currentUser);});
    render(<AdminGate><Conteudo/></AdminGate>);await screen.findByRole('button',{name:'Entrar no painel'});expect(screen.queryByText('Conteúdo protegido')).toBeNull();
    fireEvent.change(screen.getByLabelText('E-mail'),{target:{value:'adm@teste.local'}});fireEvent.change(screen.getByLabelText('Senha'),{target:{value:'senha'}});fireEvent.submit(screen.getByRole('button',{name:'Entrar no painel'}).closest('form'));
    await screen.findByText('Conteúdo protegido');expect(m.entrar).toHaveBeenCalledWith('adm@teste.local','senha');expect(m.admin.sessao).toHaveBeenCalled();
  });
  it('bloqueia cliente ou administrador de outra loja rejeitado pelo backend',async()=>{
    m.auth.currentUser={uid:'cliente',isAnonymous:false};m.admin.sessao.mockRejectedValue(Object.assign(new Error('Usuário não possui acesso a esta loja.'),{status:403}));
    render(<AdminGate><Conteudo/></AdminGate>);await screen.findByRole('alert');expect(screen.queryByText('Conteúdo protegido')).toBeNull();
  });
  it('bloqueia convidado sem tentar conceder role',async()=>{
    m.auth.currentUser={uid:'anonimo',isAnonymous:true};render(<AdminGate><Conteudo/></AdminGate>);await screen.findByRole('alert');expect(m.admin.sessao).not.toHaveBeenCalled();expect(screen.queryByText('Conteúdo protegido')).toBeNull();
  });
  it('esconde conteúdo ao expirar/revogar sessão e faz logout funcional',async()=>{
    m.auth.currentUser={uid:'adm',isAnonymous:false};m.sair.mockImplementation(async()=>{m.auth.currentUser=null;m.listener(null);});
    render(<AdminGate><Conteudo/></AdminGate>);await screen.findByText('Conteúdo protegido');fireEvent.click(screen.getByText('Sair do painel'));await screen.findByRole('button',{name:'Entrar no painel'});expect(m.sair).toHaveBeenCalledOnce();
    await act(async()=>{m.auth.currentUser={uid:'adm',isAnonymous:false};m.listener(m.auth.currentUser);});await screen.findByText('Conteúdo protegido');fireEvent(window,new Event('admin:sessao-invalida'));expect(screen.queryByText('Conteúdo protegido')).toBeNull();await screen.findByRole('alert');
  });
  it('ignora resposta atrasada de uma sessão anterior',async()=>{
    let resolver;m.auth.currentUser={uid:'adm',isAnonymous:false};m.admin.sessao.mockImplementationOnce(()=>new Promise(r=>{resolver=r;})).mockRejectedValueOnce(new Error('Acesso negado'));
    render(<AdminGate><Conteudo/></AdminGate>);await waitFor(()=>expect(m.admin.sessao).toHaveBeenCalled());await act(async()=>{m.auth.currentUser={uid:'cliente',isAnonymous:false};await m.listener(m.auth.currentUser);});await act(async()=>resolver(sessao));expect(screen.queryByText('Conteúdo protegido')).toBeNull();
  });
});
describe('operações do painel',()=>{
  it('dashboard apresenta valores da API e distingue pagamentos de pedidos',async()=>{
    m.admin.dashboard.mockResolvedValue({pedidos:3,porStatus:{recebido:1,entregue:1,cancelado:1},valorPedidos:90,valorPagamentosConfirmados:30,produtos:{disponiveis:2,indisponiveis:1},recentes:[]});render(<Dashboard/>);
    await waitFor(()=>expect(screen.getByText('Pagamentos confirmados').closest('.admin-revenue').textContent).toContain(moeda(30)));expect(screen.getByText('Valor dos pedidos').closest('.admin-summary-item').textContent).toContain(moeda(90));expect(screen.queryByText('Valor demonstrativo')).toBeNull();
  });
  it('desativar produto persiste e refaz consulta sem reload',async()=>{
    let ativo=true;m.admin.listar.mockImplementation(async nome=>({itens:nome==='categorias'?[cat]:[{...produto,ativo}],proximoCursor:null}));m.admin.salvar.mockImplementation(async(nome,id,body)=>{ativo=body.ativo;return {...produto,ativo};});
    render(<Produtos/>);await screen.findByText('Produto real');fireEvent.click(screen.getByText('Desativar'));await screen.findByText('Ativar');expect(m.admin.salvar).toHaveBeenCalledWith('produtos','produto',{ativo:false});expect(screen.getByText('Indisponível')).toBeTruthy();
  });
  it('cria produto com campos reconhecidos e permite edição após salvar',async()=>{
    m.admin.salvar.mockImplementation(async(nome,id,body)=>({...body,id:'novo'}));render(<ProdutoForm/>);await screen.findByRole('option',{name:'Categoria real'});
    fireEvent.change(screen.getByLabelText('Nome do produto'),{target:{value:'Novo real'}});fireEvent.change(screen.getByLabelText('Preço'),{target:{value:'12.50'}});fireEvent.change(screen.getByLabelText('Categoria'),{target:{value:'cat'}});fireEvent.submit(screen.getByText('Criar produto').closest('form'));
    await screen.findByText('Produto salvo.',{exact:false});expect(m.admin.salvar.mock.calls[0][2].preco).toBe(12.5);expect(m.admin.salvar.mock.calls[0][2].adicionais).toBeUndefined();expect(screen.getByRole('button',{name:'Salvar alterações'})).toBeTruthy();
  });
  it('erro HTTP de produto não simula salvamento',async()=>{
    m.admin.salvar.mockRejectedValue(Object.assign(new Error('Preço inválido.'),{status:400}));render(<ProdutoForm/>);await screen.findByRole('option',{name:'Categoria real'});fireEvent.submit(screen.getByText('Criar produto').closest('form'));await screen.findByRole('alert');expect(screen.queryByText('Produto salvo.',{exact:false})).toBeNull();
  });
  it('categoria criada aparece e exclusão inconsistente apresenta erro',async()=>{
    let categorias=[];m.admin.listar.mockImplementation(async()=>({itens:categorias,proximoCursor:null}));m.admin.salvar.mockImplementation(async(nome,id,body)=>{const nova={...body,id:'nova',ativo:true,produtos:0};categorias=[nova];return nova;});m.admin.excluir.mockRejectedValue(new Error('Categoria possui produtos vinculados.'));vi.spyOn(window,'confirm').mockReturnValue(true);
    render(<Categorias/>);await screen.findByText('Nenhuma categoria cadastrada');fireEvent.click(screen.getByText('+ Nova categoria'));fireEvent.change(screen.getByLabelText('Nome da categoria'),{target:{value:'Categoria criada'}});fireEvent.submit(screen.getByRole('button',{name:'Criar categoria'}).closest('form'));await screen.findByRole('heading',{name:'Categoria criada'});fireEvent.click(screen.getByText('Excluir'));expect((await screen.findByRole('alert')).textContent).toContain('produtos vinculados');expect(screen.getByRole('heading',{name:'Categoria criada'})).toBeTruthy();
  });
  it('confirmação financeira exige ação explícita e atualiza dados',async()=>{
    window.history.replaceState({},'', '/admin/pedido?id=pedido');let status='pendente';m.admin.buscar.mockImplementation(async()=>({id:'pedido',revisaoAdministrativa:0,status:'recebido',tipoEntrega:'retirada',itens:[{nome:'Produto',quantidade:1,subtotal:10}],subtotal:10,total:10,pagamento:{forma:'pix',status},transicoesPagamento:status==='pendente'?['confirmado','recusado']:[],transicoesStatus:['pagamento_confirmado','cancelado']}));m.admin.pagamento.mockImplementation(async()=>{status='confirmado';return {};});
    render(<PedidoDetalhes/>);await screen.findByText('Confirmar pagamento');fireEvent.click(screen.getByText('Confirmar pagamento'));expect(m.admin.pagamento).not.toHaveBeenCalled();fireEvent.click(screen.getByText('Confirmar alteração financeira'));await screen.findByText('Registro manual do estabelecimento atualizado. Não comprova liquidação bancária.');expect(m.admin.pagamento).toHaveBeenCalledWith('pedido','confirmado',0);expect(screen.getByText('confirmado')).toBeTruthy();
  });
  it('configurações exibem dados reais e persistem entrega/pagamentos/horários',async()=>{
    const dados={nome:'Loja real',whatsapp:'11999999999',entrega:{habilitada:true,taxa:5},retirada:{habilitada:true},pagamentos:{pix:true,dinheiro:false,cartao_credito:false,cartao_debito:true},horarios:{segunda:{fechado:false,abertura:'10:00',fechamento:'22:00'}},endereco:{rua:'Rua real',complemento:'Sala 1',cep:'01001000'}};
    m.admin.loja.mockResolvedValue(dados);m.admin.configurar.mockImplementation(async body=>({...dados,...body}));render(<Configuracoes/>);await waitFor(()=>expect(screen.getByLabelText('Nome da loja').value).toBe('Loja real'));
    fireEvent.change(screen.getByLabelText('Taxa de entrega'),{target:{value:'8,50'}});fireEvent.click(screen.getByText('Salvar configurações'));await screen.findByText('✓ Alterações salvas');const body=m.admin.configurar.mock.calls[0][0];expect(body.entrega.taxa).toBe(8.5);expect(body.pagamentos.cartao_debito).toBe(true);expect(body.horarios.segunda.abertura).toBe('10:00');expect(body.endereco.complemento).toBe('Sala 1');
  });
  it('clientes convidados usam dados autorizados sem indicadores fictícios',async()=>{
    m.admin.listar.mockResolvedValue({itens:[{id:'guest',nome:'Visitante real',telefone:'11999999999',anonimo:true}],proximoCursor:null});m.admin.buscar.mockResolvedValue({id:'guest',nome:'Visitante real',telefone:'11999999999',anonimo:true});render(<Clientes/>);await screen.findByText('Visitante real');expect(screen.getByText('Convidado')).toBeTruthy();fireEvent.click(screen.getByText('Ver cliente'));await screen.findByRole('dialog',{name:'Dados do cliente'});expect(screen.queryByText('R$ 428,70')).toBeNull();
  });
});

it('resposta de configuração depois do logout não reabre o painel',async()=>{
  let atualizar;m.auth.currentUser={uid:'adm',isAnonymous:false};m.sair.mockImplementation(async()=>{m.auth.currentUser=null;m.listener(null);});
  function Painel(){const sessao=useAdminSessao();atualizar=sessao.atualizarLoja;return <button onClick={sessao.sair}>Sair com gravação pendente</button>;}
  render(<AdminGate><Painel/></AdminGate>);await screen.findByText('Sair com gravação pendente');fireEvent.click(screen.getByText('Sair com gravação pendente'));await screen.findByText('Entrar no painel');await act(async()=>atualizar({id:'loja-demo',nome:'Atualização atrasada'}));expect(screen.queryByText('Sair com gravação pendente')).toBeNull();
});
it('revalidar ao voltar à janela preserva formulário de sessão autorizada',async()=>{
  m.auth.currentUser={uid:'adm',isAnonymous:false};function Painel(){return <input aria-label="Rascunho"/>;}
  render(<AdminGate><Painel/></AdminGate>);await screen.findByLabelText('Rascunho');fireEvent.change(screen.getByLabelText('Rascunho'),{target:{value:'Edição em andamento'}});fireEvent(window,new Event('focus'));await waitFor(()=>expect(m.admin.sessao).toHaveBeenCalledTimes(2));expect(screen.getByLabelText('Rascunho').value).toBe('Edição em andamento');
});
