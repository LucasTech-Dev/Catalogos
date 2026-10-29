import {identificadorValido} from '../lib/identificador.js';
import {textoBemFormado} from '../lib/textoBemFormado.js';
import {aguardarLeitura} from '../lib/carregamento.js';
import {collection, doc, getDocFromServer, getDocsFromServer, query, where} from 'firebase/firestore';

const identificador=identificadorValido;
const falha=(message,status)=>Object.assign(new Error(message),{status});
const campos=(dados,nomes)=>Object.fromEntries(nomes.filter(n=>dados[n]!==undefined).map(n=>[n,dados[n]]));

// Mesmo DTO consumido por LojaContext; Firestore mantém os IDs originais.
// Nunca faz fallback HTTP ou retorna cache de outra loja quando a leitura falha.
const leituraPadrao={collection,doc,getDocFromServer,getDocsFromServer,query,where};
async function lerCatalogo(firestore,lojaId,leitor) {
  const {collection,doc,getDocFromServer,getDocsFromServer,query,where}=leitor;
  if(!identificador(lojaId))throw falha('Estabelecimento inválido.',400);
  if(!firestore)throw falha('Catálogo não configurado. Entre em contato com a loja.',503);
  try {
    const ref=doc(firestore,'catalogosPublicos',lojaId),lojaDoc=await getDocFromServer(ref);
    if(!lojaDoc.exists() || lojaDoc.data().ativo===false)throw falha('Loja não encontrada ou indisponível.',404);
    const dados=lojaDoc.data();
    const categoriasDocs=await getDocsFromServer(query(collection(ref,'categorias'),where('ativo','==',true)));
    const categorias=categoriasDocs.docs.map(d=>({...campos(d.data(),['nome','descricao','icone','ordem','ativo']),id:d.id})).filter(c=>c.ativo!==false);
    const produtos=[];
    // Manter os filtros exigidos pelas Rules e limitar a quatro consultas por vez.
    // Esperar o lote inteiro também em falha evita acumular consultas no retry.
    for(let inicio=0;inicio<categorias.length;inicio+=4) {
      const lote=await Promise.allSettled(categorias.slice(inicio,inicio+4).map(categoria=>
        getDocsFromServer(query(collection(ref,'produtos'),where('ativo','==',true),where('categoriaId','==',categoria.id),where('preco','>=',0),where('preco','<=',1000000)))
      ));
      const erro=lote.find(r=>r.status==='rejected');
      if(erro)throw erro.reason;
      for(const {value:lista} of lote)for(const d of lista.docs)produtos.push({...campos(d.data(),['nome','descricao','categoriaId','preco','ativo','disponivel','imagem','ingredientes']),id:d.id});
    }
    const pagamentos=dados.pagamentos || {};
    const loja={...campos(dados,['nome','descricao','telefone','whatsapp','endereco','logo','imagem','corPrimaria','tempoMedio','instagram','pedidoMinimo']),id:lojaId,
      horarios:dados.horarios ?? dados.horarioFuncionamento ?? {},
      pagamentos:Object.fromEntries(['pix','dinheiro','cartao_credito','cartao_debito'].map(f=>[f,pagamentos[f]===true || f.startsWith('cartao_') && pagamentos.cartao===true])),
      entrega:{habilitada:dados.entrega?.habilitada===true,taxa:dados.entrega?.taxa ?? dados.taxaEntrega ?? null},
      retirada:{habilitada:dados.retirada?.habilitada!==false}};
    return {loja,categorias,produtos:produtos.sort((a,b)=>a.id.localeCompare(b.id))};
  }catch(error) {
    if(error.status)throw error;
    if(error.code==='permission-denied')throw falha('Catálogo não disponível para leitura pública.',403);
    throw falha('Não foi possível carregar o catálogo. Verifique sua conexão e tente novamente.',503);
  }
}

// Compartilha apenas leituras em andamento, por instância Firebase e loja.
// Após sucesso ou falha, a próxima chamada volta ao servidor; não há cache de DTO.
const leiturasEmCurso=new WeakMap();
export async function consultarCatalogo(firestore,lojaId,leitor=leituraPadrao) {
  if(!identificador(lojaId))throw falha('Estabelecimento inválido.',400);
  if(!firestore)throw falha('Catálogo não configurado. Entre em contato com a loja.',503);
  let lojas=leiturasEmCurso.get(firestore);
  if(!lojas){lojas=new Map();leiturasEmCurso.set(firestore,lojas);}
  if(!lojas.has(lojaId)) {
    const leitura=aguardarLeitura(()=>lerCatalogo(firestore,lojaId,leitor)).finally(()=>lojas.delete(lojaId));
    lojas.set(lojaId,leitura);
  }
  return lojas.get(lojaId);
}

export async function carregarCatalogo(lojaId) {
  const {dbPublico,leituraPublica}=await import('../lib/firebasePublico.js');
  return consultarCatalogo(dbPublico,lojaId,leituraPublica);
}
