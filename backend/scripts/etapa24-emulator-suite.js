const {spawnSync}=require('node:child_process');
const path=require('node:path');
for(const script of ['etapa23-emulator-suite.js','etapa24-homologacao.js']) {
  const resultado=spawnSync(process.execPath,[path.join(__dirname,script)],{stdio:'inherit',env:process.env});
  if(resultado.status!==0)process.exit(resultado.status || 1);
}
