const test=require('node:test');
const assert=require('node:assert/strict');
const base=require('../../../backend/src/validators/base');
const admin=require('../../../backend/src/validators/administracao');
const {identificador}=require('../../../backend/src/lib/identificadores');
const pedidos=require('../../../backend/src/validators/pedidos');
const {ErroDominio}=require('../../../backend/src/lib/seguranca');

test('dinheiro rejeita números não finitos, frações de centavo e formatos ambíguos',()=>{
  for(const v of [NaN,Infinity,-Infinity,-1,1.001,19.999,1000000.01,'1',null,{},[]])assert.throws(()=>base.dinheiro(v,'Preço'),ErroDominio);
  for(const v of [0,0.01,0.29,19.99,1000000])assert.equal(base.dinheiro(v,'Preço'),v);
  assert.throws(()=>admin.produto({nome:'Produto',preco:0.001,categoriaId:'categoria'}),ErroDominio);
});
test('estrutura rejeita ciclos, profundidade, expansão e chaves de prototype',()=>{
  const ciclo={};ciclo.filho=ciclo;assert.throws(()=>base.estrutura(ciclo),ErroDominio);
  let profundo={};for(let i=0;i<10;i++)profundo={filho:profundo};assert.throws(()=>base.estrutura(profundo),ErroDominio);
  assert.throws(()=>base.estrutura(Array(5001).fill(1)),ErroDominio);
  for(const key of ['__proto__','constructor','prototype'])assert.throws(()=>base.estrutura(JSON.parse(`{"${key}":{}}`)),ErroDominio);
  assert.throws(()=>base.objeto(new Date()),ErroDominio);
});
test('identificadores e Unicode mantêm texto válido e negam caminhos/controles',()=>{
  for(const v of ['',' ','.','..','a/b','a\\b','a\u0085b','\ud800','a'.repeat(129),42,[]])assert.throws(()=>identificador(v),ErroDominio);
  for(const v of ['Áçaí','João D’Ávila','🍕'])assert.equal(base.texto(v,'Nome',200,true),v);
  for(const v of ['\ud800','a\u0000','a\u009f'])assert.throws(()=>base.texto(v,'Nome'),ErroDominio);
});
test('schemas de serviços rejeitam NaN/Infinity antes de qualquer acesso persistente',()=>{
  const corpo={tipoEntrega:'retirada',itens:[{produtoId:'produto',quantidade:1}],pagamento:{forma:'pix'}};
  for(const v of [NaN,Infinity,-Infinity]) {
    assert.throws(()=>pedidos.pedido({...corpo,total:v}),ErroDominio);
    assert.throws(()=>pedidos.pagamento({forma:'pix',valor:v}),ErroDominio);
    assert.throws(()=>admin.loja({entrega:{taxa:v}}),ErroDominio);
  }
  for(const dados of [{nome:null},{nome:[]},{ativo:0},{ordem:'1'}])assert.throws(()=>admin.categoria(dados,true),ErroDominio);
});

test('valor financeiro calculado também deve ser finito e preciso em chamadas diretas',()=>{
  const {validarPagamentoInicial}=require('../../../backend/src/services/pagamentoService');
  const dados={dadosPagamento:{forma:'pix'},loja:{pagamentos:{pix:true}}};
  for(const valorCalculado of [NaN,Infinity,-Infinity,-1,1.001,null])assert.throws(()=>validarPagamentoInicial({...dados,valorCalculado}),ErroDominio);
  assert.equal(validarPagamentoInicial({...dados,valorCalculado:2000000}).valor,2000000);
});
