const v=require('./base');
function cliente(dados) {
  v.campos(dados,['nome','telefone']);
  return {nome:v.texto(dados.nome,'Nome',200,true),telefone:v.telefone(dados.telefone)};
}
function endereco(dados) {
  v.campos(dados,['rua','numero','bairro','cidade','uf','apelido','complemento','cep']);
  const saida={};
  for(const campo of ['rua','numero','bairro','cidade'])saida[campo]=v.texto(dados[campo],campo,200,true);
  saida.uf=v.uf(dados.uf);
  for(const campo of ['apelido','complemento'])if(dados[campo]!==undefined)saida[campo]=v.texto(dados[campo],campo);
  if(dados.cep!==undefined)saida.cep=v.cep(dados.cep);
  return saida;
}
module.exports={cliente,endereco};
