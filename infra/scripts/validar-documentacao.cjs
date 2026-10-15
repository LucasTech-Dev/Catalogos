const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const contratos=require('../../backend/src/validators/contratos');
const atuais=['README.md',...fs.readdirSync('docs').filter(n=>/^(ARQUITETURA_DEFINITIVA|REFERENCIA_API|MODELO_FIRESTORE|MANUAL_|DECISOES_PENDENTES|PLANO_DE_HOMOLOGACAO|ETAPA_26)/.test(n) && n.endsWith('.md')).map(n=>'docs/'+n)];
let links=0;
for(const file of atuais){const text=fs.readFileSync(file,'utf8');for(const [,raw] of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){
  const target=raw.replace(/^<|>$/g,'').split('#')[0];if(!target || /^(https?:|mailto:|app:)/.test(target) || path.isAbsolute(target))continue;
  assert.ok(fs.existsSync(path.resolve(path.dirname(file),decodeURIComponent(target))),file+': link relativo ausente '+target);links++;
}}
const api=fs.readFileSync('docs/REFERENCIA_API.md','utf8');for(const c of contratos)assert.ok(api.includes('| '+c.metodo+' | `'+c.caminho+'` |'),'Contrato ausente: '+c.metodo+' '+c.caminho);
assert.equal((api.match(/^\| (?:GET|POST|PUT|PATCH|DELETE) \| `/gm)||[]).length,contratos.length);
for(const modo of ['development','test']){
 const text=fs.readFileSync('infra/ambientes/'+modo+'.backend.env.example','utf8');const porta=Number(text.match(/^PORT=(\d+)$/m)[1]);const emulatorPorta=Number(text.match(/^FIRESTORE_EMULATOR_HOST=[^:]+:(\d+)$/m)[1]);assert.notEqual(porta,emulatorPorta,'Exemplo causa colisão API/Firestore');
 assert.ok(fs.readFileSync('infra/ambientes/'+modo+'.web.env.example','utf8').includes('VITE_API_URL=http://localhost:'+porta));
}
assert.match(fs.readFileSync('docs/PLANO_DE_HOMOLOGACAO_COMERCIAL.md','utf8'),/NO-GO/);
console.log('Documentação: '+atuais.length+' arquivos atuais; '+links+' links relativos; '+contratos.length+' contratos e exemplos sem colisão aprovados. Links externos/absolutos são verificados separadamente.');
