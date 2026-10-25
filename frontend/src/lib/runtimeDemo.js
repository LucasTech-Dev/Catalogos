export const modoOriginalDemo=env=>env.VITE_CATALOGOS_RUNTIME_MODE==='original-readonly-demo';
export const modoFixtures=env=>modoOriginalDemo(env) || env.VITE_CATALOGOS_RUNTIME_MODE==='public-fixture-demo';
export function modoDemo(env) {
  const modo=env.VITE_CATALOGOS_RUNTIME_MODE;
  if(modoFixtures(env)) {
    if(!['development','homologacao'].includes(env.VITE_APP_ENV) || env.VITE_CATALOGOS_DEMO_LOJA_ID!=='loja-demo' || Object.keys(env).some(k=>k.startsWith('VITE_FIREBASE_') && env[k]))throw new Error('Fixtures Web exigem ambiente, loja e ausência de Firebase explícitos.');
    return true;
  }
  if(modo && !['full','public-readonly-demo'].includes(modo))throw new Error('Modo de execução Web inválido.');
  if(modo!=='public-readonly-demo'){
    if(Object.keys(env).some(k=>k.startsWith('VITE_CATALOGOS_DEMO_')))throw new Error('Configuração parcial de demonstração Web recusada.');
    return false;
  }
  if(env.VITE_APP_ENV!=='homologacao' || env.VITE_FIREBASE_PROJECT_ID!=='bancorestaurante' || env.VITE_FIREBASE_EXPECTED_PROJECT_ID!=='bancorestaurante' || env.VITE_FIREBASE_HOMOLOG_PROJECT_ID!=='bancorestaurante' || env.VITE_FIREBASE_EXISTING_DEMO_PROJECT_ID!=='bancorestaurante' || env.VITE_CATALOGOS_DEMO_LOJA_ID!=='loja-demo' || env.VITE_FIREBASE_AUTH_EMULATOR_URL)throw new Error('Demonstração Web exige projeto e loja autorizados.');
  return true;
}
