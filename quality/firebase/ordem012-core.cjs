// Política pura da Ordem012: somente dados antigos inventariados, sem acesso remoto.
const assert=require('node:assert/strict'),crypto=require('node:crypto');
const PROJECT='bancorestaurante',SHOP='loja-demo',COUNTER='lojas/loja-demo/contadores/pedidos',LOCK=999999999;
const canonical=x=>Array.isArray(x)?x.map(canonical):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,canonical(x[k])])):x;
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(canonical(x))).digest('hex');
const decode=v=>{if('mapValue'in v)return Object.fromEntries(Object.entries(v.mapValue.fields||{}).map(([k,x])=>[k,decode(x)]));if('arrayValue'in v)return(v.arrayValue.values||[]).map(decode);for(const k of ['stringValue','booleanValue','integerValue','doubleValue','referenceValue','timestampValue','nullValue'])if(k in v)return k==='integerValue'?Number(v[k]):v[k];return v;};
const pathOf=d=>{const prefix=`projects/${PROJECT}/databases/(default)/documents/`;assert.ok(d.name.startsWith(prefix));return d.name.slice(prefix.length);};
const dataOf=d=>decode({mapValue:{fields:d.fields||{}}});
function authImport(u){
 assert.ok(!u.tenantId && !(u.mfaInfo||[]).length,'Tenant/MFA exige ensaio de recuperação próprio.');
 const result={uid:u.localId,disabled:!!u.disabled,emailVerified:!!u.emailVerified,providerData:(u.providerUserInfo||[]).map(p=>({uid:p.rawId,providerId:p.providerId,...(p.email?{email:p.email}:{}),...(p.displayName?{displayName:p.displayName}:{}),...(p.photoUrl?{photoURL:p.photoUrl}:{}),...(p.phoneNumber?{phoneNumber:p.phoneNumber}:{})}))};
 for(const [from,to]of [['email','email'],['displayName','displayName'],['photoUrl','photoURL'],['phoneNumber','phoneNumber']])if(u[from])result[to]=u[from];
 if(u.customAttributes)result.customClaims=JSON.parse(u.customAttributes);
 if(u.passwordHash)result.passwordHash=Buffer.from(u.passwordHash,'base64');if(u.salt)result.passwordSalt=Buffer.from(u.salt,'base64');
 result.metadata={...(u.createdAt?{creationTime:new Date(Number(u.createdAt)).toUTCString()}:{}),...(u.lastLoginAt?{lastSignInTime:new Date(Number(u.lastLoginAt)).toUTCString()}:{})};return result;
}
function authHashOptions(config){const h=config.signIn?.hashConfig;assert.ok(h?.signerKey && h.algorithm==='SCRYPT','Configuração de hash não recuperável.');return {hash:{algorithm:'SCRYPT',key:Buffer.from(h.signerKey,'base64'),saltSeparator:Buffer.from(h.saltSeparator||'','base64'),rounds:Number(h.rounds),memoryCost:Number(h.memoryCost)}};}
function plan({documents,users,adminUid,includeOrphans=false}){
 const docs=documents.map(d=>({path:pathOf(d),data:dataOf(d),raw:d})),owner=users.find(u=>u.localId===adminUid),authorization=docs.find(d=>d.path==='usuarios/'+adminUid);
 assert.ok(owner&&!owner.disabled&&owner.emailVerified&&owner.providerUserInfo?.some(p=>p.providerId==='google.com'));
 assert.ok(authorization?.data.role==='admin'&&authorization.data.ativo===true&&authorization.data.lojaId===SHOP);
 const privileged=new Set(docs.filter(d=>d.path.split('/').length===2&&d.path.startsWith('usuarios/')&&d.data.role&&d.data.role!=='cliente').map(d=>d.path.split('/')[1]));privileged.add(adminUid);
 for(const u of users)if(u.customAttributes&&Object.values(JSON.parse(u.customAttributes)).some(x=>x===true))privileged.add(u.localId);
 const authDelete=[],authExceptions=[];
 for(const u of users){if(u.localId===adminUid)continue;const refs=docs.filter(d=>d.path.split('/').includes(u.localId)||JSON.stringify(d.data).includes(u.localId));const shops=new Set(refs.map(d=>d.path.startsWith('lojas/')?d.path.split('/')[1]:d.data.lojaId).filter(Boolean));const anonymous=!u.email&&!u.phoneNumber&&!u.passwordHash&&!(u.providerUserInfo||[]).length;
  if(privileged.has(u.localId)){authExceptions.push({uid:u.localId,reason:'administrativa_ou_tecnica'});continue;}
  if([...shops].some(s=>s!==SHOP)){authExceptions.push({uid:u.localId,reason:'outra_loja_ou_compartilhada'});continue;}
  if(shops.has(SHOP)||includeOrphans&&anonymous&&!refs.length)authDelete.push(u.localId);else authExceptions.push({uid:u.localId,reason:'origem_nao_comprovada'});
 }
 const deletion=docs.filter(d=>!(d.data.lojaId&&d.data.lojaId!==SHOP)&&(new RegExp('^lojas/'+SHOP+'/(pedidos|pedidos_legado|clientes|idempotencia|numerosPedidos)/').test(d.path)||d.path.startsWith('usuarios/')&&d.path.split('/').length===2&&authDelete.includes(d.path.split('/')[1])));
 const deletePaths=new Set(deletion.map(d=>d.path));for(const uid of privileged)assert.ok(!deletePaths.has('usuarios/'+uid));assert.ok(!deletePaths.has(COUNTER));
 const protectedDocs=docs.filter(d=>!deletePaths.has(d.path)&&d.path!==COUNTER);
 return {project:PROJECT,shop:SHOP,adminUid,adminUidSha256:hash(adminUid),authDelete,authExceptions,privileged:[...privileged],deleteDocs:deletion.map(d=>({path:d.path,updateTime:d.raw.updateTime,fieldsSha256:hash(d.raw.fields||{})})).sort((a,b)=>b.path.split('/').length-a.path.split('/').length||a.path.localeCompare(b.path)),protectedDocs:protectedDocs.map(d=>({path:d.path,fieldsSha256:hash(d.raw.fields||{})})),counter:docs.find(d=>d.path===COUNTER)?.raw||null,includeOrphans};
}
module.exports={PROJECT,SHOP,COUNTER,LOCK,canonical,hash,decode,pathOf,dataOf,authImport,authHashOptions,plan};
