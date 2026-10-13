const {spawnSync}=require('node:child_process');
const path=require('node:path');
for(const script of [path.join(__dirname,'etapa20-emulator-suite.js'),path.join(__dirname,'../../demo/scripts/security-emulator-integration.js')]){
  const resultado=spawnSync(process.execPath,[script],{stdio:'inherit',env:process.env});
  if(resultado.status!==0)process.exit(resultado.status || 1);
}
