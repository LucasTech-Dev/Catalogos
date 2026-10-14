const assert=require('node:assert/strict');
assert.ok(process.env.GCLOUD_PROJECT?.startsWith('demo-'),'Somente projeto demo.');
async function main(){
  let html;
  for(const route of ['/','/cardapio','/admin/pedidos']){
    const r=await fetch('http://127.0.0.1:5000'+route);assert.equal(r.status,200);const body=await r.text();assert.ok(body.includes('<div id="root"'));html=body;assert.equal(r.headers.get('X-Content-Type-Options'),'nosniff');assert.ok(r.headers.get('Cache-Control').includes('no-cache'));
  }
  const index=await fetch('http://127.0.0.1:5000/index.html');assert.ok(index.headers.get('Cache-Control').includes('no-cache'));
  const asset=html.match(/src="(\/assets\/[^\"]+\.js)"/)[1];const r=await fetch('http://127.0.0.1:5000'+asset);assert.equal(r.status,200);assert.ok(r.headers.get('Cache-Control').includes('immutable'));
  console.log('Hosting Emulator: raiz/cardápio/admin diretos200, HTML SPA, nosniff, HTML revalidado e asset immutable aprovados.');
}
main().catch(e=>{console.error('Falha Hosting local:',e.message);process.exit(1);});
