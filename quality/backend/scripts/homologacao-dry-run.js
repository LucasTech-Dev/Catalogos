// Deliberadamente sem SDK, credenciais, rede ou caminho de escrita externa.
const fixture=require('../../fixtures/homologacao.json');
function planejar(projectId) {
 if(!/^catalogos-homolog-[a-z0-9-]+$/.test(projectId || '') || projectId.length>30)throw new Error('Simulação exige projeto dedicado explícito.');
 return {projectId,modo:'simulacao-sem-escrita',documents:structuredClone(fixture.documents)};
}
if(require.main===module) {
 const args=process.argv.slice(2);
 if(args.length!==2 || args[0]!=='--project')throw new Error('Uso: node ../quality/run.cjs backend-script homologacao-dry-run.js --project ID. Nenhum modo de escrita disponível.');
 console.log(JSON.stringify(planejar(args[1]),null,2));
}
module.exports={planejar};
