import {build} from 'vite';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const env={VITE_APP_ENV:'homologacao',VITE_CATALOGOS_RUNTIME_MODE:'original-readonly-demo',VITE_CATALOGOS_DEMO_LOJA_ID:'loja-demo',VITE_LOJA_ID:'loja-demo',VITE_API_URL:'https://catalogos-api-homolog.onrender.com'};
for(const key of Object.keys(process.env))if(key.startsWith('VITE_'))delete process.env[key];
await build({root,envFile:false,define:Object.fromEntries(Object.entries(env).map(([key,value])=>[`import.meta.env.${key}`,JSON.stringify(value)]))});
