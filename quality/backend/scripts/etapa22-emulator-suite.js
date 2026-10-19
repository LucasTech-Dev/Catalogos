const {spawnSync}=require('node:child_process');
const path=require('node:path');
for(const script of ['etapa21-emulator-suite.js','validacao-emulator-integration.js']) {
  const result=spawnSync(process.execPath,[path.join(__dirname,script)],{stdio:'inherit',env:process.env});
  if(result.status!==0)process.exit(result.status || 1);
}
