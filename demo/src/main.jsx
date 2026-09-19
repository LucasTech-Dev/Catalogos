import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./lib/firebase";
import App from "./App";
import AdminApp from "./admin/AdminApp";
import "./index.css";

function Login({ onReady }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function submit(event) {
    event.preventDefault();
    setMessage("");
    try {
      const result = mode === "login"
        ? await signInWithEmailAndPassword(auth, email, password)
        : await createUserWithEmailAndPassword(auth, email, password);

      if (mode === "register") {
        await setDoc(doc(db, "usuarios", result.user.uid), {
          tipo: "cliente", nivel: "cliente", status: "ativo",
          lojaId: import.meta.env.VITE_DEMO_LOJA_ID || "lanche-da-vila",
          criadoEm: new Date()
        });
      }
      onReady(result.user);
    } catch (error) {
      setMessage(error.code === "auth/invalid-credential" ? "E-mail ou senha inválidos." : error.message);
    }
  }

  return <main className="grid min-h-screen place-items-center bg-stone-950 p-5">
    <form onSubmit={submit} className="w-full max-w-md rounded-[2rem] bg-white p-7 shadow-2xl">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-600">Catálogo Demo</p>
      <h1 className="mt-2 text-3xl font-black">{mode === "login" ? "Entrar" : "Criar conta"}</h1>
      <p className="mt-2 text-sm text-stone-500">Lanche da Vila · ambiente funcional</p>
      <div className="mt-6 space-y-3">
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" className="w-full rounded-xl border border-stone-200 px-4 py-3" />
        <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" className="w-full rounded-xl border border-stone-200 px-4 py-3" />
      </div>
      <button className="mt-5 w-full rounded-xl bg-stone-950 px-4 py-3 font-black text-white">{mode === "login" ? "Entrar" : "Criar conta"}</button>
      {message && <p className="mt-4 text-sm text-red-600">{message}</p>}
      <button type="button" onClick={() => setMode(mode === "login" ? "register" : "login")} className="mt-4 w-full text-sm font-bold text-orange-600">
        {mode === "login" ? "Ainda não tenho conta" : "Já tenho conta"}
      </button>
    </form>
  </main>;
}

function Root() {
  const [user, setUser] = useState(undefined);
  const [profile, setProfile] = useState(null);
  const [view, setView] = useState(window.location.pathname.startsWith("/admin") ? "admin" : "catalog");

  useEffect(() => onAuthStateChanged(auth, async (current) => {
    setUser(current);
    if (!current) return setProfile(null);
    const snapshot = await getDoc(doc(db, "usuarios", current.uid));
    setProfile(snapshot.exists() ? snapshot.data() : null);
  }), []);

  if (user === undefined) return <div className="grid min-h-screen place-items-center bg-stone-50 font-bold">Inicializando...</div>;
  if (!user) return <Login onReady={setUser} />;

  if (view === "admin") {
    const storeId = import.meta.env.VITE_DEMO_LOJA_ID || "lanche-da-vila";
    const isAdmin = profile?.tipo === "admin" && profile?.status === "ativo" &&
      (profile?.nivel === "global" || (profile?.nivel === "loja" && profile?.lojaId === storeId));
    if (!isAdmin) return <main className="grid min-h-screen place-items-center bg-stone-50 p-6 text-center"><div><h1 className="text-3xl font-black">Acesso restrito</h1><p className="mt-2 text-stone-500">Esta conta não é administradora da loja.</p><button onClick={() => { window.history.pushState({}, "", "/"); setView("catalog"); }} className="mt-5 rounded-xl bg-stone-950 px-5 py-3 font-bold text-white">Voltar</button></div></main>;
    return <AdminApp onExit={() => { window.history.pushState({}, "", "/"); setView("catalog"); }} />;
  }

  return <App user={user} onAdmin={() => { window.history.pushState({}, "", "/admin"); setView("admin"); }} />;
}

createRoot(document.getElementById("root")).render(<StrictMode><Root /></StrictMode>);
