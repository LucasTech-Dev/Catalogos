import React from 'react';
import {it,expect,vi,beforeEach,afterEach} from 'vitest';
import {render,screen,fireEvent,cleanup} from '@testing-library/react';
import DemoFixtures from '../../../frontend/src/pages/DemoFixtures';
import {configuracaoAplicacao} from '../../../frontend/src/lib/ambienteAplicacao';
const env={VITE_APP_ENV:'homologacao',VITE_CATALOGOS_RUNTIME_MODE:'public-fixture-demo',VITE_CATALOGOS_DEMO_LOJA_ID:'loja-demo',VITE_LOJA_ID:'loja-demo',VITE_API_URL:'https://api.example.com'};
const catalogo={loja:{id:'loja-demo',nome:'Restaurante fictício'},categorias:[{id:'refeicoes',nome:'Refeições'},{id:'bebidas',nome:'Bebidas'}],produtos:[{id:'prato-teste',nome:'Prato teste',descricao:'Fictício',preco:20,categoriaId:'refeicoes',disponivel:true},{id:'suco',nome:'Suco',preco:7,categoriaId:'bebidas',disponivel:false}]};
beforeEach(()=>{for(const [k,v] of Object.entries(env))vi.stubEnv(k,v);for(const key of Object.keys(import.meta.env))if(key.startsWith('VITE_FIREBASE_'))vi.stubEnv(key,'');vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,json:async()=>catalogo}));window.scrollTo=vi.fn();history.replaceState({},'','/cardapio');});
afterEach(()=>{cleanup();vi.unstubAllEnvs();vi.unstubAllGlobals();});
it('configuração fixtures rejeita Firebase, outra loja e API insegura sem mudar os guardas anteriores',()=>{
 expect(configuracaoAplicacao(env).lojaId).toBe('loja-demo');
 for(const patch of [{VITE_FIREBASE_PROJECT_ID:'bancorestaurante'},{VITE_FIREBASE_API_KEY:'ficticia'},{VITE_API_URL:'http://api.example.com'},{VITE_API_URL:'https://api.example.com/path'},{VITE_CATALOGOS_DEMO_LOJA_ID:'outra'},{VITE_LOJA_ID:'outra'},{VITE_LOJAS_POR_HOST:'{"localhost":"outra"}'},{VITE_APP_ENV:'production'}])expect(()=>configuracaoAplicacao({...env,...patch})).toThrow();
});
it('catálogo vem da API, filtra categorias e não adiciona produto indisponível',async()=>{
 render(<DemoFixtures/>);await screen.findByText('Prato teste');
 expect(screen.getByRole('button',{name:'Adicionar Suco'}).disabled).toBe(true);
 fireEvent.click(screen.getByRole('button',{name:'Bebidas'}));expect(screen.queryByText('Prato teste')).toBeNull();
 expect(fetch.mock.calls[0][0]).toBe('https://api.example.com/publico/lojas/loja-demo/catalogo');expect(fetch.mock.calls[0][1]).toMatchObject({method:'GET',credentials:'omit'});
});
it('detalhe, carrinho em memória, quantidades, remoção e limite funcionam sem requisições de escrita',async()=>{
 render(<DemoFixtures/>);fireEvent.click(await screen.findByRole('link',{name:'Prato teste'}));expect(screen.getByRole('heading',{level:1,name:'Prato teste'})).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:'Adicionar Prato teste'}));fireEvent.click(screen.getByRole('link',{name:'Carrinho (1)'}));
 expect(screen.getByText(/Total demonstrativo:/).textContent).toMatch(/20,00/);
 fireEvent.click(screen.getByRole('button',{name:'Aumentar Prato teste'}));expect(screen.getByText(/Total demonstrativo:/).textContent).toMatch(/40,00/);
 for(let i=0;i<25;i++)fireEvent.click(screen.getByRole('button',{name:'Aumentar Prato teste'}));expect(screen.getByLabelText('Quantidade de Prato teste').textContent).toBe('20');
 fireEvent.click(screen.getByRole('button',{name:'Diminuir Prato teste'}));expect(screen.getByLabelText('Quantidade de Prato teste').textContent).toBe('19');
 fireEvent.click(screen.getByRole('button',{name:'Remover Prato teste'}));expect(screen.getByText(/Seu carrinho está vazio/)).toBeTruthy();expect(fetch).toHaveBeenCalledTimes(1);
});
it.each(['/login','/admin','/checkout','/cadastro','/perfil'])('rota %s não busca catálogo nem oferece finalização',path=>{
 history.replaceState({},'',path);render(<DemoFixtures/>);expect(screen.getByText(/Nenhum pedido foi criado/)).toBeTruthy();expect(fetch).not.toHaveBeenCalled();
});
it('erro de API mostra falha e retry sem fallback estático',async()=>{
 fetch.mockRejectedValueOnce(Error('detalhe privado'));render(<DemoFixtures/>);await screen.findByRole('alert');expect(screen.queryByText('Prato teste')).toBeNull();expect(screen.queryByText('detalhe privado')).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'Tentar novamente'}));await screen.findByText('Prato teste');
});
