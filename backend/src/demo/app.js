const express=require('express');
const erros=require('../lib/seguranca');
const {criarLimites,observar}=require('../middleware/operacao');
const {catalogoDemo}=require('./catalogo');
const CATALOGO='/publico/lojas/loja-demo/catalogo';
const negar=(req,res)=>res.status(404).json({error:'Recurso indisponível nesta demonstração.'});
function criarAppDemo(config,obterDb,env=process.env,lerDocumento) {
  const app=express();app.disable('x-powered-by');
  app.use(erros.correlacao,observar);
  app.use((req,res,next)=>{res.set('Cache-Control','no-store');res.set('X-Content-Type-Options','nosniff');next();});
  // Gate baseado no alvo bruto, sem decodificar/regravar: aliases e queries não ampliam o acesso.
  app.use((req,res,next)=>{
    if(!['/',CATALOGO].includes(req.originalUrl) || !['GET','HEAD','OPTIONS'].includes(req.method))return negar(req,res);
    if(req.method==='OPTIONS' && (!req.get('Origin') || !['GET','HEAD'].includes(req.get('Access-Control-Request-Method'))))return negar(req,res);
    next();
  });
  const origens=(env.CORS_ORIGINS || '').split(',').map(v=>v.trim());
  app.use((req,res,next)=>{
    const origem=req.get('Origin');
    if(origem && !origens.includes(origem))return res.status(403).json({error:'Origem não autorizada.'});
    if(origem){res.set('Access-Control-Allow-Origin',origem);res.vary('Origin');}
    res.set('Access-Control-Allow-Methods','GET, HEAD, OPTIONS');
    res.set('Access-Control-Allow-Headers','Content-Type');
    res.set('Access-Control-Expose-Headers','X-Request-ID, Retry-After');
    if(req.method==='OPTIONS')return res.status(204).end();
    next();
  });
  app.use(criarLimites({enabled:env.RATE_LIMIT_MODE==='enforce',ip:{catalogo:60,api:60,admin:60,checkout:60}}).entrada);
  app.get('/',(req,res)=>res.json({message:'API do Catálogo funcionando.'}));
  let cache,expira=0,pendente;
  async function lerCatalogo() {
    if(!config.aprovado)throw new erros.ErroHttp('Catálogo indisponível nesta demonstração.',503);
    if(cache && Date.now()<expira)return cache;
    if(!pendente)pendente=catalogoDemo(config,lerDocumento || (async path=>{
      const doc=await obterDb().doc(path).get();return doc.exists?doc.data():null;
    })).then(v=>{cache=v;expira=Date.now()+30000;return v;}).finally(()=>{pendente=null;});
    return pendente;
  }
  app.get(CATALOGO,async(req,res)=>res.json(await lerCatalogo()));
  app.use(negar);
  app.use(erros.tratarErro);
  return app;
}
module.exports={criarAppDemo,CATALOGO};
