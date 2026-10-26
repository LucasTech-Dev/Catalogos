import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {initializeApp,deleteApp} from 'firebase/app';
import {getAuth,connectAuthEmulator,createUserWithEmailAndPassword,signInAnonymously,signOut} from 'firebase/auth';
import {getFirestore,connectFirestoreEmulator,doc,setDoc,getDocFromServer,updateDoc,deleteDoc,writeBatch,runTransaction,serverTimestamp,Timestamp,disableNetwork,enableNetwork,terminate} from 'firebase/firestore';
import {projetarRegistro,salvarComProjecao} from '../../../frontend/src/services/projecaoPublica.js';
import {criarServicoPedidos} from '../../../frontend/src/services/pedidos.js';
const host=process.env.FIRESTORE_EMULATOR_HOST,authHost=process.env.FIREBASE_AUTH_EMULATOR_HOST;
for(const h of [host,authHost])assert.match(h || '',/^(127\.0\.0\.1|localhost):\d+$/);
assert.equal(process.env.CATALOGOS_EMULATOR_EXCLUSIVO,'1');
const projectId='demo-catalogos-sincronizacao';
const require=createRequire(new URL('../../../backend/package.json',import.meta.url));
const admin=require('firebase-admin/app'),fsAdmin=require('firebase-admin/firestore');
const adminApp=admin.initializeApp({projectId},'sincronizacao'),seed=fsAdmin.getFirestore(adminApp);
const atores=[],runId=Date.now(),L='sync-'+runId,B=L+'-b';let checks=0;
const ok=(v,m)=>{assert.ok(v,m);checks++;};
const hash=s=>createHash('sha256').update(s).digest('hex');
const negar=async fn=>{await assert.rejects(fn,e=>e.code==='permission-denied');checks++;};
async function carregar(content){const r=await fetch(`http://${host}/emulator/v1/projects/${projectId}:securityRules`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({rules:{files:[{name:'firestore.rules',content}]}})});assert.ok(r.ok,await r.text());}
async function ator(tipo,loja=L){
 const app=initializeApp({projectId,apiKey:'fake-api-key'},'sync-'+atores.length),db=getFirestore(app),auth=getAuth(app),[h,p]=host.split(':');
 connectFirestoreEmulator(db,h,Number(p));connectAuthEmulator(auth,'http://'+authHost,{disableWarnings:true});
 if(tipo==='anonimo')await signInAnonymously(auth);else await createUserWithEmailAndPassword(auth,`${tipo}-${atores.length}-${runId}@teste.local`,'Senha-local-teste-123!');
 const a={app,db,auth,uid:auth.currentUser.uid};atores.push(a);
 if(tipo==='admin')await seed.doc('usuarios/'+a.uid).set({role:'admin',ativo:true,lojaId:loja});
 a.criar=criarServicoPedidos({db,auth,sessao:async()=>auth.currentUser,lojaId:loja}).criarPedido;return a;
}
const loja={nome:'Loja sintética',ativo:true,entrega:{habilitada:true,taxa:5},retirada:{habilitada:true},pagamentos:{pix:true,dinheiro:true,cartao_credito:true,cartao_debito:true},pedidoMinimo:0};
const produto=i=>({nome:'Produto '+i,preco:(100+i)/100,ativo:true,disponivel:true,categoriaId:'cat'});
const dados=(n=1,tipoEntrega='retirada')=>({itens:Array.from({length:n},(_,i)=>({produtoId:'p'+i,quantidade:1})),tipoEntrega,cliente:{nome:'Cliente sintético',telefone:'51999999999'},pagamento:{forma:'pix'},observacao:'Teste local',...(tipoEntrega==='entrega'?{enderecoId:'endereco'}:{})});
let gestor,cliente,outro,adminB,anonimo;
const ref=(a,path)=>doc(a.db,path);
const ctrl=a=>ref(a,`lojas/${L}/controleCompra/versao`);
const origem=(a,i='p0')=>ref(a,`lojas/${L}/produtos/${i}`);
const publico=(a,i='p0')=>ref(a,`catalogosPublicos/${L}/produtos/${i}`);
const op=(a,chave)=>ref(a,`lojas/${L}/clientes/${a.uid}/tentativasCompra/${chave}`);
const order=(a,id)=>ref(a,`lojas/${L}/pedidos/${id}`);
const marcador=(a,id)=>ref(a,`lojas/${L}/idempotencia/${id}`);
let contador=0;
async function preparar(n=1,{ttl=60000,tipo='retirada',ator=cliente}={}){
 const chave=`manual-${runId}-${++contador}`,id=hash(ator.uid+':'+chave);
 const d={lojaId:L,clienteId:ator.uid,revisao:(await getDocFromServer(ctrl(ator))).data().revisao,dados:{...dados(n,tipo),enderecoId:tipo==='entrega'?'endereco':null},marcador:id,assinatura:hash('corpo-'+chave),itens:[],ids:[],unidades:0,centavos:0,estado:'aberta',criadoEm:serverTimestamp(),expiraEm:Timestamp.fromMillis(Date.now()+ttl)};
 await setDoc(op(ator,chave),d);return {chave,id,ator};
}
async function incluir(t,patch={}){
 const s=await getDocFromServer(op(t.ator,t.chave)),a=s.data(),entrada=a.dados.itens[a.itens.length];
 const p=(await getDocFromServer(publico(t.ator,entrada.produtoId))).data(),c=Math.round(p.preco*100);
 const i={produtoId:entrada.produtoId,nome:p.nome,precoUnitario:c/100,quantidade:entrada.quantidade,subtotal:c*entrada.quantidade/100};
 const d={itens:[...a.itens,i],ids:[...a.ids,entrada.produtoId],unidades:a.unidades+i.quantidade,centavos:a.centavos+c*i.quantidade,...patch};
 await updateDoc(op(t.ator,t.chave),d);
}
async function pedidoPara(t){
 const a=(await getDocFromServer(op(t.ator,t.chave))).data(),d=a.dados;
 const l=(await getDocFromServer(ref(t.ator,`catalogosPublicos/${L}`))).data();
 const taxa=d.tipoEntrega==='entrega'?Math.round(l.entrega.taxa*100):0;
 const e=d.tipoEntrega==='entrega'?(await getDocFromServer(ref(t.ator,`lojas/${L}/clientes/${t.ator.uid}/enderecos/endereco`))).data():null;
 return {lojaId:L,clienteId:t.ator.uid,enderecoId:d.enderecoId,endereco:e?{...e,id:'endereco'}:null,itens:a.itens,subtotal:a.centavos/100,taxaEntrega:taxa/100,desconto:0,total:(a.centavos+taxa)/100,pagamento:{forma:d.pagamento.forma,status:'pendente',valor:(a.centavos+taxa)/100},observacao:d.observacao,tipoEntrega:d.tipoEntrega,status:'recebido',cliente:d.cliente,criadoEm:serverTimestamp(),atualizadoEm:serverTimestamp(),operacaoCompra:t.chave};
}
async function loteFinal(t,patch={}){
 const contador=ref(t.ator,`lojas/${L}/contadores/pedidos`),atual=await getDocFromServer(contador),numeroPedido=(atual.exists()?atual.data().ultimo:0)+1;
 const p={...await pedidoPara(t),numeroPedido,...patch},a=(await getDocFromServer(op(t.ator,t.chave))).data();
 const b=writeBatch(t.ator.db);b.set(order(t.ator,t.id),p);b.set(marcador(t.ator,t.id),{lojaId:L,clienteId:t.ator.uid,pedidoId:t.id,assinatura:a.assinatura});b.set(contador,{ultimo:numeroPedido});b.set(ref(t.ator,`lojas/${L}/numerosPedidos/${numeroPedido}`),{numeroPedido,pedidoId:t.id,clienteId:t.ator.uid});return b;
}
try {
 await carregar(await readFile(new URL('../../../firebase/firestore.rules',import.meta.url),'utf8'));
 gestor=await ator('admin');cliente=await ator('cliente');outro=await ator('cliente');adminB=await ator('admin',B);anonimo=await ator('anonimo');
 for(const l of [L,B]){
  await seed.doc('lojas/'+l).set(loja);await seed.doc('catalogosPublicos/'+l).set(projetarRegistro('loja',loja));
  await seed.doc(`lojas/${l}/categorias/cat`).set({nome:'Categoria',ativo:true});await seed.doc(`catalogosPublicos/${l}/categorias/cat`).set(projetarRegistro('categorias',{nome:'Categoria',ativo:true}));
  for(let i=0;i<51;i++){await seed.doc(`lojas/${l}/produtos/p${i}`).set(produto(i));await seed.doc(`catalogosPublicos/${l}/produtos/p${i}`).set(projetarRegistro('produtos',produto(i)));}
 }
 const endereco={rua:'Rua fictícia',numero:'1',bairro:'Centro',cidade:'Cidade teste',uf:'RS'};
 for(const a of [cliente,anonimo])await setDoc(ref(a,`lojas/${L}/clientes/${a.uid}/enderecos/endereco`),endereco);
 await setDoc(ctrl(gestor),{revisao:0,alteracao:null});
 await seed.doc(`lojas/${B}/controleCompra/versao`).set({revisao:0,alteracao:null});
 // Escritas diretas maliciosas, incluindo admin da própria loja sem par atômico.
 for(const a of [cliente,adminB,gestor]){
  await negar(()=>updateDoc(origem(a),{preco:9.99}));
  await negar(()=>updateDoc(publico(a),{preco:9.99}));
 }
 const semControle=writeBatch(gestor.db);semControle.update(origem(gestor),{preco:9.99});semControle.set(publico(gestor),projetarRegistro('produtos',{...produto(0),preco:9.99}));await negar(()=>semControle.commit());
 await negar(()=>updateDoc(ctrl(gestor),{revisao:1,alteracao:{tipo:'produtos',id:'p0'}}));
 await negar(()=>deleteDoc(ctrl(gestor)));await negar(()=>setDoc(ctrl(gestor),{revisao:0,alteracao:null}));
 await negar(()=>deleteDoc(origem(gestor)));await negar(()=>updateDoc(ctrl(cliente),{revisao:1,alteracao:{tipo:'produtos',id:'p0'}}));
 ok((await getDocFromServer(publico(cliente))).data().preco===1,'nenhuma escrita parcial');
 // API real aprovada atualiza os três documentos e repete sem avanço artificial.
 await salvarComProjecao(gestor.db,L,'produtos','p0',{preco:9.99});
 ok((await getDocFromServer(origem(gestor))).data().preco===9.99,'origem999');
 ok((await getDocFromServer(publico(cliente))).data().preco===9.99,'projecao999');
 ok((await getDocFromServer(ctrl(cliente))).data().revisao===1,'revisao atomica');
 await salvarComProjecao(gestor.db,L,'produtos','p0',{preco:9.99});ok((await getDocFromServer(ctrl(cliente))).data().revisao===1,'repeticao sem mudanca');
 await salvarComProjecao(gestor.db,L,'produtos','p0',{preco:1});
 // O contraexemplo original é negado MESMO com projeção obsoleta injetada no seed.
 await salvarComProjecao(gestor.db,L,'produtos','p0',{preco:9.99});
 await seed.doc(`catalogosPublicos/${L}/produtos/p0`).update({preco:1});
 const inconsistente=await preparar();await negar(()=>incluir(inconsistente));
 await salvarComProjecao(gestor.db,L,'produtos','p0',{});
 await salvarComProjecao(gestor.db,L,'produtos','p0',{preco:1});
 const tamanhos=[];
 for(const n of [1,10,11,25,50]){
  const chave=`real-${runId}-${n}`,p=await cliente.criar(dados(n),{chave,expectedUid:cliente.uid});
  const esperado=Array.from({length:n},(_,i)=>100+i).reduce((a,b)=>a+b,0)/100;
  ok(p.itens.length===n && p.total===esperado,'pedido real completo '+n);
  const s=await getDocFromServer(order(cliente,p.id));ok(s.exists() && !s.metadata.fromCache && !s.metadata.hasPendingWrites,'persistencia servidor '+n);
  tamanhos.push({n,pedido:'criado_SDK_confirmado_servidor',total:p.total,bytesJson:Buffer.byteLength(JSON.stringify(s.data()))});
 }
 const entrega=await cliente.criar(dados(1,'entrega'),{chave:`entrega-${runId}-001`});ok(entrega.taxaEntrega===5 && entrega.total===6 && entrega.endereco.id==='endereco','entrega canonica');
 const inlineDados=dados(1,'entrega');delete inlineDados.enderecoId;
 const inline=await cliente.criar(inlineDados,{chave:`inline-${runId}-001`,endereco});ok(inline.total===6,'contrato entrega existente');
 const anon=await anonimo.criar(dados(),{chave:`anonimo-${runId}-001`});ok(anon.clienteId===anonimo.uid,'compatibilidade anonima nao substitui login testado');
 // Limites e alterações diretas que a validação de interface não protege.
 const manual=await preparar();
 const p0=(await getDocFromServer(publico(cliente))).data();
 const makeItem=(id,q,pc)=>({produtoId:id,nome:p0.nome,precoUnitario:pc/100,quantidade:q,subtotal:pc*q/100});
 for(const [id,q,pc] of [['p0',0,100],['p0',100,100],['p0',1.5,100],['p0',2,100],['p1',1,101],['p0',1,99]]){
  const i=makeItem(id,q,pc);await negar(()=>updateDoc(op(cliente,manual.chave),{itens:[i],ids:[id],unidades:q,centavos:pc*q}));
 }
 const duplicado=await preparar(2);const du=(await getDocFromServer(op(cliente,duplicado.chave))).data();
 // Uma intenção inválida pode ser armazenada, mas cada inclusão precisa validá-la.
 const chaveDup=`duplicado-${runId}-001`,idDup=hash(cliente.uid+':'+chaveDup);
 await setDoc(op(cliente,chaveDup),{...du,dados:{...du.dados,itens:[{produtoId:'p0',quantidade:1},{produtoId:'p0',quantidade:1}]},marcador:idDup,criadoEm:serverTimestamp()});
 const td={ator:cliente,chave:chaveDup,id:idDup};await incluir(td);await negar(()=>incluir(td));
 const chaveUn=`unidades-${runId}-001`,idUn=hash(cliente.uid+':'+chaveUn);
 await setDoc(op(cliente,chaveUn),{...du,dados:{...du.dados,itens:Array.from({length:6},(_,i)=>({produtoId:'p'+i,quantidade:i===5?6:99}))},marcador:idUn,criadoEm:serverTimestamp()});
 const tu={ator:cliente,chave:chaveUn,id:idUn};for(let i=0;i<5;i++)await incluir(tu);await negar(()=>incluir(tu));
 await negar(()=>setDoc(op(cliente,`cinquentaum-${runId}`),{...du,dados:{...du.dados,itens:dados(51).itens},marcador:hash('51'+runId),criadoEm:serverTimestamp()}));
 await negar(()=>setDoc(op(cliente,`tamanho-${runId}-001`),{...du,dados:{...du.dados,observacao:'x'.repeat(1001)},marcador:hash('tam'+runId),criadoEm:serverTimestamp()}));
 await negar(()=>setDoc(op(cliente,`prazo-${runId}-001`),{...du,expiraEm:Timestamp.fromMillis(Date.now()+16*60000),marcador:hash('prazo'+runId),criadoEm:serverTimestamp()}));
 const abandono=await preparar();await incluir(abandono);await updateDoc(op(cliente,abandono.chave),{estado:'abandonada'});
 await negar(async()=>(await loteFinal(abandono)).commit());await negar(()=>updateDoc(op(cliente,abandono.chave),{estado:'aberta'}));
 await negar(()=>updateDoc(op(cliente,abandono.chave),{centavos:100}));
 ok(!(await getDocFromServer(order(cliente,abandono.id))).exists(),'abandono nao cria pedido');
 // Pedido e nonce não existem separadamente nem aceitam assinatura divergente.
 const atomico=await preparar();await incluir(atomico);
 await negar(async()=>setDoc(order(cliente,atomico.id),await pedidoPara(atomico)));
 await negar(()=>setDoc(marcador(cliente,atomico.id),{lojaId:L,clienteId:cliente.uid,pedidoId:atomico.id,assinatura:hash('falsa')}));
 const incombinado=await loteFinal(atomico);incombinado.set(marcador(cliente,atomico.id),{lojaId:L,clienteId:cliente.uid,pedidoId:atomico.id,assinatura:hash('falsa')});await negar(()=>incombinado.commit());
 ok(!(await getDocFromServer(order(cliente,atomico.id))).exists() && !(await getDocFromServer(marcador(cliente,atomico.id))).exists(),'falha atomica sem par parcial');
 // Duplicidade concorrente e corpo divergente usando o serviço real.
 const key=`repetido-${runId}-001`,duplos=await Promise.all([cliente.criar(dados(2),{chave:key}),cliente.criar(dados(2),{chave:key})]);
 ok(duplos[0].id===duplos[1].id,'envio concorrente unico');
 await assert.rejects(()=>cliente.criar(dados(1),{chave:key}),e=>e.status===409);checks++;
 await negar(()=>updateDoc(order(cliente,duplos[0].id),{total:0}));await negar(()=>updateDoc(marcador(cliente,duplos[0].id),{assinatura:hash('outra')}));
 const quantidadeAntes=(await seed.collection(`lojas/${L}/pedidos`).get()).size;
 await disableNetwork(cliente.db);await assert.rejects(()=>getDocFromServer(order(cliente,duplos[0].id)),e=>e.code==='unavailable');checks++;await enableNetwork(cliente.db);
 ok((await cliente.criar(dados(2),{chave:key})).id===duplos[0].id,'recovery mesmo nonce apos rede');
 ok((await seed.collection(`lojas/${L}/pedidos`).get()).size===quantidadeAntes,'sem nova gravacao recovery');
 // Tentativa completa antiga não finaliza após preço mudar, inclusive ABA.
 const velha=await preparar();await incluir(velha);await salvarComProjecao(gestor.db,L,'produtos','p0',{preco:9.99});await negar(async()=>(await loteFinal(velha)).commit());
 await salvarComProjecao(gestor.db,L,'produtos','p0',{preco:1});await negar(async()=>(await loteFinal(velha)).commit());
 const montagem=await preparar(2);await incluir(montagem);await salvarComProjecao(gestor.db,L,'produtos','p0',{preco:2});await negar(()=>incluir(montagem));await salvarComProjecao(gestor.db,L,'produtos','p0',{preco:1});
 const indisponivel=await preparar();await salvarComProjecao(gestor.db,L,'produtos','p0',{disponivel:false});await negar(()=>incluir(indisponivel));const jaIndisponivel=await preparar();await negar(()=>incluir(jaIndisponivel));await salvarComProjecao(gestor.db,L,'produtos','p0',{disponivel:true});
 const inativo=await preparar();await salvarComProjecao(gestor.db,L,'produtos','p0',{ativo:false});await negar(()=>incluir(inativo));const jaInativo=await preparar();await assert.rejects(()=>incluir(jaInativo),e=>e.code==='permission-denied');checks++;await salvarComProjecao(gestor.db,L,'produtos','p0',{ativo:true});
 const incompleto=await preparar(2);await incluir(incompleto);await negar(async()=>(await loteFinal(incompleto)).commit());
 const vazio=await preparar();await negar(async()=>(await loteFinal(vazio)).commit());
 const ataques=await preparar();await incluir(ataques);
 for(const patch of [{subtotal:0},{total:0},{desconto:1},{taxaEntrega:5},{tipoEntrega:'entrega'},{clienteId:outro.uid},{lojaId:B},{status:'entregue'},{pagamento:{forma:'pix',status:'confirmado',valor:1}},{cliente:{nome:'Outro',telefone:'51999999999'}},{endereco:{rua:'Falso'}},{operacaoCompra:incompleto.chave}])await negar(async()=>(await loteFinal(ataques,patch)).commit());
 const invalido=await preparar();const original=(await getDocFromServer(op(cliente,invalido.chave))).data();
 for(const patch of [{centavos:0,itens:[{produtoId:'p0',nome:'Produto 0',precoUnitario:0,quantidade:1,subtotal:0}],ids:['p0'],unidades:1},{dados:{...original.dados,itens:[{produtoId:'p0',quantidade:2}]}},{revisao:999},{expiraEm:Timestamp.fromMillis(Date.now()+9999999)}])await negar(()=>updateDoc(op(cliente,invalido.chave),patch));
 await incluir(invalido);await negar(()=>updateDoc(op(cliente,invalido.chave),{itens:[]}));
 await negar(()=>getDocFromServer(ref(outro,op(cliente,invalido.chave).path)));
 await negar(()=>setDoc(ref(outro,op(cliente,invalido.chave).path),original));
 await negar(()=>deleteDoc(op(cliente,invalido.chave)));
 const expirado=await preparar(1,{ttl:1800});await incluir(expirado);await new Promise(r=>setTimeout(r,1900));await negar(async()=>(await loteFinal(expirado)).commit());await negar(()=>updateDoc(op(cliente,expirado.chave),{centavos:200}));
 // Finalização não pode aproveitar estado anterior em batch que altera o preço.
 const junto=await preparar(1,{ator:gestor});await incluir(junto);const lote=await loteFinal(junto),v=(await getDocFromServer(ctrl(gestor))).data();
 lote.update(origem(gestor),{preco:9.99});lote.set(publico(gestor),projetarRegistro('produtos',{...produto(0),preco:9.99}));lote.set(ctrl(gestor),{revisao:v.revisao+1,alteracao:{tipo:'produtos',id:'p0'}});await negar(()=>lote.commit());
 ok((await getDocFromServer(origem(gestor))).data().preco===1,'batch inteiro rejeitado');
 // Retry real da transação administrativa, com conflito provocado por barreira.
 let liberar,chegou;const barreira=new Promise(r=>liberar=r),primeiraLeitura=new Promise(r=>chegou=r);let chamadas=0;
 const corrida=runTransaction(gestor.db,async tx=>{const [s,c]=await Promise.all([tx.get(origem(gestor)),tx.get(ctrl(gestor))]);chamadas++;if(chamadas===1){chegou();await barreira;}const d={...s.data(),preco:3};tx.update(origem(gestor),{preco:3});tx.set(publico(gestor),projetarRegistro('produtos',d));tx.set(ctrl(gestor),{revisao:c.data().revisao+1,alteracao:{tipo:'produtos',id:'p0'}});});
 await primeiraLeitura;await salvarComProjecao(gestor.db,L,'produtos','p0',{preco:2});liberar();
 let corridaRecusada=false;
 try {await corrida;}catch(e){assert.equal(e.code,'permission-denied');corridaRecusada=true;ok((await getDocFromServer(origem(gestor))).data().preco===2 && (await getDocFromServer(publico(cliente))).data().preco===2,'conflito recusado sem escrita parcial');await salvarComProjecao(gestor.db,L,'produtos','p0',{preco:3});}
 ok((chamadas>=2 || corridaRecusada) && (await getDocFromServer(publico(cliente))).data().preco===3,'repeticao apos conflito conserva canonico');
 const apos=await cliente.criar(dados(),{chave:`apos-corrida-${runId}`});ok(apos.total===3,'cliente compra preco atual apos corrida');
 await salvarComProjecao(gestor.db,L,'produtos','p0',{preco:0.29});
 const cent=dados();cent.itens[0].quantidade=3;cent.observacao='Linha 1\nLinha 2';
 ok((await cliente.criar(cent,{chave:`centavos-${runId}-001`})).total===0.87,'centavos exatos e observacao multilinha');
 await negar(()=>salvarComProjecao(gestor.db,L,'produtos','p0',{preco:1.001}));
 await seed.doc(`lojas/${L}/produtos/p0`).update({preco:1.001});const fracao=await preparar();await negar(()=>incluir(fracao));
 await salvarComProjecao(gestor.db,L,'produtos','p0',{preco:1});
 //008: taxa fracionária agora é recusada também na configuração, não só na compra.
 await negar(()=>salvarComProjecao(gestor.db,L,'loja',null,{entrega:{taxa:1.001}}));
 for(const patch of [{pedidoMinimo:10},{entrega:{habilitada:false}},{pagamentos:{pix:false}}]){
  await salvarComProjecao(gestor.db,L,'loja',null,patch);
  const t=await preparar(1,{tipo:'entrega'});await incluir(t);await negar(async()=>(await loteFinal(t)).commit());
  await salvarComProjecao(gestor.db,L,'loja',null,{pedidoMinimo:0,entrega:{habilitada:true,taxa:5},pagamentos:{pix:true}});
 }
 await seed.doc(`lojas/${L}/produtos/p50`).delete();
 const ausente=await preparar();const aAus=(await getDocFromServer(op(cliente,ausente.chave))).data();
 const chaveAus=`ausente-${runId}-001`,tAus={ator:cliente,chave:chaveAus,id:hash(cliente.uid+':'+chaveAus)};
 await setDoc(op(cliente,chaveAus),{...aAus,dados:{...aAus.dados,itens:[{produtoId:'p50',quantidade:1}]},marcador:tAus.id,criadoEm:serverTimestamp()});
 await negar(()=>incluir(tAus));await seed.doc(`lojas/${L}/produtos/p50`).set(produto(50));
 const minChave=`minimo-servico-${runId}-001`;
 await salvarComProjecao(gestor.db,L,'loja',null,{pedidoMinimo:10});
 await assert.rejects(()=>cliente.criar(dados(),{chave:minChave}),e=>e.code==='COMPRA_REVISAR' && e.status===400);checks++;
 ok((await getDocFromServer(op(cliente,minChave))).data().estado==='abandonada','encerramento confirmado antes de nova tentativa');
 await salvarComProjecao(gestor.db,L,'loja',null,{pedidoMinimo:0});
 await assert.rejects(()=>cliente.criar(dados(),{chave:minChave}),e=>e.code==='COMPRA_REVISAR');checks++;
 ok((await cliente.criar(dados(),{chave:`nova-apos-recusa-${runId}`})).total===1,'nova confirmacao explicita apos recusa');

 await negar(()=>salvarComProjecao(gestor.db,L,'categorias','cat',{ativo:false}));
 console.log(JSON.stringify({sincronizacao:'aprovada_no_Emulator',projectId,checks,tamanhos,causaAnterior:'fonte_auxiliar_sem_vinculo_canonico',autoridade:'produto_original; projecao_para_leitura; revisao_getAfter_monotonica',contraexemplo999_100:'negado',pedidosCriadosPeloCliente:(await seed.collection(`lojas/${L}/pedidos`).get()).size,retryAdminChamadas:chamadas,conflitoAdmin:corridaRecusada?'negado_sem_parcial_e_reexecucao_confirmada':'SDK_reexecutou_callback',concorrenciaNonce:'um_pedido',B03:'desativacao_categoria_continua_negada',express:false,naoPublica:true}));
} finally {
 await carregar("rules_version = '2'; service cloud.firestore { match /databases/{db}/documents { match /{d=**} { allow read, write: if false; } } }");
 for(const a of atores){await signOut(a.auth);await terminate(a.db);await deleteApp(a.app);}
 await seed.terminate();await admin.deleteApp(adminApp);
}
