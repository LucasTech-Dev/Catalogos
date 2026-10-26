import React from 'react';
import {describe,it,expect,vi,beforeEach,afterEach} from 'vitest';
import {render,screen,fireEvent,waitFor,cleanup} from '@testing-library/react';
const mocks=vi.hoisted(()=>({api:vi.fn(),sessao:vi.fn(),entrar:vi.fn(),cadastrar:vi.fn(),buscarPerfil:vi.fn(),listarEnderecos:vi.fn(),salvarEndereco:vi.fn()}));
vi.mock('../../../frontend/src/services/api',()=>({api:mocks.api,lojaId:'loja-demo',publico:'/publico/lojas/loja-demo',pedidos:'/lojas/loja-demo/pedidos'}));
vi.mock('../../../frontend/src/services/catalogo',()=>({carregarCatalogo:()=>mocks.api('/publico/lojas/loja-demo/catalogo',{privado:false})}));
vi.mock('../../../frontend/src/lib/firebase',()=>({auth:null,sessao:mocks.sessao}));
vi.mock('../../../frontend/src/services/conta',()=>({entrar:mocks.entrar,cadastrar:mocks.cadastrar,recuperar:vi.fn(),buscarPerfil:mocks.buscarPerfil,listarEnderecos:mocks.listarEnderecos,salvarEndereco:mocks.salvarEndereco}));
vi.mock('../../../frontend/src/services/pedidosConta',()=>({criarPedido:(body,o)=>mocks.api('/lojas/loja-demo/pedidos',{method:'POST',body,chave:o.chave,expectedUid:o.expectedUid}),buscarPedido:id=>mocks.api('/lojas/loja-demo/pedidos/'+id),recuperarPedido:chave=>mocks.api('/lojas/loja-demo/pedidos/finalizacao/'+chave),finalizarPedido:id=>mocks.api('/lojas/loja-demo/pedidos/'+id+'/whatsapp')}));
import {LojaProvider,useLoja} from '../../../frontend/src/contexts/LojaContext';
import Checkout from '../../../frontend/src/pages/Checkout';
import Login from '../../../frontend/src/pages/Login';
import Cadastro from '../../../frontend/src/pages/Cadastro';
import {quantidadeValida,urlWhatsapp} from '../../../frontend/src/lib/compras';
const produto={id:'burger',nome:'Burger real',preco:20,ativo:true,categoriaId:'cat'};
const catalogo={loja:{nome:'Loja real',entrega:{habilitada:true,taxa:7},retirada:{habilitada:true},pagamentos:{pix:true,dinheiro:true,cartao_credito:true,cartao_debito:true}},categorias:[{id:'cat',nome:'Burgers'}],produtos:[produto]};
const pedido={id:'pedido-real',numeroPedido:1025,total:27,pagamento:{forma:'pix',status:'pendente'},tipoEntrega:'entrega'};
function Controle() {const {itens,produtos,adicionar,alterarQuantidade,removerItem,subtotal}=useLoja();return <><button onClick={()=>adicionar(produtos[0])}>Adicionar real</button><button onClick={()=>alterarQuantidade('burger',0)}>Zero</button><button onClick={()=>alterarQuantidade('burger',2)}>Dois</button><button onClick={()=>removerItem('burger')}>Remover</button><output>{itens.length}:{subtotal}</output></>;}
beforeEach(()=>{localStorage.clear();vi.clearAllMocks();mocks.buscarPerfil.mockResolvedValue({});mocks.listarEnderecos.mockResolvedValue([]);mocks.salvarEndereco.mockResolvedValue({id:'end-real'});mocks.sessao.mockResolvedValue({uid:'uid-real'});mocks.api.mockImplementation(async(path,options)=>{if(path.endsWith('/catalogo'))return catalogo;if(path.endsWith('/me'))return {};if(path.endsWith('/enderecos'))return options?.method === 'POST' ? {id:'end-real'} : [];if(options?.method==='POST')return pedido;return {url:'https://wa.me/5511999999999?text=real'};});});
afterEach(cleanup);
function carrinho(){localStorage.setItem('catalogos:carrinho:v2:loja-demo:visitante',JSON.stringify({dono:'visitante',itens:[{id:'burger',quantidade:1}]}));}
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
    const criacoes=mocks.api.mock.calls.filter(([,o])=>o?.chave);expect(criacoes).toHaveLength(1);expect(criacoes[0][1].expectedUid).toBe('uid-real');expect(criacoes[0][1].body.itens).toEqual([{produtoId:'burger',quantidade:1}]);expect(criacoes[0][1].body.pagamento).toEqual({forma:'pix'});expect(criacoes[0][1].body.taxaEntrega).toBeUndefined();expect(screen.getByText('Pendente')).toBeTruthy();expect(screen.getByText('#1025')).toBeTruthy();expect(screen.queryByText('Registrar pedido e preparar WhatsApp')).toBeNull();expect(screen.queryByLabelText('Nome')).toBeNull();
  });
  it('reutiliza a mesma chave e corpo após falha de rede',async()=>{
    let tentativas=0;mocks.api.mockImplementation(async(path,options)=>{if(path.endsWith('/catalogo'))return catalogo;if(path.endsWith('/me'))return {};if(path.endsWith('/enderecos'))return options?.method === 'POST' ? {id:'end-real'} : [];if(options?.chave){if(++tentativas===1)throw new Error('Falha de conexão');return pedido;}return {url:'https://wa.me/5511999999999?text=real'};});
    carrinho();render(<LojaProvider><Checkout/></LojaProvider>);await preencher();fireEvent.click(screen.getByText('Registrar pedido e preparar WhatsApp'));await screen.findByRole('alert');fireEvent.click(screen.getByText('Registrar pedido e preparar WhatsApp'));await screen.findByRole('link',{name:'Abrir WhatsApp'});
    const calls=mocks.api.mock.calls.filter(([,o])=>o?.chave);expect(calls).toHaveLength(2);expect(calls[0][1].chave).toBe(calls[1][1].chave);expect(calls[0][1].body).toEqual(calls[1][1].body);
  });
  it('falha no WhatsApp repete apenas a consulta do pedido já criado',async()=>{
    let links=0;mocks.api.mockImplementation(async(path,options)=>{if(path.endsWith('/catalogo'))return catalogo;if(path.endsWith('/me'))return {};if(path.endsWith('/enderecos'))return options?.method === 'POST' ? {id:'end-real'} : [];if(path.endsWith('/pedido-real'))return pedido;if(options?.chave)return pedido;if(++links===1)throw new Error('WhatsApp indisponível');return {url:'https://wa.me/5511999999999?text=real'};});
    carrinho();render(<LojaProvider><Checkout/></LojaProvider>);await preencher();fireEvent.click(screen.getByText('Registrar pedido e preparar WhatsApp'));await screen.findByRole('alert');expect(screen.queryByText('Registrar pedido e preparar WhatsApp')).toBeNull();fireEvent.click(screen.getByText('Preparar WhatsApp novamente'));await screen.findByRole('link',{name:'Abrir WhatsApp'});expect(mocks.api.mock.calls.filter(([,o])=>o?.chave)).toHaveLength(1);
  });
  it('rejeita carrinho vazio e URL de domínio malicioso',async()=>{
    render(<LojaProvider><Checkout/></LojaProvider>);expect(screen.getByText('Carregando...')).toBeTruthy();expect(screen.queryByText('Registrar pedido e preparar WhatsApp')).toBeNull();await screen.findByText('Registrar pedido e preparar WhatsApp');expect(screen.getByText('Registrar pedido e preparar WhatsApp').disabled).toBe(false);fireEvent.click(screen.getByText('Registrar pedido e preparar WhatsApp'));await screen.findByRole('alert');expect(mocks.api.mock.calls.filter(([,o])=>o?.chave)).toHaveLength(0);
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
  mocks.api.mockImplementation(async(path,o)=>{if(path.endsWith('/catalogo'))return catalogo;if(path.endsWith('/me'))return {};if(path.endsWith('/enderecos'))return [];if(path.includes('/finalizacao/') || path.endsWith('/pedido-real'))return pedido;return {url:'https://wa.me/5511999999999?text=real'};});
  render(<LojaProvider><Checkout/></LojaProvider>);await screen.findByRole('heading',{name:'Pedido registrado com sucesso!'});expect(screen.queryByText('Registrar pedido e preparar WhatsApp')).toBeNull();await screen.findByRole('link',{name:'Abrir WhatsApp'});
  expect(mocks.api.mock.calls.filter(([,o])=>o?.method==='POST')).toHaveLength(0);expect(JSON.parse(localStorage.getItem('catalogos:checkout:loja-demo:uid-real'))).toEqual({uid:'uid-real',chave:'nonce-persistido',pedidoId:'pedido-real'});
});

it.each([503,409])('Etapa 23: checkout HTTP %s preserva carrinho e nonce para repetição manual',async status=>{
  let tentativas=0;mocks.api.mockImplementation(async(path,options)=>{if(path.endsWith('/catalogo'))return catalogo;if(path.endsWith('/me'))return {};if(path.endsWith('/enderecos'))return options?.method==='POST'?{id:'end-real'}:[];if(options?.chave){if(++tentativas===1)throw Object.assign(new Error('Falha temporária ou conflito.'),{status});return pedido;}return {url:'https://wa.me/5511999999999?text=real'};});
  carrinho();render(<LojaProvider><Checkout/></LojaProvider>);await preencher();fireEvent.click(screen.getByText('Registrar pedido e preparar WhatsApp'));await screen.findByRole('alert');
  expect(JSON.parse(localStorage.getItem('catalogos:carrinho:v2:loja-demo:visitante')).itens).toHaveLength(1);
  expect(JSON.parse(localStorage.getItem('catalogos:checkout:loja-demo:uid-real')).chave).toBeTruthy();
  expect(mocks.api.mock.calls.filter(([,o])=>o?.chave)).toHaveLength(1);
  fireEvent.click(screen.getByText('Registrar pedido e preparar WhatsApp'));await screen.findByRole('link',{name:'Abrir WhatsApp'});
  const calls=mocks.api.mock.calls.filter(([,o])=>o?.chave);expect(calls).toHaveLength(2);expect(calls[1][1].chave).toBe(calls[0][1].chave);expect(calls[1][1].body).toEqual(calls[0][1].body);
});

it('finaliza variantes com observações sem duplicar produto, usando UID atual e sem preço do cache',async()=>{
  localStorage.setItem('catalogos:carrinho:v2:loja-demo:visitante',JSON.stringify({dono:'visitante',itens:[{id:'burger',quantidade:1,observacao:'sem cebola',preco:0.01},{id:'burger',quantidade:2,observacao:'com cebola',preco:0.01}]}));
  render(<LojaProvider><Checkout/></LojaProvider>);await preencher();fireEvent.click(screen.getByText('Registrar pedido e preparar WhatsApp'));await screen.findByRole('link',{name:'Abrir WhatsApp'});
  const [,o]=mocks.api.mock.calls.find(([,o])=>o?.chave);expect(o.expectedUid).toBe('uid-real');expect(o.body.itens).toEqual([{produtoId:'burger',quantidade:3}]);expect(o.body.observacao).toBe('1x Burger real: sem cebola\n2x Burger real: com cebola');expect(o.body.itens[0].preco).toBeUndefined();
});

it('recarregar sucesso restaura confirmação do servidor sem novo registro',async()=>{
 carrinho();const view=render(<LojaProvider><Checkout/></LojaProvider>);await preencher();fireEvent.click(screen.getByText('Registrar pedido e preparar WhatsApp'));await screen.findByRole('link',{name:'Abrir WhatsApp'});view.unmount();
 mocks.api.mockImplementation(async(path,o)=>path.endsWith('/catalogo')?catalogo:path.endsWith('/pedido-real')?pedido:{url:'https://wa.me/5511999999999?text=real'});
 render(<LojaProvider><Checkout/></LojaProvider>);await screen.findByRole('heading',{name:'Pedido registrado com sucesso!'});expect(screen.getByText('#1025')).toBeTruthy();expect(screen.queryByText('Registrar pedido e preparar WhatsApp')).toBeNull();expect(mocks.api.mock.calls.filter(([,o])=>o?.method==='POST')).toHaveLength(1);
});
it('recarregar após resposta perdida recupera a mesma tentativa sem reenviar',async()=>{
 carrinho();let perdeu=false;mocks.api.mockImplementation(async(path,o)=>{if(path.endsWith('/catalogo'))return catalogo;if(path.includes('/finalizacao/'))return pedido;if(o?.method==='POST'){perdeu=true;throw Error('Resposta perdida');}return path.endsWith('/enderecos')?[]:{};});
 const view=render(<LojaProvider><Checkout/></LojaProvider>);await preencher();fireEvent.click(screen.getByText('Registrar pedido e preparar WhatsApp'));await screen.findByRole('alert');expect(perdeu).toBe(true);const marker=localStorage.getItem('catalogos:checkout:loja-demo:uid-real');view.unmount();sessionStorage.clear();
 mocks.api.mockImplementation(async path=>path.endsWith('/catalogo')?catalogo:path.includes('/finalizacao/')?pedido:{url:'https://wa.me/5511999999999?text=real'});
 render(<LojaProvider><Checkout/></LojaProvider>);await screen.findByRole('heading',{name:'Pedido registrado com sucesso!'});expect(screen.queryByText('Registrar pedido e preparar WhatsApp')).toBeNull();expect(mocks.api.mock.calls.filter(([,o])=>o?.method==='POST')).toHaveLength(1);expect(JSON.parse(localStorage.getItem('catalogos:checkout:loja-demo:uid-real'))).toEqual({...JSON.parse(marker),pedidoId:pedido.id});expect(localStorage.getItem('catalogos:checkout:loja-demo:uid-real')).not.toContain('telefone');
});

it('UF explica o estado, normaliza sigla e preserva ao alternar modalidade',async()=>{
 carrinho();render(<LojaProvider><Checkout/></LojaProvider>);await preencher();const uf=screen.getByLabelText('UF');expect(uf.placeholder).toBe('Ex.: RS');expect(screen.getByText('(Estado — ex.: RS)')).toBeTruthy();fireEvent.change(uf,{target:{value:'rs'}});expect(uf.value).toBe('RS');fireEvent.click(screen.getByText('Retirada').closest('button'));expect(screen.queryByLabelText('UF')).toBeNull();fireEvent.click(screen.getByRole('button',{name:/^Entrega/}));expect(screen.getByLabelText('UF').value).toBe('RS');
});
it('UF inválida impede gravação e oferece orientação no campo',async()=>{
 carrinho();render(<LojaProvider><Checkout/></LojaProvider>);await preencher();fireEvent.change(screen.getByLabelText('UF'),{target:{value:'xx'}});fireEvent.click(screen.getByText('Registrar pedido e preparar WhatsApp'));await screen.findByRole('alert');expect(mocks.api.mock.calls.filter(([,o])=>o?.method==='POST')).toHaveLength(0);expect(screen.getByLabelText('UF').getAttribute('aria-invalid')).toBe('true');expect(screen.getByText('Informe uma sigla de estado válida, como RS.')).toBeTruthy();
});
it('retomada da confirmação bloqueia preparação duplicada enquanto a consulta está pendente',async()=>{
 localStorage.setItem('catalogos:checkout:loja-demo:uid-real',JSON.stringify({uid:'uid-real',chave:'nonce-persistido',pedidoId:'pedido-real'}));let resolver;
 mocks.api.mockImplementation(async path=>{if(path.endsWith('/pedido-real'))return pedido;if(path.endsWith('/catalogo'))return catalogo;if(path.endsWith('/whatsapp'))return new Promise(r=>{resolver=r;});return [];});
 render(<LojaProvider><Checkout/></LojaProvider>);await screen.findByRole('heading',{name:'Pedido registrado com sucesso!'});const botao=screen.getByRole('button',{name:'Preparando WhatsApp...'});expect(botao.disabled).toBe(true);fireEvent.click(botao);expect(mocks.api.mock.calls.filter(([p])=>p.endsWith('/whatsapp'))).toHaveLength(1);resolver({url:'https://wa.me/5511999999999?text=real'});await screen.findByRole('link',{name:'Abrir WhatsApp'});expect(screen.queryByText('Registrar pedido e preparar WhatsApp')).toBeNull();
});

it('nova compra com carrinho descarta somente marcador de pedido já confirmado',async()=>{
 carrinho();localStorage.setItem('catalogos:checkout:loja-demo:uid-real',JSON.stringify({uid:'uid-real',chave:'compra-anterior',pedidoId:'anterior'}));
 mocks.api.mockImplementation(async(path,o)=>{if(path.endsWith('/catalogo'))return catalogo;if(path.endsWith('/anterior'))return {...pedido,id:'anterior',numeroPedido:1024};if(o?.method==='POST')return pedido;if(path.endsWith('/whatsapp'))return {url:'https://wa.me/5511999999999?text=novo'};return [];});
 render(<LojaProvider><Checkout/></LojaProvider>);await preencher();expect(screen.queryByText('#1024')).toBeNull();fireEvent.click(screen.getByText('Registrar pedido e preparar WhatsApp'));await screen.findByText('#1025');
 const criacoes=mocks.api.mock.calls.filter(([,o])=>o?.method==='POST');expect(criacoes).toHaveLength(1);expect(criacoes[0][1].chave).not.toBe('compra-anterior');expect(criacoes[0][1].body.pagamento).toEqual({forma:'pix'});
});
