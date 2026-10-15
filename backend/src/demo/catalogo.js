const {ErroHttp}=require('../lib/seguranca');
const indisponivel=()=>new ErroHttp('Catálogo indisponível nesta demonstração.',503);
function texto(valor,max) {return typeof valor==='string'?valor.slice(0,max):'';}
function imagem(valor) {
  if(typeof valor!=='string' || valor.length>2048)return undefined;
  try{const u=new URL(valor);if(u.protocol==='https:' && !u.username && !u.password && !u.search && !u.hash && !['localhost','127.0.0.1','[::1]'].includes(u.hostname))return u.href;}catch{}
}
// Recebe somente a capacidade de obter documentos: não expõe write/collection ao projetor.
async function catalogoDemo(config,lerDocumento) {
  if(!config.aprovado)throw indisponivel();
  const base='lojas/'+config.lojaId;
  const loja=await lerDocumento(base);
  if(!loja || loja.ativo!==true)throw indisponivel();
  const categorias=[];
  for(const id of config.categorias){const c=await lerDocumento(base+'/categorias/'+id);if(c?.ativo===true)categorias.push({id,nome:texto(c.nome,200)});}
  const permitidas=new Set(categorias.map(c=>c.id)),produtos=[];
  for(const id of config.produtos){
    const p=await lerDocumento(base+'/produtos/'+id);
    if(p?.ativo!==true || !permitidas.has(p.categoriaId) || !Number.isFinite(p.preco) || p.preco<0 || p.preco>1000000)continue;
    const img=imagem(p.imagem);
    produtos.push({id,nome:texto(p.nome,200),descricao:texto(p.descricao,2000),preco:p.preco,categoriaId:p.categoriaId,disponivel:p.disponivel!==false,...(img?{imagem:img}:{})});
  }
  const resposta={loja:{id:config.lojaId,nome:texto(loja.nome,200)},categorias,produtos};
  if(Buffer.byteLength(JSON.stringify(resposta))>65536)throw indisponivel();
  return resposta;
}
module.exports={catalogoDemo};
