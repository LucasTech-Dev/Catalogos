import React from 'react';
import {it,expect,vi,beforeEach,afterEach} from 'vitest';
import {render,screen,fireEvent,waitFor,cleanup,act} from '@testing-library/react';
const mocks=vi.hoisted(()=>({api:vi.fn()}));
vi.mock('../../../frontend/src/services/api',()=>({api:mocks.api,lojaId:'loja-A',publico:'/publico/lojas/loja-A'}));
vi.mock('../../../frontend/src/services/catalogo',()=>({carregarCatalogo:()=>mocks.api('/publico/lojas/loja-A/catalogo',{privado:false})}));
import {LojaProvider,useLoja} from '../../../frontend/src/contexts/LojaContext';
import Cardapio from '../../../frontend/src/pages/Cardapio';
import Produto from '../../../frontend/src/pages/Produto';
const produto={id:'burger',nome:'Burger real',preco:20,ativo:true,disponivel:true,categoriaId:'cat'};
const catalogo={loja:{nome:'Loja A'},categorias:[{id:'cat',nome:'Lanches'},{id:'bebidas',nome:'Bebidas'}],produtos:[produto,{id:'suco',nome:'Suco real',preco:8,ativo:true,categoriaId:'bebidas'}]};
function Estado(){const c=useLoja();return <><output>{JSON.stringify({produtos:c.produtos.map(p=>({id:p.id,preco:p.preco})),itens:c.itens.map(p=>({id:p.id,quantidade:p.quantidade,ativo:p.ativo})),subtotal:c.subtotal,erro:c.erro})}</output><button onClick={()=>c.adicionar(c.produtos[0])}>Adicionar</button><button onClick={()=>c.alterarQuantidade('burger',99)}>Máximo</button><button onClick={()=>c.alterarQuantidade('burger',100)}>Excesso</button><button onClick={()=>c.removerItem('burger')}>Remover</button><button onClick={c.limpar}>Limpar</button></>;}
const dados=()=>JSON.parse(screen.getByRole('status').textContent);
beforeEach(()=>{vi.resetAllMocks();localStorage.clear();mocks.api.mockResolvedValue(catalogo);history.replaceState({},'', '/');});afterEach(cleanup);
it('Etapa24: resposta antiga não sobrescreve catálogo atualizado',async()=>{
  let antiga,nova;mocks.api.mockImplementationOnce(()=>new Promise(r=>{antiga=r;})).mockImplementationOnce(()=>new Promise(r=>{nova=r;}));
  render(<LojaProvider><Estado/></LojaProvider>);await waitFor(()=>expect(antiga).toBeTypeOf('function'));fireEvent(window,new Event('focus'));await waitFor(()=>expect(nova).toBeTypeOf('function'));
  await act(async()=>nova({...catalogo,produtos:[{...produto,preco:33}]}));expect(dados().subtotal).toBe(0);expect(dados().produtos[0].preco).toBe(33);
  await act(async()=>antiga(catalogo));expect(dados().produtos[0].preco).toBe(33);
});
it('Etapa24: cache com null e duplicatas preserva apenas itens válidos',async()=>{
  localStorage.setItem('catalogos:carrinho:loja-A',JSON.stringify([null,{id:'burger',quantidade:1},{id:'burger',quantidade:1},{id:'suco',quantidade:0},{id:'suco',quantidade:100},{id:'../privado',quantidade:1}]));
  render(<LojaProvider><Estado/></LojaProvider>);await waitFor(()=>expect(dados().produtos).toHaveLength(2));expect(dados().itens).toEqual([{id:'burger',quantidade:1,ativo:true}]);
});
it('Etapa24: carrinho da outra loja não é carregado',async()=>{
  localStorage.setItem('catalogos:carrinho:loja-B',JSON.stringify([{id:'burger',quantidade:99}]));render(<LojaProvider><Estado/></LojaProvider>);await waitFor(()=>expect(dados().produtos).toHaveLength(2));expect(dados().itens).toEqual([]);expect(JSON.parse(localStorage.getItem('catalogos:carrinho:loja-B'))[0].quantidade).toBe(99);
});
it('Etapa24: quantidades máximas, remover e limpar permanecem consistentes',async()=>{
  render(<LojaProvider><Estado/></LojaProvider>);await waitFor(()=>expect(dados().produtos).toHaveLength(2));fireEvent.click(screen.getByText('Adicionar'));fireEvent.click(screen.getByText('Máximo'));fireEvent.click(screen.getByText('Excesso'));expect(dados().itens[0].quantidade).toBe(99);fireEvent.click(screen.getByText('Remover'));expect(dados().itens).toEqual([]);fireEvent.click(screen.getByText('Adicionar'));fireEvent.click(screen.getByText('Limpar'));expect(dados().subtotal).toBe(0);
});
it('Etapa24: catálogo vazio e filtros exibem estado correto',async()=>{
  render(<LojaProvider><Cardapio/></LojaProvider>);await screen.findByText('Burger real');fireEvent.click(screen.getByText('Bebidas'));expect(screen.queryByText('Burger real')).toBeNull();expect(screen.getByText('Suco real')).toBeTruthy();
});
it('Etapa24: catálogo sem produtos informa vazio',async()=>{
  mocks.api.mockResolvedValue({...catalogo,produtos:[]});render(<LojaProvider><Cardapio/></LojaProvider>);await screen.findByText(/Nada nesta categoria/);expect(mocks.api).toHaveBeenCalled();
});
it('Etapa24: falha pública permite retry explícito',async()=>{
  mocks.api.mockRejectedValueOnce(new Error('Rede indisponível')).mockResolvedValueOnce(catalogo);render(<LojaProvider><Cardapio/></LojaProvider>);await screen.findByRole('alert');fireEvent.click(screen.getByText('Tentar novamente'));await screen.findByText('Burger real');
});
it('Etapa24: URL de detalhe seleciona produto correto',async()=>{
  history.replaceState({},'', '/produto?id=suco');render(<LojaProvider><Produto/></LojaProvider>);await screen.findByRole('heading',{name:'Suco real'});expect(screen.queryByRole('heading',{name:'Burger real'})).toBeNull();
});
it('Etapa24: produto desativado ao recarregar permanece impedido no carrinho',async()=>{
  localStorage.setItem('catalogos:carrinho:loja-A',JSON.stringify([{id:'burger',quantidade:1}]));mocks.api.mockResolvedValue({...catalogo,produtos:[]});render(<LojaProvider><Estado/></LojaProvider>);await waitFor(()=>expect(dados().itens[0].ativo).toBeUndefined());expect(dados().subtotal).toBe(0);
});
