import {modoDemo} from './runtimeDemo.js';
const idValido=id=>typeof id==='string' && Boolean(id.trim()) && id.length<=128 && id.isWellFormed() && !/[\/\\\u0000-\u001f\u007f-\u009f]/.test(id) && !['.','..'].includes(id);
export function configuracaoAplicacao(env,hostname='localhost') {
  const demo=modoDemo(env);
  const modo=env.VITE_APP_ENV || 'development';
  if(!['development','test','homologacao','production'].includes(modo))throw new Error('Ambiente Web inválido.');
  const externo=['homologacao','production'].includes(modo);
  const projetoDemoExistente=env.VITE_FIREBASE_EXISTING_DEMO_PROJECT_ID;
  if(projetoDemoExistente && (projetoDemoExistente!=='bancorestaurante' || modo!=='homologacao' || env.VITE_FIREBASE_PROJECT_ID!==projetoDemoExistente))throw new Error('Projeto Web existente exige demonstração explicitamente autorizada.');
  if(modo==='production' && env.VITE_FIREBASE_PROJECT_ID==='bancorestaurante')throw new Error('Projeto Web de demonstração não autorizado para produção comercial.');
  if(externo) {
    for(const campo of (demo?['VITE_API_URL','VITE_FIREBASE_PROJECT_ID','VITE_FIREBASE_EXPECTED_PROJECT_ID']:['VITE_API_URL','VITE_FIREBASE_API_KEY','VITE_FIREBASE_AUTH_DOMAIN','VITE_FIREBASE_PROJECT_ID','VITE_FIREBASE_APP_ID','VITE_FIREBASE_EXPECTED_PROJECT_ID']))if(!env[campo])throw new Error('Configuração Web externa incompleta.');
    if(env.VITE_FIREBASE_AUTH_EMULATOR_URL || env.VITE_FIREBASE_PROJECT_ID.startsWith('demo-') || env.VITE_FIREBASE_PROJECT_ID!==env.VITE_FIREBASE_EXPECTED_PROJECT_ID)throw new Error('Projeto Web externo inválido.');
    const url=new URL(env.VITE_API_URL);
    if(url.protocol!=='https:' || url.username || url.password || url.search || url.hash || ['localhost','127.0.0.1','[::1]'].includes(url.hostname))throw new Error('API externa exige HTTPS seguro.');
  }
  if(modo==='homologacao') {
    const permitido=env.VITE_FIREBASE_HOMOLOG_PROJECT_ID;
    const dedicado=/^catalogos-homolog-[a-z0-9-]+$/.test(permitido || '') && permitido.length<=30;
    const demoAutorizada=permitido==='bancorestaurante' && projetoDemoExistente===permitido;
    if(!permitido || (!dedicado && !demoAutorizada) || env.VITE_FIREBASE_PROJECT_ID!==permitido)throw new Error('Homologação Web exige projeto permitido e autorização explícitos.');
  }
  let loja=env.VITE_LOJA_ID || 'loja-demo';
  if(env.VITE_LOJAS_POR_HOST) {
    let mapa;try{mapa=JSON.parse(env.VITE_LOJAS_POR_HOST);}catch{throw new Error('Mapa de lojas inválido.');}
    if(!mapa || Array.isArray(mapa) || typeof mapa!=='object' || Object.entries(mapa).some(([host,id])=>!/^([a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(host) || !idValido(id)))throw new Error('Mapa de lojas inválido.');
    if(!Object.hasOwn(mapa,hostname.toLowerCase()))throw new Error('Estabelecimento não configurado para este domínio.');
    loja=mapa[hostname.toLowerCase()];
  } else if(externo && !env.VITE_LOJA_ID)throw new Error('Estabelecimento externo não configurado.');
  if(demo && (loja!=='loja-demo' || (env.VITE_LOJAS_POR_HOST && Object.values(JSON.parse(env.VITE_LOJAS_POR_HOST)).some(id=>id!=='loja-demo'))))throw new Error('Loja não autorizada nesta demonstração.');
  if(!idValido(loja))throw new Error('Identificador de loja inválido.');
  if(modo==='test' && !env.VITE_FIREBASE_PROJECT_ID?.startsWith('demo-'))throw new Error('Testes Web exigem projeto demo.');
  return {lojaId:loja,base:(env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/,'')};
}
