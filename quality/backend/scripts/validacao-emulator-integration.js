const assert=require('node:assert/strict');
const crypto=require('node:crypto');
// Nunca permitir fixture em Firebase real, mesmo quando o script roda isolado.
require('../../../backend/src/config/ambiente').validarAmbiente();
assert.ok(process.env.GCLOUD_PROJECT?.startsWith('demo-'));
for(const key of ['FIREBASE_AUTH_EMULATOR_HOST','FIRESTORE_EMULATOR_HOST'])assert.match(process.env[key] || '',/^(127\.0\.0\.1|localhost):\d+$/);
const {request,identity}=require('./publico-emulator-integration');
const {getFirestore}=require('firebase-admin/firestore');
const {getAuth}=require('firebase-admin/auth');
const contratos=require('../../../backend/src/validators/contratos');
const app=require('../../../backend/src/app');
let verificacoes=0;
async function main() {
  const db=getFirestore(),auth=getAuth(),lojaId='validacao-'+crypto.randomUUID(),ref=db.collection('lojas').doc(lojaId);
  const pub='/publico/lojas/'+lojaId,adm='/admin/lojas/'+lojaId,orders='/lojas/'+lojaId+'/pedidos';
  await ref.set({nome:'Loja Validação',ativo:true,whatsapp:'11999999999',pagamentos:{pix:true,dinheiro:true,cartao:true},entrega:{habilitada:true,taxa:7},retirada:{habilitada:true},endereco:{rua:'São José',cidade:'São Paulo'},horarios:{segunda:{fechado:false,abertura:'08:00',fechamento:'18:00'},terca:{fechado:true}}});
  await ref.collection('categorias').doc('cat').set({nome:'Categoria',ativo:true});
  await ref.collection('produtos').doc('produto').set({nome:'Açaí',preco:19.99,categoriaId:'cat',ativo:true});
  const cliente=await identity('signUp',{}),outro=await identity('signUp',{});
  async function administrador(loja) {
    const email='validacao-'+crypto.randomUUID()+'@teste.local',password='Senha-local-123!';
    const user=await auth.createUser({email,password});await db.collection('usuarios').doc(user.uid).set({lojaId:loja,role:'admin',ativo:true});return identity('signInWithPassword',{email,password});
  }
  const admin=await administrador(lojaId),adminOutra=await administrador('outra-'+lojaId);
  async function checar(method,path,token,body,esperado,chave) {
    const r=await request(method,path,token,body,chave);assert.equal(r.status,esperado,method+' '+path+' '+JSON.stringify(r.body));verificacoes++;return r;
  }
  const endereco={rua:'Rua São José',numero:'s/n',bairro:'Centro',cidade:'São Paulo',uf:'sp',cep:'01001-000'};
  const addr=await checar('POST',pub+'/me/enderecos',cliente.idToken,endereco,201);
  await checar('PUT',pub+'/me',cliente.idToken,{nome:'João D’Ávila 🍕',telefone:'+55 (11) 99999-9999'},200);
  const corpo={tipoEntrega:'entrega',enderecoId:addr.body.id,itens:[{produtoId:'produto',quantidade:2}],cliente:{nome:'João D’Ávila',telefone:'11999999999'},pagamento:{forma:'pix'},observacao:'Sem açúcar\nObrigado 🍇'};
  async function snapshot() {
    const colecoes=['produtos','categorias','clientes','pedidos','idempotencia'];
    const estado={loja:(await ref.get()).data()};
    for(const nome of colecoes)estado[nome]=(await ref.collection(nome).orderBy('__name__').get()).docs.map(d=>[d.id,d.data()]);
    estado.enderecos=(await ref.collection('clientes').doc(cliente.localId).collection('enderecos').get()).docs.map(d=>[d.id,d.data()]);
    return JSON.stringify(estado);
  }
  const antes=await snapshot();
  // Contratos completos: mesmo sem recurso existente, rejeição acontece antes do controller.
  for(const c of contratos) {
    const path=c.caminho.replace(/:([A-Za-z]+)/g,(_,nome)=>nome==='lojaId'?lojaId:nome==='clienteId'?cliente.localId:nome==='chave'?'etapa22-chave-0001':'produto');
    await checar(c.metodo,path+'?inesperado=sentinela',admin.idToken,{interno:true},400,crypto.randomUUID());
  }
  for(const alteracao of [
    {itens:[]},{itens:[corpo.itens[0],corpo.itens[0]]},{itens:Array.from({length:51},(_,i)=>({produtoId:'p'+i,quantidade:1}))},
    {itens:[{produtoId:'produto',quantidade:'2'}]},{itens:[{produtoId:'produto',quantidade:100}]},
    {itens:[corpo.itens[0],{produtoId:'inexistente',quantidade:1}]},{itens:[{produtoId:'produto/privado',quantidade:1}]},
    {pagamento:{forma:'pix',token:'sentinela'}},{pagamento:{forma:'pix',status:'confirmado'}},{pagamento:{forma:'pix',valor:null}},
    {cliente:{nome:'Cliente',telefone:'11999999999',role:'admin'}},{observacao:'x'.repeat(1001)},{observacao:'\ud800'},
    {role:'admin'},{desconto:1},{total:1.001},{enderecoId:'endereco-alheio'},{clienteId:'x/y'},
  ])await checar('POST',orders,cliente.idToken,{...corpo,...alteracao},400,crypto.randomUUID());
  await checar('POST',orders,outro.idToken,corpo,400,crypto.randomUUID());
  await checar('PUT',pub+'/me',cliente.idToken,{nome:'Cliente',telefone:'11999999999',email:'alheio@teste.local'},400);
  await checar('POST',pub+'/me/enderecos',cliente.idToken,{...endereco,cep:'123'},400);
  await checar('POST',pub+'/me/enderecos',cliente.idToken,{...endereco,uf:'XX'},400);
  for(const preco of [-1,0.001,1000000.01,'19.99'])await checar('POST',adm+'/produtos',admin.idToken,{nome:'Inválido',preco,categoriaId:'cat'},400);
  await checar('POST',adm+'/categorias',admin.idToken,{nome:'Categoria',ordem:1.5},400);
  for(const dados of [{entrega:{habilitada:false},retirada:{habilitada:false}},{horarios:{segunda:{abertura:'18:00'}}},{pagamentos:{pix:false,dinheiro:false,cartao_credito:false,cartao_debito:false}},{pedidoMinimo:1.001}])await checar('PATCH',adm+'/loja',admin.idToken,dados,400);
  for(const query of ['limite=1&limite=2','limite=101','cursor=produto%2Fprivado'])await checar('GET',adm+'/produtos?'+query,admin.idToken,undefined,400);
  for(const query of ['inicio=2026-02-30','inicio=2026-10-13&fim=2026-10-12'])await checar('GET',adm+'/dashboard?'+query,admin.idToken,undefined,400);
  await checar('PATCH',adm+'/loja',cliente.idToken,{interno:true},403);
  await checar('PATCH',adm+'/loja',adminOutra.idToken,{interno:true},403);
  await checar('POST',orders,null,corpo,401);
  assert.equal(await snapshot(),antes,'Nenhuma requisição inválida pode persistir dados parciais.');
  const patch=await checar('PATCH',adm+'/loja',admin.idToken,{entrega:{taxa:8},pagamentos:{cartao_credito:false,cartao_debito:false},endereco:{numero:'s/n'},horarios:{segunda:{abertura:'09:00'}}},200);
  assert.equal(patch.body.entrega.habilitada,true);assert.equal(patch.body.pagamentos.pix,true);assert.equal(patch.body.pagamentos.cartao_credito,false);assert.equal(patch.body.endereco.rua,'São José');assert.equal(patch.body.horarios.segunda.fechamento,'18:00');assert.equal(patch.body.horarios.terca.fechado,true);
  const chave=crypto.randomUUID(),concorrentes=await Promise.all(Array.from({length:5},()=>checar('POST',orders,cliente.idToken,corpo,201,chave)));
  const pedido=concorrentes[0].body;assert.equal(pedido.total,47.98);assert.equal(new Set(concorrentes.map(r=>r.body.id)).size,1);assert.equal((await ref.collection('pedidos').get()).size,1);assert.equal((await ref.collection('idempotencia').get()).size,1);
  await checar('POST',orders,cliente.idToken,{...corpo,observacao:'Outro corpo'},409,chave);
  await checar('GET',orders+'/finalizacao/'+chave,cliente.idToken,undefined,200);
  await checar('GET',orders+'/finalizacao/'+chave,outro.idToken,undefined,404);
  await checar('PATCH',orders+'/'+pedido.id+'/pagamento',cliente.idToken,{status:'confirmado'},403);
  await checar('PATCH',orders+'/'+pedido.id+'/pagamento',admin.idToken,{status:'confirmado',valor:0},400);
  await checar('PATCH',orders+'/'+pedido.id+'/status',admin.idToken,{status:'desconhecido'},400);
  await checar('PATCH',orders+'/'+pedido.id+'/pagamento',admin.idToken,{status:'confirmado'},200);
  await checar('PATCH',orders+'/'+pedido.id+'/pagamento',admin.idToken,{status:'pendente'},400);
  const catalogo=await checar('GET',pub+'/catalogo',null,undefined,200);assert.equal(catalogo.body.produtos[0].preco,19.99);
  // Transport HTTP real: erros de parser não expõem stacks nem geram escritas.
  const server=await new Promise(resolve=>{const server=app.listen(0,'127.0.0.1',()=>resolve(server));});
  try {
    const baseline=await snapshot();
    for(const [body,expected,extra] of [['{"nome":',400,{}],['{"nome":"'+'x'.repeat(70000)+'"}',413,{}],['{}',415,{'Content-Type':'application/json; charset=ascii'}],['{}',415,{'Content-Encoding':'nao-suportado'}],['{}',400,{'Content-Encoding':'gzip'}]]) {
      const r=await fetch('http://127.0.0.1:'+server.address().port+adm+'/produtos',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+admin.idToken,...extra},body});
      assert.equal(r.status,expected);assert.doesNotMatch(JSON.stringify(await r.json()),/stack|SyntaxError|backend/);verificacoes++;
    }
    assert.equal(await snapshot(),baseline);
  }finally{await new Promise(resolve=>server.close(resolve));}
  console.log(`Etapa 22 Emulator: ${verificacoes} verificações HTTP; ${contratos.length} contratos; rejeições sem persistência, PATCH parcial, centavos, anônimo, autorização, isolamento e idempotência concorrente aprovados.`);
  await db.terminate();
}
main().catch(()=>{console.error('Falha na integração local da Etapa 22.');process.exit(1);});
