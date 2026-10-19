function validarAmbiente(env=process.env) {
  require('../middleware/publicacaoCatalogo').configurarPublicacao(env);
  const demo=require('./demoPublica').configurarDemo(env);
  const modo=env.APP_ENV || 'development';
  if(demo?.fonte==='fixtures'){
    if(!['development','homologacao'].includes(modo) || modo==='homologacao' && env.NODE_ENV!=='production' || modo==='development' && env.NODE_ENV==='production')throw new Error('Ambiente de fixtures inválido.');
    const origens=(env.CORS_ORIGINS || '').split(',');
    if(origens.some(o=>{try{const u=new URL(o.trim());return u.origin!==o.trim() || Boolean(u.username || u.password) || !(u.protocol==='https:' || modo==='development' && u.protocol==='http:' && ['localhost','127.0.0.1'].includes(u.hostname));}catch{return true;}}))throw new Error('Fixtures exigem origens explícitas e seguras.');
    if(env.RATE_LIMIT_MODE!=='enforce' || env.HTTP_LOG_ENABLED!=='1')throw new Error('Fixtures exigem limites e logs habilitados.');
    return {demo,emulador:false};
  }
  if(env.RATE_LIMIT_MODE && !['off','enforce'].includes(env.RATE_LIMIT_MODE))throw new Error('RATE_LIMIT_MODE inválido.');
  if(!['development','test','homologacao','production'].includes(modo))throw new Error('APP_ENV inválido.');
  const credentialMode=env.FIREBASE_CREDENTIAL_MODE || 'managed';
  const projetoDemoExistente=env.FIREBASE_EXISTING_DEMO_PROJECT_ID;
  if(projetoDemoExistente && (projetoDemoExistente!=='bancorestaurante' || modo!=='homologacao' || credentialMode!=='render-secret-file' || env.GCLOUD_PROJECT!==projetoDemoExistente))throw new Error('Autorização do projeto existente válida apenas na demonstração explícita com Secret File.');
  if(!['managed','render-secret-file'].includes(credentialMode))throw new Error('Modo de identidade Firebase inválido.');
  if(credentialMode==='render-secret-file' && modo!=='homologacao')throw new Error('Secret file permitido apenas em homologação.');
  const externo=['homologacao','production'].includes(modo);
  if(env.NODE_ENV==='production' && !externo)throw new Error('NODE_ENV production exige APP_ENV externo explícito.');
  if(externo) {
    if(env.NODE_ENV!=='production')throw new Error('Ambiente externo exige NODE_ENV production.');
    if(!env.GCLOUD_PROJECT || !env.FIREBASE_EXPECTED_PROJECT_ID || env.GCLOUD_PROJECT!==env.FIREBASE_EXPECTED_PROJECT_ID)throw new Error('Projeto Firebase externo deve ser explícito e corresponder ao projeto esperado.');
    if(env.FIREBASE_AUTH_EMULATOR_HOST || env.FIRESTORE_EMULATOR_HOST || env.GCLOUD_PROJECT.startsWith('demo-'))throw new Error('Ambiente externo não aceita Emulator.');
    const origens=(env.CORS_ORIGINS || '').split(',');
    if(!origens.length || origens.some(o=>{try{const u=new URL(o.trim());return u.protocol!=='https:' || u.origin!==o.trim() || Boolean(u.username || u.password) || ['localhost','127.0.0.1'].includes(u.hostname);}catch{return true;}}))throw new Error('CORS externo exige origens HTTPS explícitas.');
    if(modo==='production' && (env.GCLOUD_PROJECT==='bancorestaurante' || env.GCLOUD_PROJECT.startsWith('catalogos-homolog-') || env.FIREBASE_HOMOLOG_PROJECT_ID || env.FIREBASE_SERVICE_ACCOUNT_EMAIL))throw new Error('Configuração de demonstração/homologação não pode ser reutilizada em produção comercial.');
    if(modo==='homologacao') {
      if(!env.FIREBASE_CREDENTIAL_MODE)throw new Error('Homologação exige modo de identidade explícito.');
      const permitido=env.FIREBASE_HOMOLOG_PROJECT_ID;
      const dedicado=/^catalogos-homolog-[a-z0-9-]+$/.test(permitido || '') && permitido.length<=30;
      const demoAutorizada=permitido==='bancorestaurante' && projetoDemoExistente===permitido;
      if(!permitido || (!dedicado && !demoAutorizada) || env.GCLOUD_PROJECT!==permitido)throw new Error('Homologação exige projeto permitido explícito; banco existente exige autorização específica.');
      const email=env.FIREBASE_SERVICE_ACCOUNT_EMAIL || '';
      if(credentialMode==='render-secret-file' && (!/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(email.split('@')[0]) || email.split('@').length!==2 || !email.endsWith('@'+permitido+'.iam.gserviceaccount.com')))throw new Error('Conta de serviço de homologação deve ser explícita e pertencer ao projeto permitido.');
    }
    // O loader continua usando cert() e o Secret File fixo; esta variável não libera ADC arbitrária.
    if(env.GOOGLE_APPLICATION_CREDENTIALS && !(credentialMode==='render-secret-file' &&
      env.GOOGLE_APPLICATION_CREDENTIALS===require('./credencialHomologacao').SECRET_PATH))throw new Error('Arquivo de identidade externo deve corresponder ao Secret File autorizado.');
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
  return {projectId,emulador:false,...(demo?{demo}:{}),...(credentialMode==='render-secret-file'?{credentialMode,serviceAccountEmail:env.FIREBASE_SERVICE_ACCOUNT_EMAIL}:{})};
}
function portaServidor(value='3000') {const porta=Number(value);if(!Number.isInteger(porta) || porta<1 || porta>65535)throw new Error('PORT inválida.');return porta;}
module.exports={validarAmbiente,portaServidor};
