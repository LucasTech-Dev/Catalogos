import {auth,sessao,sessaoExistente} from '../lib/firebase';
export const lojaId = import.meta.env.VITE_LOJA_ID || 'loja-demo';
const base = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
export const publico = `/publico/lojas/${encodeURIComponent(lojaId)}`;
export const pedidos = `/lojas/${encodeURIComponent(lojaId)}/pedidos`;
export async function api(path, {privado = true, method = 'GET', body, chave, signal, administrativo = false, expectedUid} = {}) {
  let user=null;
  try {user=privado ? await (administrativo ? sessaoExistente() : sessao()) : null;}
  catch(e){if(administrativo && e.status===401)window.dispatchEvent(new Event('admin:sessao-invalida'));throw e;}
  function conferirSessao(){if(user && ((expectedUid && user.uid!==expectedUid) || (auth && auth.currentUser?.uid!==user.uid)))throw Object.assign(new Error('A sessão mudou. Confira seus dados e tente novamente.'),{status:409});}
  async function enviar(force = false) {
    conferirSessao();
    const headers = {'Content-Type':'application/json'};
    if (user) {
      try {headers.Authorization = `Bearer ${await user.getIdToken(force)}`;}
      catch(e) {
        if(e.code==='auth/network-request-failed')throw new Error('Não foi possível validar a sessão. Verifique sua conexão e tente novamente.');
        if(administrativo)window.dispatchEvent(new Event('admin:sessao-invalida'));
        throw Object.assign(new Error('Sessão expirada ou revogada. Entre novamente.'),{status:401});
      }
    }
    conferirSessao();
    if (chave) headers['Idempotency-Key'] = chave;
    try {return await fetch(base + path, {method, headers, body:body === undefined ? undefined : JSON.stringify(body), signal: signal || AbortSignal.timeout(20000)});}
    catch(e) {if (e.name === 'AbortError') throw e; throw new Error('Não foi possível conectar. Verifique sua conexão e tente novamente.');}
  }
  let response = await enviar();
  if (response.status === 401 && user) response = await enviar(true);
  const data = response.status === 204 ? null : await response.json().catch(() => null);
  if (administrativo && [401,403].includes(response.status)) window.dispatchEvent(new Event('admin:sessao-invalida'));
  if (!response.ok) throw Object.assign(new Error(data?.error || (response.status === 401 ? 'Sessão expirada. Entre novamente.' : 'Não foi possível concluir a operação.')), {status:response.status});
  return data;
}
