// Inventário único: a documentação e os testes de cobertura usam estes contratos.
const contratos=[];
function rota(metodo,caminho,corpo=null,query=[]) {
  const parametros=[];
  const expressao=caminho.replace(/:([A-Za-z]+)/g,(_,nome)=>{parametros.push(nome);return '([^/]+)';});
  contratos.push({metodo,caminho,corpo,query,parametros,regex:new RegExp('^'+expressao+'/?$')});
}
rota('GET','/');
rota('GET','/usuarios/me');
const publico='/publico/lojas/:lojaId';
rota('GET',publico+'/catalogo');rota('GET',publico+'/me');rota('PUT',publico+'/me','cliente');
rota('GET',publico+'/me/enderecos');rota('POST',publico+'/me/enderecos','endereco');
rota('PUT',publico+'/me/enderecos/:enderecoId','endereco');rota('DELETE',publico+'/me/enderecos/:enderecoId');
const loja='/lojas/:lojaId';
rota('GET',loja);rota('PATCH',loja+'/pagamentos','pagamentos');
for(const [nome,id] of [['produtos','produtoId'],['categorias','categoriaId'],['clientes','clienteId']]) {
  rota('GET',loja+'/'+nome);rota('GET',loja+'/'+nome+'/:'+id);
}
rota('GET',loja+'/clientes/:clienteId/enderecos');rota('GET',loja+'/clientes/:clienteId/enderecos/:enderecoId');
rota('POST',loja+'/pedidos','pedido');rota('GET',loja+'/pedidos',null,['limite','cursor','status']);
rota('GET',loja+'/pedidos/finalizacao/:chave');rota('GET',loja+'/pedidos/:pedidoId');rota('GET',loja+'/pedidos/:pedidoId/whatsapp');
rota('PATCH',loja+'/pedidos/:pedidoId/status','status');rota('PATCH',loja+'/pedidos/:pedidoId/pagamento','financeiro');
const admin='/admin/lojas/:lojaId';
rota('GET',admin+'/sessao');rota('GET',admin+'/dashboard',null,['inicio','fim']);
rota('GET',admin+'/loja');rota('PATCH',admin+'/loja','loja');rota('GET',admin+'/pedidos/:id');
for(const nome of ['produtos','categorias','clientes']) {
  rota('GET',admin+'/'+nome,null,['limite','cursor',...(nome==='produtos'?['categoriaId']:nome==='categorias'?['contagem']:[])]);
  rota('GET',admin+'/'+nome+'/:id');
  if(nome!=='clientes') {
    rota('POST',admin+'/'+nome,nome==='produtos'?'produto':'categoria');
    rota('PATCH',admin+'/'+nome+'/:id',nome==='produtos'?'produtoParcial':'categoriaParcial');
    rota('DELETE',admin+'/'+nome+'/:id');
  }
}
module.exports=contratos;
