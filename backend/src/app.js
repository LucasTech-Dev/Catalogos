const express = require('express');
const {randomUUID} = require('node:crypto');
const fixture = require('../fixtures/catalogo-publico.json');
const CATALOGO = '/publico/lojas/loja-demo/catalogo';

function origensPermitidas(env = process.env) {
  // Recusa configuração externa de banco/identidade em vez de ignorá-la.
  if (Object.keys(env).some(k => /^(FIREBASE_|FIRESTORE_|GCLOUD_PROJECT$|GOOGLE_CLOUD_PROJECT$|GOOGLE_APPLICATION_CREDENTIALS$)/.test(k) && env[k])) {
    throw new Error('Configuração externa não suportada nesta demonstração.');
  }
  const origins = (env.CORS_ORIGINS || '').split(',').map(v => v.trim());
  for (const origin of origins) {
    const u = new URL(origin);
    if (u.origin !== origin || u.username || u.password || !(u.protocol === 'https:' ||
      env.NODE_ENV !== 'production' && u.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(u.hostname))) {
      throw new Error('CORS exige origens explícitas.');
    }
  }
  return origins;
}

function criarApp({env = process.env, clock = Date.now} = {}) {
  const origins = origensPermitidas(env);
  if (fixture.loja.id !== 'loja-demo' || fixture.categorias.length !== 3 || fixture.produtos.length !== 6) {
    throw new Error('Catálogo fictício inválido.');
  }
  // Projeção fechada: nenhum leitor de banco ou capacidade de escrita.
  const payload = {
    loja: {id: fixture.loja.id, nome: fixture.loja.nome},
    categorias: fixture.categorias.map(({id, nome}) => ({id, nome})),
    produtos: fixture.produtos.map(({id, nome, descricao, preco, categoriaId, disponivel}) =>
      ({id, nome, descricao, preco, categoriaId, disponivel})),
  };
  const serialized = JSON.stringify(payload);
  if (Buffer.byteLength(serialized) > 65536) throw new Error('Catálogo excede o limite.');
  const buckets = new Map();
  let nextCleanup = 0;
  const app = express();
  app.disable('x-powered-by');
  const negar = (_req, res) => res.status(404).json({error: 'Recurso indisponível nesta demonstração.'});
  app.use((req, res, next) => {
    const requestId = randomUUID(), start = process.hrtime.bigint();
    res.set({'X-Request-ID': requestId, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff'});
    res.once('finish', () => console.info(JSON.stringify({evento: 'http_acesso', requestId,
      status: res.statusCode, duracaoMs: Math.round(Number(process.hrtime.bigint() - start) / 1e6)})));
    next();
  });
  app.use((req, res, next) => {
    if (!['/', CATALOGO].includes(req.originalUrl) || !['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return negar(req, res);
    if (req.method === 'OPTIONS' && (!req.get('Origin') || !['GET', 'HEAD'].includes(req.get('Access-Control-Request-Method')))) return negar(req, res);
    const origin = req.get('Origin');
    // Vary também nas respostas sem Origin, para preservar o contrato com caches.
    res.vary('Origin');
    if (origin && !origins.includes(origin)) return res.status(403).json({error: 'Origem não autorizada.'});
    if (origin) res.set('Access-Control-Allow-Origin', origin);
    res.set({'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Expose-Headers': 'X-Request-ID, Retry-After'});
    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.originalUrl === CATALOGO) {
      const now = clock();
      if (now >= nextCleanup) {
        for (const [key, bucket] of buckets) if (bucket.end <= now) buckets.delete(key);
        nextCleanup = now + 60000;
      }
      const peer = req.socket.remoteAddress;
      let bucket = buckets.get(peer);
      if (!bucket || bucket.end <= now) {
        if (buckets.size >= 10000) return res.set('Retry-After', '60').status(429).json({error: 'Limite de requisições excedido.'});
        bucket = {end: now + 60000, count: 0};
        buckets.set(peer, bucket);
      }
      if (++bucket.count > 60) return res.set('Retry-After', String(Math.max(1, Math.ceil((bucket.end - now) / 1000))))
        .status(429).json({error: 'Limite de requisições excedido.'});
    }
    next();
  });
  app.get('/', (_req, res) => res.json({message: 'API do Catálogo funcionando.'}));
  app.get(CATALOGO, (_req, res) => res.type('json').send(serialized));
  app.use(negar);
  app.use((_error, _req, res, _next) => {
    if (res.headersSent) return res.destroy();
    res.status(500).json({error: 'Não foi possível concluir a operação.'});
  });
  return app;
}
module.exports = {criarApp, origensPermitidas, CATALOGO};
