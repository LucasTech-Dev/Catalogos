const assert=require('node:assert/strict');
assert.ok(require('../src/config/ambiente').validarAmbiente().emulador);
process.env.RATE_LIMIT_MODE='enforce';
const app=require('../src/app');
const {getFirestore}=require('firebase-admin/firestore');
const {identity}=require('./publico-emulator-integration');
async function main(){
  const db=getFirestore(),loja='etapa25-limites';await db.doc('lojas/'+loja).set({nome:'Loja limites',ativo:true,retirada:{habilitada:true},pagamentos:{pix:true},entrega:{habilitada:false},pedidoMinimo:0});await db.doc('lojas/'+loja+'/produtos/p').set({nome:'Produto',ativo:true,disponivel:true,preco:10});
  const user=await identity('signUp',{});const server=await new Promise(resolve=>{const s=app.listen(0,'127.0.0.1',()=>resolve(s));});
  try{
    const base='http://127.0.0.1:'+server.address().port,url='/lojas/'+loja+'/pedidos';let pedidoId;
    // Repetir a MESMA tentativa válida preserva um pedido; todas as chamadas contam para abuso.
    for(let i=0;i<21;i++){
      const r=await fetch(base+url,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+user.idToken,'Idempotency-Key':'nonce-etapa25-local'},body:JSON.stringify({tipoEntrega:'retirada',itens:[{produtoId:'p',quantidade:1}],pagamento:{forma:'pix'}})}),body=await r.json();
      if(i<20){assert.equal(r.status,201,JSON.stringify(body));pedidoId ||= body.id;assert.equal(body.id,pedidoId);}else{assert.equal(r.status,429);assert.ok(Number(r.headers.get('Retry-After'))>0);assert.equal(body.error,'Limite de requisições excedido.');}
      assert.equal(r.headers.get('Cache-Control'),'no-store');assert.equal(r.headers.get('X-Powered-By'),null);
    }
    assert.equal((await db.collection('lojas/'+loja+'/pedidos').get()).size,1);
    const recover=await fetch(base+url+'/finalizacao/nonce-etapa25-local',{headers:{Authorization:'Bearer '+user.idToken}});assert.equal(recover.status,200);assert.equal((await recover.json()).id,pedidoId);
    console.log('Etapa25: 21 tentativas checkout, 20 aceitas (1 criação/19 replays)/um pedido, 429 real com Retry-After e recuperação GET aprovados.');
  }finally{await new Promise(resolve=>server.close(resolve));await db.terminate();}
}
main().catch(e=>{console.error('Falha infraestrutura25:',e.message);process.exit(1);});
