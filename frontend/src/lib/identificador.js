import {textoBemFormado} from './textoBemFormado.js';
// O mesmo contrato para loja e IDs de documentos; nenhum ajuste silencioso do caminho.
export const identificadorValido = id => typeof id === 'string' && id.length > 0 && id.length <= 128
  && id.trim() === id && textoBemFormado(id) && !/[\/\\\u0000-\u001f\u007f-\u009f]/u.test(id) && !['.','..'].includes(id);
