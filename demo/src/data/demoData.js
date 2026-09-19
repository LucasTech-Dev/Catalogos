export const DEMO_LOJA_ID = import.meta.env.VITE_DEMO_LOJA_ID || "lanche-da-vila";

export const demoStore = {
  id: DEMO_LOJA_ID,
  nome: "Lanche da Vila",
  tipo: "lancheria",
  descricao: "Hambúrguer artesanal, combos e porções preparados na hora.",
  logo: "",
  whatsapp: "5551999999999",
  telefone: "(51) 99999-9999",
  taxaEntrega: 5,
  pedidoMinimo: 0,
  ativo: true,
  entrega: true,
  retirada: true
};

export const demoCategories = [
  { id: "hamburgueres", nome: "Hambúrgueres", ordem: 1, ativo: true },
  { id: "combos", nome: "Combos", ordem: 2, ativo: true },
  { id: "porcoes", nome: "Porções", ordem: 3, ativo: true },
  { id: "bebidas", nome: "Bebidas", ordem: 4, ativo: true }
];

export const demoProducts = [
  { id: "vila-bacon", categoriaId: "hamburgueres", nome: "Vila Bacon", descricao: "Pão brioche, hambúrguer artesanal, cheddar, bacon crocante e molho da casa.", preco: 28.9, imagem: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80", ativo: true, destaque: true },
  { id: "classico-vila", categoriaId: "hamburgueres", nome: "Clássico da Vila", descricao: "Hambúrguer artesanal, queijo, alface, tomate e molho especial.", preco: 24.9, imagem: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80", ativo: true, destaque: false },
  { id: "combo-vila", categoriaId: "combos", nome: "Combo Vila", descricao: "Hambúrguer da casa, batata crocante e refrigerante lata.", preco: 34.9, imagem: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=900&q=80", ativo: true, destaque: true },
  { id: "batata-cheddar-bacon", categoriaId: "porcoes", nome: "Batata Cheddar & Bacon", descricao: "Batatas crocantes com cheddar cremoso e bacon.", preco: 22.9, imagem: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=80", ativo: true, destaque: false },
  { id: "refri-lata", categoriaId: "bebidas", nome: "Refrigerante Lata", descricao: "Coca-Cola, Guaraná ou Fanta.", preco: 6.5, imagem: "https://images.unsplash.com/photo-1629203849820-fdd70d49c38e?auto=format&fit=crop&w=900&q=80", ativo: true, destaque: false }
];
