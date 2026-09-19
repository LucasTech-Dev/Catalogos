import { useEffect, useState } from "react";
import { demoCategories, demoProducts, demoStore, DEMO_LOJA_ID } from "../data/demoData";
import { seedDemoData, getAdminOrders, getAllCategories, getAllProducts, getStore, saveCategory, saveProduct, saveStore, deleteCategory, deleteProduct } from "../services/storeService";
import { updateOrderStatus } from "../services/orderService";

const statuses = ["Criado", "Enviado para WhatsApp", "Confirmado", "Em preparação", "Pronto", "Saiu para entrega", "Entregue", "Cancelado"];
const money = (value) => Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function AdminApp({ onExit }) {
  const [tab, setTab] = useState("pedidos");
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [store, setStore] = useState(demoStore);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ id: "", nome: "", ordem: 1, ativo: true });
  const [productForm, setProductForm] = useState({ id: "", nome: "", descricao: "", preco: "", categoriaId: "", imagem: "", ativo: true, destaque: false });

  async function refresh() {
    const [s, c, p, o] = await Promise.all([getStore(DEMO_LOJA_ID), getAllCategories(DEMO_LOJA_ID), getAllProducts(DEMO_LOJA_ID), getAdminOrders(DEMO_LOJA_ID)]);
    if (s) setStore(s);
    setCategories(c); setProducts(p); setOrders(o);
    if (!productForm.categoriaId && c[0]) setProductForm((v) => ({ ...v, categoriaId: c[0].id }));
  }
  useEffect(() => { refresh().catch((e) => setMessage(e.message)); }, []);

  async function prepareDemo() {
    setLoading(true); setMessage("");
    try { await seedDemoData(DEMO_LOJA_ID, demoStore, demoCategories, demoProducts); await refresh(); setMessage("Dados demo preparados no Firestore."); }
    catch (e) { setMessage(e.message); } finally { setLoading(false); }
  }
  async function submitCategory(e) {
    e.preventDefault();
    try { await saveCategory(DEMO_LOJA_ID, { ...categoryForm, ordem: Number(categoryForm.ordem) }); setCategoryForm({ id: "", nome: "", ordem: categories.length + 1, ativo: true }); await refresh(); setMessage("Categoria salva."); }
    catch (e) { setMessage(e.message); }
  }
  async function submitProduct(e) {
    e.preventDefault();
    try { await saveProduct(DEMO_LOJA_ID, { ...productForm, preco: Number(productForm.preco), id: productForm.id || undefined }); setProductForm({ id: "", nome: "", descricao: "", preco: "", categoriaId: categories[0]?.id || "", imagem: "", ativo: true, destaque: false }); await refresh(); setMessage("Produto salvo."); }
    catch (e) { setMessage(e.message); }
  }
  async function saveStoreConfig(e) {
    e.preventDefault();
    try { await saveStore(DEMO_LOJA_ID, { ...store, taxaEntrega: Number(store.taxaEntrega || 0), pedidoMinimo: Number(store.pedidoMinimo || 0) }); await refresh(); setMessage("Configuração salva."); }
    catch (e) { setMessage(e.message); }
  }

  return <main className="min-h-screen bg-stone-100 p-5 text-stone-950 md:p-10">
    <div className="mx-auto max-w-7xl">
      <header className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">Admin</p><h1 className="text-4xl font-black">{store.nome}</h1><p className="text-sm text-stone-500">Loja: {DEMO_LOJA_ID}</p></div><button onClick={onExit} className="rounded-xl bg-stone-950 px-4 py-2 font-bold text-white">Voltar ao catálogo</button></header>
      <nav className="mt-8 flex flex-wrap gap-2">{["pedidos","produtos","categorias","loja"].map((item) => <button key={item} onClick={() => setTab(item)} className={\`rounded-xl px-4 py-2 text-sm font-bold \${tab === item ? "bg-stone-950 text-white" : "bg-white ring-1 ring-stone-200"}\`}>{item[0].toUpperCase()+item.slice(1)}</button>)}<button disabled={loading} onClick={prepareDemo} className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-black text-white disabled:opacity-50">{loading ? "Preparando..." : "Preparar dados demo"}</button></nav>
      {message && <p className="mt-4 rounded-xl bg-white p-4 text-sm text-stone-600 ring-1 ring-stone-200">{message}</p>}

      {tab === "pedidos" && <section className="mt-6 rounded-3xl bg-white p-6 ring-1 ring-stone-200"><div className="flex justify-between"><div><h2 className="text-2xl font-black">Pedidos</h2><p className="text-sm text-stone-500">Pedidos registrados no Firestore.</p></div><strong className="text-2xl">{orders.length}</strong></div><div className="mt-5 space-y-3">{!orders.length && <p className="text-stone-500">Nenhum pedido ainda.</p>}{orders.map((o) => <article key={o.id} className="rounded-2xl bg-stone-50 p-4 ring-1 ring-stone-200"><div className="flex flex-wrap justify-between gap-3"><div><p className="font-black">#{o.id.slice(0,6)} · {o.nomeCliente}</p><p className="text-sm text-stone-500">{o.telefone} · {o.tipoEntrega}</p></div><strong>{money(o.total)}</strong></div><div className="mt-3 flex flex-wrap justify-between gap-3"><span className="text-sm text-stone-600">{o.whatsappEnviado ? "WhatsApp preparado" : "WhatsApp não preparado"}</span><select value={o.status} onChange={async (e) => { await updateOrderStatus(DEMO_LOJA_ID,o.id,e.target.value); await refresh(); }} className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm">{statuses.map((s) => <option key={s}>{s}</option>)}</select></div></article>)}</div></section>}

      {tab === "categorias" && <section className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]"><form onSubmit={submitCategory} className="rounded-3xl bg-white p-6 ring-1 ring-stone-200"><h2 className="text-2xl font-black">Categoria</h2><div className="mt-5 space-y-3"><input value={categoryForm.nome} onChange={(e)=>setCategoryForm({...categoryForm,nome:e.target.value})} required placeholder="Nome" className="w-full rounded-xl border border-stone-200 px-4 py-3"/><input type="number" value={categoryForm.ordem} onChange={(e)=>setCategoryForm({...categoryForm,ordem:e.target.value})} className="w-full rounded-xl border border-stone-200 px-4 py-3"/><label className="flex gap-2 text-sm"><input type="checkbox" checked={categoryForm.ativo !== false} onChange={(e)=>setCategoryForm({...categoryForm,ativo:e.target.checked})}/> Ativa</label></div><button className="mt-5 w-full rounded-xl bg-stone-950 px-4 py-3 font-black text-white">Salvar</button></form><div className="space-y-3">{categories.map((c)=><div key={c.id} className="flex items-center justify-between rounded-2xl bg-white p-4 ring-1 ring-stone-200"><div><p className="font-black">{c.nome}</p><p className="text-xs text-stone-500">{c.id} · ordem {c.ordem}</p></div><div className="flex gap-2"><button onClick={()=>setCategoryForm(c)} className="rounded-lg border px-3 py-2 text-sm font-bold">Editar</button><button onClick={async()=>{await deleteCategory(DEMO_LOJA_ID,c.id);await refresh();}} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-600">Excluir</button></div></div>)}</div></section>}

      {tab === "produtos" && <section className="mt-6 grid gap-6 lg:grid-cols-[400px_1fr]"><form onSubmit={submitProduct} className="rounded-3xl bg-white p-6 ring-1 ring-stone-200"><h2 className="text-2xl font-black">Produto</h2><div className="mt-5 space-y-3"><input value={productForm.nome} onChange={(e)=>setProductForm({...productForm,nome:e.target.value})} required placeholder="Nome" className="w-full rounded-xl border border-stone-200 px-4 py-3"/><textarea value={productForm.descricao} onChange={(e)=>setProductForm({...productForm,descricao:e.target.value})} placeholder="Descrição" className="w-full rounded-xl border border-stone-200 px-4 py-3"/><input type="number" step="0.01" value={productForm.preco} onChange={(e)=>setProductForm({...productForm,preco:e.target.value})} required placeholder="Preço" className="w-full rounded-xl border border-stone-200 px-4 py-3"/><select value={productForm.categoriaId} onChange={(e)=>setProductForm({...productForm,categoriaId:e.target.value})} required className="w-full rounded-xl border border-stone-200 px-4 py-3">{categories.map((c)=><option key={c.id} value={c.id}>{c.nome}</option>)}</select><input value={productForm.imagem} onChange={(e)=>setProductForm({...productForm,imagem:e.target.value})} placeholder="URL da imagem" className="w-full rounded-xl border border-stone-200 px-4 py-3"/><label className="flex gap-2 text-sm"><input type="checkbox" checked={productForm.ativo !== false} onChange={(e)=>setProductForm({...productForm,ativo:e.target.checked})}/> Ativo</label><label className="flex gap-2 text-sm"><input type="checkbox" checked={productForm.destaque === true} onChange={(e)=>setProductForm({...productForm,destaque:e.target.checked})}/> Destaque</label></div><button className="mt-5 w-full rounded-xl bg-stone-950 px-4 py-3 font-black text-white">Salvar</button></form><div className="space-y-3">{products.map((p)=><div key={p.id} className="flex gap-4 rounded-2xl bg-white p-4 ring-1 ring-stone-200"><img src={p.imagem} alt="" className="h-20 w-20 rounded-xl object-cover"/><div className="min-w-0 flex-1"><p className="font-black">{p.nome}</p><p className="text-sm text-stone-500">{money(p.preco)} · {p.ativo === false ? "inativo" : "ativo"}</p><div className="mt-2 flex gap-2"><button onClick={()=>setProductForm({...p,preco:String(p.preco)})} className="rounded-lg border px-3 py-2 text-sm font-bold">Editar</button><button onClick={async()=>{await deleteProduct(DEMO_LOJA_ID,p.id);await refresh();}} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-600">Excluir</button></div></div></div>)}</div></section>}

      {tab === "loja" && <form onSubmit={saveStoreConfig} className="mt-6 max-w-2xl rounded-3xl bg-white p-6 ring-1 ring-stone-200"><h2 className="text-2xl font-black">Configuração da loja</h2><div className="mt-5 grid gap-3"><input value={store.nome||""} onChange={(e)=>setStore({...store,nome:e.target.value})} placeholder="Nome" className="rounded-xl border border-stone-200 px-4 py-3"/><textarea value={store.descricao||""} onChange={(e)=>setStore({...store,descricao:e.target.value})} placeholder="Descrição" className="rounded-xl border border-stone-200 px-4 py-3"/><input value={store.whatsapp||""} onChange={(e)=>setStore({...store,whatsapp:e.target.value})} placeholder="WhatsApp com DDI" className="rounded-xl border border-stone-200 px-4 py-3"/><input type="number" step="0.01" value={store.taxaEntrega??0} onChange={(e)=>setStore({...store,taxaEntrega:e.target.value})} placeholder="Taxa de entrega" className="rounded-xl border border-stone-200 px-4 py-3"/><input type="number" step="0.01" value={store.pedidoMinimo??0} onChange={(e)=>setStore({...store,pedidoMinimo:e.target.value})} placeholder="Pedido mínimo" className="rounded-xl border border-stone-200 px-4 py-3"/></div><button className="mt-5 rounded-xl bg-stone-950 px-5 py-3 font-black text-white">Salvar configuração</button></form>}
    </div>
  </main>;
}
