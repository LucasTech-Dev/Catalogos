import { collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, setDoc, where } from "firebase/firestore";
import { db } from "../lib/firebase";

const storeRef = (lojaId) => doc(db, "lojas", lojaId);

export async function getStore(lojaId) {
  const snapshot = await getDoc(storeRef(lojaId));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

export async function getCategories(lojaId) {
  const snapshot = await getDocs(query(collection(db, "lojas", lojaId, "categorias"), orderBy("ordem", "asc")));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).filter((item) => item.ativo !== false);
}

export async function getAllCategories(lojaId) {
  const snapshot = await getDocs(query(collection(db, "lojas", lojaId, "categorias"), orderBy("ordem", "asc")));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function getProducts(lojaId) {
  const snapshot = await getDocs(query(collection(db, "lojas", lojaId, "produtos"), where("ativo", "==", true)));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function getAllProducts(lojaId) {
  const snapshot = await getDocs(collection(db, "lojas", lojaId, "produtos"));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function saveCategory(lojaId, data) {
  const id = data.id || data.nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  await setDoc(doc(db, "lojas", lojaId, "categorias", id), { ...data, id, atualizadoEm: new Date() }, { merge: true });
}

export async function deleteCategory(lojaId, id) {
  await deleteDoc(doc(db, "lojas", lojaId, "categorias", id));
}

export async function saveProduct(lojaId, data) {
  const id = data.id || data.nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  await setDoc(doc(db, "lojas", lojaId, "produtos", id), { ...data, id, atualizadoEm: new Date() }, { merge: true });
}

export async function deleteProduct(lojaId, id) {
  await deleteDoc(doc(db, "lojas", lojaId, "produtos", id));
}

export async function saveStore(lojaId, data) {
  await setDoc(storeRef(lojaId), { ...data, atualizadoEm: new Date() }, { merge: true });
}

export async function seedDemoData(lojaId, store, categories, products) {
  const now = new Date();
  await setDoc(storeRef(lojaId), { ...store, atualizadoEm: now, criadoEm: now }, { merge: true });
  await Promise.all(categories.map((item) => setDoc(doc(db, "lojas", lojaId, "categorias", item.id), { ...item, atualizadoEm: now }, { merge: true })));
  await Promise.all(products.map((item) => setDoc(doc(db, "lojas", lojaId, "produtos", item.id), { ...item, atualizadoEm: now }, { merge: true })));
}
