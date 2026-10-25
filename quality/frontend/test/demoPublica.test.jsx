import React from 'react';
import {it,expect,vi,beforeEach,afterEach} from 'vitest';
import {render,screen,fireEvent,cleanup} from '@testing-library/react';
import DemoPublica from '../../../frontend/src/pages/DemoPublica';
import {modoDemo} from '../../../frontend/src/lib/runtimeDemo';
import {configuracaoAplicacao} from '../../../frontend/src/lib/ambienteAplicacao';
const sdk=vi.hoisted(()=>({initializeApp:vi.fn(),getAuth:vi.fn(),signInAnonymously:vi.fn(),onIdTokenChanged:vi.fn(),connectAuthEmulator:vi.fn()}));
vi.mock('firebase/app',()=>({initializeApp:sdk.initializeApp}));
vi.mock('firebase/auth',()=>({getAuth:sdk.getAuth,signInAnonymously:sdk.signInAnonymously,onIdTokenChanged:sdk.onIdTokenChanged,connectAuthEmulator:sdk.connectAuthEmulator}));
const env={VITE_CATALOGOS_RUNTIME_MODE:'public-readonly-demo',VITE_CATALOGOS_DEMO_LOJA_ID:'loja-demo',VITE_APP_ENV:'homologacao',VITE_API_URL:'https://api.example.com',VITE_FIREBASE_PROJECT_ID:'bancorestaurante',VITE_FIREBASE_EXPECTED_PROJECT_ID:'bancorestaurante',VITE_FIREBASE_HOMOLOG_PROJECT_ID:'bancorestaurante',VITE_FIREBASE_EXISTING_DEMO_PROJECT_ID:'bancorestaurante',VITE_LOJA_ID:'loja-demo'};
const catalogo={loja:{id:'loja-demo',nome:'Loja pública'},categorias:[{id:'c',nome:'Refeições'},{id:'b',nome:'Bebidas'}],produtos:[{id:'p',nome:'Prato teste',descricao:'Comida',preco:20,categoriaId:'c',disponivel:true},{id:'s',nome:'Suco',preco:5,categoriaId:'b',disponivel:true}]};
beforeEach(()=>{vi.resetModules();vi.clearAllMocks();for(const [k,v] of Object.entries(env))vi.stubEnv(k,v);vi.stubEnv('VITE_FIREBASE_AUTH_EMULATOR_URL','');history.replaceState({},'','/cardapio');vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,json:async()=>catalogo}));});
afterEach(()=>{cleanup();vi.unstubAllEnvs();vi.unstubAllGlobals();});
it('configuração exige loja/projeto/mode explícitos e preserva modo completo',()=>{
 expect(modoDemo(env)).toBe(true);expect(modoDemo({})).toBe(false);
 expect(configuracaoAplicacao(env).lojaId).toBe('loja-demo');
 for(const patch of [{VITE_CATALOGOS_RUNTIME_MODE:''},{VITE_CATALOGOS_RUNTIME_MODE:'typo'},{VITE_CATALOGOS_DEMO_LOJA_ID:''},{VITE_CATALOGOS_DEMO_LOJA_ID:'outra'},{VITE_APP_ENV:'production'},{VITE_FIREBASE_PROJECT_ID:'outro'},{VITE_FIREBASE_AUTH_EMULATOR_URL:'http://localhost:9099'},{VITE_LOJA_ID:'outra'},{VITE_LOJAS_POR_HOST:'{"localhost":"loja-demo","outra.example":"outra"}'}])expect(()=>configuracaoAplicacao({...env,...patch})).toThrow();
});
it('catálogo e filtro funcionam sem carrinho, pedido ou sessão',async()=>{
 render(<DemoPublica/>);await screen.findByText('Prato teste');expect(screen.getByText('Checkout indisponível. Esta prévia não registra pedidos.')).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:'Bebidas'}));expect(screen.queryByText('Prato teste')).toBeNull();expect(screen.getByText('Suco')).toBeTruthy();
 expect(fetch).toHaveBeenCalledTimes(1);expect(fetch.mock.calls[0][0]).toBe('https://api.example.com/publico/lojas/loja-demo/catalogo');expect(fetch.mock.calls[0][1].method).toBe('GET');expect(fetch.mock.calls[0][1].credentials).toBe('omit');
 expect(sdk.initializeApp).not.toHaveBeenCalled();expect(sdk.signInAnonymously).not.toHaveBeenCalled();
 expect(screen.queryByRole('button',{name:/finalizar|adicionar/i})).toBeNull();
});
it.each(['/checkout','/admin','/login','/cadastro','/perfil','/carrinho'])('rota privada %s não busca dados nem aparenta concluir pedido',async path=>{
 history.replaceState({},'',path);render(<DemoPublica/>);expect(screen.getByText('Nenhum pedido foi criado.')).toBeTruthy();expect(fetch).not.toHaveBeenCalled();
});
it('SDK Web permanece desligado mesmo com configuração pública de Auth presente',async()=>{
 vi.stubEnv('VITE_FIREBASE_API_KEY','publica-ficticia');vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN','bancorestaurante.firebaseapp.com');vi.stubEnv('VITE_FIREBASE_APP_ID','app-ficticio');
 const m=await import('../../../frontend/src/lib/firebase');expect(m.auth).toBeNull();expect(m.firebaseConfigurado).toBe(false);await expect(m.sessao()).rejects.toThrow();
 for(const fn of Object.values(sdk))expect(fn).not.toHaveBeenCalled();
});
it('cliente API defensivo bloqueia mutações/privado antes de fetch e Auth',async()=>{
 const {api}=await import('../../../frontend/src/services/api');
 for(const [path,opts] of [['/lojas/loja-demo/pedidos',{method:'POST'}],['/admin/lojas/loja-demo/sessao',{}],['/publico/lojas/loja-demo/catalogo',{}]])await expect(api(path,opts)).rejects.toMatchObject({status:403,code:'DEMO_READONLY'});
 expect(fetch).not.toHaveBeenCalled();expect(sdk.getAuth).not.toHaveBeenCalled();
});
it('falhas mostram mensagem segura e retry somente de leitura',async()=>{
 fetch.mockRejectedValueOnce(new Error('segredo-sentinela'));render(<DemoPublica/>);await screen.findByRole('alert');expect(screen.queryByText(/segredo-sentinela/)).toBeNull();
 fireEvent.click(screen.getByText('Tentar novamente'));await screen.findByText('Prato teste');expect(fetch).toHaveBeenCalledTimes(2);
});
