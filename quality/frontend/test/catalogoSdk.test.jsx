import React from 'react';
import {it,expect,vi,beforeEach,afterEach} from 'vitest';
import {render,screen,fireEvent,cleanup} from '@testing-library/react';
const mocks=vi.hoisted(()=>({api:vi.fn(),carregar:vi.fn()}));
vi.mock('../../../frontend/src/services/api',()=>({api:mocks.api,lojaId:'cliente-b',publico:'/publico/lojas/cliente-b'}));
vi.mock('../../../frontend/src/services/catalogo',()=>({carregarCatalogo:mocks.carregar}));
import {LojaProvider} from '../../../frontend/src/contexts/LojaContext';
import Cardapio from '../../../frontend/src/pages/Cardapio';
import Produto from '../../../frontend/src/pages/Produto';
import {validarFirebaseWeb} from '../../../frontend/src/lib/firebaseAmbiente';
import {configuracaoAplicacao} from '../../../frontend/src/lib/ambienteAplicacao';
const dto={loja:{id:'cliente-b',nome:'Cliente B'},categorias:[{id:'cat',nome:'Refeições'}],produtos:[{id:'prato',nome:'Prato SDK',categoriaId:'cat',preco:23,ativo:true,disponivel:true}]};
beforeEach(()=>{vi.resetAllMocks();localStorage.clear();history.replaceState({},'','/cardapio');mocks.carregar.mockResolvedValue(dto);});
afterEach(cleanup);
it('catálogo completo consulta o serviço da loja selecionada sem chamar HTTP',async()=>{
  render(<LojaProvider><Cardapio/></LojaProvider>);await screen.findByText('Prato SDK');
  expect(mocks.carregar).toHaveBeenCalledWith('cliente-b');expect(mocks.api).not.toHaveBeenCalled();
});
it('detalhe usa o mesmo catálogo SDK sem endpoint adicional',async()=>{
  history.replaceState({},'','/produto?id=prato');render(<LojaProvider><Produto/></LojaProvider>);
  await screen.findByRole('heading',{name:'Prato SDK'});expect(screen.getAllByText('R$ 23,00')).toHaveLength(2);expect(mocks.api).not.toHaveBeenCalled();
});
it('preserva loading, erro e retry do SDK sem sucesso fictício',async()=>{
  let rejeitar;mocks.carregar.mockImplementationOnce(()=>new Promise((_,reject)=>{rejeitar=reject;}));
  render(<LojaProvider><Cardapio/></LojaProvider>);expect(screen.getByText('Carregando...')).toBeTruthy();
  rejeitar(new Error('Catálogo não disponível para leitura pública.'));await screen.findByRole('alert');
  expect(screen.queryByText('Prato SDK')).toBeNull();fireEvent.click(screen.getByText('Tentar novamente'));await screen.findByText('Prato SDK');expect(mocks.api).not.toHaveBeenCalled();
});
it('recusa Firestore Emulator remoto, mistura de projetos e portas inválidas',()=>{
  const local={VITE_FIREBASE_PROJECT_ID:'demo-local',VITE_FIREBASE_AUTH_EMULATOR_URL:'http://localhost:9099',VITE_FIRESTORE_EMULATOR_HOST:'127.0.0.1:8080'};
  expect(validarFirebaseWeb(local)).toBe('http://localhost:9099');
  for(const patch of [{VITE_FIRESTORE_EMULATOR_HOST:'externo.example:8080'},{VITE_FIRESTORE_EMULATOR_HOST:'127.0.0.1:0'},{VITE_FIRESTORE_EMULATOR_HOST:'127.0.0.1:99999'},{VITE_FIREBASE_PROJECT_ID:'bancorestaurante'},{VITE_FIREBASE_AUTH_EMULATOR_URL:''}])expect(()=>validarFirebaseWeb({...local,...patch})).toThrow();
});
it('catálogo externo aceita configuração pública Firebase sem URL de Express',()=>{
  const env={VITE_LOJAS_POR_HOST:'{"localhost":"cliente-b"}',VITE_APP_ENV:'production',VITE_LOJA_ID:'cliente-b',VITE_FIREBASE_API_KEY:'fake-public',VITE_FIREBASE_AUTH_DOMAIN:'public.example',VITE_FIREBASE_PROJECT_ID:'projeto-exemplo',VITE_FIREBASE_EXPECTED_PROJECT_ID:'projeto-exemplo',VITE_FIREBASE_APP_ID:'app-publico'};
  expect(configuracaoAplicacao(env).lojaId).toBe('cliente-b');
  expect(()=>configuracaoAplicacao({...env,VITE_FIRESTORE_EMULATOR_HOST:'127.0.0.1:8080'})).toThrow();
});
it('catálogo pronto permanece durante releitura, mas é ocultado se a loja negar acesso',async()=>{
  render(<LojaProvider><Cardapio/></LojaProvider>);await screen.findByText('Prato SDK');
  let rejeitar;mocks.carregar.mockImplementationOnce(()=>new Promise((_,j)=>{rejeitar=j;}));
  fireEvent(window,new Event('focus'));expect(screen.getByText('Prato SDK')).toBeTruthy();
  rejeitar(Object.assign(new Error('Catálogo indisponível.'),{status:403}));await screen.findByRole('alert');
  expect(screen.queryByText('Prato SDK')).toBeNull();expect(screen.queryByText('Carregando...')).toBeNull();
});
