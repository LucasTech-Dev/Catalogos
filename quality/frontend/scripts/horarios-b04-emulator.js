// Ordem008/B-04: operações Web SDK reais; Admin SDK somente prepara dados sintéticos.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {initializeApp,deleteApp} from 'firebase/app';
import {getAuth,connectAuthEmulator,createUserWithEmailAndPassword,signOut} from 'firebase/auth';
import {getFirestore,connectFirestoreEmulator,doc,getDocFromServer,updateDoc,deleteDoc,writeBatch,runTransaction,terminate} from 'firebase/firestore';
import {projetarRegistro,salvarComProjecao} from '../../../frontend/src/services/projecaoPublica.js';
import {criarAdminGestao} from '../../../frontend/src/services/adminGestao.js';
const host=process.env.FIRESTORE_EMULATOR_HOST,authHost=process.env.FIREBASE_AUTH_EMULATOR_HOST;
for(const h of [host,authHost])assert.match(h || '',/^(127\.0\.0\.1|localhost):\d+$/);
assert.equal(process.env.CATALOGOS_EMULATOR_EXCLUSIVO,'1');
const projectId='demo-catalogos-horarios-b04',run=Date.now(),L='horarios-'+run;
const require=createRequire(new URL('../../../backend/package.json',import.meta.url)),admin=require('firebase-admin/app'),fsAdmin=require('firebase-admin/firestore');
const appAdmin=admin.initializeApp({projectId},'horarios-b04'),seed=fsAdmin.getFirestore(appAdmin),atores=[];
const orig=`lojas/${L}`,pub=`catalogosPublicos/${L}`,controle=orig+'/controleCompra/versao';
const regras=await readFile(new URL('../../../firebase/firestore.rules',import.meta.url),'utf8');
let checks=0;const casos=[];
const ok=(v,m)=>{assert.ok(v,m);checks++;casos.push(m);};
async function carregar(content){const r=await fetch(`http://${host}/emulator/v1/projects/${projectId}:securityRules`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({rules:{files:[{name:'firestore.rules',content}]}})});assert.ok(r.ok,await r.text());}
async function ator(tipo,loja=L){
 const app=initializeApp({projectId,apiKey:'fake-api-key'},'b04-'+atores.length),db=getFirestore(app),auth=getAuth(app),[h,p]=host.split(':');
 connectFirestoreEmulator(db,h,Number(p));connectAuthEmulator(auth,'http://'+authHost,{disableWarnings:true});
 await createUserWithEmailAndPassword(auth,`${tipo}-${atores.length}-${run}@teste.local`,'Senha-local-teste-123!');
 const a={app,db,auth,uid:auth.currentUser.uid};atores.push(a);
 if(tipo==='admin')await seed.doc('usuarios/'+a.uid).set({role:'admin',ativo:true,lojaId:loja});
 a.api=criarAdminGestao({db,auth,sessaoExistente:async()=>auth.currentUser,lojaId:L});return a;
}
const ref=(a,p)=>doc(a.db,p);
async function estado(){return Promise.all([orig,pub,controle].map(async p=>(await seed.doc(p).get()).data()));}
function merge(a,b){const n={...a};for(const [k,v] of Object.entries(b))n[k]=v && typeof v==='object' && !Array.isArray(v)?merge(a?.[k],v):v;return n;}
async function lote(a,patch,{fonte=true,projecao=true,revisao=true,adulterar=p=>p,salto=1}={}){
 const [anterior,publicoAtual,v]=await estado(),n=merge(anterior,patch),tx=writeBatch(a.db);
 if(fonte)tx.set(ref(a,orig),n);
 // Tipos adversariais não passam pelo projetor JS: enviá-los realmente às Rules.
 let p=publicoAtual;try{p=projetarRegistro('loja',n);}catch{}
 if(projecao)tx.set(ref(a,pub),adulterar(p));
 if(revisao)tx.set(ref(a,controle),{revisao:v.revisao+salto,alteracao:{tipo:'loja',id:'loja'}});
 return tx.commit();
}
async function negar(m,fn){const antes=await estado();await assert.rejects(fn,e=>e.code==='permission-denied');ok(true,m);assert.deepEqual(await estado(),antes);ok(true,m+' sem parcial');}
async function coerente(m){const [s,p]=await estado();assert.deepEqual(p,projetarRegistro('loja',s));ok(!JSON.stringify(p).includes('sentinela'),m);}
const dias=['segunda','terca','quarta','quinta','sexta','sabado','domingo'];
const semana=abertura=>Object.fromEntries(dias.map(d=>[d,{abertura,fechamento:'18:00',fechado:false}]));
try{
 await carregar(regras);
 const a=await ator('admin'),outro=await ator('admin'),b=await ator('admin',L+'-b'),c=await ator('cliente');
 const loja={nome:'B04',ativo:true,pagamentos:{pix:true},retirada:{habilitada:true},privado:'sentinela',horarios:{segunda:{abertura:'08:00',fechamento:'18:00',fechado:false,privado:'sentinela'}}};
 await seed.doc(orig).set(loja);await seed.doc(pub).set(projetarRegistro('loja',loja));await seed.doc(controle).set({revisao:0,alteracao:null});
 // Repetir os ataques essenciais numa origem pequena para também exercitar as
 // comparações canônicas sem depender da recusa de payloads grandes pelo custo.
 const pequeno={horarios:{segunda:{fechamento:'19:00'}}};
 for(const [m,x,op] of [
  ['origem isolada pequena',a,{projecao:false}],['projecao isolada pequena',a,{fonte:false,revisao:false}],
  ['divergencia pequena',a,{adulterar:p=>({...p,nome:'divergente'})}],
  ['revisao pequena ausente',a,{revisao:false}],['revisao pequena saltada',a,{salto:2}],
  ['cliente pequeno',c,{}],['admin cruzado pequeno',b,{}]
 ])await negar(m,()=>lote(x,pequeno,op));
 await lote(a,pequeno);await coerente('escrita direta válida pequena');
 // Não contaminar a contagem de revisões do cenário da semana abaixo.
 await seed.doc(orig).set(loja);await seed.doc(pub).set(projetarRegistro('loja',loja));await seed.doc(controle).set({revisao:0,alteracao:null});
 // Controle negativo permanente: o caminho atômico grande segue recusado com segurança.
 await negar('sete dias em lote integral ainda recusados',()=>lote(a,{horarios:semana('09:00')}));
 let r=await a.api.configurar({horarios:semana('09:00'),descricao:'Semana completa'});
 ok(r.salvamento.atomico===false && r.salvamento.diasConfirmados.length===7 && r.salvamento.outrosConfirmados,'sete dias confirmados pelo serviço em etapas');
 let [s,,v]=await estado();ok(dias.every(d=>s.horarios[d].abertura==='09:00') && s.descricao==='Semana completa','todos os valores persistidos');
 ok(v.revisao===8,'revisao monotônica por alteração confirmada');await coerente('projecao canônica mínima da semana');
 const antes=v.revisao;await a.api.configurar({horarios:{domingo:{fechamento:'19:00'}}});
 [s,,v]=await estado();ok(s.horarios.domingo.fechamento==='19:00' && v.revisao===antes+1,'um dia com semana completa');
 // SDK direto: nada depende do validador JavaScript do serviço.
 for(const [m,patch] of [
  ['sem abertura',{horarios:{terca:{abertura:''}}}],['formato inválido',{horarios:{terca:{abertura:'9:00'}}}],
  ['hora inválida',{horarios:{terca:{abertura:'24:00'}}}],['tipo inválido',{horarios:{terca:{abertura:900}}}],
  ['fechado inválido',{horarios:{terca:{fechado:'true'}}}],['dia inválido',{horarios:{feriado:{abertura:'09:00'}}}],
  ['privado adulterado',{horarios:{segunda:{privado:'novo'}}}],['mapa ausente',{horarios:null}],
  ['abertura igual ao fechamento',{horarios:{terca:{abertura:'18:00'}}}]
 ])await negar(m,()=>lote(a,patch));
 // Ausência real de campo: não é merge com o valor anterior.
 const [base,,ver]=await estado(),semHora=structuredClone(base);delete semHora.horarios.terca.abertura;
 await negar('campo abertura removido',async()=>{const tx=writeBatch(a.db);tx.set(ref(a,orig),semHora);tx.set(ref(a,pub),projetarRegistro('loja',semHora));tx.set(ref(a,controle),{revisao:ver.revisao+1,alteracao:{tipo:'loja',id:'loja'}});await tx.commit();});
 for(const [m,x] of [['cliente comum',c],['admin outra loja',b]])await negar(m,()=>lote(x,{horarios:{terca:{abertura:'10:00'}}}));
 await negar('origem isolada',()=>lote(a,{horarios:{terca:{abertura:'10:00'}}},{projecao:false}));
 await negar('projecao isolada',()=>lote(a,{horarios:{terca:{abertura:'10:00'}}},{fonte:false,revisao:false}));
 await negar('projecao divergente',()=>lote(a,{horarios:{terca:{abertura:'10:00'}}},{adulterar:p=>({...p,horarios:{...p.horarios,terca:'grátis'}})}));
 await negar('campo privado público',()=>lote(a,{horarios:{terca:{abertura:'10:00'}}},{adulterar:p=>({...p,privado:'sentinela'})}));
 for(const salto of [0,-1,2])await negar('revisao adulterada '+salto,()=>lote(a,{horarios:{terca:{abertura:'10:00'}}},{salto}));
 await negar('booleano pagamento adulterado',()=>lote(a,{pagamentos:{pix:1}}));
 await negar('nenhum pagamento',()=>lote(a,{pagamentos:{pix:false}}));
 await negar('chave pagamento removida da projecao',()=>lote(a,{descricao:'mascara'},{adulterar:p=>{delete p.pagamentos.cartao_debito;return p;}}));
 await negar('revisao ausente',()=>lote(a,{horarios:{terca:{abertura:'10:00'}}},{revisao:false}));
 await negar('excluir origem',()=>deleteDoc(ref(a,orig)));await negar('excluir projecao',()=>deleteDoc(ref(a,pub)));
 // Sem documento público, nenhuma alteração isolada pode passar.
 const salvoPublico=(await estado())[1];await seed.doc(pub).delete();
 await negar('origem sem projecao existente',()=>lote(a,{horarios:{terca:{abertura:'10:00'}}},{projecao:false}));await seed.doc(pub).set(salvoPublico);
 // Formulário inteiro é validado antes de gravar qualquer dia.
 const preInvalido=await estado();await assert.rejects(()=>a.api.configurar({horarios:{segunda:{abertura:'10:00'},terca:{abertura:'18:00'}}}),e=>e.status===400);assert.deepEqual(await estado(),preInvalido);ok(true,'validacao completa antes da primeira escrita');
 // Regra adicional somente restritiva no Emulator força falha real após segunda.
 const restrita=regras.replace('&& loja_comercial_valida()',"&& loja_comercial_valida() && request.resource.data.get('horarios',{}).get('terca',{}).get('abertura','') != '13:00'");assert.notEqual(restrita,regras);
 await carregar(restrita);const preFalha=await estado();let parcial;
 try{await a.api.configurar({horarios:{segunda:{abertura:'12:00'},terca:{abertura:'13:00'},quarta:{abertura:'14:00'}},descricao:'Não deve salvar'});}catch(e){parcial=e;}
 assert.equal(parcial?.code,'ADMIN_CONFIG_ETAPAS');assert.deepEqual(parcial.salvamento.diasConfirmados,['segunda']);assert.deepEqual(parcial.salvamento.diasNaoConfirmados,['terca','quarta']);ok(!parcial.salvamento.outrosConfirmados && parcial.message.includes('interrompido'),'falha parcial declarada corretamente');
 [s,,v]=await estado();ok(s.horarios.segunda.abertura==='12:00' && s.horarios.terca.abertura===preFalha[0].horarios.terca.abertura && s.horarios.quarta.abertura===preFalha[0].horarios.quarta.abertura && s.descricao===preFalha[0].descricao && v.revisao===preFalha[2].revisao+1,'falha mantém somente dia confirmado e sua revisão');await coerente('falha parcial mantém origem e projeção consistentes');
 await carregar(regras);
 await a.api.configurar({horarios:{segunda:{abertura:'12:00'},terca:{abertura:'13:00'},quarta:{abertura:'14:00'}},descricao:'Recuperada'});await coerente('retomada após falha');
 const restritaEndereco=regras.replace('&& loja_comercial_valida()',"&& loja_comercial_valida() && request.resource.data.get('endereco',{}).get('rua','') != 'Recusar no Emulator'");
 await carregar(restritaEndereco);const preEndereco=await estado();let parcialEndereco;
 try{await a.api.configurar({horarios:{segunda:{abertura:'12:30'},terca:{abertura:'13:30'}},nome:'Identidade confirmada',endereco:{rua:'Recusar no Emulator'}});}catch(e){parcialEndereco=e;}
 assert.equal(parcialEndereco?.code,'ADMIN_CONFIG_ETAPAS');assert.deepEqual(parcialEndereco.salvamento.gruposConfirmados,['identidade']);
 [s,,v]=await estado();ok(parcialEndereco.salvamento.diasConfirmados.length===2 && !parcialEndereco.salvamento.outrosConfirmados && s.nome==='Identidade confirmada' && s.endereco===preEndereco[0].endereco && v.revisao===preEndereco[2].revisao+3,'falha em grupo informa dias e identidade confirmados');await coerente('falha em grupo mantém projeção consistente');
 await carregar(regras);
 // Concorrência determinística: transação atrasada precisa reler origem/revisão.
 let liberar,chegou,chamadas=0;const barreira=new Promise(r=>liberar=r),leu=new Promise(r=>chegou=r);
 const preCorrida=(await estado())[2].revisao;
 const corrida=runTransaction(a.db,async tx=>{
  const [o,k]=await Promise.all([tx.get(ref(a,orig)),tx.get(ref(a,controle))]);chamadas++;
  if(chamadas===1){chegou();await barreira;}
  const n=merge(o.data(),{horarios:{segunda:{abertura:'10:30'}}});tx.set(ref(a,orig),n);tx.set(ref(a,pub),projetarRegistro('loja',n));tx.set(ref(a,controle),{revisao:k.data().revisao+1,alteracao:{tipo:'loja',id:'loja'}});
 });
 await leu;try{await outro.api.configurar({horarios:{domingo:{abertura:'11:00'}}});}finally{liberar();}
 let concorrenciaRecusada=false;try{await corrida;}catch(e){assert.ok(['permission-denied','aborted'].includes(e.code));concorrenciaRecusada=true;}
 [s,,v]=await estado();ok(s.horarios.domingo.abertura==='11:00' && (concorrenciaRecusada || s.horarios.segunda.abertura==='10:30') && v.revisao===preCorrida+(concorrenciaRecusada?1:2),'concorrência preserva alteração recente e revisão');await coerente('concorrência canônica');
 if(concorrenciaRecusada){await a.api.configurar({horarios:{segunda:{abertura:'10:30'}}});await coerente('retomada explícita após conflito');}
 // Legado/publicação mínima: mesma semântica nos ramos string/mapa/fechado.
 const [completa]=await estado();
 for(const h of ['Consultar',{segunda:'09:00 às 18:00',terca:{fechado:true},quarta:{abertura:'09:00'},quinta:{fechamento:'18:00'},sexta:{},sábado:{abertura:'10:00',fechamento:'17:00'}}]){
  await seed.doc(orig).set({...completa,horarios:h});await seed.doc(pub).set(projetarRegistro('loja',{...completa,horarios:h}));
  await a.api.configurar({descricao:'Legado '+checks});await coerente('projecao legada equivalente');
 }
 await seed.doc(orig).set(completa);await seed.doc(pub).set(projetarRegistro('loja',completa));
 const legadoInvalido=merge(completa,{horarios:{segunda:{abertura:900}}});
 await seed.doc(orig).set(legadoInvalido);
 await negar('join não converte horário numérico legado em texto aceito',()=>lote(a,{descricao:'nao aceitar'}, {adulterar:p=>({...p,horarios:{...p.horarios,segunda:'900 às 18:00'}})}));
 await seed.doc(orig).set(completa);await seed.doc(pub).set(projetarRegistro('loja',completa));
 await a.api.configurar({horarios:{quinta:{fechado:true}}});await coerente('fechar dia com semana completa');
 const formulario=await a.api.configurar({nome:'Formulário completo',descricao:'Configuração com sete dias',telefone:'51999999999',whatsapp:'51988887777',instagram:'@sintetico',logo:'https://example.test/logo.png',imagem:'https://example.test/imagem.jpg',corPrimaria:'#123abc',tempoMedio:'30min',horarios:semana('09:00'),endereco:{rua:'Rua pública',numero:'1',bairro:'Centro',cidade:'Cidade',uf:'RS',cep:'90000-000',complemento:'Sala1'},pagamentos:{pix:true,dinheiro:true,cartao_credito:true,cartao_debito:true},entrega:{habilitada:true,taxa:9.75},retirada:{habilitada:false},pedidoMinimo:15});
 ok(formulario.salvamento.gruposConfirmados.length===4 && formulario.nome==='Formulário completo' && formulario.entrega.taxa===9.75,'formulário completo com quatro grupos e sete dias');await coerente('formulário completo consistente');
 const recibo={B04:'sete_dias_em_etapas_aprovados',checks,casos,atomicoPorDia:true,atomicoSemana:false,regrasCanonicasIntegrais:true,retryChamadas:chamadas,concorrenciaRecusada,projeto:projectId,remoto:false};
 if(process.env.CATALOGOS_B04_ETAPA4==='1')await writeFile(new URL('../../../docs/ADAPTACAO_SERVERLESS/ETAPA4_B04_EMULATOR.json',import.meta.url),JSON.stringify({...recibo,at:new Date().toISOString()},null,2)+'\n');
 console.log(JSON.stringify(recibo));
}finally{
 await carregar("rules_version = '2'; service cloud.firestore { match /databases/{db}/documents { match /{d=**} { allow read, write: if false; } } }");
 for(const x of atores){await signOut(x.auth);await terminate(x.db);await deleteApp(x.app);}await seed.terminate();await admin.deleteApp(appAdmin);
}
