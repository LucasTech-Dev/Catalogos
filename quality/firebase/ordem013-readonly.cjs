// Handoff 26/10: GETs restritos a catálogo, loja e versão Rules; nenhuma identidade/pedido.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {GoogleAuth}=require('../../backend/node_modules/google-auth-library');
const root=path.resolve(__dirname,'../..'),project='bancorestaurante';
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const decode=v=>{if(!v)return null;if('mapValue'in v)return Object.fromEntries(Object.entries(v.mapValue.fields||{}).map(([k,x])=>[k,decode(x)]));if('arrayValue'in v)return(v.arrayValue.values||[]).map(decode);for(const k of ['stringValue','booleanValue','integerValue','doubleValue'])if(k in v)return k==='integerValue'?Number(v[k]):v[k];return null;};
(async()=>{
 const client=await new GoogleAuth({scopes:['https://www.googleapis.com/auth/cloud-platform','https://www.googleapis.com/auth/firebase.readonly']}).getClient();
 const base=`https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents/lojas/loja-demo`;
 const get=async url=>(await client.request({url,method:'GET',retry:false,timeout:20000})).data;
 const list=async tipo=>{let docs=[],next;do{const r=await get(base+'/'+tipo+'?pageSize=100'+(next?'&pageToken='+encodeURIComponent(next):''));docs.push(...(r.documents||[]));next=r.nextPageToken;}while(next);return docs.map(d=>({id:d.name.split('/').at(-1),...decode({mapValue:{fields:d.fields}})}));};
 const produtos=await list('produtos'),categorias=await list('categorias'),loja=decode({mapValue:{fields:(await get(base)).fields}});
 const release=await get(`https://firebaserules.googleapis.com/v1/projects/${project}/releases/cloud.firestore`),rules=await get('https://firebaserules.googleapis.com/v1/'+release.rulesetName);
 const out={at:new Date().toISOString(),project,shop:'loja-demo',mode:'GET_ONLY',realWrites:0,products:produtos.map(p=>({id:p.id,nome:p.nome,ativo:p.ativo,disponivel:p.disponivel,categoriaId:p.categoriaId,categoriaAtiva:categorias.find(c=>c.id===p.categoriaId)?.ativo??null,precoValido:Number.isFinite(p.preco)&&p.preco>=0,possuiImagem:!!p.imagem})),categories:categorias.map(c=>({id:c.id,nome:c.nome,ativo:c.ativo})),hoursType:typeof loja.horarios,hourDayTypes:typeof loja.horarios==='object'?Object.fromEntries(Object.entries(loja.horarios||{}).map(([k,v])=>[k,typeof v])):{},ruleset:release.rulesetName,rulesSha256:hash(rules.source.files.map(f=>f.content).join('\n')),candidateSha256:hash(fs.readFileSync(path.join(root,'firebase/firestore.rules')))};
 fs.writeFileSync(path.join(root,'docs/ADAPTACAO_SERVERLESS/ORDEM_013_FIREBASE_LEITURA.json'),JSON.stringify(out,null,2)+'\n');
 console.log(JSON.stringify({products:out.products.length,categories:out.categories.length,rulesEqual:out.rulesSha256===out.candidateSha256,realWrites:0}));
})().catch(e=>{console.error('Leitura não concluída: '+(e.code||e.response?.status||'sem credencial disponível'));process.exitCode=1;});
