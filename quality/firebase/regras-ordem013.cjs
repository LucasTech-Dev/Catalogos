// Produz as duas variantes somente em memória, sem publicar/modificar Rules.
const assert=require('node:assert/strict'),{createHash}=require('node:crypto');
const publicada="      && (resource == null || request.resource.data.get('ativo',true) == resource.data.get('ativo',true) || request.resource.data.get('ativo',true) == true)";
const candidata="      // Desativação lógica de categoria é reversível: preserva produtos, histórico e origem.\n      // A leitura pública de produtos já exige categoria ativa, ocultando-os do catálogo.\n      && (request.resource.data.get('ativo',true) is bool)";
function contratosCategoria(fonte,shaPublicado){
 const publicadas=fonte.replace(candidata,publicada);
 assert.equal(createHash('sha256').update(publicadas).digest('hex'),shaPublicado,'A fonte não corresponde ao contrato publicado inventariado.');
 assert.equal(publicadas.split(publicada).length,2,'Condição B03 única obrigatória.');
 return {publicadas,candidata:publicadas.replace(publicada,candidata)};
}
module.exports={contratosCategoria};
