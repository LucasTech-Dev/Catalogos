import React from 'react';
import {it,expect,vi,afterEach} from 'vitest';
import {render,screen,cleanup} from '@testing-library/react';
import {ingredientesDoTexto} from '../../../frontend/src/lib/ingredientes';
const m=vi.hoisted(()=>({ingredientes:[]}));
vi.mock('../../../frontend/src/contexts/LojaContext',()=>({useLoja:()=>({produtos:[{id:'produto',nome:'Produto',preco:10,ativo:true,ingredientes:m.ingredientes}],adicionar:()=>{},carregando:false}),CatalogoPronto:({children})=>children,EstadoCatalogo:()=>null}));
import Produto from '../../../frontend/src/pages/Produto';
afterEach(()=>{cleanup();m.ingredientes=[];});
it('transforma linhas em ingredientes sem dividir nomes que contêm vírgula',()=>{
 expect(ingredientesDoTexto(' Batata\r\n\n Óleo vegetal, mistura \n Sal ')).toEqual(['Batata','Óleo vegetal, mistura','Sal']);
 expect(ingredientesDoTexto(' \n ')).toEqual([]);
});
it('respeita limites do contrato e impede listas excessivas antes de salvar',()=>{
 expect(ingredientesDoTexto(Array(50).fill('a'.repeat(200)).join('\n'))).toHaveLength(50);
 expect(()=>ingredientesDoTexto(Array(51).fill('Sal').join('\n'))).toThrow('50');
 expect(()=>ingredientesDoTexto('a'.repeat(201))).toThrow('200');
});
it('mostra cada ingrediente cadastrado na seção do produto',()=>{
 history.replaceState({},'', '/produto?id=produto');m.ingredientes=['Batata','Óleo vegetal','Sal'];render(<Produto/>);
 expect(screen.getByRole('list',{name:'Ingredientes do produto'}).querySelectorAll('li')).toHaveLength(3);
 for(const nome of m.ingredientes)expect(screen.getByText(nome)).toBeTruthy();
 expect(screen.queryByText(/Ingredientes não informados/)).toBeNull();
});
it('informa ausência de dados e não inventa ingredientes',()=>{
 history.replaceState({},'', '/produto?id=produto');render(<Produto/>);
 expect(screen.getByText('Ingredientes não informados pelo estabelecimento.')).toBeTruthy();
 expect(screen.queryByRole('list',{name:'Ingredientes do produto'})).toBeNull();
});
