import React from 'react';
import {it,expect,vi,beforeEach,afterEach} from 'vitest';
import {render,screen,act,cleanup,fireEvent} from '@testing-library/react';
const m=vi.hoisted(()=>({api:vi.fn(),sessao:vi.fn(),auth:{currentUser:null},trocar:null,itens:[]}));
vi.mock('../../../frontend/src/lib/firebase',()=>({auth:m.auth,sessao:m.sessao}));
vi.mock('../../../frontend/src/services/api',()=>({api:m.api,lojaId:'loja',publico:'/publico/lojas/loja',pedidos:'/lojas/loja/pedidos'}));
vi.mock('../../../frontend/src/services/conta',()=>({buscarPerfil:()=>Promise.resolve({}),listarEnderecos:()=>Promise.resolve([]),salvarEndereco:vi.fn()}));
vi.mock('../../../frontend/src/services/pedidosConta',()=>({criarPedido:(body,o)=>m.api('/lojas/loja/pedidos',{method:'POST',body,chave:o.chave}),buscarPedido:vi.fn(),recuperarPedido:vi.fn(),finalizarPedido:vi.fn()}));
vi.mock('firebase/auth',()=>({onIdTokenChanged:vi.fn((auth,callback)=>{m.trocar=callback;return ()=>{};})}));
vi.mock('../../../frontend/src/contexts/LojaContext',()=>({EstadoCatalogo:()=>null,useLoja:()=>({loja:{entrega:{habilitada:false,taxa:0},retirada:{habilitada:true},pagamentos:{pix:true}},itens:m.itens,subtotal:20,limpar:vi.fn()})}));
import Checkout from '../../../frontend/src/pages/Checkout';
import {useRecurso} from '../../../frontend/src/hooks/useRecurso';
import {salvarTentativa,carregarTentativa,limparDadosDeOutraSessao} from '../../../frontend/src/lib/tentativaCheckout';
import {validarFirebaseWeb} from '../../../frontend/src/lib/firebaseAmbiente';
function Perfil({ler='/me'}){const {dados,carregando}=useRecurso(ler);return <output>{carregando?'carregando':dados?.nome || 'vazio'}</output>;}
beforeEach(()=>{localStorage.clear();sessionStorage.clear();vi.clearAllMocks();m.itens=[{id:'produto',nome:'Produto',preco:20,quantidade:1,ativo:true}];});afterEach(cleanup);
it('descarta resposta privada atrasada e limpa perfil ao trocar UID',async()=>{
  let resolver;m.api.mockImplementationOnce(()=>new Promise(r=>{resolver=r;})).mockResolvedValueOnce({nome:'Cliente B'});
  render(<Perfil/>);await act(async()=>m.trocar({uid:'A'}));await act(async()=>m.trocar({uid:'B'}));
  expect(screen.getByRole('status').textContent).toBe('Cliente B');await act(async()=>resolver({nome:'Cliente A privado'}));expect(screen.getByRole('status').textContent).toBe('Cliente B');
});
it('mantém apenas nonce e referência no armazenamento permanente',()=>{
  const key='catalogos:checkout:loja:A',t={uid:'A',chave:'nonce',dados:{cliente:{nome:'Nome privado',telefone:'11999999999'}},endereco:{rua:'Rua privada'},pedido:{id:'pedido',total:20}};
  salvarTentativa(key,t);expect(JSON.parse(localStorage.getItem(key))).toEqual({uid:'A',chave:'nonce',pedidoId:'pedido'});expect(carregarTentativa(key,'A').dados.cliente.nome).toBe('Nome privado');
  limparDadosDeOutraSessao('B','loja');expect(sessionStorage.getItem(key)).toBeNull();expect(carregarTentativa(key,'A')).toEqual({uid:'A',chave:'nonce',pedidoId:'pedido'});expect(()=>carregarTentativa(key,'B')).toThrow();
});
it('remove dados pessoais de tentativas legadas após logout',()=>{
  const key='catalogos:checkout:loja:A';localStorage.setItem(key,JSON.stringify({uid:'A',chave:'nonce',dados:{telefone:'privado'},endereco:{rua:'privada'}}));
  limparDadosDeOutraSessao(null,'loja');expect(localStorage.getItem(key)).not.toContain('privad');expect(sessionStorage.getItem(key)).toBeNull();
});
it('bloqueia configurações Web de emulação misturadas com projeto real',()=>{
  for(const env of [{VITE_FIREBASE_PROJECT_ID:'real',VITE_FIREBASE_AUTH_EMULATOR_URL:'http://localhost:9099'},{VITE_FIREBASE_PROJECT_ID:'demo-teste'},{VITE_FIREBASE_PROJECT_ID:'demo-teste',VITE_FIREBASE_AUTH_EMULATOR_URL:'https://externo.test'}])expect(()=>validarFirebaseWeb(env)).toThrow();
  expect(validarFirebaseWeb({VITE_FIREBASE_PROJECT_ID:'demo-teste',VITE_FIREBASE_AUTH_EMULATOR_URL:'http://localhost:9099'})).toBe('http://localhost:9099');
});

it('troca de UID durante checkout descarta pedido atrasado e cache privado',async()=>{
  let resolver;m.auth.currentUser={uid:'A'};m.sessao.mockResolvedValue({uid:'A'});m.api.mockImplementation((path,o)=>o?.method==='POST'?new Promise(r=>{resolver=r;}):Promise.resolve(path.endsWith('/me')?{}:[]));
  render(<Checkout/>);await act(async()=>m.trocar({uid:'A'}));fireEvent.change(screen.getByLabelText('Nome'),{target:{value:'Cliente A privado'}});fireEvent.change(screen.getByLabelText('WhatsApp'),{target:{value:'11999999999'}});
  await act(async()=>fireEvent.click(screen.getByText('Registrar pedido e preparar WhatsApp')));expect(resolver).toBeTypeOf('function');
  m.auth.currentUser={uid:'B'};await act(async()=>m.trocar({uid:'B'}));await act(async()=>resolver({id:'pedido-privado-A',total:20,pagamento:{status:'pendente'}}));
  expect(screen.queryByText(/Total definitivo/)).toBeNull();expect(screen.getByLabelText('Nome').value).toBe('');expect(sessionStorage.getItem('catalogos:checkout:loja:A')).toBeNull();expect(localStorage.getItem('catalogos:checkout:loja:A')).not.toContain('Cliente A privado');
});

it('serviço SDK descarta leitura atrasada após troca de sessão',async()=>{
  let resolver;const ler=vi.fn().mockImplementationOnce(()=>new Promise(r=>{resolver=r;})).mockResolvedValueOnce({nome:'Conta B SDK'});
  render(<Perfil ler={ler}/>);await act(async()=>m.trocar({uid:'A'}));await act(async()=>m.trocar({uid:'B'}));
  expect(screen.getByRole('status').textContent).toBe('Conta B SDK');await act(async()=>resolver({nome:'Conta A privada'}));
  expect(screen.getByRole('status').textContent).toBe('Conta B SDK');expect(m.api).not.toHaveBeenCalled();
});

it('troca de conta durante preparo do WhatsApp não mantém botão ocupado nem confirmação anterior',async()=>{
 m.itens=[];const {buscarPedido,finalizarPedido}=await import('../../../frontend/src/services/pedidosConta');let liberar;
 m.auth.currentUser={uid:'A'};m.sessao.mockResolvedValue({uid:'A'});localStorage.setItem('catalogos:checkout:loja:A',JSON.stringify({uid:'A',chave:'nonce-persistido',pedidoId:'pedido-A'}));
 buscarPedido.mockResolvedValue({id:'pedido-A',numeroPedido:11,total:20,tipoEntrega:'retirada',pagamento:{forma:'pix',status:'pendente'}});finalizarPedido.mockImplementation(()=>new Promise(r=>{liberar=r;}));
 render(<Checkout/>);await act(async()=>m.trocar({uid:'A'}));expect(screen.getByRole('button',{name:'Preparando WhatsApp...'}).disabled).toBe(true);
 m.auth.currentUser={uid:'B'};m.sessao.mockResolvedValue({uid:'B'});await act(async()=>m.trocar({uid:'B'}));expect(screen.queryByText('#11')).toBeNull();expect(screen.getByText('Registrar pedido e preparar WhatsApp').disabled).toBe(false);
 await act(async()=>liberar({url:'https://wa.me/5551995310123?text=conta-anterior'}));expect(screen.queryByRole('link',{name:'Abrir WhatsApp'})).toBeNull();expect(screen.getByLabelText('Nome').value).toBe('');
});
