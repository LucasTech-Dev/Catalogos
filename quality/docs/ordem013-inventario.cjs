// Inventário estrutural/controles declarados; não equivale a teste funcional.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..'),out=path.join(root,'docs/ADAPTACAO_SERVERLESS');
const fontes=['frontend/src/pages/admin','frontend/src/components/admin'];
const arquivos=fontes.flatMap(n=>fs.readdirSync(path.join(root,n)).filter(f=>f.endsWith('.jsx')).map(f=>n+'/'+f));
arquivos.push('frontend/src/components/ui/ToastProvider.jsx','frontend/src/components/ui/BotaoGoogle.jsx','frontend/src/components/ui/CampoSenha.jsx','frontend/src/components/ui/PageLoader.jsx');
const controles=[];
for(const arquivo of arquivos){const texto=fs.readFileSync(path.join(root,arquivo),'utf8'),re=/<(button|a|input|select|textarea|form)(?=[\s>])/g;let m;
 while((m=re.exec(texto))){let quote='',braces=0,end=m.index;
  for(;end<texto.length;end++){const c=texto[end];if(quote){if(c===quote&&texto[end-1]!=='\\')quote='';continue;}if(['"',"'",'`'].includes(c)){quote=c;continue;}if(c==='{')braces++;if(c==='}')braces--;if(c==='>'&&braces===0)break;}
  const tag=texto.slice(m.index,end+1);controles.push({arquivo,linha:texto.slice(0,m.index).split('\n').length,elemento:m[1],declaracao:tag.replace(/\s+/g,' ').slice(0,900),verificacao:'Cruzar com matriz funcional e inventário DOM do Emulator; declaração não prova execução.'});
 }
}
const finalidade={'.git':'Histórico local preservado; nenhuma limpeza','.agents':'Configuração privada local preservada','.aws':'Configuração privada local preservada','.codex':'Configuração privada local preservada','.tools-local':'Java21/jar Firestore usados nas suítes; preservar','backend':'AdminSDK/GoogleAuth de recuperação e ferramentas; contratos históricos e357 testes; preservar','docs':'Documentação oficial/histórico/evidências; preservar','firebase':'Rules/índices/configurações necessários; nenhuma publicação nesta ordem','frontend':'Produto React/Vite e dependências de build/teste; preservar','infra':'Scanner/testes/ferramentas e histórico não hospedado; preservar','private-backups':'Recuperação privada e checkout main de publicação; nunca publicar nem excluir','quality':'Regressões/Emulators/Chrome/documentação; preservar'};
const pastas=fs.readdirSync(root,{withFileTypes:true}).filter(d=>d.isDirectory()).map(d=>({pasta:d.name,decisao:finalidade[d.name]||'Uso não comprovadamente dispensável; preservar',removida:false}));
fs.writeFileSync(path.join(out,'ORDEM_013_INVENTARIO_CONTROLES.json'),JSON.stringify({ordem:'013',tipo:'Inventário de declarações JSX',arquivos:arquivos.length,total:controles.length,controles},null,2)+'\n');
fs.writeFileSync(path.join(out,'ORDEM_013_INVENTARIO_ESTRUTURA.json'),JSON.stringify({ordem:'013',pastas,exclusoesDePastas:[],criterio:'Preservar arquivos exclusivos, fontes, ferramentas, dependências, histórico e recuperação. Registrar remoções de logs/temporários após preservar evidências.',arquivosRuntime:fs.readdirSync(path.join(root,'frontend/src/pages/admin')).filter(f=>f.endsWith('.jsx'))},null,2)+'\n');
console.log(JSON.stringify({inventario:'APROVADO',arquivos:arquivos.length,controles:controles.length,pastas:pastas.length}));
