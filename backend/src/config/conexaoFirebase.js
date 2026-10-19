// Verificação única de conectividade no bootstrap; não consultar em cada health check.
async function verificarConexaoFirebase(db, timeoutMs=10000) {
  let timer;
  try {
    const snapshot=await Promise.race([
      db.doc('lojas/loja-demo').get(),
      new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error()),timeoutMs);}),
    ]);
    if(snapshot?.exists!==true)throw new Error();
    // Não ler/projetar campos nem retornar dados privados do documento.
  } catch {
    throw new Error('Conexão Firebase indisponível.');
  } finally {clearTimeout(timer);}
}
module.exports={verificarConexaoFirebase};
