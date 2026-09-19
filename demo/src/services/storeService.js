import { collection, doc, getDoc, getDocs, orderBy, query, setDoc, where } from "firebase/firestore";
import { db } from "../lib/firebase";

export async function getStore(lojaId) {
  const snapshot = await getDoc(doc(db, "lojas", lojaId));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

export async function getCategories(lojaId) {
  const snapshot = await getDocs(query(collection(db, "lojas", lojaId, "categorias"), orderBy("ordem", "asc")));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).filter((item) => item.ativo !== false);
}

export async function getProducts(lojaId) {
  const snapshot = await getDocs(query(collection(db, "lojas", lojaId, "produtos"), where("ativo", "==", true)));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function seedDemoData(lojaId, store, categories, products) {
  const now = new Date();
  await setDoc(doc(db, "lojas", lojaId), { ...store, atualizadoEm: now, criadoEm: now }, { merge: true });
  await Promise.all(categories.map((item) => setDoc(doc(db, "lojas", lojaId, "categorias", item.id), { ...item, atualizadoEm: now }, { merge: true })));
  await Promise.all(products.map((item) => setDoc(doc(db, "lojas", lojaId, "produtos", item.id), { ...item, atualizadoEm: now }, { merge: true })));
}
