import {notificar} from '../lib/notificacoes';
import React, {createContext, useContext, useState, useEffect, useCallback, useRef} from 'react';
import {api, publico, lojaId} from '../services/api';
import {alterarCarrinho,quantidadeValida,chaveItem} from '../lib/compras';
import {modoOriginalDemo} from '../lib/runtimeDemo';
import {adaptarCatalogoDemo} from '../services/catalogoDemo';
import {carregarCatalogo} from '../services/catalogo';
import {modoFixtures} from '../lib/runtimeDemo';
import {aguardarLeitura} from '../lib/carregamento';
import {auth} from '../lib/firebase';
import {onIdTokenChanged} from 'firebase/auth';
import {criarCarrinhoSessao} from '../lib/carrinhoSessao';
import {PageBoundary} from '../components/ui/PageLoader';
const Context = createContext(null);
export function LojaProvider({children}) {
  const [dados, setDados] = useState(null), [erro,setErro] = useState(''), [carregando,setCarregando] = useState(true);
  const sessaoCarrinho=useRef(null);
  if(!sessaoCarrinho.current)sessaoCarrinho.current=criarCarrinhoSessao({getItem:key=>window.localStorage.getItem(key),setItem:(key,value)=>window.localStorage.setItem(key,value)},lojaId);
  const [carrinho,exibirCarrinho]=useState([]);
  useEffect(()=>{
    const trocar=user=>exibirCarrinho(sessaoCarrinho.current.trocar(user));
    if(auth)return onIdTokenChanged(auth,trocar);
    trocar(null);
  },[]);
  function setCarrinho(operacao){
    // Persistir antes de navegar; conferir a identidade atual também em ações atrasadas.
    exibirCarrinho(sessaoCarrinho.current.alterar(auth?.currentUser,atual=>typeof operacao==='function'?operacao(atual):operacao));
  }
  const versao=useRef(0),emCurso=useRef(null);
  const atualizar = useCallback(() => {
    if(emCurso.current)return emCurso.current;
    const operacao=async()=>{
    const atual=++versao.current;setCarregando(true);setErro('');
    try {const resultado=await aguardarLeitura(()=>modoFixtures(import.meta.env)?api(publico + '/catalogo',{privado:false}):carregarCatalogo(lojaId));if(atual!==versao.current)return {ok:false,cancelado:true};setDados(modoOriginalDemo(import.meta.env)?adaptarCatalogoDemo(resultado):resultado);return {ok:true};}
    catch(e){if(atual===versao.current){if([403,404].includes(e.status))setDados(null);setErro(e.message);}return {ok:false,mensagem:e.message,erroPersistente:true};}
    finally{if(atual===versao.current)setCarregando(false);}
    };
    const promessa=operacao().finally(()=>{if(emCurso.current===promessa)emCurso.current=null;});emCurso.current=promessa;return promessa;
  }, []);
  useEffect(() => {atualizar(); const foco = () => atualizar(); window.addEventListener('focus',foco);window.addEventListener('online',foco); return () => {versao.current++;emCurso.current=null;window.removeEventListener('focus',foco);window.removeEventListener('online',foco);};},[atualizar]);
  useEffect(() => {
    if (/^#[0-9a-f]{6}$/i.test(dados?.loja?.corPrimaria || "")) document.documentElement.style.setProperty("--primary",dados.loja.corPrimaria);
    return () => document.documentElement.style.removeProperty("--primary");
  },[dados?.loja?.corPrimaria]);
  const produtos = (dados?.produtos || []).map(p => ({...p, ingredientes:p.ingredientes || [], categoria:dados?.categorias.find(c => c.id === p.categoriaId)?.nome || '', adicionais:[], adicionaisTotal:0}));
  const itens = carrinho.map(i => ({...(produtos.find(p => p.id === i.id) || {id:i.id,nome:'Produto removido',preco:0,adicionais:[],adicionaisTotal:0}), quantidade:i.quantidade,observacao:i.observacao,chave:chaveItem(i)}));
  function adicionar(produto, quantidade = 1, observacao = '') {
    if (!produto || produto.ativo !== true || produto.disponivel === false){notificar('aviso','Este produto está indisponível.');return false;}
    if(typeof observacao!=='string' || observacao.length>1000)return false;
    const total=carrinho.filter(i=>i.id===produto.id).reduce((s,i)=>s+i.quantidade,0)+quantidade;
    if(!quantidadeValida(total)){notificar('aviso','Você pode adicionar até 99 unidades de cada produto.');return false;}
    setCarrinho(atual => alterarCarrinho(atual,produto.id,(atual.find(i => chaveItem(i) === chaveItem({id:produto.id,observacao}))?.quantidade || 0) + quantidade,observacao));
    notificar('sucesso','Produto adicionado ao carrinho.');return true;
  }
  function alterarQuantidade(id,q){const item=carrinho.find(i=>chaveItem(i)===id);if(!item)return;if(!quantidadeValida(q)||item.quantidade===q){notificar('aviso','A quantidade deve ficar entre 1 e 99.');return;}setCarrinho(a=>alterarCarrinho(a,item.id,q,item.observacao));notificar('sucesso','Quantidade atualizada.');}
  function alterarObservacao(id,observacao){
    if(typeof observacao!=='string' || observacao.length>1000)return false;
    const item=carrinho.find(i=>chaveItem(i)===id);
    if(!item)return false;
    if(item.observacao===observacao)return true;
    const chaveNova=chaveItem({id:item.id,observacao});
    const destino=carrinho.find(i=>chaveItem(i)===chaveNova && chaveItem(i)!==id);
    if(destino && !quantidadeValida(destino.quantidade+item.quantidade)){
      notificar('aviso','A soma das quantidades ultrapassaria 99 unidades.');return false;
    }
    setCarrinho(atuais=>{
      const atual=atuais.find(i=>chaveItem(i)===id);
      if(!atual)return atuais;
      const outras=atuais.filter(i=>chaveItem(i)!==id);
      const existente=outras.find(i=>chaveItem(i)===chaveNova);
      if(existente){
        if(!quantidadeValida(existente.quantidade+atual.quantidade))return atuais;
        return outras.map(i=>chaveItem(i)===chaveNova?{...i,quantidade:i.quantidade+atual.quantidade}:i);
      }
      return atuais.map(i=>chaveItem(i)===id?{...i,observacao}:i);
    });
    notificar('sucesso','Observação do produto atualizada.');
    return true;
  }
  function removerItem(id){if(!carrinho.some(i=>chaveItem(i)===id))return;setCarrinho(a=>a.filter(i=>chaveItem(i)!==id));notificar('sucesso','Produto removido do carrinho.');}
  return <Context.Provider value={{loja:dados?.loja,categorias:dados?.categorias || [],produtos,itens,erro,carregando,pronto:Boolean(dados),atualizar,adicionar,alterarQuantidade,alterarObservacao,removerItem,limpar:() => setCarrinho([]),subtotal:Number(itens.reduce((s,i) => s + Number((i.preco*i.quantidade).toFixed(2)),0).toFixed(2))}}>{children}</Context.Provider>;
}
export const useLoja = () => useContext(Context);
export function EstadoCatalogo() {
  const {erro,carregando,atualizar} = useLoja();
  return <div role="status">{carregando && <p>Atualizando catálogo...</p>}{erro && <p role="alert">{erro} <button onClick={atualizar}>Tentar novamente</button></p>}</div>;
}

export function CatalogoPronto({children}) {
  const recurso=useLoja();
  return <PageBoundary recursos={[recurso]} loja={recurso.loja}>{children}</PageBoundary>;
}
