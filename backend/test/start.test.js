const test = require('node:test'), assert = require('node:assert/strict');
const {spawn} = require('node:child_process');
const net = require('node:net');
const path = require('node:path');
const {once} = require('node:events');

test('npm start com ambiente mínimo de produção e SIGTERM', {timeout: 15000}, async () => {
  const reserve = net.createServer().listen(0, '127.0.0.1');
  await once(reserve, 'listening');
  const port = reserve.address().port;
  await new Promise(resolve => reserve.close(resolve));
  const child = spawn('npm', ['start'], {cwd: path.join(__dirname, '..'), detached: true,
    env: {PATH: process.env.PATH, HOME: process.env.HOME, NODE_ENV: 'production',
      CORS_ORIGINS: 'https://catalogo-demo-cz1.pages.dev', PORT: String(port)}, stdio: ['ignore', 'pipe', 'pipe']});
  let output = '';
  child.stdout.on('data', b => output += b);
  child.stderr.on('data', b => output += b);
  try {
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Startup não concluído: ' + output)), 8000);
      child.stdout.on('data', () => {if (output.includes('Servidor de demonstração')) {clearTimeout(timer); resolve();}});
      child.once('exit', code => {clearTimeout(timer); reject(new Error('Startup encerrou: ' + code));});
    });
    assert.equal((await fetch('http://127.0.0.1:' + port + '/')).status, 200);
    const data = await (await fetch('http://127.0.0.1:' + port + '/publico/lojas/loja-demo/catalogo')).json();
    assert.equal(data.produtos.length, 6);
    process.kill(-child.pid, 'SIGTERM');
    const [code, signal] = await once(child, 'close');
    // O npm pode receber SIGTERM; o servidor precisa completar o shutdown.
    assert.ok(code === 0 || signal === 'SIGTERM');
    assert.match(output, /Servidor de demonstração encerrado/);
  } finally {
    try {process.kill(-child.pid, 'SIGKILL');} catch {}
  }
});
