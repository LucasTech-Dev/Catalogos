import React from 'react';
import {describe,it,expect,vi,beforeEach,afterEach} from 'vitest';
import {render,screen,fireEvent,waitFor,cleanup} from '@testing-library/react';
const mocks=vi.hoisted(()=>({api:vi.fn(),sessao:vi.fn(),entrar:vi.fn(),cadastrar:vi.fn()}));
vi.mock('../src/services/api',()=>({api:mocks.api,lojaId:'loja-demo',publico:'/publico/lojas/loja-demo',pedidos:'/lojas/loja-demo/pedidos'}));
vi.mock('../src/lib/firebase',()=>({auth:null,sessao:mocks.sessao}));
vi.mock('../src/services/conta',()=>({entrar:mocks.entrar,cadastrar:mocks.cadastrar,recuperar:vi.fn()}));
import {LojaProvider,useLoja} from '../src/contexts/LojaContext';
import Checkout from '../src/pages/Checkout';
import Login from '../src/pages/Login';
import Cadastro from '../src/pages/Cadastro';
import {quantidadeValida,urlWhatsapp} from '../src/lib/compras';
const produto={id:'burger',nome:'Burger real',preco:20,ativo:true,categoriaId:'cat'};
const catalogo={loja:{nome:'Loja real',entrega:{habilitada:true,taxa:7},retirada:{habilitada:true},pagamentos:{pix:true,dinheiro:true,cartao_credito:true,cartao_debito:true}},categorias:[{id:'cat',nome:'Burgers'}],produtos:[produto]};
const pedido={id:'pedido-real',total:27,pagamento:{status:'pendente'}};
function Controle() {const {itens,produtos,adicionar,alterarQuantidade,removerItem,subtotal}=useLoja();return <><button onClick={()=>adicionar(produtos[0])}>Adicionar real</button><button onClick={()=>alterarQuantidade('burger',0)}>Zero</button><button onClick={()=>alterarQuantidade('burger',2)}>Dois</button><button onClick={()=>removerItem('burger')}>Remover</button><output>{itens.length}:{subtotal}</output></>;}
beforeEach(()=>{localStorage.clear();vi.clearAllMocks();mocks.sessao.mockResolvedValue({uid:'uid-real'});mocks.api.mockImplementation(async(path,options)=>{if(path.endsWith('/catalogo'))return catalogo;if(path.endsWith('/me'))return {};if(path.endsWith('/enderecos'))return options?.method === 'POST' ? {id:'end-real'} : [];if(options?.method==='POST')return pedido;return {url:'https://wa.me/5511999999999?text=real'};});});
afterEach(cleanup);
function carrinho(){localStorage.setItem('catalogos:carrinho:loja-demo',JSON.stringify([{id:'burger',quantidade:1}]));}
async function preencher(){await screen.findByText('1x Burger real');for(const [label,value] of [['Nome','Cliente'],['WhatsApp','11999999999'],['Endereço','Rua Real'],['Número','10'],['Bairro','Centro'],['Cidade','São Paulo'],['UF','SP']])fireEvent.change(screen.getByLabelText(label),{target:{value}});}
describe('carrinho real',()=>{
  it('mantém consistência, rejeita quantidade inválida e persiste na navegação',async()=>{
    const view=render(<LojaProvider><Controle/></LojaProvider>);await waitFor(()=>expect(mocks.api).toHaveBeenCalled());await waitFor(()=>{fireEvent.click(screen.getByText('Adicionar real'));expect(screen.getByRole('status').textContent).toBe('1:20');});
    fireEvent.click(screen.getByText('Zero'));expect(screen.getByRole('status').textContent).toBe('1:20');fireEvent.click(screen.getByText('Dois'));expect(screen.getByRole('status').textContent).toBe('1:40');
    view.unmount();render(<LojaProvider><Controle/></LojaProvider>);await waitFor(()=>expect(screen.getByRole('status').textContent).toBe('1:40'));fireEvent.click(screen.getByText('Remover'));expect(screen.getByRole('status').textContent).toBe('0:0');
  });
  it('não adiciona produto indisponível',async()=>{mocks.api.mockResolvedValue({...catalogo,produtos:[{...produto,ativo:false}]});render(<LojaProvider><Controle/></LojaProvider>);await waitFor(()=>expect(mocks.api).toHaveBeenCalled());fireEvent.click(screen.getByText('Adicionar real'));expect(screen.getByRole('status').textContent).toBe('0:0');});
});
describe('checkout persistido',()=>{
  it('envia IDs e quantidades, evita cliques rápidos e usa URL real sem confirmar pagamento',async()=>{
    carrinho();render(<LojaProvider><Checkout/></LojaProvider>);await preencher();const botao=screen.getByText('Registrar pedido e preparar WhatsApp');fireEvent.click(botao);fireEvent.click(botao);
    const link=await screen.findByRole('link',{name:'Abrir WhatsApp'});expect(link.href).toBe('https://wa.me/5511999999999?text=real');
    const criacoes=mocks.api.mock.calls.filter(([,o])=>o?.chave);expect(criacoes).toHaveLength(1);expect(criacoes[0][1].body.itens).toEqual([{produtoId:'burger',quantidade:1}]);expect(criacoes[0][1].body.pagamento).toEqual({forma:'pix'});expect(criacoes[0][1].body.taxaEntrega).toBeUndefined();expect(screen.getByText(/Total definitivo/).textContent).toContain('pendente');
  });
  it('reutiliza a mesma chave e corpo após falha de rede',async()=>{
    let tentativas=0;mocks.api.mockImplementation(async(path,options)=>{if(path.endsWith('/catalogo'))return catalogo;if(path.endsWith('/me'))return {};if(path.endsWith('/enderecos'))return options?.method === 'POST' ? {id:'end-real'} : [];if(options?.chave){if(++tentativas===1)throw new Error('Falha de conexão');return pedido;}return {url:'https://wa.me/5511999999999?text=real'};});
    carrinho();render(<LojaProvider><Checkout/></LojaProvider>);await preencher();fireEvent.click(screen.getByText('Registrar pedido e preparar WhatsApp'));await screen.findByRole('alert');fireEvent.click(screen.getByText('Registrar pedido e preparar WhatsApp'));await screen.findByRole('link',{name:'Abrir WhatsApp'});
    const calls=mocks.api.mock.calls.filter(([,o])=>o?.chave);expect(calls).toHaveLength(2);expect(calls[0][1].chave).toBe(calls[1][1].chave);expect(calls[0][1].body).toEqual(calls[1][1].body);
  });
  it('falha no WhatsApp repete apenas a consulta do pedido já criado',async()=>{
    let links=0;mocks.api.mockImplementation(async(path,options)=>{if(path.endsWith('/catalogo'))return catalogo;if(path.endsWith('/me'))return {};if(path.endsWith('/enderecos'))return options?.method === 'POST' ? {id:'end-real'} : [];if(options?.chave)return pedido;if(++links===1)throw new Error('WhatsApp indisponível');return {url:'https://wa.me/5511999999999?text=real'};});
    carrinho();render(<LojaProvider><Checkout/></LojaProvider>);await preencher();fireEvent.click(screen.getByText('Registrar pedido e preparar WhatsApp'));await screen.findByRole('alert');fireEvent.click(screen.getByText('Registrar pedido e preparar WhatsApp'));await screen.findByRole('link',{name:'Abrir WhatsApp'});expect(mocks.api.mock.calls.filter(([,o])=>o?.chave)).toHaveLength(1);
  });
  it('rejeita carrinho vazio e URL de domínio malicioso',async()=>{
    render(<LojaProvider><Checkout/></LojaProvider>);fireEvent.click(screen.getByText('Registrar pedido e preparar WhatsApp'));await screen.findByRole('alert');expect(mocks.api.mock.calls.filter(([,o])=>o?.chave)).toHaveLength(0);
    for(const url of ['http://wa.me/5511999999999','https://wa.me.evil.com/5511999999999','https://usuario@wa.me/5511999999999','https://wa.me:444/5511999999999','javascript:alert(1)'])expect(()=>urlWhatsapp(url)).toThrow();
    expect(quantidadeValida(1.5)).toBe(false);expect(quantidadeValida(100)).toBe(false);
  });
});
describe('formulários de conta',()=>{
  it('apresenta erro de login sem simular sucesso',async()=>{mocks.entrar.mockRejectedValue(new Error('E-mail ou senha inválidos.'));render(<Login/>);fireEvent.change(screen.getByLabelText('E-mail'),{target:{value:'teste@local.com'}});fireEvent.change(screen.getByLabelText('Senha'),{target:{value:'senha'}});fireEvent.submit(screen.getByRole('button',{name:'Entrar'}).closest('form'));expect((await screen.findByRole('alert')).textContent).toBe('E-mail ou senha inválidos.');expect(mocks.entrar).toHaveBeenCalledWith('teste@local.com','senha');});
  it('não cadastra com senhas diferentes',async()=>{render(<Cadastro/>);fireEvent.change(screen.getByLabelText('Senha'),{target:{value:'senha123'}});fireEvent.change(screen.getByLabelText('Confirmar senha'),{target:{value:'outra123'}});fireEvent.submit(screen.getByRole('button',{name:'Criar minha conta'}).closest('form'));await screen.findByRole('alert');expect(mocks.cadastrar).not.toHaveBeenCalled();});
});
it('retoma marcador de outra aba sem reenviar pedido nem persistir dados pessoais',async()=>{
  localStorage.setItem('catalogos:checkout:loja-demo:uid-real',JSON.stringify({uid:'uid-real',chave:'nonce-persistido',pedidoId:'pedido-real'}));
  mocks.api.mockImplementation(async(path,o)=>{if(path.endsWith('/catalogo'))return catalogo;if(path.endsWith('/me'))return {};if(path.endsWith('/enderecos'))return [];if(path.includes('/finalizacao/'))return pedido;return {url:'https://wa.me/5511999999999?text=real'};});
  render(<LojaProvider><Checkout/></LojaProvider>);await screen.findByText(/Carrinho vazio/).catch(()=>{});fireEvent.click(screen.getByText('Registrar pedido e preparar WhatsApp'));await screen.findByRole('link',{name:'Abrir WhatsApp'});
  expect(mocks.api.mock.calls.filter(([,o])=>o?.method==='POST')).toHaveLength(0);expect(JSON.parse(localStorage.getItem('catalogos:checkout:loja-demo:uid-real'))).toEqual({uid:'uid-real',chave:'nonce-persistido',pedidoId:'pedido-real'});
});
