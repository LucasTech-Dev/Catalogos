import {identificadorValido} from './identificador.js';
const base='catalogos:checkout:';
export function chaveTentativa(lojaId,uid){
  if(!identificadorValido(lojaId)||!identificadorValido(uid))throw new Error('Loja ou sessão inválida para a tentativa.');
  return base+encodeURIComponent(lojaId)+':'+encodeURIComponent(uid);
}
const ler=(storage,key)=>{try{return JSON.parse(storage.getItem(key) || 'null');}catch{return null;}};
function marcador(dados){return {uid:dados.uid,chave:dados.chave,...(dados.pedido?.id || dados.pedidoId?{pedidoId:dados.pedido?.id || dados.pedidoId}:{})};}
export function carregarTentativa(key,uid) {
  const permanente=ler(localStorage,key);
  if(!permanente){sessionStorage.removeItem(key);return null;}
  if(permanente.uid!==uid)throw new Error('A tentativa pertence a outra sessão.');
  if(permanente.dados || permanente.pedido || permanente.endereco){sessionStorage.setItem(key,JSON.stringify(permanente));localStorage.setItem(key,JSON.stringify(marcador(permanente)));}
  const privada=ler(sessionStorage,key);
  return privada?.uid===uid && privada.chave===permanente.chave ? {...privada,pedidoId:permanente.pedido?.id || permanente.pedidoId} : marcador(permanente);
}
export function salvarTentativa(key,dados){sessionStorage.setItem(key,JSON.stringify(dados));localStorage.setItem(key,JSON.stringify(marcador(dados)));}
export function removerTentativa(key){localStorage.removeItem(key);sessionStorage.removeItem(key);}
export function limparDadosDeOutraSessao(uid,lojaId) {
  if(!identificadorValido(lojaId))throw new Error('Loja inválida para limpar tentativas.');
  const prefixo=base+encodeURIComponent(lojaId)+':';
  const daLoja=k=>k.startsWith(prefixo) && k.slice(prefixo.length).length>0 && !k.slice(prefixo.length).includes(':');
  for(const key of Object.keys(localStorage).filter(daLoja)) {
    const dados=ler(localStorage,key);
    if(!dados){localStorage.removeItem(key);continue;}
    if(dados.dados || dados.pedido || dados.endereco) {
      if(dados.uid===uid)sessionStorage.setItem(key,JSON.stringify(dados));
      localStorage.setItem(key,JSON.stringify(marcador(dados)));
    }
  }
  for(const key of Object.keys(sessionStorage).filter(daLoja))if(ler(sessionStorage,key)?.uid!==uid)sessionStorage.removeItem(key);
}
