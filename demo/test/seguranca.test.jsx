import React from 'react';
import {it,expect,vi,beforeEach,afterEach} from 'vitest';
import {render,screen,act,cleanup,fireEvent} from '@testing-library/react';
const m=vi.hoisted(()=>({api:vi.fn(),sessao:vi.fn(),auth:{currentUser:null},trocar:null}));
vi.mock('../src/lib/firebase',()=>({auth:m.auth,sessao:m.sessao}));
vi.mock('../src/services/api',()=>({api:m.api,lojaId:'loja',publico:'/publico/lojas/loja',pedidos:'/lojas/loja/pedidos'}));
vi.mock('firebase/auth',()=>({onIdTokenChanged:vi.fn((auth,callback)=>{m.trocar=callback;return ()=>{};})}));
vi.mock('../src/contexts/LojaContext',()=>({EstadoCatalogo:()=>null,useLoja:()=>({loja:{entrega:{habilitada:false,taxa:0},retirada:{habilitada:true},pagamentos:{pix:true}},itens:[{id:'produto',nome:'Produto',preco:20,quantidade:1,ativo:true}],subtotal:20,limpar:vi.fn()})}));
import Checkout from '../src/pages/Checkout';
import {useRecurso} from '../src/hooks/useRecurso';
import {salvarTentativa,carregarTentativa,limparDadosDeOutraSessao} from '../src/lib/tentativaCheckout';
import {validarFirebaseWeb} from '../src/lib/firebaseAmbiente';
function Perfil(){const {dados,carregando}=useRecurso('/me');return <output>{carregando?'carregando':dados?.nome || 'vazio'}</output>;}
beforeEach(()=>{localStorage.clear();sessionStorage.clear();vi.clearAllMocks();});afterEach(cleanup);
it('descarta resposta privada atrasada e limpa perfil ao trocar UID',async()=>{
  let resolver;m.api.mockImplementationOnce(()=>new Promise(r=>{resolver=r;})).mockResolvedValueOnce({nome:'Cliente B'});
  render(<Perfil/>);await act(async()=>m.trocar({uid:'A'}));await act(async()=>m.trocar({uid:'B'}));
  expect(screen.getByRole('status').textContent).toBe('Cliente B');await act(async()=>resolver({nome:'Cliente A privado'}));expect(screen.getByRole('status').textContent).toBe('Cliente B');
});
it('mantém apenas nonce e referência no armazenamento permanente',()=>{
  const key='catalogos:checkout:loja:A',t={uid:'A',chave:'nonce',dados:{cliente:{nome:'Nome privado',telefone:'11999999999'}},endereco:{rua:'Rua privada'},pedido:{id:'pedido',total:20}};
  salvarTentativa(key,t);expect(JSON.parse(localStorage.getItem(key))).toEqual({uid:'A',chave:'nonce',pedidoId:'pedido'});expect(carregarTentativa(key,'A').dados.cliente.nome).toBe('Nome privado');
  limparDadosDeOutraSessao('B');expect(sessionStorage.getItem(key)).toBeNull();expect(carregarTentativa(key,'A')).toEqual({uid:'A',chave:'nonce',pedidoId:'pedido'});expect(()=>carregarTentativa(key,'B')).toThrow();
});
it('remove dados pessoais de tentativas legadas após logout',()=>{
  const key='catalogos:checkout:loja:A';localStorage.setItem(key,JSON.stringify({uid:'A',chave:'nonce',dados:{telefone:'privado'},endereco:{rua:'privada'}}));
  limparDadosDeOutraSessao(null);expect(localStorage.getItem(key)).not.toContain('privad');expect(sessionStorage.getItem(key)).toBeNull();
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
