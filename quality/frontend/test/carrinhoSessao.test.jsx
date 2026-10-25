import React from 'react';
import {it,expect,vi,beforeEach,afterEach} from 'vitest';
import {render,screen,fireEvent,act,cleanup} from '@testing-library/react';
import {criarCarrinhoSessao} from '../../../frontend/src/lib/carrinhoSessao';
import {alterarCarrinho,carregarCarrinho,compraDoCarrinho} from '../../../frontend/src/lib/compras';
const m=vi.hoisted(()=>({auth:{currentUser:null},listeners:new Set(),catalogo:vi.fn()}));
vi.mock('../../../frontend/src/lib/firebase',()=>({auth:m.auth}));
vi.mock('firebase/auth',()=>({onIdTokenChanged:(_,cb)=>{m.listeners.add(cb);return ()=>m.listeners.delete(cb);}}));
vi.mock('../../../frontend/src/services/api',()=>({lojaId:'A',publico:'/A'}));
vi.mock('../../../frontend/src/services/catalogo',()=>({carregarCatalogo:m.catalogo}));
import {LojaProvider,useLoja} from '../../../frontend/src/contexts/LojaContext';
const a={uid:'A',isAnonymous:false},b={uid:'B',isAnonymous:false},anon={uid:'anon',isAnonymous:true};
const item={id:'burger',quantidade:2};
const criar=loja=>criarCarrinhoSessao(localStorage,loja||'A');
const adicionar=(c,u=null,obs)=>c.alterar(u,itens=>alterarCarrinho(itens,'burger',2,obs));
beforeEach(()=>{localStorage.clear();m.auth.currentUser=null;m.listeners.clear();m.catalogo.mockResolvedValue({loja:{nome:'A'},categorias:[],produtos:[{id:'burger',nome:'Burger',preco:20,ativo:true}]});});
afterEach(cleanup);
it('visitante adiciona, navega e recarrega sem autenticar nem armazenar preços',()=>{const c=criar();c.trocar(null);adicionar(c);expect(criar().trocar(null)).toEqual([item]);});
it.each(['google.com','password'])('login %s preserva visitante uma única vez e não soma cache antigo',providerId=>{
 const c=criar();adicionar(c);const user={...a,providerData:[{providerId}]};expect(c.trocar(user)).toEqual([item]);expect(c.trocar(user)).toEqual([item]);expect(criar().trocar(user)).toEqual([item]);
 expect(c.trocar(null)).toEqual([]);adicionar(c);expect(c.trocar(user)).toEqual([item]);
});
it('logout limpa visitante; B não herda A; A recupera somente seu próprio carrinho',()=>{
 const c=criar();adicionar(c);c.trocar(a);expect(c.trocar(null)).toEqual([]);expect(criar().trocar(null)).toEqual([]);expect(c.trocar(b)).toEqual([]);expect(c.trocar(a)).toEqual([item]);
});
it('troca direta A para B e recarga de B não exibem A',()=>{const c=criar();adicionar(c,a,'sem cebola');expect(c.trocar(b)).toEqual([]);expect(criar().trocar(b)).toEqual([]);});
it('sessão anônima, vinculação com mesmo UID e login com UID diferente preservam a própria compra',()=>{
 const c=criar();adicionar(c);expect(c.trocar(anon)).toEqual([item]);expect(criar().trocar(anon)).toEqual([item]);expect(c.trocar({...anon,isAnonymous:false})).toEqual([item]);
 const d=criar('B');adicionar(d,anon);expect(d.trocar(a)).toEqual([item]);
});
it('outra sessão anônima não herda a sessão anterior',()=>{const c=criar();adicionar(c,anon,'nota privada');expect(c.trocar({uid:'outro',isAnonymous:true})).toEqual([]);});
it('lojas diferentes isolam visitante e conta',()=>{adicionar(criar('A'));adicionar(criar('A'),a);expect(criar('B').trocar(null)).toEqual([]);expect(criar('B').trocar(a)).toEqual([]);});
it('cache legado sem dono permanece intacto e não é atribuído a visitante nem conta',()=>{
 const key='catalogos:carrinho:A';localStorage.setItem(key,JSON.stringify([item]));expect(criar().trocar(null)).toEqual([]);expect(criar().trocar(b)).toEqual([]);expect(JSON.parse(localStorage.getItem(key))).toEqual([item]);
});
it('observações distintas persistem, são transferidas sem duplicação e não chegam a B',()=>{
 const c=criar();adicionar(c,null,'sem cebola');adicionar(c,null,'com cebola');const itens=c.trocar(a);expect(itens).toHaveLength(2);expect(criar().trocar(a)).toEqual(itens);expect(c.trocar(a)).toEqual(itens);
 const compra=compraDoCarrinho(itens.map(i=>({...i,nome:'Burger'})),'Retirar');expect(compra.itens[0].quantidade).toBe(4);expect(compra.observacao).toBe('Retirar\n2x Burger: sem cebola\n2x Burger: com cebola');expect(c.trocar(b)).toEqual([]);
});
it('storage bloqueado mantém compra em memória e isola logout',()=>{const c=criarCarrinhoSessao({getItem(){throw Error('bloqueado');},setItem(){throw Error('bloqueado');}},'A');expect(adicionar(c,a)).toEqual([item]);expect(c.trocar(null)).toEqual([]);});
it('cache corrompido e observações inválidas são rejeitados',()=>{expect(carregarCarrinho('[null]')).toEqual([]);expect(carregarCarrinho(JSON.stringify([{...item,observacao:42}]))).toEqual([]);});
function Controle(){const c=useLoja();return <><output data-testid="carrinho">{JSON.stringify(c.itens)}</output><button onClick={()=>c.adicionar(c.produtos[0],1,'sem cebola')}>Adicionar</button><button onClick={c.limpar}>Limpar</button></>;}
async function sessao(user){await act(async()=>{m.auth.currentUser=user;for(const cb of m.listeners)cb(user);});}
it('Provider acompanha Auth, preserva visitante, esconde logout e troca A/B na mesma página',async()=>{
 const view=render(<LojaProvider><Controle/></LojaProvider>);await sessao(null);fireEvent.click(screen.getByText('Adicionar'));expect(screen.getByTestId('carrinho').textContent).toContain('sem cebola');
 await sessao(a);expect(screen.getByTestId('carrinho').textContent).toContain('sem cebola');await sessao(null);expect(screen.getByTestId('carrinho').textContent).toBe('[]');await sessao(b);expect(screen.getByTestId('carrinho').textContent).toBe('[]');
 await sessao(a);expect(screen.getByTestId('carrinho').textContent).toContain('sem cebola');view.unmount();render(<LojaProvider><Controle/></LojaProvider>);expect(screen.getByTestId('carrinho').textContent).toBe('[]');await sessao(a);expect(screen.getByTestId('carrinho').textContent).toContain('sem cebola');fireEvent.click(screen.getByText('Limpar'));expect(criar().trocar(a)).toEqual([]);
});
it('ação atrasada da sessão anterior não altera B nem recria notas no visitante',()=>{
 const c=criar();adicionar(c,a,'privada');let executou=false;
 expect(c.alterar(b,()=>{executou=true;return [{...item,observacao:'privada'}];})).toEqual([]);expect(executou).toBe(false);
 c.trocar(a);expect(c.alterar(null,()=>[{...item,observacao:'privada'}])).toEqual([]);
});
it('storage bloqueado ainda transfere visitante em memória no login',()=>{
 const c=criarCarrinhoSessao({getItem(){throw Error('bloqueado');},setItem(){throw Error('bloqueado');}},'A');adicionar(c);expect(c.trocar(a)).toEqual([item]);
});
