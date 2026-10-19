// Comandos reproduzíveis de qualidade, sem duplicar dependências ou incluí-las nos artefatos de runtime.
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),[command,...args]=process.argv.slice(2);
const hook=path.join(__dirname,'register.cjs');
const env={...process.env,NODE_OPTIONS:[process.env.NODE_OPTIONS,'--require='+JSON.stringify(hook)].filter(Boolean).join(' ')};
let cwd,argv;
if(command==='backend-test'){
 cwd=path.join(root,'backend');argv=['--test',...args,...fs.readdirSync(path.join(__dirname,'backend/test')).filter(n=>n.endsWith('.test.js')).sort().map(n=>path.join(__dirname,'backend/test',n))];
}else if(command==='backend-script'){
 const [name,...rest]=args;if(!/^[a-zA-Z0-9-]+\.js$/.test(name || ''))throw Error('Script de qualidade inválido.');
 cwd=path.join(root,'backend');argv=[path.join(__dirname,'backend/scripts',name),...rest];
}else{
 cwd=path.join(root,'frontend');
 const scripts={'frontend-auth':'auth-emulator-integration.js','frontend-security':'security-emulator-integration.js','frontend-integration':'fixtures-integracao.cjs','frontend-preview':'preview-publicada.cjs'};
 if(command==='frontend-test')argv=[path.join(cwd,'node_modules/vitest/vitest.mjs'),'run','--config',path.join(__dirname,'frontend/vitest.config.mjs'),...args];
 else if(scripts[command])argv=[path.join(__dirname,'frontend/scripts',scripts[command]),...args];
 else throw Error('Comando de qualidade desconhecido.');
}
const result=spawnSync(process.execPath,argv,{cwd,env,stdio:'inherit'});
if(result.error)console.error(result.error.message);
process.exitCode=result.status ?? 1;
