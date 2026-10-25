// Somente leituras: o limite encerra a espera visual, sem repetir ou cancelar escritas.
export const LIMITE_LEITURA_MS=20000;
export function aguardarLeitura(operacao,limite=LIMITE_LEITURA_MS) {
  let timer;
  return Promise.race([
    new Promise(resolve=>resolve(operacao())),
    new Promise((_,reject)=>{timer=setTimeout(()=>reject(Object.assign(new Error('O carregamento demorou mais que o esperado. Verifique sua conexão e tente novamente.'),{code:'LEITURA_TIMEOUT'})),limite);})
  ]).finally(()=>clearTimeout(timer));
}
