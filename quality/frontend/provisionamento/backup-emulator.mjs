// Ensaio recuperável de dados sintéticos; não é exportador de produção/Auth.
import {alvoEmulator} from './emulator.mjs';
import {serializar,sha256} from './manifesto.mjs';
import {identificadorValido} from '../../../frontend/src/lib/identificador.js';
export function criarBackupEmulator(config,{fetcher=fetch,env=process.env}={}) {
 const alvo=alvoEmulator(config,env),prefix=`projects/${alvo.projetoId}/databases/(default)/documents/`,base=`http://${alvo.firestore}/v1/${prefix.slice(0,-1)}`;
 async function req(path,method='GET',body){const r=await fetcher(base+path,{method,headers:{'Content-Type':'application/json',Authorization:'Bearer owner'},redirect:'error',signal:AbortSignal.timeout(15000),...(body?{body:JSON.stringify(body)}:{})});if(r.status===404)return null;if(!r.ok)throw Error('Backup Emulator: HTTP '+r.status);return r.json();}
 async function paginas(path,method,key){let token,all=[];do{const r=await req(path+(method==='GET'?'?pageSize=100&showMissing=true'+(token?'&pageToken='+encodeURIComponent(token):''):''),method,method==='POST'?{pageSize:100,...(token?{pageToken:token}:{})}:undefined);all.push(...(r?.[key]||[]));token=r?.nextPageToken;}while(token);return all;}
 async function arvore(path,all){const d=await req('/'+path);if(d)all.push({caminho:path,fields:d.fields||{}});for(const c of await paginas('/'+path+':listCollectionIds','POST','collectionIds')){if(!/^[\w-]+$/.test(c))throw Error('Coleção fora do contrato.');for(const x of await paginas('/'+path+'/'+c,'GET','documents')){if(!x.name.startsWith(prefix))throw Error('Projeto divergente.');await arvore(x.name.slice(prefix.length),all);}}}
 function validarIds(lojaId,uids){if(!identificadorValido(lojaId)||lojaId==='loja-demo'||!Array.isArray(uids)||!uids.length||new Set(uids).size!==uids.length||uids.some(u=>!identificadorValido(u)))throw Error('Exige loja sintética e UIDs explícitos únicos.');}
 async function exportar(lojaId,uids){validarIds(lojaId,uids);const documentos=[];for(const p of [`lojas/${lojaId}`,`catalogosPublicos/${lojaId}`,...uids.map(u=>'usuarios/'+u)])await arvore(p,documentos);if(documentos.some(d=>d.caminho.startsWith('usuarios/')&&d.fields.lojaId?.stringValue!==lojaId))throw Error('UID vinculado a outra loja.');documentos.sort((a,b)=>a.caminho.localeCompare(b.caminho));const dados={versao:1,origem:alvo.projetoId,lojaId,uids,documentos};return {...dados,sha256:sha256(dados)};}
 async function restaurar(snapshot){
  const {sha256:hash,...dados}=snapshot;validarIds(dados.lojaId,dados.uids);
  if(dados.versao!==1||!/^demo-/.test(dados.origem)||sha256(dados)!==hash)throw Error('Integridade do backup inválida.');
  const docs=dados.documentos,L=dados.lojaId;
  if(!Array.isArray(docs)||!docs.length||docs.length>450||new Set(docs.map(d=>d.caminho)).size!==docs.length)throw Error('Backup fora do limite atômico de450documentos.');
  for(const d of docs){const seg=d.caminho.split('/');if(seg.length%2||seg.some(s=>!identificadorValido(s))||!(d.caminho===`lojas/${L}`||d.caminho.startsWith(`lojas/${L}/`)||d.caminho===`catalogosPublicos/${L}`||d.caminho.startsWith(`catalogosPublicos/${L}/`)||dados.uids.some(u=>d.caminho==='usuarios/'+u))||!d.fields||typeof d.fields!=='object')throw Error('Caminho fora da loja do backup.');}
  if(docs.some(d=>d.caminho.startsWith('usuarios/')&&d.fields.lojaId?.stringValue!==L))throw Error('Vínculo administrativo fora da loja.');
  const atual=await exportar(L,dados.uids);if(atual.documentos.length)throw Error('Destino existente; nenhuma sobrescrita.');
  await req(':commit','POST',{writes:docs.map(d=>({update:{name:prefix+d.caminho,fields:d.fields},currentDocument:{exists:false}}))});
  const confirmado=await exportar(L,dados.uids);if(serializar(confirmado.documentos)!==serializar(docs))throw Error('Restauração não confirmada; conferir destino, sem reset.');
  return {documentos:docs.length,hashDados:sha256(docs)};
 }
 return {exportar,restaurar};
}
