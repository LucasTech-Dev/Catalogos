import {it,expect} from 'vitest';
import {configuracaoAplicacao} from '../src/lib/ambienteAplicacao';
const externo={VITE_APP_ENV:'production',VITE_API_URL:'https://api.example.com',VITE_LOJA_ID:'a',VITE_FIREBASE_API_KEY:'publica-ficticia',VITE_FIREBASE_AUTH_DOMAIN:'auth.example.com',VITE_FIREBASE_PROJECT_ID:'prod-exemplo',VITE_FIREBASE_EXPECTED_PROJECT_ID:'prod-exemplo',VITE_FIREBASE_APP_ID:'app-ficticio'};
it('configuração externa exige HTTPS, projeto esperado e todos os campos públicos',()=>{
 expect(configuracaoAplicacao(externo).lojaId).toBe('a');
 for(const patch of [{VITE_API_URL:'http://api.example.com'},{VITE_API_URL:'https://user:senha@api.example.com'},{VITE_API_URL:'https://api.example.com?redirect=externo'},{VITE_FIREBASE_API_KEY:''},{VITE_FIREBASE_PROJECT_ID:'demo-x'},{VITE_FIREBASE_EXPECTED_PROJECT_ID:'outro'},{VITE_FIREBASE_AUTH_EMULATOR_URL:'http://localhost:9099'},{VITE_LOJA_ID:''}])expect(()=>configuracaoAplicacao({...externo,...patch})).toThrow();
});
it('um bundle seleciona lojas somente pelo mapa explícito de hostname',()=>{
 const env={...externo,VITE_LOJA_ID:'',VITE_LOJAS_POR_HOST:'{"a.example.com":"a","b.example.com":"b"}'};
 expect(configuracaoAplicacao(env,'a.example.com').lojaId).toBe('a');expect(configuracaoAplicacao(env,'b.example.com').lojaId).toBe('b');
 expect(()=>configuracaoAplicacao(env,'nao-autorizado.example.com')).toThrow();expect(()=>configuracaoAplicacao({...env,VITE_LOJAS_POR_HOST:'{"a.example.com":"../b"}'},'a.example.com')).toThrow();
});
it('desenvolvimento mantém defaults e testes Web exigem projeto demo',()=>{
 expect(configuracaoAplicacao({})).toEqual({lojaId:'loja-demo',base:'http://localhost:3000'});expect(()=>configuracaoAplicacao({VITE_APP_ENV:'test',VITE_FIREBASE_PROJECT_ID:'real'})).toThrow();
});
