const MODO='public-readonly-demo';
const MODO_FIXTURES='public-fixture-demo';
function configurarDemo(env) {
  const modo=env.CATALOGOS_RUNTIME_MODE;
  if(modo && !['full',MODO,MODO_FIXTURES].includes(modo))throw new Error('Modo de execução inválido.');
  if(modo===MODO_FIXTURES){
    if(env.CATALOGOS_DEMO_LOJA_ID!=='loja-demo' || Object.keys(env).some(k=>(k.startsWith('FIREBASE_') || k.startsWith('FIRESTORE_') || k==='GCLOUD_PROJECT' || k==='GOOGLE_CLOUD_PROJECT' || k==='GOOGLE_APPLICATION_CREDENTIALS' || k.startsWith('CATALOGOS_DEMO_') && k!=='CATALOGOS_DEMO_LOJA_ID') && env[k]))throw new Error('Fixtures exigem loja-demo e configuração sem Firebase ou listas de publicação.');
    return Object.freeze({fonte:'fixtures',lojaId:'loja-demo'});
  }
  if(modo!==MODO){
    if(Object.keys(env).some(k=>k.startsWith('CATALOGOS_DEMO_')))throw new Error('Configuração parcial de demonstração recusada.');
    return null;
  }
  if(env.APP_ENV!=='homologacao' || env.NODE_ENV!=='production' || env.GCLOUD_PROJECT!=='bancorestaurante' || env.FIREBASE_EXPECTED_PROJECT_ID!=='bancorestaurante' || env.FIREBASE_HOMOLOG_PROJECT_ID!=='bancorestaurante' || env.FIREBASE_EXISTING_DEMO_PROJECT_ID!=='bancorestaurante' || env.FIREBASE_CREDENTIAL_MODE!=='render-secret-file' || env.CATALOGOS_DEMO_LOJA_ID!=='loja-demo' || env.FIREBASE_AUTH_EMULATOR_HOST || env.FIRESTORE_EMULATOR_HOST)throw new Error('Demonstração exige projeto, loja e identidade autorizados, sem Emulator.');
  if(!['0','1'].includes(env.CATALOGOS_DEMO_CATALOG_APPROVED))throw new Error('Aprovação de catálogo deve ser explícita.');
  function ids(nome,max) {
    let lista;try{lista=JSON.parse(env[nome]);}catch{throw new Error('Lista de publicação inválida.');}
    if(!Array.isArray(lista) || lista.length>max || lista.some(id=>typeof id!=='string' || !/^[A-Za-z0-9_-]{1,128}$/.test(id)) || new Set(lista).size!==lista.length)throw new Error('Lista de publicação inválida.');
    return Object.freeze(lista);
  }
  const produtos=ids('CATALOGOS_DEMO_PRODUCT_IDS',50),categorias=ids('CATALOGOS_DEMO_CATEGORY_IDS',20);
  const aprovado=env.CATALOGOS_DEMO_CATALOG_APPROVED==='1';
  if(aprovado && (!produtos.length || !categorias.length))throw new Error('Publicação aprovada exige listas de registros revisados.');
  return Object.freeze({lojaId:'loja-demo',aprovado,produtos,categorias});
}
module.exports={MODO,MODO_FIXTURES,configurarDemo};
