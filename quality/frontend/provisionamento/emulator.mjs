// Bootstrap privilegiado apenas no Emulator. Nunca incluído no bundle React.
// Não carrega ADC/Admin SDK/.env, não cria Auth e não publica Rules/índices.
import {planejarProvisionamento, validarProjeto, serializar, sha256} from './manifesto.mjs';
export function alvoEmulator({projetoId, firestore, auth}, env = process.env) {
  validarProjeto(projetoId);
  if (env.CATALOGOS_EMULATOR_EXCLUSIVO !== '1') throw Error('Exige CATALOGOS_EMULATOR_EXCLUSIVO=1.');
  for (const host of [firestore,auth]) {
    const m = typeof host === 'string' && /^127\.0\.0\.1:([1-9][0-9]{0,4})$/.exec(host);
    if (!m || Number(m[1]) > 65535) throw Error('Emulators exigem IPv4 loopback e porta explícita.');
  }
  if (firestore === auth) throw Error('Auth e Firestore devem usar portas diferentes.');
  return {projetoId,firestore,auth};
}
export function codificar(v) {
  if (v === null) return {nullValue:null};
  if (typeof v === 'boolean') return {booleanValue:v};
  if (typeof v === 'string') return {stringValue:v};
  if (typeof v === 'number' && Number.isFinite(v)) return Number.isInteger(v) ? {integerValue:String(v)} : {doubleValue:v};
  if (Array.isArray(v)) return {arrayValue:{values:v.map(codificar)}};
  if (v && typeof v === 'object') return {mapValue:{fields:Object.fromEntries(Object.entries(v).map(([k,v])=>[k,codificar(v)]))}};
  throw Error('Tipo fora do manifesto JSON.');
}
function decodificar(v) {
  if ('nullValue' in v) return null;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('stringValue' in v) return v.stringValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(decodificar);
  if ('mapValue' in v) return Object.fromEntries(Object.entries(v.mapValue.fields || {}).map(([k,v])=>[k,decodificar(v)]));
  return v; // Tipos existentes fora do manifesto tornam a comparação diferente.
}
export function criarProvisionador(config, {fetcher = fetch, env = process.env} = {}) {
  const alvo = alvoEmulator(config,env);
  const prefixo = `projects/${alvo.projetoId}/databases/(default)/documents/`;
  const base = `http://${alvo.firestore}/v1/${prefixo.slice(0,-1)}`;
  const headers = {'Content-Type':'application/json',Authorization:'Bearer owner'};
  async function req(url, method = 'GET', body, ausente = false) {
    const r = await fetcher(url,{method,headers,redirect:'error',signal:AbortSignal.timeout(15000),...(body ? {body:JSON.stringify(body)} : {})});
    if (ausente && r.status === 404) return null;
    if (!r.ok) throw Object.assign(Error(`Emulator recusou ${method} (${r.status}); nenhuma repetição automática.`),{status:r.status});
    return r.json();
  }
  async function paginar(url, method, body, campo) {
    let token, itens = [];
    do {
      const u = new URL(url);
      if (method === 'GET') {u.searchParams.set('pageSize','100');u.searchParams.set('showMissing','true');if(token)u.searchParams.set('pageToken',token);}
      const r = await req(u.href,method,method === 'POST' ? {...body,pageSize:100,...(token?{pageToken:token}:{})} : undefined);
      itens.push(...(r[campo] || []));token=r.nextPageToken;
    } while (token);
    return itens;
  }
  async function inventariar(caminho, documentos, visitar = true) {
    const atual = await req(`${base}/${caminho}`,'GET',undefined,true);
    if (atual) documentos.push({caminho,fields:atual.fields || {},updateTime:atual.updateTime});
    if (!visitar) return;
    const colecoes = await paginar(`${base}/${caminho}:listCollectionIds`,'POST',{},'collectionIds');
    for (const colecao of colecoes) {
      if (!/^[a-zA-Z0-9_-]+$/.test(colecao)) throw Error('Subcoleção existente fora do contrato; destino não está vazio.');
      const docs = await paginar(`${base}/${caminho}/${colecao}`,'GET',undefined,'documents');
      for (const d of docs) {
        const inicio = prefixo+caminho+'/'+colecao+'/';
        if (!d.name.startsWith(inicio) || d.name.slice(inicio.length).includes('/')) throw Error('Caminho inesperado no inventário.');
        await inventariar(d.name.slice(prefixo.length),documentos);
      }
    }
  }
  async function preparar(manifesto) {
    const plano = planejarProvisionamento(manifesto);
    if (plano.projetoId !== alvo.projetoId) throw Error('Projeto do manifesto diverge do alvo explícito.');
    const uid = manifesto.administrador.uid;
    // Consultar uma identidade por UID; não enumerar nem inferir privilégio por e-mail.
    const contas = await req(`http://${alvo.auth}/identitytoolkit.googleapis.com/v1/projects/${alvo.projetoId}/accounts:lookup`,'POST',{localId:[uid]});
    const conta = contas.users?.find(u=>u.localId===uid);
    if (!conta || conta.disabled || conta.emailVerified !== true || !conta.providerUserInfo?.some(p=>['google.com','password'].includes(p.providerId))) throw Error('UID administrativo deve existir, estar ativo, verificado e usar provedor não anônimo no Auth Emulator.');
    const encontrados = [];
    for (const raiz of [`lojas/${plano.lojaId}`,`catalogosPublicos/${plano.lojaId}`,`usuarios/${uid}`]) await inventariar(raiz,encontrados);
    const esperados = plano.documentos.map(d=>({caminho:d.caminho,fields:codificar(d.dados).mapValue.fields}));
    const normalizar = fields => serializar(decodificar({mapValue:{fields}}));
    const iguais = encontrados.length === esperados.length && esperados.every(e => encontrados.some(d => d.caminho === e.caminho && normalizar(d.fields) === normalizar(e.fields)));
    if (encontrados.length && !iguais) throw Error('Destino existente ou alterado; não sobrescrever, reiniciar contador nem reatribuir administrador.');
    const estado = iguais ? 'ja-provisionado-intacto' : 'novo';
    return {plano,estado,inventario:{documentos:encontrados.length,hash:sha256(encontrados)},acao:iguais?'nenhuma':'criar-atomicamente'};
  }
  async function aplicar(manifesto) {
    const preparo = await preparar(manifesto);
    if (preparo.acao === 'nenhuma') return {...preparo,gravados:0};
    const writes = preparo.plano.documentos.map(d=>({update:{name:prefixo+d.caminho,fields:codificar(d.dados).mapValue.fields},currentDocument:{exists:false}}));
    try { await req(base+':commit','POST',{writes}); }
    catch (cause) { throw Object.assign(Error('Resultado não confirmado. Repita o dry-run do mesmo manifesto para conferir; nunca apague dados ou reinicie contador.'),{code:'PROVISIONAMENTO_INCERTO',cause}); }
    const confirmado = await preparar(manifesto);
    if (confirmado.estado !== 'ja-provisionado-intacto') throw Error('Provisionamento não confirmado.');
    return {...confirmado,gravados:writes.length};
  }
  return {dryRun:preparar,aplicar};
}
