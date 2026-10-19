// Bootstrap exclusivo de qualidade: preserva resolução nativa de dependências das aplicações Node 24.
const {registerHooks,createRequire}=require('node:module');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const scopes=['backend','frontend'].map(name=>({prefix:pathToFileURL(path.join(__dirname,name)+path.sep).href,parent:pathToFileURL(path.join(root,name,'package.json')).href,require:createRequire(path.join(root,name,'package.json'))}));
registerHooks({resolve(specifier,context,nextResolve){
  const scope=scopes.find(s=>context.parentURL?.startsWith(s.prefix));
  if(scope && !specifier.startsWith('.') && !specifier.startsWith('/') && !specifier.startsWith('node:') && !specifier.startsWith('file:')){
    if(context.conditions.includes('require'))return nextResolve(scope.require.resolve(specifier),context);
    return nextResolve(specifier,{...context,parentURL:scope.parent});
  }
  return nextResolve(specifier,context);
}});
