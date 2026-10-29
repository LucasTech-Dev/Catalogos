import {beforeEach,describe,expect,it,vi} from 'vitest';
const m=vi.hoisted(()=>({getDoc:vi.fn(),getDocs:vi.fn()}));
vi.mock('firebase/firestore',async importOriginal=>({
 ...await importOriginal(),
 doc:(base,...partes)=>({path:[base.path,...partes].filter(Boolean).join('/')}),
 collection:(base,...partes)=>({path:[base.path,...partes].filter(Boolean).join('/')}),
 query:(base,...filtros)=>({...base,filtros}),where:(campo,operador,valor)=>({campo,operador,valor}),
 getDocFromServer:m.getDoc,getDocsFromServer:m.getDocs
}));
import {consultarCatalogo} from '../../../frontend/src/services/catalogo.js';
import {criarAdminCatalogo} from '../../../frontend/src/services/adminCatalogo.js';
import {criarAdminPedidos} from '../../../frontend/src/services/adminPedidos.js';
import {criarAdminGestao} from '../../../frontend/src/services/adminGestao.js';
const documento=(id,dados)=>({id,exists:()=>dados!==undefined,data:()=>dados});
const adiar=()=>{let resolve,reject;const promise=new Promise((r,j)=>{resolve=r;reject=j;});return {promise,resolve,reject};};
beforeEach(()=>{vi.resetAllMocks();m.getDoc.mockResolvedValue(documento('loja',{ativo:true,nome:'Loja'}));});
function prepararCatalogo(n=8){
 const categorias=Array.from({length:n},(_,i)=>documento('cat'+i,{ativo:true,nome:'Categoria '+i}));
 const pendentes=[];
 m.getDocs.mockImplementation(q=>{
  if(q.path.endsWith('/categorias'))return Promise.resolve({docs:categorias});
  const espera=adiar();pendentes.push({q,...espera});return espera.promise;
 });
 return pendentes;
}
describe('leituras públicas sem esperas por categoria',()=>{
 it('executa oito categorias em dois lotes de quatro, preservando filtros, campos e ordenação',async()=>{
  const pendentes=prepararCatalogo();const resposta=consultarCatalogo({},'loja-a');
  await vi.waitFor(()=>expect(pendentes).toHaveLength(4));
  for(let i=3;i>=0;i--)pendentes[i].resolve({docs:[documento('p'+(7-i),{nome:'Produto',categoriaId:'cat'+i,preco:10,ativo:true,privado:'omitir'})]});
  await vi.waitFor(()=>expect(pendentes).toHaveLength(8));
  for(let i=7;i>=4;i--)pendentes[i].resolve({docs:[documento('p'+(7-i),{nome:'Produto',categoriaId:'cat'+i,preco:10,ativo:true})]});
  const dto=await resposta;
  expect(dto.produtos.map(p=>p.id)).toEqual(Array.from({length:8},(_,i)=>'p'+i));
  expect(dto.produtos.every(p=>!Object.hasOwn(p,'privado'))).toBe(true);
  pendentes.forEach(({q},i)=>expect(q.filtros).toEqual([
   {campo:'ativo',operador:'==',valor:true},{campo:'categoriaId',operador:'==',valor:'cat'+i},
   {campo:'preco',operador:'>=',valor:0},{campo:'preco',operador:'<=',valor:1000000}
  ]));
 });
 it('reúne chamadas simultâneas da mesma loja e volta ao servidor depois de concluídas',async()=>{
  const db={},pendentes=prepararCatalogo(1);
  const a=consultarCatalogo(db,'loja-a'),b=consultarCatalogo(db,'loja-a');
  await vi.waitFor(()=>expect(pendentes).toHaveLength(1));expect(m.getDoc).toHaveBeenCalledTimes(1);
  pendentes[0].resolve({docs:[]});expect(await a).toEqual(await b);
  const c=consultarCatalogo(db,'loja-a');await vi.waitFor(()=>expect(pendentes).toHaveLength(2));
  pendentes[1].resolve({docs:[]});await c;expect(m.getDoc).toHaveBeenCalledTimes(2);
 });
 it('isola instâncias Firebase e lojas',async()=>{
  m.getDocs.mockResolvedValue({docs:[]});const db={};
  await Promise.all([consultarCatalogo(db,'loja-a'),consultarCatalogo(db,'loja-b'),consultarCatalogo({},'loja-a')]);
  expect(m.getDoc.mock.calls.map(([ref])=>ref.path)).toEqual(['catalogosPublicos/loja-a','catalogosPublicos/loja-b','catalogosPublicos/loja-a']);
 });
 it('recusa resultado parcial, aguarda consultas abertas e permite retry após erro',async()=>{
  const db={},pendentes=prepararCatalogo(5);const resposta=consultarCatalogo(db,'loja-a');
  const resultado=expect(resposta).rejects.toMatchObject({status:403});
  await vi.waitFor(()=>expect(pendentes).toHaveLength(4));
  pendentes[0].reject({code:'permission-denied'});
  for(let i=1;i<4;i++)pendentes[i].resolve({docs:[]});await resultado;expect(pendentes).toHaveLength(4);
  m.getDocs.mockResolvedValue({docs:[]});await consultarCatalogo(db,'loja-a');expect(m.getDoc).toHaveBeenCalledTimes(2);
 });
 it('não consulta produtos de loja indisponível',async()=>{
  m.getDoc.mockResolvedValue(documento('loja',{ativo:false}));
  await expect(consultarCatalogo({},'loja-a')).rejects.toMatchObject({status:404});expect(m.getDocs).not.toHaveBeenCalled();
 });
});
function contexto(){const user={uid:'admin',isAnonymous:false};return {db:{},auth:{currentUser:user},sessaoExistente:async()=>user,lojaId:'loja-a',invalidar:vi.fn()};}
const autoridade={role:'admin',ativo:true,lojaId:'loja-a'};
describe('gate administrativo sem leitura redundante da loja',()=>{
 it('pedidos e clientes fazem somente a leitura de autoridade e a consulta solicitada',async()=>{
  const ctx=contexto();m.getDoc.mockResolvedValue(documento('admin',autoridade));m.getDocs.mockResolvedValue({docs:[]});
  await criarAdminPedidos(ctx).listar();await criarAdminGestao(ctx).listarClientes();
  expect(m.getDoc.mock.calls.map(([r])=>r.path)).toEqual(['usuarios/admin','usuarios/admin']);
  expect(m.getDocs.mock.calls.map(([r])=>r.path)).toEqual(['lojas/loja-a/pedidos','lojas/loja-a/clientes']);
 });
 it('configurações leem a loja apenas uma vez após validar autoridade',async()=>{
  const ctx=contexto();m.getDoc.mockImplementation(async r=>documento('registro',r.path==='usuarios/admin'?autoridade:{nome:'Loja'}));
  expect((await criarAdminGestao(ctx).loja()).nome).toBe('Loja');
  expect(m.getDoc.mock.calls.map(([r])=>r.path)).toEqual(['usuarios/admin','lojas/loja-a']);
 });
 it('revalida revogação em cada operação, sem cache de permissão',async()=>{
  const ctx=contexto(),servico=criarAdminPedidos(ctx);m.getDocs.mockResolvedValue({docs:[]});
  m.getDoc.mockResolvedValueOnce(documento('admin',autoridade)).mockResolvedValueOnce(documento('admin',{...autoridade,ativo:false}));
  await servico.listar();await expect(servico.listar()).rejects.toMatchObject({status:403});
  expect(m.getDocs).toHaveBeenCalledTimes(1);expect(ctx.invalidar).toHaveBeenCalled();
 });
 it('bloqueia conta de outra loja e sessão trocada durante o gate',async()=>{
  const ctx=contexto(),gate=criarAdminCatalogo(ctx);
  m.getDoc.mockResolvedValueOnce(documento('admin',{...autoridade,lojaId:'loja-b'}));
  await expect(gate.autorizar()).rejects.toMatchObject({status:403});
  m.getDoc.mockImplementationOnce(async()=>{ctx.auth.currentUser={uid:'outra'};return documento('admin',autoridade);});
  await expect(gate.autorizar()).rejects.toMatchObject({status:409});
 });
});

it('GETs simultâneos da autoridade são reunidos sem cache posterior nem compartilhamento entre lojas',async()=>{
 const ctx=contexto(),gate=criarAdminCatalogo(ctx),espera=adiar();m.getDoc.mockReturnValueOnce(espera.promise);
 const a=gate.autorizar(),b=gate.autorizar();await vi.waitFor(()=>expect(m.getDoc).toHaveBeenCalledTimes(1));espera.resolve(documento('admin',autoridade));await Promise.all([a,b]);
 m.getDoc.mockResolvedValueOnce(documento('admin',{...autoridade,ativo:false}));await expect(gate.autorizar()).rejects.toMatchObject({status:403});expect(m.getDoc).toHaveBeenCalledTimes(2);
 const outro=criarAdminCatalogo({...ctx,lojaId:'loja-b'});m.getDoc.mockResolvedValueOnce(documento('admin',autoridade));await expect(outro.autorizar()).rejects.toMatchObject({status:403});expect(m.getDoc).toHaveBeenCalledTimes(3);
});
