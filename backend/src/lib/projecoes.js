function campos(dados,tipos) {
  if(!dados || typeof dados!=='object' || Array.isArray(dados))return {};
  const seguro={};
  for(const [campo,tipo] of Object.entries(tipos)) {
    const valor=dados[campo];
    if(valor===null && tipo==='opcional')seguro[campo]=null;
    else if(typeof valor===(tipo==='opcional'?'string':tipo) && (tipo!=='number' || Number.isFinite(valor)))seguro[campo]=valor;
  }
  return seguro;
}
function textos(dados,nomes){return campos(dados,Object.fromEntries(nomes.map(n=>[n,'string'])));}
function data(valor) {
  if(valor instanceof Date && Number.isFinite(valor.getTime()))return valor;
  const segundos=valor?.seconds ?? valor?._seconds,nanos=valor?.nanoseconds ?? valor?._nanoseconds;
  if(Number.isFinite(segundos))return {_seconds:segundos,_nanoseconds:Number.isFinite(nanos)?nanos:0};
  return undefined;
}
function datas(saida,dados) {for(const campo of ['criadoEm','atualizadoEm']){const valor=data(dados?.[campo]);if(valor!==undefined)saida[campo]=valor;}return saida;}
function endereco(d){return textos(d,['id','apelido','rua','logradouro','numero','bairro','cidade','uf','complemento','cep']);}
function cliente(d){return datas({...textos(d,['id','nome','email','telefone']),...campos(d,{anonimo:'boolean'})},d);}
function usuario(d){return datas({...textos(d,['id','nome','email','telefone','role','lojaId']),...campos(d,{ativo:'boolean'})},d);}
function pagamento(d){return datas(campos(d,{forma:'string',status:'string',valor:'number'}),d);}
function pedido(d) {
  const seguro=datas(campos(d,{id:'string',lojaId:'string',clienteId:'opcional',enderecoId:'opcional',observacao:'string',tipoEntrega:'string',status:'string',subtotal:'number',taxaEntrega:'number',desconto:'number',total:'number'}),d);
  seguro.cliente=d?.cliente ? cliente(d.cliente) : null;seguro.endereco=d?.endereco?endereco(d.endereco):null;
  seguro.pagamento=pagamento(d?.pagamento);
  seguro.itens=Array.isArray(d?.itens)?d.itens.map(i=>campos(i,{produtoId:'string',nome:'string',precoUnitario:'number',quantidade:'number',subtotal:'number'})):[];
  for(const key of ['transicoesStatus','transicoesPagamento'])if(Array.isArray(d?.[key]))seguro[key]=d[key].filter(v=>typeof v==='string');
  return seguro;
}
function produto(d) {
  const seguro=datas({...textos(d,['id','nome','descricao','categoriaId']),...campos(d,{preco:'number',ativo:'boolean',disponivel:'boolean'})},d);
  for(const campo of ['imagem']) {const valor=urlPublica(d?.[campo]);if(valor!==undefined)seguro[campo]=valor;}
  if(Array.isArray(d?.ingredientes))seguro.ingredientes=d.ingredientes.filter(v=>typeof v==='string');return seguro;
}
function categoria(d){return datas({...textos(d,['id','nome','descricao','icone']),...campos(d,{ativo:'boolean',ordem:'number',produtos:'number'})},d);}
function urlPublica(valor) {if(valor==='')return '';if(typeof valor!=='string')return undefined;try {const url=new URL(valor);if(['http:','https:'].includes(url.protocol)&&!url.username&&!url.password)return valor;}catch{}return undefined;}
function loja(d) {
  const seguro={...textos(d,['id','nome','descricao','telefone','whatsapp','corPrimaria','tempoMedio','instagram']),...campos(d,{pedidoMinimo:'number'})};
  for(const campo of ['logo','imagem']) {const valor=urlPublica(d?.[campo]);if(valor!==undefined)seguro[campo]=valor;}
  seguro.endereco=typeof d?.endereco==='string'?d.endereco:endereco(d?.endereco);
  const horarios=d?.horarios || d?.horarioFuncionamento;
  seguro.horarios=typeof horarios==='string'?horarios:Object.fromEntries(Object.entries(horarios || {}).filter(([dia])=>['segunda','terca','terça','quarta','quinta','sexta','sabado','sábado','domingo'].includes(dia.toLowerCase())).map(([dia,h])=>[dia,typeof h==='string'?h:campos(h,{abertura:'string',fechamento:'string',fechado:'boolean'})]));
  seguro.pagamentos=Object.fromEntries(['pix','dinheiro','cartao_credito','cartao_debito'].map(f=>[f,d?.pagamentos?.[f]===true || (f.startsWith('cartao_') && d?.pagamentos?.cartao===true)]));
  const taxa=d?.entrega?.taxa ?? d?.taxaEntrega;
  seguro.entrega={habilitada:d?.entrega?.habilitada===true,taxa:Number.isFinite(taxa)&&taxa>=0?taxa:null};
  seguro.retirada={habilitada:d?.retirada?.habilitada!==false};return seguro;
}
module.exports={campos,textos,endereco,cliente,usuario,pagamento,pedido,produto,categoria,loja};
