const {createHash}=require('node:crypto');
const {ErroHttp}=require('../lib/seguranca');
function grupo(req) {
  const path=(req.originalUrl?.split('?')[0] || req.path || '').replace(/\/+$/,'') || '/';
  if(req.method==='OPTIONS' || path==='/')return 'health';
  if(req.method==='POST' && /^\/lojas\/[^/]+\/pedidos$/.test(path))return 'checkout';
  if(path.startsWith('/admin/'))return 'admin';
  if(/^\/publico\/lojas\/[^/]+\/catalogo$/.test(path))return 'catalogo';
  return 'api';
}
// Limite por processo: complementar, não substitui proteção distribuída na borda.
function criarLimites({enabled=false,clock=Date.now,janelaMs=60000,maxChaves=10000,ip={catalogo:600,checkout:120,admin:600,api:600},uid={checkout:20,admin:180,api:120,catalogo:600}}={}) {
  const buckets=new Map();let proximaLimpeza=0;
  function consumir(req,res,tipo,identidade) {
    const classe=grupo(req);if(!enabled || classe==='health')return;
    const now=clock();if(now>=proximaLimpeza){for(const [key,b] of buckets)if(b.fim<=now)buckets.delete(key);proximaLimpeza=now+janelaMs;}
    const key=tipo+':'+classe+':'+createHash('sha256').update(String(identidade)).digest('hex');
    let b=buckets.get(key);if(b && b.fim<=now){buckets.delete(key);b=null;}
    if(!b){if(buckets.size>=maxChaves){res.set('Retry-After',String(Math.ceil(janelaMs/1000)));throw new ErroHttp('Limite de requisições excedido.',429);}b={fim:now+janelaMs,n:0};buckets.set(key,b);}
    const limite=(tipo==='ip'?ip:uid)[classe];
    if(++b.n>limite){res.set('Retry-After',String(Math.max(1,Math.ceil((b.fim-now)/1000))));throw new ErroHttp('Limite de requisições excedido.',429);}
  }
  return {entrada(req,res,next){try{consumir(req,res,'ip',req.socket?.remoteAddress || 'sem-peer');next();}catch(e){next(e);}},identidade(req,res,uid){consumir(req,res,'uid',uid);}};
}
const limites=criarLimites({enabled:process.env.RATE_LIMIT_MODE==='enforce'});
function observar(req,res,next) {
  if(process.env.HTTP_LOG_ENABLED==='1') {
    const inicio=process.hrtime.bigint();res.once('finish',()=>console.info(JSON.stringify({evento:'http_acesso',requestId:req.requestId,grupo:grupo(req),status:res.statusCode,duracaoMs:Math.round(Number(process.hrtime.bigint()-inicio)/1e6)})));
  }
  next();
}
module.exports={grupo,criarLimites,limites,observar};
