const {ErroDominio}=require('../lib/seguranca');
function erro(mensagem,status=400) {return new ErroDominio(mensagem,status);}
const {objeto,campos,texto,dinheiro:numero,booleano,telefone,uf,cep}=require('./base');
function url(valor,nome) {if (valor === '') return '';const v=texto(valor,nome,2048);try {const u=new URL(v);if (!['https:','http:'].includes(u.protocol) || u.username || u.password) throw Error();return u.href;} catch {throw erro(`${nome} deve ser uma URL HTTP ou HTTPS válida.`);}}
function id(valor) {return require('../lib/identificadores').identificador(valor);}
const CAMPOS_PRODUTO = ['nome','descricao','preco','categoriaId','ativo','disponivel','imagem','ingredientes'];
function produto(dados,parcial = false) {
  campos(dados,CAMPOS_PRODUTO);const d={};
  for(const campo of ['nome','descricao']) if (dados[campo] !== undefined || (!parcial && campo === 'nome')) d[campo]=texto(dados[campo],campo,campo==='descricao'?2000:200,campo==='nome',campo==='descricao');
  if (dados.preco !== undefined || !parcial) d.preco=numero(dados.preco,'Preço');
  if (dados.categoriaId !== undefined || !parcial) d.categoriaId=id(dados.categoriaId);
  for(const campo of ['ativo','disponivel']) if (dados[campo] !== undefined) d[campo]=booleano(dados[campo],campo);
  if (!parcial) {d.ativo ??= true;d.disponivel ??= true;d.descricao ??= '';d.imagem ??= '';}
  if (dados.imagem !== undefined) d.imagem=url(dados.imagem,'Imagem');
  if (dados.ingredientes !== undefined) {if (!Array.isArray(dados.ingredientes) || dados.ingredientes.length>50) throw erro('Ingredientes inválidos.');d.ingredientes=dados.ingredientes.map(v=>texto(v,'Ingrediente'));}
  if (!Object.keys(d).length) throw erro('Informe os campos a atualizar.');return d;
}
function categoria(dados,parcial = false) {
  campos(dados,['nome','descricao','ativo','icone','ordem']);const d={};
  if (dados.nome !== undefined || !parcial) d.nome=texto(dados.nome,'Nome',200,true);
  for(const c of ['descricao','icone']) if (dados[c] !== undefined) d[c]=texto(dados[c],c,c==='descricao'?2000:50,false,c==='descricao');
  if (dados.ativo !== undefined) d.ativo=booleano(dados.ativo,'Ativo');else if (!parcial) d.ativo=true;
  if (dados.ordem !== undefined) {if (!Number.isInteger(dados.ordem) || dados.ordem<0 || dados.ordem>10000) throw erro('Ordem inválida.');d.ordem=dados.ordem;}
  if (!Object.keys(d).length) throw erro('Informe os campos a atualizar.');return d;
}
const DIAS=['segunda','terca','quarta','quinta','sexta','sabado','domingo'];
const CAMPOS_LOJA=['nome','descricao','telefone','whatsapp','instagram','endereco','horarios','logo','imagem','corPrimaria','tempoMedio','pagamentos','entrega','retirada','pedidoMinimo'];
function loja(dados) {
  campos(dados,CAMPOS_LOJA);const d={};
  for(const c of ['nome','descricao','instagram','tempoMedio']) if (dados[c] !== undefined) d[c]=texto(dados[c],c,c==='descricao'?2000:200,c==='nome',c==='descricao');
  if (dados.telefone !== undefined) {d.telefone=telefone(dados.telefone,'Telefone',true);}
  if (dados.whatsapp !== undefined) {try {d.whatsapp=require('../services/whatsappService').normalizarWhatsapp(telefone(dados.whatsapp,'WhatsApp'));} catch {throw erro('WhatsApp inválido.');}}
  for(const c of ['logo','imagem']) if (dados[c] !== undefined) d[c]=url(dados[c],c);
  if (dados.corPrimaria !== undefined) {if (typeof dados.corPrimaria!=='string' || !/^#[\da-f]{6}$/i.test(dados.corPrimaria)) throw erro('Cor inválida.');d.corPrimaria=dados.corPrimaria;}
  if (dados.endereco !== undefined) {if (typeof dados.endereco==='string') d.endereco=texto(dados.endereco,'Endereço',1000);else {campos(dados.endereco,['rua','logradouro','numero','bairro','cidade','uf','cep','complemento']);d.endereco=Object.fromEntries(Object.entries(dados.endereco).map(([k,v])=>[k,k==='uf'?uf(v,true):k==='cep'?cep(v):texto(v,k)]));}}
  if (dados.horarios !== undefined) {
    campos(dados.horarios,DIAS);d.horarios={};
    for(const [dia,h] of Object.entries(dados.horarios)) {
      campos(h,['abertura','fechamento','fechado']);if(!Object.keys(h).length)throw erro('Informe horário.');const novo={};if(h.fechado!==undefined)novo.fechado=booleano(h.fechado,'Fechado');const fechado=novo.fechado;
      for(const c of ['abertura','fechamento']) if (h[c] !== undefined) {if (typeof h[c]!=='string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(h[c])) throw erro('Horário inválido.');novo[c]=h[c];}
      if (!fechado && novo.abertura && novo.abertura===novo.fechamento) throw erro('Abertura e fechamento devem ser diferentes.');
      d.horarios[dia]=novo;
    }
  }
  if (dados.pagamentos !== undefined) {campos(dados.pagamentos,['pix','dinheiro','cartao_credito','cartao_debito']);for (const [k,v] of Object.entries(dados.pagamentos)) booleano(v,k);if(!Object.keys(dados.pagamentos).length)throw erro('Informe formas de pagamento.');d.pagamentos={...dados.pagamentos};}
  if (dados.entrega !== undefined) {campos(dados.entrega,['habilitada','taxa']);if(!Object.keys(dados.entrega).length)throw erro('Informe configuração de entrega.');d.entrega={};if(dados.entrega.habilitada!==undefined)d.entrega.habilitada=booleano(dados.entrega.habilitada,'Entrega');if(dados.entrega.taxa!==undefined)d.entrega.taxa=numero(dados.entrega.taxa,'Taxa de entrega');}
  if (dados.retirada !== undefined) {campos(dados.retirada,['habilitada']);d.retirada={habilitada:booleano(dados.retirada.habilitada,'Retirada')};}
  if (dados.pedidoMinimo !== undefined) d.pedidoMinimo=numero(dados.pedidoMinimo,'Pedido mínimo');
  if (!Object.keys(d).length) throw erro('Informe os campos a atualizar.');return d;
}
module.exports={erro,id,produto,categoria,loja,CAMPOS_PRODUTO,CAMPOS_LOJA,DIAS};
