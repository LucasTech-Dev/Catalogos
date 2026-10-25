// Publicação somente nos resultados de ações explícitas, nunca em serviços/GETs.
const ouvintes=new Set();
const chave='catalogos:feedback:navegacao';
export const DURACAO_TOAST=5000;
export function textoSeguro(texto,limite=240) {
 if(typeof texto!=='string'||texto.length>limite||/https?:\/\/|-----BEGIN|eyJ[\w-]+\.[\w-]+\.|(?:token|api[_-]?key|password)\s*[:=]|FirebaseError|permission-denied|\n\s*at\s|\{.*\}/i.test(texto))return 'Não foi possível concluir a ação. Tente novamente.';
 return texto.trim();
}
export function notificar(tipo,mensagem) {const aviso={tipo:['sucesso','erro','aviso','info'].includes(tipo)?tipo:'info',mensagem:textoSeguro(mensagem)};if(aviso.mensagem)for(const ouvir of ouvintes)ouvir(aviso);}
export function ouvirNotificacoes(ouvir){ouvintes.add(ouvir);return()=>ouvintes.delete(ouvir);}
// Só resultados públicos conhecidos atravessam a navegação completa. Nunca dados de formulário.
const permitidas=new Set(['Você entrou na sua conta.','Conta criada com sucesso.','Você saiu da sua conta.','Produto adicionado ao carrinho.','Edição cancelada.']);
export function notificarAoNavegar(mensagem){if(!permitidas.has(mensagem))return;try{sessionStorage.setItem(chave,JSON.stringify({mensagem,expira:Date.now()+DURACAO_TOAST}));}catch{notificar(mensagem==='Edição cancelada.'?'info':'sucesso',mensagem);}}
export function consumirNotificacao(){try{const valor=sessionStorage.getItem(chave);sessionStorage.removeItem(chave);const aviso=JSON.parse(valor);if(permitidas.has(aviso?.mensagem)&&aviso.expira>Date.now()&&aviso.expira<=Date.now()+DURACAO_TOAST)return {...aviso,tipo:aviso.mensagem==='Edição cancelada.'?'info':'sucesso'};}catch{}return null;}
export async function atualizarComFeedback(recurso,mensagem='Informações atualizadas.') {
 try{const resultado=await recurso.atualizar();if(resultado?.cancelado)return;if(resultado?.ok===false){if(!resultado.erroPersistente)notificar('erro',resultado.mensagem||'Não foi possível atualizar. Tente novamente.');}else notificar('sucesso',mensagem);}catch{notificar('erro','Não foi possível atualizar. Tente novamente.');}
}
