import { addDoc, collection, getDocs, limit, orderBy, query, serverTimestamp, updateDoc, doc, where } from "firebase/firestore";
import { db } from "../lib/firebase";

export async function createOrder(lojaId, userId, payload) {
  const ref = await addDoc(collection(db, "lojas", lojaId, "pedidos"), {
    ...payload, clienteId: userId, lojaId, status: "Criado", criadoEm: serverTimestamp(), atualizadoEm: serverTimestamp()
  });
  return ref.id;
}

export async function markWhatsAppSent(lojaId, orderId) {
  await updateDoc(doc(db, "lojas", lojaId, "pedidos", orderId), { whatsappEnviado: true, whatsappEnviadoEm: serverTimestamp(), status: "Enviado para WhatsApp", atualizadoEm: serverTimestamp() });
}

export async function getCustomerOrders(lojaId, userId) {
  const snapshot = await getDocs(query(collection(db, "lojas", lojaId, "pedidos"), where("clienteId", "==", userId), orderBy("criadoEm", "desc"), limit(30)));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function getAdminOrders(lojaId) {
  const snapshot = await getDocs(query(collection(db, "lojas", lojaId, "pedidos"), orderBy("criadoEm", "desc"), limit(100)));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function updateOrderStatus(lojaId, orderId, status) {
  await updateDoc(doc(db, "lojas", lojaId, "pedidos", orderId), { status, atualizadoEm: serverTimestamp() });
}
