import assert from 'node:assert/strict';
import {doc,collection,getDocFromServer,getDocsFromServer,deleteDoc,setDoc,updateDoc,query,where,orderBy,limit,startAfter,writeBatch} from 'firebase/firestore';
import {projetarRegistro} from '../../../frontend/src/services/projecaoPublica.js';
import {criarBackupEmulator} from '../provisionamento/backup-emulator.mjs';
import {sha256} from '../provisionamento/manifesto.mjs';
import {consultarCatalogo} from '../../../frontend/src/services/catalogo.js';
import {homologarNavegador} from './homologacao-etapa4-browser.mjs';
export async function homologar(c){
 const {adminA,adminB,ca,cb,anon,visitante,ma,mb,pa,pb,catA,catB,gestA,gestB,comprarA,comprarB,admPedidosA,admPedidosB,ok,negar}=c,A=ma.lojaId,B=mb.lojaId;
 for(const [actor,L] of [[adminA,B],[adminB,A],[ca,B],[cb,A],[anon,A],[visitante,A]]){
  await negar('SDK não altera configuração '+actor.label,()=>updateDoc(doc(actor.db,`lojas/${L}`),{nome:'invasão'}));
  await negar('SDK não altera categoria '+actor.label,()=>updateDoc(doc(actor.db,`lojas/${L}/categorias/categoria-igual`),{ativo:false}));
  await negar('SDK não altera produto '+actor.label,()=>updateDoc(doc(actor.db,`lojas/${L}/produtos/produto-igual`),{preco:0}));
  await negar('SDK não reinicia contador '+actor.label,()=>updateDoc(doc(actor.db,`lojas/${L}/contadores/pedidos`),{ultimo:0}));
  await negar('SDK não promove administrador '+actor.label,()=>setDoc(doc(actor.db,'usuarios/'+(actor.auth.currentUser?.uid||'visitante')),{role:'admin',ativo:true,lojaId:L}));
 }
 await catB.salvar('categorias',null,{nome:'Exclusiva B',ativo:true},'categoria-so-b');
 const produtoRef=doc(adminA.db,`lojas/${A}/produtos/produto-igual`),controleRef=doc(adminA.db,`lojas/${A}/controleCompra/versao`);
 const produto=(await getDocFromServer(produtoRef)).data(),revisao=(await getDocFromServer(controleRef)).data();
 await negar('SDK lote coerente recusa categoria que existe somente em B',async()=>{const tx=writeBatch(adminA.db),novo={...produto,categoriaId:'categoria-so-b'};tx.set(produtoRef,novo);tx.set(doc(adminA.db,`catalogosPublicos/${A}/produtos/produto-igual`),projetarRegistro('produtos',novo));tx.set(controleRef,{revisao:revisao.revisao+1,alteracao:{tipo:'produtos',id:'produto-igual'}});await tx.commit();});
 ok('categoria cruzada não muda produto/revisão',(await getDocFromServer(produtoRef)).data().categoriaId===produto.categoriaId&&(await getDocFromServer(controleRef)).data().revisao===revisao.revisao);
 for(const [actor,L,P] of [[ca,A,pa],[cb,B,pb]]){
  await negar('SDK cliente não move pedido para outra loja '+L,()=>updateDoc(doc(actor.db,`lojas/${L}/pedidos/${P.id}`),{lojaId:L===A?B:A}));
  await negar('SDK cliente não adulterar itens/valor '+L,()=>updateDoc(doc(actor.db,`lojas/${L}/pedidos/${P.id}`),{itens:[{produtoId:'somente-b',quantidade:1,precoUnitario:0,subtotal:0,nome:'forjado'}],total:0}));
 }
 await negar('SDK não exclui categoria fisicamente',()=>deleteDoc(doc(adminA.db,`lojas/${A}/categorias/categoria-igual`)));
 await negar('cliente não lê toda coleção de pedidos',()=>getDocsFromServer(collection(ca.db,`lojas/${A}/pedidos`)));
 await negar('anônimo não lê perfil de cliente registrado',()=>getDocFromServer(doc(anon.db,`lojas/${A}/clientes/${ca.auth.currentUser.uid}`)));
 await catA.salvar('categorias','categoria-igual',{ativo:false});
 ok('B03 produtos permanecem armazenados',(await catA.buscar('produtos','produto-igual')).ativo===true);
 ok('B03 catálogo público oculta categoria desativada',(await consultarCatalogo(visitante.db,A)).produtos.length===0);
 ok('B03 pedido histórico preserva snapshot',(await comprarA.buscarPedido(pa.id)).itens[0].precoUnitario===10);
 ok('B03 loja B mantém produto',(await consultarCatalogo(visitante.db,B)).produtos.length>0);
 await catA.salvar('categorias','categoria-igual',{ativo:true});ok('B03 reativação recupera visibilidade',(await consultarCatalogo(visitante.db,A)).produtos.length>0);
 const consultas=[];
 for(const [actor,L,admin,gest,comprar,pedido] of [[adminA,A,admPedidosA,gestA,comprarA,pa],[adminB,B,admPedidosB,gestB,comprarB,pb]]){
  const first=await admin.listar({limite:1});assert.equal(first.itens.length,1);assert.ok(first.proximoCursor);
  const second=await admin.listar({limite:1,cursor:first.proximoCursor});ok('paginação de pedidos sem repetição '+L,second.itens.length===1&&second.itens[0].id!==first.itens[0].id);consultas.push('adminPedidos.listar/paginacao');
  const filtro=await admin.listar({status:'recebido'});ok('filtro status '+L,filtro.itens.every(p=>p.status==='recebido'));consultas.push('status/criadoEm desc');
  ok('busca por número '+L,(await admin.listar({numeroPedido:1})).itens[0].id===pedido.id);consultas.push('numeroPedido');
  ok('histórico cliente '+L,(await comprar.listarPedidos()).length>=1);consultas.push('clienteId/lojaId');
  ok('pedidos por cliente '+L,(await admin.listar({clienteId:pedido.clienteId})).itens.every(p=>p.clienteId===pedido.clienteId));consultas.push('clienteId/documentId');
  ok('dashboard/agregações '+L,(await gest.dashboard()).pedidos>=2);consultas.push('dashboard/status/data/sum/pagamento/disponibilidade');
  ok('clientes paginados '+L,(await gest.listarClientes({limite:1})).itens.length===1);consultas.push('clientes/documentId');
  const catalogo=L===A?catA:catB;ok('produtos filtrados/paginados '+L,(await catalogo.listar('produtos',{categoriaId:'categoria-igual',limite:1})).itens.length===1);consultas.push('produtos/categoriaId/documentId');
  ok('categorias e contagem '+L,(await catalogo.listar('categorias')).itens.some(x=>x.produtos>=1));consultas.push('categorias/documentId/count');
  const ref=collection(actor.db,`lojas/${L}/pedidos`),q=query(ref,where('status','==','recebido'),orderBy('criadoEm'),limit(1));const p=await getDocsFromServer(q);if(p.docs.length)await getDocsFromServer(query(ref,where('status','==','recebido'),orderBy('criadoEm'),startAfter(p.docs[0]),limit(1)));consultas.push('status/criadoEm asc/cursor');
 }
 const cfg={projetoId:'demo-replicacao',firestore:'127.0.0.1:8188',auth:'127.0.0.1:9198'},backup=criarBackupEmulator(cfg);
 const snap=await backup.exportar(A,[adminA.auth.currentUser.uid]);ok('backup inclui pedido/histórico/idempotência/reserva', ['pedidos','historicoAdministrativo','idempotencia','numerosPedidos','tentativasCompra'].every(t=>snap.documentos.some(d=>d.caminho.split('/').includes(t))));
 ok('backup preserva tipos de timestamp',JSON.stringify(snap.documentos).includes('timestampValue'));
 const destino=criarBackupEmulator({...cfg,projetoId:'demo-restauracao-etapa4'});
 const corrupto=structuredClone(snap);corrupto.documentos[0].fields.adulterado={booleanValue:true};await assert.rejects(()=>destino.restaurar(corrupto),/Integridade/);ok('backup adulterado recusado sem escrita',(await destino.exportar(A,snap.uids)).documentos.length===0);
 const falha=criarBackupEmulator({...cfg,projetoId:'demo-restauracao-etapa4'},{fetcher:async(url,op)=>{if(url.endsWith(':commit'))throw Error('falha antes do commit');return fetch(url,op);}});await assert.rejects(()=>falha.restaurar(snap),/falha antes/);ok('restauração interrompida antes do commit é vazia',(await destino.exportar(A,snap.uids)).documentos.length===0);
 const perdido=criarBackupEmulator({...cfg,projetoId:'demo-restauracao-etapa4'},{fetcher:async(url,op)=>{const r=await fetch(url,op);if(url.endsWith(':commit'))throw Error('resposta perdida após commit');return r;}});await assert.rejects(()=>perdido.restaurar(snap),/resposta perdida/);
 const restaurado=await destino.exportar(A,snap.uids);ok('restauração confirmada por hash após resposta perdida',sha256(restaurado.documentos)===sha256(snap.documentos));
 await assert.rejects(()=>destino.restaurar(snap),/Destino existente/);ok('repetição não sobrescreve dados restaurados',sha256((await destino.exportar(A,snap.uids)).documentos)===sha256(snap.documentos));
 ok('backup não modifica loja original',sha256((await backup.exportar(A,snap.uids)).documentos)===sha256(snap.documentos));
 // Build/React reais ligados ao mesmo projeto; sem mocks de serviços/contextos.
 const navegador=await homologarNavegador(c);
 return {consultas:[...new Set(consultas)],backup:{documentos:snap.documentos.length,hash:sha256(snap.documentos),tiposFirestorePreservados:true,authExportado:false,restauracao:'projeto demo- separado, commit único, precondição exists:false'},navegador,indicesProducaoVerificados:false};
}
