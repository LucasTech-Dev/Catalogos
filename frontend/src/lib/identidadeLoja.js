// Somente apresentação: nunca aceita preços, permissões, conta ou configuração Firebase.
const textos = ['nome', 'descricao', 'tituloInicio', 'chamadaFinal'];
const imagens = ['logo', 'imagem', 'imagemSobre', 'favicon'];
export function imagemPublica(valor) {
  if (typeof valor !== 'string' || valor.length > 2048) return '';
  if (/^\/(?!\/)/.test(valor) && !/[\\\s]/.test(valor)) return valor;
  try { const url = new URL(valor); return url.protocol === 'https:' && !url.username && !url.password ? url.href : ''; } catch { return ''; }
}
export function personalizarLoja(loja, lojaId, configuracao = '') {
  let mapa = {};
  if (configuracao) {
    try { mapa = JSON.parse(configuracao); } catch { throw new Error('Identidade visual: JSON inválido.'); }
    if (!mapa || typeof mapa !== 'object' || Array.isArray(mapa)) throw new Error('Identidade visual: mapa inválido.');
  }
  const dados = Object.hasOwn(mapa, lojaId) ? mapa[lojaId] : {};
  if (!dados || typeof dados !== 'object' || Array.isArray(dados)) throw new Error('Identidade visual: loja inválida.');
  const resultado = {...loja};
  for (const campo of textos) if (typeof dados[campo] === 'string' && dados[campo].trim() && dados[campo].length <= 500) resultado[campo] = dados[campo].trim();
  for (const campo of imagens) resultado[campo] = imagemPublica(dados[campo]) || imagemPublica(loja?.[campo]);
  resultado.corPrimaria = /^#[0-9a-f]{6}$/i.test(dados.corPrimaria || '') ? dados.corPrimaria : /^#[0-9a-f]{6}$/i.test(loja?.corPrimaria || '') ? loja.corPrimaria : '#f97316';
  return resultado;
}
function luminancia(hex) {
  const canais = hex.match(/[0-9a-f]{2}/gi).map(c => { const v = parseInt(c,16)/255; return v <= .04045 ? v/12.92 : ((v+.055)/1.055)**2.4; });
  return canais[0]*.2126 + canais[1]*.7152 + canais[2]*.0722;
}
export function tokensIdentidade(cor = '#f97316') {
  if (!/^#[0-9a-f]{6}$/i.test(cor)) cor = '#f97316';
  const escura = '#' + cor.slice(1).match(/../g).map(c => Math.round(parseInt(c,16)*.78).toString(16).padStart(2,'0')).join('');
  let texto = cor;
  while (luminancia(texto) > .16) texto = '#' + texto.slice(1).match(/../g).map(c => Math.floor(parseInt(c,16)*.8).toString(16).padStart(2,'0')).join('');
  return {'--primary-text':texto, '--primary':cor, '--primary-dark':escura, '--on-primary':luminancia(cor) > .179 ? '#171717' : '#ffffff', '--primary-soft':cor+'12'};
}
export function aplicarIdentidade(loja, doc = document) {
  const root = doc.documentElement;
  const anteriores = Object.entries(tokensIdentidade(loja.corPrimaria)).map(([k,v]) => { const anterior = root.style.getPropertyValue(k); root.style.setProperty(k,v); return [k,anterior]; });
  const titulo = doc.title;
  doc.title = loja.nome ? `${loja.nome} | Catálogo` : 'Catálogo';
  const elementos = [];
  function meta(seletor, tag, atributos, valor, atributo = 'content') {
    let el = doc.head.querySelector(seletor); const criado = !el;
    if (!el) { el = doc.createElement(tag); for (const [k,v] of Object.entries(atributos)) el.setAttribute(k,v); doc.head.append(el); }
    const anterior = el.getAttribute(atributo); el.setAttribute(atributo,valor); elementos.push(() => { if(criado) el.remove(); else if(anterior === null) el.removeAttribute(atributo); else el.setAttribute(atributo,anterior); });
  }
  meta('meta[name="description"]','meta',{name:'description'},loja.descricao || 'Consulte o cardápio e faça seu pedido.');
  meta('meta[property="og:title"]','meta',{property:'og:title'},doc.title);
  meta('meta[property="og:description"]','meta',{property:'og:description'},loja.descricao || 'Consulte o cardápio e faça seu pedido.');
  // Valores vazios substituem qualquer marca anterior; sem herança entre lojas.
  meta('meta[property="og:image"]','meta',{property:'og:image'},imagemPublica(loja.imagem) || '');
  meta('link[rel="icon"]','link',{rel:'icon'},imagemPublica(loja.favicon) || imagemPublica(loja.logo) || '/demo-produto.svg','href');
  return () => { doc.title = titulo; for(const [k,v] of anteriores) v ? root.style.setProperty(k,v) : root.style.removeProperty(k); elementos.reverse().forEach(restaurar => restaurar()); };
}
