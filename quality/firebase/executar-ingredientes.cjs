const {spawn}=require('node:child_process'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
(async()=>{
 for(const h of ['127.0.0.1:8188','127.0.0.1:9198']){let busy=false;try{await fetch('http://'+h);busy=true;}catch{}if(busy)throw Error('Porta local ocupada: '+h);}
 const {AuthEmulator}=require(path.resolve(path.dirname(process.execPath),'../lib/node_modules/firebase-tools/lib/emulator/auth/index.js'));
 const auth=new AuthEmulator({projectId:'demo-ingredientes',host:'127.0.0.1',port:9198,singleProjectMode:2});
 const java=spawn(path.join(root,'.tools-local/java21/bin/java'),['-jar',path.join(root,'.tools-local/firebase/cloud-firestore-emulator-v1.22.0.jar'),'--host=127.0.0.1','--port=8188','--project_id=demo-ingredientes'],{cwd:root,stdio:'ignore'});let stopped=false;java.once('exit',()=>stopped=true);
 try{await auth.start();let ready=false;for(let i=0;i<120;i++){try{const r=await fetch('http://127.0.0.1:8188');if(r.ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,500));}if(!ready)throw Error('Emulator indisponível.');
 await new Promise((resolve,reject)=>{const p=spawn(process.execPath,['--require',path.join(root,'quality/register.cjs'),path.join(root,'quality/frontend/scripts/ingredientes-emulator.mjs')],{cwd:root,stdio:'inherit',env:{...process.env,GCLOUD_PROJECT:'demo-ingredientes',FIRESTORE_EMULATOR_HOST:'127.0.0.1:8188',FIREBASE_AUTH_EMULATOR_HOST:'127.0.0.1:9198'}});p.once('error',reject);p.once('exit',code=>code===0?resolve():reject(Error('Ensaio falhou: '+code)));});
 }finally{if(!stopped)java.kill('SIGTERM');await auth.stop();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
