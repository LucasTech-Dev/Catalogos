const v=require('./base');
const {identificador}=require('../lib/identificadores');
function consulta(dados,campos=[]) {
  v.campos(dados,campos);
  for(const [campo,valor] of Object.entries(dados)) {
    if(typeof valor!=='string' || valor==='')throw v.erro('Parâmetro de consulta inválido ou repetido.');
    if(campo==='limite' && (!/^[1-9]\d{0,2}$/.test(valor) || Number(valor)>100))throw v.erro('Limite deve estar entre 1 e 100.');
    if(['cursor','categoriaId'].includes(campo))identificador(valor);
    if(campo==='contagem' && !['0','1'].includes(valor))throw v.erro('Contagem deve ser 0 ou 1.');
    if(campo==='status')require('../services/pedidoStatusService').validarStatus(valor);
    if(['inicio','fim'].includes(campo)) {
      if(!/^\d{4}-\d{2}-\d{2}$/.test(valor))throw v.erro('Data inválida.');
      const data=new Date(valor+'T00:00:00-03:00');
      if(!Number.isFinite(data.getTime()) || data.toISOString().slice(0,10)!==valor)throw v.erro('Data inválida.');
    }
  }
  if(campos.includes('inicio'))require('../services/adminService').periodo(dados);
  return dados;
}
module.exports={consulta};
