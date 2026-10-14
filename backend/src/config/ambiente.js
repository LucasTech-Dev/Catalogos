function validarAmbiente(env=process.env) {
  const modo=env.APP_ENV || 'development';
  if(env.RATE_LIMIT_MODE && !['off','enforce'].includes(env.RATE_LIMIT_MODE))throw new Error('RATE_LIMIT_MODE inválido.');
  if(!['development','test','homologacao','production'].includes(modo))throw new Error('APP_ENV inválido.');
  const externo=['homologacao','production'].includes(modo);
  if(env.NODE_ENV==='production' && !externo)throw new Error('NODE_ENV production exige APP_ENV externo explícito.');
  if(externo) {
    if(env.NODE_ENV!=='production')throw new Error('Ambiente externo exige NODE_ENV production.');
    if(!env.GCLOUD_PROJECT || !env.FIREBASE_EXPECTED_PROJECT_ID || env.GCLOUD_PROJECT!==env.FIREBASE_EXPECTED_PROJECT_ID)throw new Error('Projeto Firebase externo deve ser explícito e corresponder ao projeto esperado.');
    if(env.FIREBASE_AUTH_EMULATOR_HOST || env.FIRESTORE_EMULATOR_HOST || env.GCLOUD_PROJECT.startsWith('demo-'))throw new Error('Ambiente externo não aceita Emulator.');
    const origens=(env.CORS_ORIGINS || '').split(',');
    if(!origens.length || origens.some(o=>{try{const u=new URL(o.trim());return u.protocol!=='https:' || u.origin!==o.trim() || Boolean(u.username || u.password) || ['localhost','127.0.0.1'].includes(u.hostname);}catch{return true;}}))throw new Error('CORS externo exige origens HTTPS explícitas.');
    if(env.GOOGLE_APPLICATION_CREDENTIALS)throw new Error('Ambiente externo exige identidade gerenciada, sem arquivo de chave privada.');
    if(env.RATE_LIMIT_MODE!=='enforce' || env.HTTP_LOG_ENABLED!=='1')throw new Error('Ambiente externo exige limites e logs HTTP habilitados.');
  }
  const auth=env.FIREBASE_AUTH_EMULATOR_HOST,firestore=env.FIRESTORE_EMULATOR_HOST;
  const projectId=env.GCLOUD_PROJECT || 'bancorestaurante';
  if(auth || firestore) {
    if(!auth || !firestore || !/^(localhost|127\.0\.0\.1):\d{1,5}$/.test(auth) || !/^(localhost|127\.0\.0\.1):\d{1,5}$/.test(firestore) || !projectId.startsWith('demo-')) throw new Error('Emulação exige Auth e Firestore locais e projeto demo-.');
    for(const host of [auth,firestore]) {const porta=Number(host.split(':')[1]);if(porta<1 || porta>65535)throw new Error('Porta de emulador inválida.');}
    return {projectId,emulador:true};
  }
  if(projectId.startsWith('demo-'))throw new Error('Projeto demo exige ambos os emuladores.');
  if(modo==='test')throw new Error('Testes exigem projeto demo e ambos os emuladores.');
  return {projectId,emulador:false};
}
function portaServidor(value='3000') {const porta=Number(value);if(!Number.isInteger(porta) || porta<1 || porta>65535)throw new Error('PORT inválida.');return porta;}
module.exports={validarAmbiente,portaServidor};
