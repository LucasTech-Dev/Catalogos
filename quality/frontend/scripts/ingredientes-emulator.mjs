// Restauração e contrato exclusivamente no Emulator; nunca importa credenciais/transportes reais.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import crypto from 'node:crypto';
import {initializeApp,deleteApp} from 'firebase/app';import {getFirestore,connectFirestoreEmulator,doc,getDocFromServer} from 'firebase/firestore';import {getAuth,connectAuthEmulator,createUserWithEmailAndPassword} from 'firebase/auth';
import {criarAdminCatalogo} from '../../../frontend/src/services/adminCatalogo.js';
const root=path.resolve(import.meta.dirname,'../../..'),dir=path.join(root,'private-backups/ingredientes-publicacao'),project=process.env.GCLOUD_PROJECT,host=process.env.FIRESTORE_EMULATOR_HOST;
assert.equal(project,'demo-ingredientes');assert.equal(host,'127.0.0.1:8188');assert.equal(process.env.FIREBASE_AUTH_EMULATOR_HOST,'127.0.0.1:9198');
const prefix=`projects/${project}/databases/(default)/documents/`,base=`http://${host}/v1/projects/${project}/databases/(default)/documents`,headers={'Content-Type':'application/json',Authorization:'Bearer owner'};
const backup=JSON.parse(fs.readFileSync(path.join(dir,'backup.json'))),proposal=JSON.parse(fs.readFileSync(path.join(root,'docs/ADAPTACAO_SERVERLESS/PROPOSTA_INGREDIENTES.json'))),updates=proposal.entries.filter(e=>e.fieldChanged.length);
const sorted=x=>Array.isArray(x)?x.map(sorted):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,sorted(x[k])])):x,canon=x=>JSON.stringify(sorted(x));let checks=0;const ok=(a,b)=>{assert.equal(canon(a),canon(b));checks++;};
const req=async(url,method='GET',data)=>{const r=await fetch(url,{method,headers,body:data?JSON.stringify(data):undefined});assert.ok(r.ok,await r.clone().text());return r.json();};
const restore=()=>req(base+':commit','POST',{writes:backup.documents.map(d=>({update:{name:prefix+d.path,fields:d.fields}}))});
const read=p=>req(base+'/'+p);
const rule=await req(`http://${host}/emulator/v1/projects/${project}:securityRules`,'PUT',{rules:{files:[{name:'firestore.rules',content:fs.readFileSync(path.join(root,'firebase/firestore.rules'),'utf8')}]}});
await restore();for(const d of backup.documents)ok((await read(d.path)).fields,d.fields);
const app=initializeApp({projectId:project,apiKey:'fake-api-key'},'ingredientes'),db=getFirestore(app),auth=getAuth(app);connectFirestoreEmulator(db,'127.0.0.1',8188);connectAuthEmulator(auth,'http://127.0.0.1:9198',{disableWarnings:true});
try{
 await createUserWithEmailAndPassword(auth,'ingredientes-local@example.invalid','Teste-local-123456!');
 await req(base+'/usuarios/'+auth.currentUser.uid,'PATCH',{fields:{role:{stringValue:'admin'},ativo:{booleanValue:true},lojaId:{stringValue:'loja-demo'}}});
 const api=criarAdminCatalogo({db,auth,sessaoExistente:async()=>auth.currentUser,lojaId:'loja-demo'}),ctrl=doc(db,'lojas/loja-demo/controleCompra/versao'),initial=(await getDocFromServer(ctrl)).data().revisao;
 for(const [i,e] of updates.entries()){
  const before=backup.documents.find(d=>d.path===`lojas/loja-demo/produtos/${e.id}`);
  const saved=await api.salvar('produtos',e.id,{ingredientes:e.proposedIngredients});ok(saved.ingredientes,e.proposedIngredients);
  const actual=(await read(before.path)).fields;const strip=x=>Object.fromEntries(Object.entries(x).filter(([k])=>!['ingredientes','atualizadoEm'].includes(k)));ok(strip(actual),strip(before.fields));
  ok((await getDocFromServer(doc(db,'catalogosPublicos/loja-demo/produtos/'+e.id))).data().ingredientes,e.proposedIngredients);ok((await getDocFromServer(ctrl)).data().revisao,initial+i+1);
 }
 for(const d of backup.documents.filter(d=>!updates.some(e=>d.path.endsWith('/produtos/'+e.id))&&!d.path.endsWith('/controleCompra/versao')))ok((await read(d.path)).fields,d.fields);
 // Cliente sem role não pode alterar os mesmos ingredientes.
 const other=initializeApp({projectId:project,apiKey:'fake-api-key'},'ingredientes-cliente'),otherDb=getFirestore(other),otherAuth=getAuth(other);connectFirestoreEmulator(otherDb,'127.0.0.1',8188);connectAuthEmulator(otherAuth,'http://127.0.0.1:9198',{disableWarnings:true});
 await createUserWithEmailAndPassword(otherAuth,'cliente-local@example.invalid','Teste-local-123456!');
 await assert.rejects(()=>criarAdminCatalogo({db:otherDb,auth:otherAuth,sessaoExistente:async()=>otherAuth.currentUser,lojaId:'loja-demo'}).salvar('produtos',updates[0].id,{ingredientes:['Alteração indevida']}),e=>e.status===403);checks++;await deleteApp(other);
 // Restaurar conteúdo integral da cópia após ensaio e conferir todos os documentos.
 await restore();for(const d of backup.documents)ok((await read(d.path)).fields,d.fields);
 const receipt={status:'APROVADO',checks,restoredDocuments:backup.documents.length,changedProducts:updates.length,productionWrites:0,backupSha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(dir,'backup.json'))).digest('hex'),rulesSha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'firebase/firestore.rules'))).digest('hex'),scope:'Restaurar conteúdo dos campos, aplicar via WebSDK/Rules, negar cliente e restaurar; metadata updateTime não é restaurada.'};
 fs.writeFileSync(path.join(dir,'emulator.json'),JSON.stringify(receipt,null,2)+'\n',{mode:0o600,flag:'wx'});console.log(JSON.stringify(receipt));
}finally{await deleteApp(app);}
