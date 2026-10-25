import {carregarCarrinho} from './compras';

// O cache anterior não informa titularidade: permanece intacto, sem atribuição automática.
export function criarCarrinhoSessao(storage,lojaId) {
  const base=`catalogos:carrinho:v2:${encodeURIComponent(lojaId)}:`;
  let identidade,atual=[];
  const visitante=base+'visitante';
  const ler=key=>{try{return JSON.parse(storage.getItem(key));}catch{return undefined;}};
  const gravar=(key,valor)=>{try{storage.setItem(key,JSON.stringify(valor));}catch{/* Carrinho em memória quando o navegador bloqueia persistência. */}};
  const chave=id=>id.startsWith('conta:')?base+encodeURIComponent(id):visitante;
  function trocar(user) {
    const proxima=user?.uid?`${user.isAnonymous?'anonimo':'conta'}:${user.uid}`:'visitante';
    if(proxima===identidade)return atual;
    const anterior=identidade,cache=ler(chave(proxima));
    if(proxima.startsWith('conta:')) {
      const armazenada=ler(visitante);
      const origem=armazenada===undefined && anterior && !anterior.startsWith('conta:')?{dono:anterior,itens:atual}:armazenada;
      const podeTransferir=(anterior===undefined || !anterior.startsWith('conta:')) && origem &&
        (origem.dono==='visitante' || origem.dono===`anonimo:${user.uid}` || origem.dono===anterior);
      // Uma compra iniciada como visitante assume a sessão; não soma um cache antigo.
      atual=carregarCarrinho(JSON.stringify(podeTransferir&&origem.itens?.length?origem.itens:cache?.itens));
      gravar(visitante,{dono:'visitante',itens:[]});
    } else {
      const saiu=anterior!==undefined && anterior!==proxima && !(anterior==='visitante' && proxima.startsWith('anonimo:'));
      atual=carregarCarrinho(JSON.stringify(!saiu && (cache?.dono===proxima || cache?.dono==='visitante')?cache.itens:[]));
    }
    identidade=proxima;gravar(chave(identidade),{dono:identidade,itens:atual});return atual;
  }
  function alterar(user,operacao){
    const anterior=identidade;trocar(user);
    // Uma ação montada na sessão anterior não pode editar a conta recém-resolvida.
    if(anterior!==undefined && anterior!==identidade)return atual;
    atual=operacao(atual);gravar(chave(identidade),{dono:identidade,itens:atual});return atual;
  }
  return {trocar,alterar};
}
