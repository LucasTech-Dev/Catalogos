const fs = require('node:fs');

// Único arquivo permitido. Não aceitar caminhos vindos da requisição ou do ambiente.
const SECRET_PATH = '/etc/secrets/firebase-homologacao.json';
const FALHA = 'Identidade administrativa de homologação inválida ou indisponível.';

function carregarCredencial(ambiente, cert, filesystem = fs) {
  let fd;
  try {
    fd = filesystem.openSync(SECRET_PATH, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW | fs.constants.O_NONBLOCK);
    const stat = filesystem.fstatSync(fd);
    if (!stat.isFile() || stat.size < 1 || stat.size > 65536) throw new Error();
    // Leitura limitada inclusive se o arquivo crescer após fstat.
    const buffer = Buffer.alloc(65537);
    let total = 0, n;
    while (total < buffer.length && (n = filesystem.readSync(fd, buffer, total, buffer.length - total, null)) > 0) total += n;
    if (total > 65536) throw new Error();
    const key = JSON.parse(buffer.toString('utf8', 0, total));
    if (key.type !== 'service_account' || key.project_id !== ambiente.projectId ||
        key.client_email !== ambiente.serviceAccountEmail ||
        typeof key.private_key !== 'string' || !key.private_key.trim() ||
        typeof key.private_key_id !== 'string' || !key.private_key_id.trim()) throw new Error();
    // Apenas os campos necessários: endpoints arbitrários do JSON não são utilizados.
    return cert({ projectId: key.project_id, clientEmail: key.client_email, privateKey: key.private_key });
  } catch {
    // Não propagar mensagem/cause do fs, JSON ou SDK: podem conter caminho/segredo.
    throw new Error(FALHA);
  } finally {
    if (fd !== undefined) { try { filesystem.closeSync(fd); } catch { /* sem conteúdo privado nos logs */ } }
  }
}

function inicializarFirebase(ambiente, sdk, filesystem) {
  try {
    const apps = sdk.getApps();
    if (apps.length) {
      // No modo secret não reutilizar app com identidade que não foi validada aqui.
      if (ambiente.credentialMode === 'render-secret-file' || apps[0].options.projectId !== ambiente.projectId) throw new Error();
      return apps[0];
    }
    const credential = ambiente.emulador ? undefined : ambiente.credentialMode === 'render-secret-file'
      ? carregarCredencial(ambiente, sdk.cert, filesystem) : sdk.applicationDefault();
    return sdk.initializeApp({ projectId: ambiente.projectId, ...(credential ? { credential } : {}) });
  } catch {
    throw new Error('Não foi possível inicializar o Firebase com a configuração autorizada.');
  }
}
module.exports = { SECRET_PATH, carregarCredencial, inicializarFirebase };
