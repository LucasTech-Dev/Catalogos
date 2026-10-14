const {execFileSync}=require('node:child_process');
const fs=require('node:fs');
const files=execFileSync('git',['ls-files','--cached','--others','--exclude-standard','-z'],{encoding:'utf8'}).split('\0');
const patterns=[/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,/AIza[0-9A-Za-z_-]{30,}/,/gh[pousr]_[A-Za-z0-9]{20,}/,/github_pat_[A-Za-z0-9_]{30,}/,/eyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}/];
const failures=[];
for(const file of new Set(files)){
  if(!file || !fs.existsSync(file) || fs.statSync(file).isDirectory() || /\.png$/.test(file))continue;
  if(/(^|\/)\.env($|\.)/.test(file) && !file.endsWith('.env.example'))failures.push(file+': env privado versionado');
  const content=fs.readFileSync(file,'utf8');if(patterns.some(p=>p.test(content)))failures.push(file+': padrão sensível');
}
if(failures.length){console.error(failures.join('\n'));process.exit(1);}
console.log('Scan textual sem achados. Não substitui revisão de segredos/artefatos.');
