// Ordem012: inventário/backup somente leitura. Sem exclusão ou alteração remota.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {GoogleAuth}=require('../../backend/node_modules/google-auth-library');
const root=path.resolve(__dirname,'../..'),dir=path.join(root,'private-backups/ordem012-20261026');
const project='bancorestaurante',prefix=`projects/${project}/databases/(default)/documents`,base='https://firestore.googleapis.com/v1/'+prefix;
process.umask(0o077);
const canonical=x=>Array.isArray(x)?x.map(canonical):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,canonical(x[k])])):x;
const hash=x=>crypto.createHash('sha256').update(typeof x==='string'?x:JSON.stringify(canonical(x))).digest('hex');
const decode=v=>{if(!v)return null;if('mapValue'in v)return Object.fromEntries(Object.entries(v.mapValue.fields||{}).map(([k,x])=>[k,decode(x)]));if('arrayValue'in v)return(v.arrayValue.values||[]).map(decode);for(const k of ['stringValue','booleanValue','integerValue','doubleValue','referenceValue','timestampValue','nullValue'])if(k in v)return k==='integerValue'?Number(v[k]):v[k];return v;};
function save(name,data){fs.writeFileSync(path.join(dir,name),JSON.stringify(data,null,2)+'\n',{mode:0o600,flag:'wx'});}
(async()=>{
 assert.ok(!process.env.FIRESTORE_EMULATOR_HOST);const resume=process.argv[2]==='--finish';if(!resume)fs.mkdirSync(dir,{mode:0o700});
 const client=await new GoogleAuth({scopes:['https://www.googleapis.com/auth/cloud-platform']}).getClient();let requests=0;
 const call=async(url,data)=>{assert.ok(++requests<=3000);return(await client.request({url,method:data?'POST':'GET',...(data?{data}:{}),retry:false,timeout:20000})).data;};
 const database=await call(`https://firestore.googleapis.com/v1/projects/${project}/databases/(default)`);assert.equal(database.name,`projects/${project}/databases/(default)`);
 const snapshotAt=resume?JSON.parse(fs.readFileSync(path.join(dir,'firestore.json'))).snapshotAt:new Date(Date.now()-3000).toISOString(),documents=[],missing=[],collections=[];
 async function walk(parent=''){
  let token;do{const r=await call(base+parent+':listCollectionIds',{pageSize:100,readTime:snapshotAt,...(token?{pageToken:token}:{})});
   for(const id of r.collectionIds||[]){assert.ok(collections.length<500);const collection=parent+'/'+id;collections.push(collection);let next;
    do{const q=new URLSearchParams({pageSize:'100',showMissing:'true',readTime:snapshotAt});if(next)q.set('pageToken',next);const page=await call(base+collection+'?'+q);
     for(const d of page.documents||[]){assert.ok(documents.length+missing.length<2000);if(d.createTime)documents.push(d);else missing.push(d.name);await walk(d.name.slice(prefix.length));}next=page.nextPageToken;
    }while(next);
   }token=r.nextPageToken;
  }while(token);
 }
 if(resume){const previous=JSON.parse(fs.readFileSync(path.join(dir,'firestore.json')));documents.push(...previous.documents);collections.push(...previous.collections);missing.push(...previous.missing);}else await walk();
 if(!resume)save('firestore.json',{format:'firestore-rest-Value-v1',project,database:'(default)',snapshotAt,collections,missing,documents,complete:true});
 const config=resume?JSON.parse(fs.readFileSync(path.join(dir,'auth-config.json'))):await call(`https://identitytoolkit.googleapis.com/admin/v2/projects/${project}/config`);if(!resume)save('auth-config.json',config);
 const users=resume?JSON.parse(fs.readFileSync(path.join(dir,'auth-users.json'))).users:[];let next;if(!resume)do{const r=await call(`https://identitytoolkit.googleapis.com/v1/projects/${project}/accounts:batchGet?maxResults=100`+(next?'&nextPageToken='+encodeURIComponent(next):''));users.push(...r.users||[]);next=r.nextPageToken;assert.ok(users.length<=1000);}while(next);
 if(!resume)save('auth-users.json',{project,users,complete:true,at:new Date().toISOString()});
 const release=await call(`https://firebaserules.googleapis.com/v1/projects/${project}/releases/cloud.firestore`),rules=await call('https://firebaserules.googleapis.com/v1/'+release.rulesetName);
 const indexes=await call(`https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/collectionGroups/-/indexes`);assert.ok(!indexes.nextPageToken);
 const apps=await call(`https://firebase.googleapis.com/v1beta1/projects/${project}/webApps?pageSize=100`);assert.ok(!apps.nextPageToken);
 save('preservation-config.json',{database,release,rules,indexes,apps});
 const docs=documents.map(d=>({path:d.name.slice(prefix.length+1),data:decode({mapValue:{fields:d.fields}}),updateTime:d.updateTime}));
 const historic=JSON.parse(fs.readFileSync(path.join(root,'private-backups/acesso-admin-proprietario/admin-manifest-1792972111579.json'))),expected=historic.plan.uid;
 const adminUser=users.find(u=>u.localId===expected),adminDoc=docs.find(d=>d.path==='usuarios/'+expected);
 assert.ok(adminUser && !adminUser.disabled && adminUser.emailVerified && adminUser.providerUserInfo?.some(p=>p.providerId==='google.com'));
 assert.ok(adminDoc?.data.role==='admin' && adminDoc.data.ativo===true && adminDoc.data.lojaId==='loja-demo');
 const adminOther=docs.filter(d=>d.path.startsWith('usuarios/')&&d.path.split('/').length===2&&d.data.role==='admin');
 const protectedDocs=docs.filter(d=>!/^lojas\/loja-demo\/(pedidos|clientes|idempotencia|numerosPedidos|contadores)\//.test(d.path)&&d.path!=='usuarios/'+expected || d.path==='usuarios/'+expected);
 const rootCounts={};for(const d of docs){const key=d.path.split('/')[0];rootCounts[key]=(rootCounts[key]||0)+1;}
 const shopCounts={};for(const d of docs.filter(d=>d.path.startsWith('lojas/loja-demo/'))){const key=d.path.split('/')[2];shopCounts[key]=(shopCounts[key]||0)+1;}
 const candidates=users.filter(u=>u.localId!==expected).map(u=>{const refs=docs.filter(d=>d.path.split('/').includes(u.localId)||JSON.stringify(d.data).includes(u.localId));const lojas=[...new Set(refs.map(d=>d.path.startsWith('lojas/')?d.path.split('/')[1]:d.data.lojaId).filter(Boolean))];const roles=refs.filter(d=>d.path==='usuarios/'+u.localId).map(d=>d.data.role);return {uid:u.localId,anonymous:!(u.providerUserInfo||[]).length,providers:(u.providerUserInfo||[]).map(p=>p.providerId),hasPassword:!!u.passwordHash,refs:refs.map(d=>d.path),lojas,roles,otherShop:lojas.some(l=>l!=='loja-demo'),exclusiveEvidence:lojas.length===1&&lojas[0]==='loja-demo'&&!roles.some(r=>r!=='cliente')};});
 save('inventory-private.json',{project,snapshotAt,adminUid:expected,adminAuth:adminUser,adminAuthorization:adminDoc,protectedDocs:protectedDocs.map(d=>({path:d.path,fieldsSha256:hash(d.data)})),otherAdminUids:adminOther.filter(d=>d.path!=='usuarios/'+expected).map(d=>d.path.split('/')[1]),candidates,rootCounts,shopCounts,apps:(apps.apps||[]).map(a=>({appId:a.appId,displayName:a.displayName})),requests});
 const checksums={};for(const f of fs.readdirSync(dir)){const b=fs.readFileSync(path.join(dir,f));checksums[f]={bytes:b.length,sha256:crypto.createHash('sha256').update(b).digest('hex')};}save('integrity.json',{project,snapshotAt,documents:documents.length,users:users.length,files:checksums});
 const summary={phase:'INVENTARIO_BACKUP_LEITURA',complete:true,project,shop:'loja-demo',documents:documents.length,authUsers:users.length,adminVerified:true,otherAdmins:adminOther.length-1,rootCounts,shopCounts,authExclusiveCandidates:candidates.filter(c=>c.exclusiveEvidence).length,authUnclassified:candidates.filter(c=>!c.exclusiveEvidence).length,passwordUsers:users.filter(u=>u.passwordHash).length,hashConfigAvailable:!!config.signIn?.hashConfig?.signerKey,webApps:(apps.apps||[]).length,privateBackup:'private-backups/ordem012-20261026',realWrites:0};
 fs.writeFileSync(path.join(root,'docs/ADAPTACAO_SERVERLESS/ORDEM_012_INVENTARIO_EVIDENCIAS.json'),JSON.stringify(summary,null,2)+'\n');console.log(JSON.stringify(summary));
})().catch(e=>{console.error(JSON.stringify({failed:true,status:e.response?.status||null,code:typeof e.code==='string'?e.code:null,assertion:e instanceof assert.AssertionError?e.message:undefined,message:e.response?.data?.error?.message?.slice(0,220),noSecretPrinted:true,realWrites:0}));process.exitCode=1;});
