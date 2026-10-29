// Harness local, reaproveita os emuladores e binários já existentes no projeto.
const {spawn}=require('node:child_process'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
const homologacao=process.argv[2]==='--homologacao',seed4=process.argv[2]==='--seed-etapa4',b04=process.argv[2]==='--b04-etapa4';
const project=b04?'demo-catalogos-horarios-b04':'demo-replicacao',firestorePort=b04?8189:8188,authPort=b04?9199:9198,firestoreHost='127.0.0.1:'+firestorePort,authHost='127.0.0.1:'+authPort;
const servicos=process.argv[2]==='--servicos',regressao=process.argv[2]==='--regressao-provisionamento';
if(process.argv.length!==((servicos||regressao||homologacao||seed4||b04)?3:2))throw Error('Argumentos inválidos; projeto/portas sintéticos são fixos.');
const script=b04?'horarios-b04-emulator.js':(servicos||homologacao)?'servicos-multiloja-emulator.mjs':'provisionamento-emulator.mjs';
(async()=>{
 for(const host of [firestoreHost,authHost]){let busy=false;try{await fetch('http://'+host,{signal:AbortSignal.timeout(1000)});busy=true;}catch{}if(busy)throw Error('Porta local ocupada: '+host);}
 const {AuthEmulator}=require(path.resolve(path.dirname(process.execPath),'../lib/node_modules/firebase-tools/lib/emulator/auth/index.js'));
 const auth=new AuthEmulator({projectId:project,host:'127.0.0.1',port:authPort,singleProjectMode:2});
 const java=spawn(path.join(root,'.tools-local/java21/bin/java'),['-jar',path.join(root,'.tools-local/firebase/cloud-firestore-emulator-v1.22.0.jar'),'--host=127.0.0.1','--port='+firestorePort,'--project_id='+project],{cwd:root,stdio:'ignore'});
 let stopped=false;java.once('exit',()=>stopped=true);
 try {
  await auth.start();let ready=false;
  for(let i=0;i<120;i++){if(stopped)throw Error('Firestore Emulator encerrou antes de iniciar.');try{const r=await fetch('http://'+firestoreHost,{signal:AbortSignal.timeout(1000)});if(r.ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,500));}
  if(!ready)throw Error('Emulator indisponível.');
  await new Promise((resolve,reject)=>{const p=spawn(process.execPath,['--require',path.join(root,'quality/register.cjs'),path.join(root,'quality/frontend/scripts',script)],{cwd:root,stdio:'inherit',env:{...process.env,GCLOUD_PROJECT:project,CATALOGOS_ETAPA4:homologacao?'1':'0',CATALOGOS_B04_ETAPA4:b04?'1':'0',CATALOGOS_SEED_ETAPA4:seed4?'1':'0',CATALOGOS_EMULATOR_EXCLUSIVO:'1',CATALOGOS_PROVISIONAMENTO_REGRESSAO_ETAPA3:regressao?'1':'0',FIRESTORE_EMULATOR_HOST:firestoreHost,FIREBASE_AUTH_EMULATOR_HOST:authHost}});p.once('error',reject);p.once('exit',code=>code===0?resolve():reject(Error('Provisionamento: ensaio falhou ('+code+').')));});
 }finally{
  if(!stopped){const exit=new Promise(r=>java.once('exit',r));java.kill('SIGTERM');await exit;}
  await auth.stop();
 }
})().catch(e=>{console.error(e.message);process.exitCode=1;});
