// Gera manifesto privado somente após recuperação local aprovada; não escreve remotamente.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),core=require('./ordem012-core.cjs');
process.umask(0o077);const root=path.resolve(__dirname,'../..'),dir=path.join(root,'private-backups/ordem012-20261026'),read=n=>JSON.parse(fs.readFileSync(path.join(dir,n)));
const backup=read('firestore.json'),auth=read('auth-users.json'),inv=read('inventory-private.json'),proof=JSON.parse(fs.readFileSync(path.join(root,'docs/ADAPTACAO_SERVERLESS/ORDEM_012_EMULATOR_EVIDENCIAS.json')));
assert.equal(proof.status,'APROVADO');assert.equal(proof.documentsRestored,backup.documents.length);assert.equal(proof.authUsersRestored,auth.users.length);
const manifest=core.plan({documents:backup.documents,users:auth.users,adminUid:inv.adminUid});
manifest.snapshotAt=backup.snapshotAt;manifest.createdAt=new Date().toISOString();manifest.pendingFacts={resetToOne:'aguardando declaração sobre compromissos externos',orphanAuth:'18 contas sem vínculo preservadas; aguarda classificação'};manifest.recoveryProofSha256=core.hash(proof);manifest.backupDocumentsSha256=core.hash(backup);
const deleted=new Set(manifest.deleteDocs.map(d=>d.path)),retainedReferences=[];
function strings(x){return typeof x==='string'?[x]:Array.isArray(x)?x.flatMap(strings):x&&typeof x==='object'?Object.values(x).flatMap(strings):[];}
for(const d of backup.documents){const p=core.pathOf(d);if(deleted.has(p)||p===core.COUNTER)continue;for(const s of strings(core.dataOf(d)))if([...deleted].some(t=>s===t||s.endsWith('/documents/'+t)))retainedReferences.push(p);}
manifest.retainedReferences=[...new Set(retainedReferences)];assert.equal(manifest.retainedReferences.length,0,'Referências sobreviventes exigem preservação.');
fs.writeFileSync(path.join(dir,'deletion-manifest.json'),JSON.stringify(manifest,null,2)+'\n',{mode:0o600,flag:'wx'});
const counts={};for(const d of manifest.deleteDocs){const key=d.path.startsWith('lojas/loja-demo/')?d.path.split('/')[2]:d.path.split('/')[0];counts[key]=(counts[key]||0)+1;}
const summary={order:'012',phase:'MANIFESTO_PREPARADO',at:new Date().toISOString(),project:core.PROJECT,shop:core.SHOP,documentDeletes:manifest.deleteDocs.length,counts,authDeletes:manifest.authDelete.length,authPreservedExceptions:manifest.authExceptions.reduce((r,a)=>(r[a.reason]=(r[a.reason]||0)+1,r),{}),adminUidSha256:manifest.adminUidSha256,manifestSha256:core.hash(manifest),backupLocation:'private-backups/ordem012-20261026',counterBefore:core.dataOf(manifest.counter),counterResetAuthorizedButExternalReferencesPending:true,realWrites:0};
fs.writeFileSync(path.join(root,'docs/ADAPTACAO_SERVERLESS/ORDEM_012_MANIFESTO_EVIDENCIAS.json'),JSON.stringify(summary,null,2)+'\n');console.log(JSON.stringify(summary));
