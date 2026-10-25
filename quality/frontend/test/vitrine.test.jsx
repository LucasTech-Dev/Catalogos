import React from 'react';
import {it,expect,vi,afterEach} from 'vitest';
import {render,screen,fireEvent,cleanup} from '@testing-library/react';
import {adaptarCatalogoDemo} from '../../../frontend/src/services/catalogoDemo';
import {configuracaoAplicacao} from '../../../frontend/src/lib/ambienteAplicacao';
import App from '../../../frontend/src/App';
import dto from '../../fixtures/contratos-originais/data/catalogo-publico.json';
const mocks=vi.hoisted(()=>({api:vi.fn()}));
vi.mock('../../../frontend/src/services/api',()=>({api:mocks.api,lojaId:'loja-demo',publico:'/publico/lojas/loja-demo'}));
const env={VITE_APP_ENV:'homologacao',VITE_CATALOGOS_RUNTIME_MODE:'original-readonly-demo',VITE_CATALOGOS_DEMO_LOJA_ID:'loja-demo',VITE_LOJA_ID:'loja-demo',VITE_API_URL:'https://catalogos-api-homolog.onrender.com'};
function preparar(path){for(const [k,v] of Object.entries(env))vi.stubEnv(k,v);for(const k of Object.keys(import.meta.env))if(k.startsWith('VITE_FIREBASE_'))vi.stubEnv(k,'');history.replaceState({},'',path);localStorage.clear();mocks.api.mockResolvedValue({...dto,produtos:dto.produtos.map(({ativo,...p})=>p)});}
afterEach(()=>{cleanup();vi.unstubAllEnvs();vi.clearAllMocks();});
it('adapta DTO real sem ativo, preserva preço e indisponibilidade e rejeita resposta incorreta',()=>{
 const catalogo=adaptarCatalogoDemo({...dto,produtos:dto.produtos.map(({ativo,...p})=>p)});
 expect(catalogo.produtos).toHaveLength(6);expect(catalogo.categorias).toHaveLength(3);expect(catalogo.produtos[0]).toMatchObject({ativo:true,preco:20});expect(catalogo.produtos[3].disponivel).toBe(false);
 expect(()=>adaptarCatalogoDemo({...dto,produtos:[{...dto.produtos[0],preco:'20'}]})).toThrow();
 expect(()=>configuracaoAplicacao({...env,VITE_FIREBASE_API_KEY:'proibida'})).toThrow();expect(configuracaoAplicacao(env).base).toBe(env.VITE_API_URL);
});
it('renderiza design original e adiciona detalhe ao carrinho usando DTO HTTP',async()=>{
 preparar('/produto?id=prato-teste');render(<App/>);await screen.findByRole('heading',{name:'Prato da casa'});
 const botao=screen.getAllByRole('button').find(b=>/Adicionar/i.test(b.textContent));expect(botao).toBeTruthy();fireEvent.click(botao);
 expect(JSON.parse(localStorage.getItem('catalogos:carrinho:loja-demo'))).toEqual([{id:'prato-teste',quantidade:1}]);
});
it.each(['/checkout','/admin','/admin/produtos','/login','/cadastro','/perfil'])('bloqueia %s antes de montar funcionalidades completas',path=>{
 preparar(path);render(<App/>);expect(screen.getByRole('heading',{name:'Recurso indisponível nesta demonstração'})).toBeTruthy();expect(mocks.api).not.toHaveBeenCalled();
});
it('carrinho mantém checkout desabilitado',async()=>{
 preparar('/carrinho');localStorage.setItem('catalogos:carrinho:loja-demo',JSON.stringify([{id:'prato-teste',quantidade:2}]));render(<App/>);await screen.findByText('Prato da casa');expect(screen.getByRole('button',{name:'Checkout indisponível na demonstração'}).disabled).toBe(true);
});

it.each(['/produto?id=prato-teste','/cardapio'])('MVP-01: %s distingue carga, falha recuperável e ausência de dados',async path=>{
 preparar(path);
 let rejeitar;
 mocks.api.mockImplementationOnce(()=>new Promise((_,reject)=>{rejeitar=reject;}));
 render(<App/>);
 expect(screen.getByText('Carregando...')).toBeTruthy();
 expect(screen.queryByText('Produto não encontrado.')).toBeNull();
 expect(screen.queryByText(/Nada nesta categoria/)).toBeNull();
 rejeitar(new Error('Serviço temporariamente indisponível. Tente novamente.'));
 await screen.findByRole('alert');
 expect(screen.queryByText('Produto não encontrado.')).toBeNull();
 expect(screen.queryByText(/Nada nesta categoria/)).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'Tentar novamente'}));
 await screen.findByText('Prato da casa');
 expect(screen.queryByRole('alert')).toBeNull();
 expect(mocks.api).toHaveBeenCalledWith('/publico/lojas/loja-demo/catalogo',{privado:false});
});

it('MVP-01: detalhe já carregado informa falha de atualização e permite tentar novamente',async()=>{
 preparar('/produto?id=prato-teste');render(<App/>);
 await screen.findByRole('heading',{name:'Prato da casa'});
 mocks.api.mockRejectedValueOnce(new Error('Não foi possível conectar. Verifique sua conexão e tente novamente.'));
 fireEvent(window,new Event('focus'));
 await screen.findByRole('alert');
 expect(screen.getByRole('heading',{name:'Prato da casa'})).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:'Tentar novamente'}));
 await vi.waitFor(()=>expect(screen.queryByRole('alert')).toBeNull());
});
