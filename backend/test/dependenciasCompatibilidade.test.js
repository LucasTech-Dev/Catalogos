const test=require('node:test');
const assert=require('node:assert/strict');
const {Gaxios}=require('gaxios');
test('override uuid mantém boundary multipart do gaxios sem rede',async()=>{
  const gaxios=new Gaxios();let corpo='',boundary='';
  const r=await gaxios.request({url:'http://127.0.0.1/fixture-sem-rede',method:'POST',multipart:[{headers:{'Content-Type':'text/plain'},content:'fixture-local'}],adapter:async opts=>{
    boundary=opts.headers['Content-Type'].split('boundary=')[1];for await(const chunk of opts.body)corpo+=chunk.toString();return {config:opts,data:{ok:true},status:200,statusText:'OK',headers:{}};
  }});
  assert.equal(r.status,200);assert.match(boundary,/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/);assert.ok(corpo.includes('fixture-local'));assert.ok(corpo.endsWith('--'+boundary+'--'));
});
