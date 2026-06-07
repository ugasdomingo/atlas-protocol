"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function VerificarPage() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const router = useRouter();

  useEffect(() => {
    const stored = sessionStorage.getItem("pa_email");
    if (!stored) {
      router.replace("/acceso");
      return;
    }
    setEmail(stored);
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      sessionStorage.removeItem("pa_email");
      router.push("/biblioteca");
    } else {
      setError(data.error ?? "Código incorrecto");
    }
  }

  async function resendOtp() {
    setError("");
    await fetch("/api/auth/request-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setError("Código reenviado. Revisa tu correo.");
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

        <h1 className="mb-2 text-center text-2xl font-bold">Ingresa tu código</h1>
        <p className="mb-8 text-center text-sm text-neutral-400">
          Enviamos un código de 6 dígitos a{" "}
          <span className="text-white">{email}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            required
            className="w-full border border-white/10 bg-black px-4 py-3 text-center text-2xl tracking-widest text-white outline-none placeholder:text-neutral-700 focus:border-white"
          />

          {error && <p className="text-center text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full bg-white py-3 font-semibold text-black transition hover:bg-neutral-200 disabled:opacity-50"
          >
            {loading ? "Verificando..." : "Acceder"}
          </button>
        </form>

        <button
          onClick={resendOtp}
          className="mt-4 w-full text-sm text-neutral-500 transition hover:text-white"
        >
          Reenviar código
        </button>
      </div>
    </main>
  );
}
