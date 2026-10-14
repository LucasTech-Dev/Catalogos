const test=require('node:test');
const assert=require('node:assert/strict');
const express=require('express');
const http=require('node:http');
const {Readable,Writable}=require('node:stream');
const s=require('../src/lib/seguranca');
function request(app,path) {
  return new Promise(resolve=>{
    const req=new Readable({read(){this.push(null);}});req.method='GET';req.url=path;req.headers={};
    const res=new http.ServerResponse(req),chunks=[];res.assignSocket(new Writable({write(chunk,encoding,cb){chunks.push(Buffer.from(chunk));cb();}}));
    res.on('finish',()=>{const raw=Buffer.concat(chunks).toString().split('\r\n\r\n')[1];resolve({status:res.statusCode,body:JSON.parse(raw),requestId:res.getHeader('X-Request-ID')});});app.handle(req,res);
  });
}
test('Express 5 encaminha exceções sync/async ao handler global sem segredo',async()=>{
  const app=express();app.use(s.correlacao);app.get('/sync',()=>{throw new Error('senha=sentinela');});app.get('/async',async()=>{await Promise.resolve();throw Object.assign(new Error('token=sentinela'),{code:14});});
  app.get('/limite',()=>{throw new s.ErroHttp('Limite excedido.',429,'validacao');});app.use(s.rotaInexistente,s.tratarErro);
  const logger=console.error,logs=[];console.error=value=>logs.push(value);
  try {
    for(const [path,status] of [['/sync',500],['/async',503],['/limite',429],['/ausente',404]]){const r=await request(app,path);assert.equal(r.status,status);assert.doesNotMatch(JSON.stringify(r.body),/sentinela|stack/);assert.match(r.requestId,/^[\da-f-]{36}$/i);}
    assert.equal(logs.length,2);assert.doesNotMatch(logs.join(''),/sentinela|senha|token|\/sync|\/async/);for(const log of logs){const data=JSON.parse(log);assert.ok(data.requestId);assert.ok(data.status>=500);}
  }finally{console.error=logger;}
});
test('status arbitrário/expor em erro externo não autoriza divulgar sua mensagem',()=>{
  const r=s.classificar(Object.assign(new Error('sentinela'),{status:400,expor:true}));assert.equal(r.status,500);assert.doesNotMatch(r.mensagem,/sentinela/);
  assert.equal(s.classificar(Object.assign(new Error('SDK permiso'),{code:7})).status,500);
  assert.equal(s.classificar(Object.assign(new Error('SDK inexistente'),{code:5})).status,500);
  for(const status of [400,401,403,404,409,413,415,429,500,503])assert.equal(s.classificar(new s.ErroHttp('Mensagem.',status)).status,status);
});
test('resposta já iniciada fecha sem delegar exceção sensível ao logger padrão',()=>{
  let fechado=false,nextChamado=false;const original=console.error;console.error=()=>{};
  try{s.tratarErro(new Error('sentinela'),{requestId:'550e8400-e29b-41d4-a716-446655440000'},{headersSent:true,destroy(){fechado=true;}},()=>{nextChamado=true;});assert.equal(fechado,true);assert.equal(nextChamado,false);}finally{console.error=original;}
});
