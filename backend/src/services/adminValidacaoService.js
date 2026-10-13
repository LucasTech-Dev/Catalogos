function erro(mensagem, status = 400) {return Object.assign(new Error(mensagem), {status});}
function objeto(dados) {if (!dados || typeof dados !== 'object' || Array.isArray(dados)) throw erro('Dados inválidos.');}
function campos(dados,permitidos) {objeto(dados);if (Object.keys(dados).some(k => !permitidos.includes(k))) throw erro('Campo não permitido nesta operação.');}
function texto(valor,nome,max = 200,obrigatorio = false) {if (typeof valor !== 'string' || valor.trim().length > max || (obrigatorio && !valor.trim())) throw erro(`${nome} inválido.`);return valor.trim();}
function numero(valor,nome) {if (typeof valor !== 'number' || !Number.isFinite(valor) || valor < 0 || valor > 1000000) throw erro(`${nome} inválido.`);return Math.round((valor + Number.EPSILON)*100)/100;}
function booleano(valor,nome) {if (typeof valor !== 'boolean') throw erro(`${nome} deve ser booleano.`);return valor;}
function url(valor,nome) {if (valor === '') return '';const v=texto(valor,nome,2048);try {const u=new URL(v);if (!['https:','http:'].includes(u.protocol) || u.username || u.password) throw Error();return u.href;} catch {throw erro(`${nome} deve ser uma URL HTTP ou HTTPS válida.`);}}
function id(valor) {if (typeof valor !== 'string' || !valor || valor.length > 128 || valor.includes('/') || valor === '.' || valor === '..') throw erro('Identificador inválido.');return valor;}
const CAMPOS_PRODUTO = ['nome','descricao','preco','categoriaId','ativo','disponivel','imagem','ingredientes'];
function produto(dados,parcial = false) {
  campos(dados,CAMPOS_PRODUTO);const d={};
  for(const campo of ['nome','descricao']) if (dados[campo] !== undefined || (!parcial && campo === 'nome')) d[campo]=texto(dados[campo],campo,campo==='descricao'?2000:200,campo==='nome');
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
  for(const c of ['descricao','icone']) if (dados[c] !== undefined) d[c]=texto(dados[c],c,c==='descricao'?2000:50);
  if (dados.ativo !== undefined) d.ativo=booleano(dados.ativo,'Ativo');else if (!parcial) d.ativo=true;
  if (dados.ordem !== undefined) {if (!Number.isInteger(dados.ordem) || dados.ordem<0 || dados.ordem>10000) throw erro('Ordem inválida.');d.ordem=dados.ordem;}
  if (!Object.keys(d).length) throw erro('Informe os campos a atualizar.');return d;
}
const DIAS=['segunda','terca','quarta','quinta','sexta','sabado','domingo'];
const CAMPOS_LOJA=['nome','descricao','telefone','whatsapp','instagram','endereco','horarios','logo','imagem','corPrimaria','tempoMedio','pagamentos','entrega','retirada','pedidoMinimo'];
function loja(dados) {
  campos(dados,CAMPOS_LOJA);const d={};
  for(const c of ['nome','descricao','instagram','tempoMedio']) if (dados[c] !== undefined) d[c]=texto(dados[c],c,c==='descricao'?2000:200,c==='nome');
  if (dados.telefone !== undefined) {d.telefone=texto(dados.telefone,'Telefone');if (d.telefone && (!/^\+?[\d\s()\-]{10,25}$/.test(d.telefone) || d.telefone.replace(/\D/g,'').length<10 || d.telefone.replace(/\D/g,'').length>15)) throw erro('Telefone inválido.');}
  if (dados.whatsapp !== undefined) {try {d.whatsapp=require('./whatsappService').normalizarWhatsapp(dados.whatsapp);} catch {throw erro('WhatsApp inválido.');}}
  for(const c of ['logo','imagem']) if (dados[c] !== undefined) d[c]=url(dados[c],c);
  if (dados.corPrimaria !== undefined) {if (!/^#[\da-f]{6}$/i.test(dados.corPrimaria)) throw erro('Cor inválida.');d.corPrimaria=dados.corPrimaria;}
  if (dados.endereco !== undefined) {if (typeof dados.endereco==='string') d.endereco=texto(dados.endereco,'Endereço',1000);else {campos(dados.endereco,['rua','logradouro','numero','bairro','cidade','uf','cep','complemento']);d.endereco=Object.fromEntries(Object.entries(dados.endereco).map(([k,v])=>[k,texto(v,k)]));}}
  if (dados.horarios !== undefined) {
    campos(dados.horarios,DIAS);d.horarios={};
    for(const [dia,h] of Object.entries(dados.horarios)) {
      campos(h,['abertura','fechamento','fechado']);const fechado=booleano(h.fechado,'Fechado');const novo={fechado};
      for(const c of ['abertura','fechamento']) if (h[c] !== undefined) {if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(h[c])) throw erro('Horário inválido.');novo[c]=h[c];}
      if (!fechado && (!novo.abertura || !novo.fechamento)) throw erro('Informe abertura e fechamento.');d.horarios[dia]=novo;
    }
  }
  if (dados.pagamentos !== undefined) {campos(dados.pagamentos,['pix','dinheiro','cartao_credito','cartao_debito']);for (const [k,v] of Object.entries(dados.pagamentos)) booleano(v,k);d.pagamentos=require('./pagamentoService').validarConfiguracaoPagamentos(dados.pagamentos);}
  if (dados.entrega !== undefined) {campos(dados.entrega,['habilitada','taxa']);d.entrega={habilitada:booleano(dados.entrega.habilitada,'Entrega'),taxa:numero(dados.entrega.taxa,'Taxa de entrega')};}
  if (dados.retirada !== undefined) {campos(dados.retirada,['habilitada']);d.retirada={habilitada:booleano(dados.retirada.habilitada,'Retirada')};}
  if (dados.pedidoMinimo !== undefined) d.pedidoMinimo=numero(dados.pedidoMinimo,'Pedido mínimo');
  if (!Object.keys(d).length) throw erro('Informe os campos a atualizar.');return d;
}
module.exports={erro,id,produto,categoria,loja,CAMPOS_PRODUTO,CAMPOS_LOJA,DIAS};
