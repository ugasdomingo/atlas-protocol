"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AccesoPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const res = await fetch("/api/auth/request-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.status === 429) {
      setError(data.error);
      return;
    }

    setMessage(data.message ?? "Revisa tu correo.");
    sessionStorage.setItem("pa_email", email);
    setTimeout(() => router.push("/acceso/verificar"), 1500);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#070707] px-6 text-white">
      <div className="w-full max-w-sm">
        <Image
          src="/brand/logo_solo.png"
          alt="Protocolo Atlas"
          width={48}
          height={48}
          className="mx-auto mb-8"
        />

        <h1 className="mb-2 text-center text-2xl font-bold">Acceder</h1>
        <p className="mb-8 text-center text-sm text-neutral-400">
          Ingresa el email con el que compraste
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
            className="w-full border border-white/10 bg-black px-4 py-3 text-white outline-none placeholder:text-neutral-600 focus:border-white"
          />

          {error && <p className="text-sm text-red-400">{error}</p>}
          {message && <p className="text-sm text-emerald-400">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white py-3 font-semibold text-black transition hover:bg-neutral-200 disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Enviar código"}
          </button>
        </form>
      </div>
    </main>
  );
}
