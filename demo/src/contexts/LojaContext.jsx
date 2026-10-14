import React, {createContext, useContext, useState, useEffect, useCallback, useRef} from 'react';
import {api, publico, lojaId} from '../services/api';
import {alterarCarrinho,carregarCarrinho} from '../lib/compras';
const Context = createContext(null);
export function LojaProvider({children}) {
  const [dados, setDados] = useState(null), [erro,setErro] = useState(''), [carregando,setCarregando] = useState(true);
  const key = `catalogos:carrinho:${lojaId}`;
  const [carrinho,setCarrinho] = useState(() => {try{return carregarCarrinho(localStorage.getItem(key));}catch{return [];}});
  const versao=useRef(0);
  const atualizar = useCallback(async() => {
    const atual=++versao.current;setCarregando(true);setErro('');
    try {const resultado=await api(publico + '/catalogo',{privado:false});if(atual===versao.current)setDados(resultado);}
    catch(e){if(atual===versao.current)setErro(e.message);}
    finally{if(atual===versao.current)setCarregando(false);}
  }, []);
  useEffect(() => {atualizar(); const foco = () => atualizar(); window.addEventListener('focus',foco); return () => {versao.current++;window.removeEventListener('focus',foco);};},[atualizar]);
  useEffect(() => {
    if (/^#[0-9a-f]{6}$/i.test(dados?.loja?.corPrimaria || "")) document.documentElement.style.setProperty("--primary",dados.loja.corPrimaria);
    return () => document.documentElement.style.removeProperty("--primary");
  },[dados?.loja?.corPrimaria]);
  useEffect(() => {localStorage.setItem(key,JSON.stringify(carrinho));},[carrinho,key]);
  const produtos = (dados?.produtos || []).map(p => ({...p, ingredientes:p.ingredientes || [], categoria:dados?.categorias.find(c => c.id === p.categoriaId)?.nome || '', adicionais:[], adicionaisTotal:0}));
  const itens = carrinho.map(i => ({...(produtos.find(p => p.id === i.id) || {id:i.id,nome:'Produto removido',preco:0,adicionais:[],adicionaisTotal:0}), quantidade:i.quantidade}));
  function adicionar(produto, quantidade = 1) {
    if (!produto || produto.ativo !== true || produto.disponivel === false) return;
    setCarrinho(atual => alterarCarrinho(atual,produto.id,(atual.find(i => i.id === produto.id)?.quantidade || 0) + quantidade));
  }
  return <Context.Provider value={{loja:dados?.loja,categorias:dados?.categorias || [],produtos,itens,erro,carregando,atualizar,adicionar,alterarQuantidade:(id,q) => setCarrinho(a => alterarCarrinho(a,id,q)),removerItem:id => setCarrinho(a => a.filter(i => i.id !== id)),limpar:() => setCarrinho([]),subtotal:itens.reduce((s,i) => s + i.preco*i.quantidade,0)}}>{children}</Context.Provider>;
}
export const useLoja = () => useContext(Context);
export function EstadoCatalogo() {
  const {erro,carregando,atualizar} = useLoja();
  return <div role="status">{carregando && <p>Carregando catálogo...</p>}{erro && <p role="alert">{erro} <button onClick={atualizar}>Tentar novamente</button></p>}</div>;
}
