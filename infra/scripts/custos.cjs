// Modelo de planejamento. Não lê ambiente/credenciais nem consulta serviços.
const fs=require('node:fs');
function calcular(n,{dias=30,catalogosDia=300,leiturasCatalogo=131,pedidosDia=20,leiturasCheckout=10,escritasPedido=3,paginasAdminDia=30,leiturasPagina=28,dashboardsDia=24,leiturasDashboard=21,outrosReadsMes=10000,outrosWritesMes=2000,precoLeitura100k=.03,precoEscrita100k=.09,gratisReadsDia=50000,gratisWritesDia=20000,catalogoBytes=15000,frontendBytes=800000,cpuSegundosRequisicao=.15,memoriaGiB=1,precoCpuSegundo=.000024,precoMemoriaGiBSegundo=.0000025,precoReqMilhao=.4}={}){
  if(!Number.isInteger(n) || n<1)throw new Error('Número de lojas inválido.');
  const readsLojaDia=catalogosDia*leiturasCatalogo+pedidosDia*leiturasCheckout+paginasAdminDia*leiturasPagina+dashboardsDia*leiturasDashboard+outrosReadsMes/dias;
  const writesLojaDia=pedidosDia*escritasPedido+outrosWritesMes/dias;
  const requestsMes=n*dias*(catalogosDia+pedidosDia*1.2+paginasAdminDia+dashboardsDia);
  const firestoreReadsUsd=Math.max(0,n*readsLojaDia-gratisReadsDia)*dias/100000*precoLeitura100k;
  const firestoreWritesUsd=Math.max(0,n*writesLojaDia-gratisWritesDia)*dias/100000*precoEscrita100k;
  const cpuSegundos=requestsMes*cpuSegundosRequisicao;
  const runBrutoUsd=cpuSegundos*(precoCpuSegundo+memoriaGiB*precoMemoriaGiBSegundo)+requestsMes/1e6*precoReqMilhao;
  return {lojas:n,readsMes:Math.round(n*readsLojaDia*dias),writesMes:Math.round(n*writesLojaDia*dias),requestsMes,firestoreReadsUsd:+firestoreReadsUsd.toFixed(2),firestoreWritesUsd:+firestoreWritesUsd.toFixed(2),runBrutoUsd:+runBrutoUsd.toFixed(2),subtotalParcialUsd:+(firestoreReadsUsd+firestoreWritesUsd+runBrutoUsd).toFixed(2),apiCatalogoGiB:+(n*dias*catalogosDia*catalogoBytes/2**30).toFixed(2),hostingGB:+(n*dias*catalogosDia*frontendBytes/1e9).toFixed(2)};
}
if(require.main===module){
  const result={dataReferencia:'13/10/2026',moeda:'USD',localPrecoFirestore:'us-central1 (referência; região final pendente)',fontes:['https://cloud.google.com/firestore/pricing','https://cloud.google.com/run/pricing'],limites:'Subtotal parcial; excludes storage/indexes, egress, hosting/images, backups, logs, Auth/MAU, domains, CI, support, taxes/FX. Run gross without free credits; reference serial CPU assumption not measured production.',normal:[1,10,50,100,150].map(n=>calcular(n)),catalogoGrande:[1,10,50,100,150].map(n=>calcular(n,{leiturasCatalogo:1006,catalogoBytes:106726}))};
  const text=JSON.stringify(result,null,2)+'\n';if(process.argv[2])fs.writeFileSync(process.argv[2],text);else process.stdout.write(text);
}
module.exports={calcular};
