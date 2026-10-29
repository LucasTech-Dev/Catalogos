import fs from 'node:fs/promises';
import {parseArgs} from 'node:util';
import {planejarProvisionamento} from '../provisionamento/manifesto.mjs';
import {criarProvisionador} from '../provisionamento/emulator.mjs';
const {values,positionals} = parseArgs({allowPositionals:true,options:{firestore:{type:'string'},auth:{type:'string'}}});
const [operacao,arquivo] = positionals;
if (positionals.length!==2 || !['planejar','dry-run','aplicar'].includes(operacao)) throw Error('Uso: provisionar-loja.mjs planejar|dry-run|aplicar manifesto.json [--firestore 127.0.0.1:8188 --auth 127.0.0.1:9198]');
const manifesto = JSON.parse(await fs.readFile(arquivo,'utf8'));
if (operacao === 'planejar') console.log(JSON.stringify(planejarProvisionamento(manifesto),null,2));
else {
  const executor = criarProvisionador({projetoId:manifesto.projetoId,firestore:values.firestore,auth:values.auth});
  const resultado = await (operacao==='dry-run'?executor.dryRun(manifesto):executor.aplicar(manifesto));
  console.log(JSON.stringify(resultado,null,2));
}
