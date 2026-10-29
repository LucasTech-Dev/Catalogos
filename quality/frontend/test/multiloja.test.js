import {beforeEach,expect,it,vi} from 'vitest';
import {configuracaoAplicacao} from '../../../frontend/src/lib/ambienteAplicacao';
import {identificadorValido} from '../../../frontend/src/lib/identificador';
import {chaveTentativa,salvarTentativa,carregarTentativa,limparDadosDeOutraSessao} from '../../../frontend/src/lib/tentativaCheckout';
import {criarServicoPerfil} from '../../../frontend/src/services/perfil';
import {criarServicoPedidos} from '../../../frontend/src/services/pedidos';
import {criarAdminCatalogo} from '../../../frontend/src/services/adminCatalogo';
beforeEach(()=>{localStorage.clear();sessionStorage.clear();});
it('nenhum domínio não configurado herda a Demo, mesmo no modo development',()=>{
 for(const env of [{},{VITE_LOJA_ID:'loja-demo'}])expect(()=>configuracaoAplicacao(env,'cliente.example.com')).toThrow('mapa explícito');
 expect(()=>configuracaoAplicacao({})).toThrow('Estabelecimento não configurado');
 const env={VITE_LOJAS_POR_HOST:'{"a.example.com":"loja-a","b.example.com":"loja-b"}'};
 expect(configuracaoAplicacao(env,'A.EXAMPLE.COM').lojaId).toBe('loja-a');expect(configuracaoAplicacao(env,'b.example.com').lojaId).toBe('loja-b');
 expect(()=>configuracaoAplicacao(env,'desconhecido.example.com')).toThrow('não configurado');
 expect(()=>configuracaoAplicacao({...env,VITE_LOJAS_POR_HOST:'{"__proto__":"loja-a"}'},'__proto__')).toThrow();
});
it.each(['',' ',' a','a ','.','..','a/b','a\\b','a\u0000','a\u0085','\ud800','a'.repeat(129),null,undefined])('identificador %s é recusado antes da sessão ou de qualquer consulta',async lojaId=>{
 expect(identificadorValido(lojaId)).toBe(false);const sessao=vi.fn(),ctx={lojaId,auth:{},db:{},sessao,sessaoExistente:sessao};
 await expect(criarServicoPerfil(ctx).buscarPerfil()).rejects.toMatchObject({status:400});
 await expect(criarServicoPedidos(ctx).listarPedidos()).rejects.toMatchObject({status:400});
 await expect(criarAdminCatalogo(ctx).sessao()).rejects.toMatchObject({status:400});expect(sessao).not.toHaveBeenCalled();
});
it('logout/limpeza A não lê, migra ou apaga tentativas de B no mesmo origin',()=>{
 const a=chaveTentativa('loja-a','uid'),b=chaveTentativa('loja-b','uid'),outra=chaveTentativa('loja-a:outra','uid');
 salvarTentativa(a,{uid:'uid',chave:'nonce-a',dados:{observacao:'privado A'}});salvarTentativa(b,{uid:'uid',chave:'nonce-b',dados:{observacao:'privado B'}});
 localStorage.setItem(outra,JSON.stringify({uid:'uid',chave:'nonce-c',dados:{observacao:'legado C'}}));
 const antesB=sessionStorage.getItem(b),antesC=localStorage.getItem(outra);
 limparDadosDeOutraSessao(null,'loja-a');expect(sessionStorage.getItem(a)).toBeNull();expect(sessionStorage.getItem(b)).toBe(antesB);expect(localStorage.getItem(outra)).toBe(antesC);expect(sessionStorage.getItem(outra)).toBeNull();
 expect(carregarTentativa(b,'uid').dados.observacao).toBe('privado B');
});
it('loja/UID com separador não colidem com o namespace de outra loja',()=>{
 expect(chaveTentativa('a:b','c')).not.toBe(chaveTentativa('a','b:c'));
 expect(chaveTentativa('loja-demo','uid-real')).toBe('catalogos:checkout:loja-demo:uid-real');
});

it('serviços contextualizados recusam sessão ausente antes de acessar Firestore',async()=>{
 const ctx={db:{},auth:{currentUser:null},lojaId:'loja-a',sessao:async()=>null,sessaoExistente:async()=>null};
 await expect(criarServicoPerfil(ctx).buscarPerfil()).rejects.toMatchObject({status:401});
 await expect(criarServicoPedidos(ctx).listarPedidos()).rejects.toMatchObject({status:401});
 await expect(criarAdminCatalogo(ctx).sessao()).rejects.toMatchObject({status:401});
});
