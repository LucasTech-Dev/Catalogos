// Apenas um identificador aleatório na URL; nenhum conteúdo do formulário.
// Mantém o mesmo destino quando a resposta se perde ou a página recarrega.
export function chaveCriacaoAdmin(parametro) {
  const url=new URL(window.location.href);
  let chave=url.searchParams.get(parametro);
  if(!/^[a-f0-9-]{36}$/.test(chave||'')){
    chave=crypto.randomUUID();url.searchParams.set(parametro,chave);
    window.history.replaceState({},'',url);
  }
  return chave;
}
export function limparCriacaoAdmin(parametro,id) {
  const url=new URL(window.location.href);url.searchParams.delete(parametro);
  if(id)url.searchParams.set('id',id);
  window.history.replaceState({},'',url);
}
