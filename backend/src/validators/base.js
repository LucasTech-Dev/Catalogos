const {ErroDominio} = require('../lib/seguranca');
const LIMITES = Object.freeze({jsonBytes:65536,profundidade:8,nos:5000,itensPedido:50,quantidadeItem:99,quantidadePedido:500,monetario:1000000});
const erro = mensagem => new ErroDominio(mensagem,400,'validacao');
function objeto(valor) {
  if (!valor || typeof valor !== 'object' || Array.isArray(valor) || ![Object.prototype,null].includes(Object.getPrototypeOf(valor))) throw erro('Dados inválidos.');
  return valor;
}
function campos(valor,permitidos) {
  objeto(valor);
  if (Object.keys(valor).some(k=>!permitidos.includes(k))) throw erro('Campo não permitido nesta operação.');
  return valor;
}
function estrutura(valor) {
  let nos=0; const vistos=new Set();
  function visitar(v,nivel) {
    if (++nos>LIMITES.nos || nivel>LIMITES.profundidade) throw erro('Estrutura excede os limites permitidos.');
    if (v && typeof v==='object') {
      if (vistos.has(v)) throw erro('Estrutura inválida.');
      vistos.add(v);
      if (!Array.isArray(v)) objeto(v);
      for (const [k,x] of Object.entries(v)) {
        if (['__proto__','prototype','constructor'].includes(k)) throw erro('Campo não permitido nesta operação.');
        visitar(x,nivel+1);
      }
      vistos.delete(v);
    }
  }
  visitar(valor,0); return valor;
}
function texto(valor,nome,max=200,obrigatorio=false,multilinha=false) {
  if (typeof valor!=='string' || !valor.isWellFormed() || valor.length>max || (obrigatorio && !valor.trim()) || /[\u007f-\u009f]/u.test(valor) || (multilinha ? /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u : /[\u0000-\u001f]/u).test(valor)) throw erro(`${nome} inválido.`);
  return valor.trim();
}
function dinheiro(valor,nome,maximo=LIMITES.monetario) {
  if (typeof valor!=='number' || !Number.isFinite(valor) || valor<0 || valor>maximo) throw erro(`${nome} inválido.`);
  const centavos=valor*100;
  if (Math.abs(centavos-Math.round(centavos))>Number.EPSILON*Math.max(1,Math.abs(centavos))*4) throw erro(`${nome} deve possuir no máximo duas casas decimais.`);
  return Math.round(centavos)/100;
}
function booleano(valor,nome) {if(typeof valor!=='boolean')throw erro(`${nome} deve ser booleano.`);return valor;}
function telefone(valor,nome='Telefone',opcional=false) {
  const v=texto(valor,nome,25,!opcional),digitos=v.replace(/\D/g,'');
  if(opcional && v==='')return v;
  if(!/^\+?[\d ()-]+$/.test(v) || digitos.length<10 || digitos.length>15 || /^0+$/.test(digitos))throw erro(`${nome} inválido.`);
  return v;
}
const UFS=new Set('AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' '));
function uf(valor,opcional=false) {const v=texto(valor,'UF',2,!opcional).toUpperCase();if(!(opcional && !v) && !UFS.has(v))throw erro('UF inválida.');return v;}
function cep(valor) {const v=texto(valor,'CEP',9);if(v && !/^\d{5}-?\d{3}$/.test(v))throw erro('CEP inválido.');return v;}
function chave(valor) {if(typeof valor!=='string' || !/^[a-zA-Z0-9_-]{16,100}$/.test(valor))throw erro('Chave de idempotência inválida.');return valor;}
module.exports={LIMITES,erro,objeto,campos,estrutura,texto,dinheiro,booleano,telefone,uf,cep,chave};
