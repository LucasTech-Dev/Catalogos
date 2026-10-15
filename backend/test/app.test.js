const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const net = require('node:net');
const originalLoad = Module._load;
Module._load = function(id, ...args) {
  if (/firebase|firestore|google-auth|gcloud/i.test(id)) throw new Error('SDK externo proibido: ' + id);
  return originalLoad.call(this, id, ...args);
};
// Todos os sockets de saída dos testes precisam ficar no loopback.
const originalConnect = net.Socket.prototype.connect;
net.Socket.prototype.connect = function(...args) {
  const options = typeof args[0] === 'object' ? (Array.isArray(args[0]) ? args[0][0] : args[0]) : null;
  if (options && options.host && !['127.0.0.1', 'localhost', '::1'].includes(options.host)) throw new Error('Rede externa proibida.');
  return originalConnect.apply(this, args);
};
const {criarApp, origensPermitidas, CATALOGO} = require('../src/app');
const env = {NODE_ENV: 'production', CORS_ORIGINS: 'https://catalogo-demo-cz1.pages.dev'};

test('configuração exige CORS explícito e recusa identidade externa', () => {
  assert.deepEqual(origensPermitidas(env), [env.CORS_ORIGINS]);
  for (const patch of [{CORS_ORIGINS: ''}, {CORS_ORIGINS: '*'}, {CORS_ORIGINS: 'https://site.example/path'},
    {CORS_ORIGINS: 'http://localhost:5173'}, {FIREBASE_CREDENTIAL_MODE: 'qualquer'},
    {GCLOUD_PROJECT: 'projeto-proibido'}, {GOOGLE_APPLICATION_CREDENTIALS: '/tmp/proibido.json'}]) {
    assert.throws(() => origensPermitidas({...env, ...patch}));
  }
  assert.deepEqual(origensPermitidas({CORS_ORIGINS: 'http://127.0.0.1:5173'}), ['http://127.0.0.1:5173']);
});

test('contrato HTTP real: catálogo, CORS, rotas privadas, métodos, limite e imutabilidade', async () => {
  const before = fs.readFileSync(new URL('../fixtures/catalogo-publico.json', 'file://' + __filename), 'utf8');
  let now = 100000;
  const app = criarApp({env, clock: () => now});
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = 'http://127.0.0.1:' + server.address().port;
  try {
    for (const method of ['GET', 'HEAD']) assert.equal((await fetch(base + '/', {method})).status, 200);
    const result = await fetch(base + CATALOGO, {headers: {Origin: env.CORS_ORIGINS}});
    assert.equal(result.status, 200);
    assert.equal(result.headers.get('access-control-allow-origin'), env.CORS_ORIGINS);
    assert.equal(result.headers.get('cache-control'), 'no-store');
    assert.equal(result.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(result.headers.get('x-powered-by'), null);
    const data = await result.json();
    assert.equal(data.loja.id, 'loja-demo');
    assert.equal(data.categorias.length, 3);
    assert.equal(data.produtos.length, 6);
    assert.equal(data.produtos.find(p => p.id === 'prato-teste').preco, 20);
    assert.equal(data.produtos.find(p => p.id === 'lanche-vegetariano').disponivel, false);
    assert.ok(data.produtos.every(p => data.categorias.some(c => c.id === p.categoriaId)));
    assert.doesNotMatch(JSON.stringify(data), /email|usuarios|clientes|private_key/);
    assert.equal((await fetch(base + CATALOGO, {method: 'HEAD'})).status, 200);
    assert.equal((await fetch(base + CATALOGO, {headers: {Origin: 'https://negada.example'}})).status, 403);
    assert.equal((await fetch(base + CATALOGO, {method: 'OPTIONS', headers: {Origin: env.CORS_ORIGINS,
      'Access-Control-Request-Method': 'GET'}})).status, 204);
    assert.equal((await fetch(base + CATALOGO, {method: 'OPTIONS', headers: {Origin: env.CORS_ORIGINS,
      'Access-Control-Request-Method': 'POST'}})).status, 404);
    for (const contract of require('./contratos-privados.cjs')) {
      const target = contract.caminho.replace(/:lojaId/g, 'loja-demo').replace(/:[A-Za-z]+/g, 'p');
      if (target === '/' || target === CATALOGO) continue;
      assert.equal((await fetch(base + target, {method: contract.metodo})).status, 404, contract.metodo + target);
    }
    for (const target of ['/admin', '/login', '/checkout', '/publico/lojas/outra/catalogo', CATALOGO + '/',
      CATALOGO + '?outra=loja', CATALOGO.toUpperCase(), '/publico/lojas/loja-demo/%63atalogo']) {
      assert.equal((await fetch(base + target)).status, 404, target);
    }
    for (const target of ['/', CATALOGO]) for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
      assert.equal((await fetch(base + target, {method})).status, 404);
    }
    for (let i = 0; i < 60; i++) await fetch(base + CATALOGO);
    const limited = await fetch(base + CATALOGO);
    assert.equal(limited.status, 429);
    assert.equal(limited.headers.get('retry-after'), '60');
    assert.equal((await fetch(base + '/')).status, 200);
    now += 60001;
    assert.deepEqual(await (await fetch(base + CATALOGO)).json(), data);
    assert.equal(fs.readFileSync(new URL('../fixtures/catalogo-publico.json', 'file://' + __filename), 'utf8'), before);
    assert.ok(!Object.keys(require.cache).some(p => /node_modules.*(?:firebase|firestore|google-auth)/i.test(p)));
  } finally {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
});
