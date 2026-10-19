const {spawnSync} = require('node:child_process');
const path = require('node:path');
for (const script of ['firebase-emulator-smoke.js','pagamento-emulator-integration.js','whatsapp-emulator-integration.js','publico-emulator-integration.js','../../frontend/scripts/auth-emulator-integration.js']) {
  const result=spawnSync(process.execPath,[path.resolve(__dirname,script)],{stdio:'inherit',env:process.env});
  if (result.status !== 0) process.exit(result.status || 1);
}
