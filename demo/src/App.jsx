import { useMemo, useState } from "react";

const categories = ["Todos", "Hambúrgueres", "Combos", "Porções", "Bebidas"];

const products = [
  {
    id: 1,
    category: "Hambúrgueres",
    name: "Vila Bacon",
    description: "Pão brioche, hambúrguer artesanal, cheddar, bacon crocante e molho da casa.",
    price: 28.9,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 2,
    category: "Hambúrgueres",
    name: "Clássico da Vila",
    description: "Hambúrguer artesanal, queijo, alface, tomate e molho especial.",
    price: 24.9,
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 3,
    category: "Combos",
    name: "Combo Vila",
    description: "Hambúrguer da casa, batata crocante e refrigerante lata.",
    price: 34.9,
    image: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 4,
    category: "Porções",
    name: "Batata Cheddar & Bacon",
    description: "Batatas crocantes com cheddar cremoso e bacon.",
    price: 22.9,
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 5,
    category: "Bebidas",
    name: "Refrigerante Lata",
    description: "Escolha entre Coca-Cola, Guaraná ou Fanta.",
    price: 6.5,
    image: "https://images.unsplash.com/photo-1629203849820-fdd70d49c38e?auto=format&fit=crop&w=900&q=80",
  },
];

const money = (value) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function App() {
  const [category, setCategory] = useState("Todos");
  const [cart, setCart] = useState([]);

  const visibleProducts = useMemo(
    () => category === "Todos" ? products : products.filter((p) => p.category === category),
    [category]
  );

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  function addToCart(product) {
    setCart((current) => {
      const exists = current.find((item) => item.id === product.id);
      if (exists) {
        return current.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
  }

  function sendWhatsApp() {
    if (!cart.length) return;

    const lines = cart.map(
      (item) => `• ${item.quantity}x ${item.name} — ${money(item.price * item.quantity)}`
    );

    const message = [
      "Olá! Quero fazer este pedido:",
      "",
      ...lines,
      "",
      `Subtotal: ${money(subtotal)}`,
      "",
      "Gostaria de confirmar o pedido e combinar a entrega/pagamento.",
    ].join("\n");

    window.open(`https://wa.me/5551999999999?text=${encodeURIComponent(message)}`, "_blank");
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-950">
      <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-stone-50/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-600">Lanche da Vila</p>
            <p className="text-sm text-stone-500">Hambúrguer artesanal</p>
          </div>
          <button
            onClick={() => document.getElementById("carrinho")?.scrollIntoView({ behavior: "smooth" })}
            className="rounded-full bg-stone-950 px-4 py-2 text-sm font-bold text-white transition hover:-translate-y-0.5"
          >
            Carrinho {totalItems > 0 && `(${totalItems})`}
          </button>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-5 pb-10 pt-12 md:pt-20">
          <div className="grid items-center gap-10 md:grid-cols-[1.05fr_.95fr]">
            <div>
              <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                Aberto hoje · 18:00–23:30
              </span>
              <h1 className="mt-5 max-w-xl text-5xl font-black tracking-tight md:text-7xl">
                Seu lanche favorito, sem complicação.
              </h1>
              <p className="mt-5 max-w-lg text-lg leading-8 text-stone-600">
                Escolha seus produtos, monte o pedido e envie tudo direto para o WhatsApp da Lanche da Vila.
              </p>
              <button
                onClick={() => document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" })}
                className="mt-7 rounded-2xl bg-orange-500 px-6 py-3 font-extrabold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-1 hover:bg-orange-600"
              >
                Ver cardápio
              </button>
            </div>

            <div className="overflow-hidden rounded-[2rem] shadow-2xl shadow-stone-900/10">
              <img
                className="h-[360px] w-full object-cover md:h-[460px]"
                src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=85"
                alt="Hambúrguer artesanal da Lanche da Vila"
              />
            </div>
          </div>
        </section>

        <section id="catalogo" className="mx-auto max-w-6xl px-5 py-10">
          <div className="mb-6">
            <p className="text-sm font-bold text-orange-600">CARDÁPIO</p>
            <h2 className="text-3xl font-black tracking-tight">Escolha o que vai pedir</h2>
          </div>

          <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
            {categories.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition ${category === item ? "bg-stone-950 text-white" : "bg-white text-stone-600 ring-1 ring-stone-200 hover:ring-stone-400"}`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleProducts.map((product) => (
              <article key={product.id} className="group overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-stone-200/70 transition hover:-translate-y-1 hover:shadow-xl">
                <img className="h-52 w-full object-cover transition duration-500 group-hover:scale-105" src={product.image} alt={product.name} />
                <div className="p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-orange-600">{product.category}</p>
                  <h3 className="mt-2 text-xl font-black">{product.name}</h3>
                  <p className="mt-2 min-h-12 text-sm leading-6 text-stone-500">{product.description}</p>
                  <div className="mt-5 flex items-center justify-between gap-3">
                    <strong className="text-lg">{money(product.price)}</strong>
                    <button
                      onClick={() => addToCart(product)}
                      className="rounded-xl bg-stone-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-orange-500"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="carrinho" className="mx-auto max-w-6xl px-5 pb-20 pt-8">
          <div className="rounded-[2rem] bg-stone-950 p-6 text-white md:p-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-orange-400">SEU PEDIDO</p>
                <h2 className="mt-1 text-3xl font-black">Carrinho</h2>
              </div>
              <p className="text-2xl font-black">{money(subtotal)}</p>
            </div>

            {cart.length === 0 ? (
              <p className="mt-6 rounded-2xl bg-white/10 p-5 text-stone-300">
                Seu carrinho está vazio. Adicione alguns produtos para montar o pedido.
              </p>
            ) : (
              <>
                <div className="mt-6 divide-y divide-white/10">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-4 py-4">
                      <div>
                        <p className="font-bold">{item.name}</p>
                        <p className="text-sm text-stone-400">{item.quantity}x · {money(item.price)}</p>
                      </div>
                      <p className="font-bold">{money(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={sendWhatsApp}
                  className="mt-6 w-full rounded-2xl bg-orange-500 px-5 py-4 font-black text-white transition hover:bg-orange-400"
                >
                  Enviar pedido pelo WhatsApp
                </button>
              </>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-stone-200 py-8 text-center text-sm text-stone-500">
        Catálogo Demo · Projeto Catálogos
      </footer>
    </div>
  );
}
