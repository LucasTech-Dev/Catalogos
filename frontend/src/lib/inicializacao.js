import {LIMITE_LEITURA_MS} from './carregamento';
// O limite encerra o loader visual, mas uma importação válida atrasada ainda abre a página.
export function iniciarInterface({carregar,mostrar,mostrarErro,limite=LIMITE_LEITURA_MS}) {
 let ativo=true;
 const timer=setTimeout(()=>{if(ativo)mostrarErro();},limite);
 const concluida=Promise.resolve().then(carregar).then(valor=>{if(ativo)mostrar(valor);},()=>{if(ativo)mostrarErro();}).finally(()=>clearTimeout(timer));
 return {concluida,cancelar:()=>{ativo=false;clearTimeout(timer);}};
}
