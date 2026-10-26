// Validação Unicode compatível com Safari que ainda não oferece String.isWellFormed.
export function textoBemFormado(valor) {
 if(typeof valor!=='string')return false;
 for(let i=0;i<valor.length;i++){
  const code=valor.charCodeAt(i);
  if(code>=0xd800 && code<=0xdbff){const next=valor.charCodeAt(++i);if(!(next>=0xdc00 && next<=0xdfff))return false;}
  else if(code>=0xdc00 && code<=0xdfff)return false;
 }
 return true;
}
