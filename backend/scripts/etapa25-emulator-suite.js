const {spawnSync}=require('node:child_process');
const path=require('node:path');
const {validarAmbiente}=require('../src/config/ambiente');
if(!validarAmbiente().emulador)throw new Error('Suite25 exige Emulator.');
for(const script of ['etapa24-emulator-suite.js','infraestrutura-emulator-integration.js']){
  const r=spawnSync(process.execPath,[path.join(__dirname,script)],{stdio:'inherit',env:{...process.env,ETAPA24_EVIDENCIAS:process.env.ETAPA24_EVIDENCIAS || path.resolve(__dirname,'../../docs/evidencias-etapa25/homologacao')}});
  if(r.status!==0)process.exit(r.status || 1);
}
