// Adapta o DTO público somente leitura ao modelo do frontend original.
// A API já filtra registros ativos; indisponibilidade continua sendo respeitada.
export function adaptarCatalogoDemo(dto) {
  if(dto?.loja?.id!=='loja-demo' || !Array.isArray(dto.categorias) || !Array.isArray(dto.produtos))throw new Error('Catálogo de demonstração inválido.');
  const categorias=dto.categorias.map(c=>{
    if(typeof c.id!=='string' || typeof c.nome!=='string')throw new Error('Categoria inválida.');
    return {...c,ativo:true,icone:c.icone || ({refeicoes:'🍽️',lanches:'🍔',bebidas:'🥤'}[c.id] || '🍽️')};
  });
  const produtos=dto.produtos.map(p=>{
    if(typeof p.id!=='string' || typeof p.nome!=='string' || !Number.isFinite(p.preco) || p.preco<0 || typeof p.disponivel!=='boolean' || !categorias.some(c=>c.id===p.categoriaId))throw new Error('Produto inválido.');
    return {...p,ativo:p.ativo!==false,ingredientes:p.ingredientes || [],imagem:p.imagem || '/demo-produto.svg'};
  });
  return {...dto,loja:{...dto.loja,imagem:dto.loja.imagem || '/demo-produto.svg',descricao:dto.loja.descricao || 'Catálogo de demonstração com produtos fictícios. Explore o cardápio e experimente o carrinho.'},categorias,produtos};
}
