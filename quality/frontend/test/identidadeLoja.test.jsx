import React, {useEffect} from 'react';
import {it,expect,afterEach,vi} from 'vitest';
import {render,screen,cleanup,fireEvent} from '@testing-library/react';
import {personalizarLoja,tokensIdentidade,aplicarIdentidade,imagemPublica} from '../../../frontend/src/lib/identidadeLoja';
import {criarCarrinhoSessao} from '../../../frontend/src/lib/carrinhoSessao';
const dados=vi.hoisted(()=>({loja:null}));
vi.mock('../../../frontend/src/contexts/LojaContext',()=>({useLoja:()=>({loja:dados.loja,categorias:[],produtos:[]}),EstadoCatalogo:()=>null,CatalogoPronto:({children})=>children}));
import Home from '../../../frontend/src/pages/Home';
const mapa=JSON.stringify({a:{nome:'Cozinha Aurora',logo:'/a.svg',imagem:'/a.jpg',imagemSobre:'/sobre-a.jpg',corPrimaria:'#125b45',tituloInicio:'Comida da Aurora',descricao:'Receitas A'},b:{nome:'Cantina Boreal',logo:'/b.svg',imagem:'/b.jpg',corPrimaria:'#f5d34e',tituloInicio:'Receitas Boreal',descricao:'Receitas B'}});
afterEach(()=>{cleanup();localStorage.clear();});
it('mesmas páginas mudam entre duas lojas sem herdar imagens, marca ou metadados',()=>{
 const titulo=document.title;
 function Vitrine({id}){const loja=personalizarLoja({},id,mapa);dados.loja=loja;useEffect(()=>aplicarIdentidade(loja),[id]);return <Home/>;}
 const {rerender,unmount}=render(<Vitrine id="a"/>);
 expect(screen.getByRole('heading',{level:1}).textContent).toBe('Comida da Aurora');
 expect(document.title).toContain('Cozinha Aurora');
 expect(document.querySelector('link[rel="icon"]').getAttribute('href')).toBe('/a.svg');
 expect(screen.getAllByRole('img')[0].getAttribute('src')).toBe('/a.jpg');
 rerender(<Vitrine id="b"/>);
 expect(screen.getByRole('heading',{level:1}).textContent).toBe('Receitas Boreal');
 expect(screen.queryByText('Comida da Aurora')).toBeNull();
 expect(document.title).toContain('Cantina Boreal');
 expect(document.head.innerHTML).not.toContain('/a.svg');
 expect(document.documentElement.style.getPropertyValue('--primary')).toBe('#f5d34e');
 fireEvent.error(screen.getAllByRole('img')[0]);
 expect(screen.getAllByRole('img')[0].getAttribute('data-image-fallback')).toBe('true');
 unmount();expect(document.title).toBe(titulo);
 expect(document.documentElement.style.getPropertyValue('--primary')).toBe('');
});
it('configuração visual não altera loja, dados comerciais ou permissões',()=>{
 const original={id:'a',nome:'Original',whatsapp:'123',pedidoMinimo:10,entrega:{taxa:5}};
 const alterado=personalizarLoja(original,'a',JSON.stringify({a:{id:'b',nome:'Marca A',whatsapp:'999',pedidoMinimo:0,entrega:{taxa:0},admin:true}}));
 expect(alterado).toMatchObject({...original,nome:'Marca A'});expect(alterado.admin).toBeUndefined();expect(original.nome).toBe('Original');
 expect(personalizarLoja({},'desconhecida',mapa).nome).toBeUndefined();
});
it.each(['javascript:alert(1)','data:image/svg+xml,x','//outro.example/a','https://user:pass@example.com/a'])('rejeita URL de imagem insegura %s',url=>expect(imagemPublica(url)).toBe(''));
it('rejeita configuração inválida e aceita apenas cores hex completas',()=>{
 expect(()=>personalizarLoja({},'a','{')).toThrow('JSON inválido');
 expect(()=>personalizarLoja({},'a','[]')).toThrow('mapa inválido');
 expect(tokensIdentidade('red')).toEqual(tokensIdentidade());
 expect(tokensIdentidade('#ffffff')['--on-primary']).toBe('#171717');
 expect(tokensIdentidade('#000000')['--on-primary']).toBe('#ffffff');
});
it('mesmo navegador mantém carrinho separado entre lojas e contas',()=>{
 const a=criarCarrinhoSessao(localStorage,'a'),b=criarCarrinhoSessao(localStorage,'b');
 const user={uid:'cliente',isAnonymous:false};a.trocar(user);a.alterar(user,()=>[{id:'p',quantidade:2,observacao:'Sem cebola'}]);
 expect(b.trocar(user)).toEqual([]);
 expect(criarCarrinhoSessao(localStorage,'a').trocar(user)[0].observacao).toBe('Sem cebola');
 expect(a.trocar({uid:'outro',isAnonymous:false})).toEqual([]);
});
