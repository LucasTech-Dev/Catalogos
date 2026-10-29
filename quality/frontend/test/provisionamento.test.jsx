import fs from 'node:fs';
import {it,expect,vi} from 'vitest';
import {planejarProvisionamento} from '../provisionamento/manifesto.mjs';
import {alvoEmulator,criarProvisionador} from '../provisionamento/emulator.mjs';
const modelo=()=>JSON.parse(fs.readFileSync('../quality/fixtures/provisionamento/aurora.json','utf8'));
it('plano offline determinístico gera só cinco documentos de loja vazia e administrador explícito',()=>{
 const fetcher=vi.fn();vi.stubGlobal('fetch',fetcher);
 try {const m=modelo(),antes=JSON.stringify(m),p=planejarProvisionamento(m);expect(p.documentos.map(d=>d.caminho)).toEqual(['lojas/loja-aurora','catalogosPublicos/loja-aurora','lojas/loja-aurora/controleCompra/versao','lojas/loja-aurora/contadores/pedidos','usuarios/admin-sintetico-aurora']);expect(p.documentos[3].dados).toEqual({ultimo:0});expect(p.documentos[1].dados.horarios.segunda).toBe('Fechado');expect(p.hash).toBe(planejarProvisionamento(JSON.parse(antes)).hash);expect(JSON.stringify(m)).toBe(antes);expect(fetcher).not.toHaveBeenCalled();}finally{vi.unstubAllGlobals();}
});
it.each(['bancorestaurante','catalogos-cliente','demo-x/../real'])('recusa projeto %s antes de usar rede',projeto=>{
 const m=modelo();m.projetoId=projeto;expect(()=>planejarProvisionamento(m)).toThrow('demo-');
});
it.each(['firestore.googleapis.com:443','localhost:8188','127.0.0.1.evil:8188','127.0.0.1:8188/path','[::1]:8188','127.0.0.1:99999'])('destino %s não pode usar bootstrap privilegiado',firestore=>{
 const fetcher=vi.fn();expect(()=>criarProvisionador({projetoId:'demo-replicacao',firestore,auth:'127.0.0.1:9198'},{fetcher,env:{CATALOGOS_EMULATOR_EXCLUSIVO:'1'}})).toThrow();expect(fetcher).not.toHaveBeenCalled();
});
it('recusa execução sem isolamento explícito do Emulator',()=>expect(()=>alvoEmulator({projetoId:'demo-replicacao',firestore:'127.0.0.1:8188',auth:'127.0.0.1:9198'},{})).toThrow('EXCLUSIVO'));
it.each([
 m=>m.lojaId='loja-demo',m=>m.lojaId='../outra',m=>m.administrador.confirmado=false,m=>m.administrador.email='admin@example.invalid',m=>m.loja.clientes=[{nome:'Não copiar'}],m=>m.pedidos=[],m=>m.loja.pagamentos={dinheiro:false},m=>m.loja.retirada.habilitada=false,m=>m.loja.pedidoMinimo=.001,m=>delete m.loja.horarios.domingo,m=>m.loja.horarios.segunda={fechado:false,abertura:'18:00',fechamento:'18:00'},m=>delete m.loja.entrega.taxa,m=>m.loja.endereco.uf='XX'
])('manifestações inseguras ou configurações inválidas são rejeitadas',alterar=>{const m=modelo();alterar(m);expect(()=>planejarProvisionamento(m)).toThrow();});

it.each([
 {disabled:true,emailVerified:true,providerUserInfo:[{providerId:'password'}]},
 {emailVerified:false,providerUserInfo:[{providerId:'password'}]},
 {emailVerified:true,providerUserInfo:[]}
])('bootstrap recusa identidade desativada, não verificada ou sem provedor permitido',async conta=>{
 const m=modelo(),fetcher=vi.fn(async()=>({ok:true,json:async()=>({users:[{localId:m.administrador.uid,...conta}]})}));
 const executor=criarProvisionador({projetoId:'demo-replicacao',firestore:'127.0.0.1:8188',auth:'127.0.0.1:9198'},{fetcher,env:{CATALOGOS_EMULATOR_EXCLUSIVO:'1'}});
 await expect(executor.aplicar(m)).rejects.toThrow('ativo, verificado');expect(fetcher).toHaveBeenCalledTimes(1);
});
