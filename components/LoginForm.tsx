 "use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [username,setUsername] = useState("");
  const [password,setPassword] = useState("");
  const [error,setError] = useState("");

  async function login(e: React.FormEvent) {
    e.preventDefault(); setError("");
    const res = await fetch("/api/admin/login", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({username,password}) });
    if (!res.ok) { setError("Invalid username or password"); return; }
    router.push("/admin");
    router.refresh();
  }

  return <main className="flex min-h-screen items-center justify-center bg-[#101113] p-5">
    <form onSubmit={login} className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
      <p className="font-bold text-[#b17b18]">HALF & FULL</p>
      <h1 className="mt-2 text-3xl font-black">Admin Login</h1>
      <p className="mt-1 text-sm text-gray-500">Manage menu, prices and hero banners.</p>
      <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username" className="mt-6 w-full rounded-xl border p-3" />
      <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Password" className="mt-3 w-full rounded-xl border p-3" />
      {error && <p className="mt-3 text-sm font-bold text-red-600">{error}</p>}
      <button className="mt-5 w-full rounded-xl bg-[#101113] p-3 font-bold text-white">Login</button>
      <a href="/" className="mt-4 block text-center text-sm text-gray-500">← Back to menu</a>
    </form>
  </main>;
}
