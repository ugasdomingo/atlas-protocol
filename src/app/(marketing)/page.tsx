"use client";

import Image from "next/image";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  Download,
  FileText,
  Headphones,
  LockKeyhole,
  MailCheck,
  ShieldCheck,
} from "lucide-react";

const PRODUCT_SLUG = "protocolo-atlas";

export default function LandingPage() {
  const [paymentError, setPaymentError] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [consentMarketing, setConsentMarketing] = useState(false);
  const [leadMessage, setLeadMessage] = useState("");
  const [leadError, setLeadError] = useState("");
  const [leadLoading, setLeadLoading] = useState(false);

  async function handleLeadSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLeadLoading(true);
    setLeadError("");
    setLeadMessage("");

    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: leadName,
        email: leadEmail,
        consentMarketing,
        website: "",
      }),
    });

    const data = await res.json();
    setLeadLoading(false);

    if (!res.ok) {
      setLeadError(data.error ?? "No pudimos enviar el PDF. Intenta de nuevo.");
      return;
    }

    setLeadMessage(data.message ?? "Te enviamos el PDF a tu correo.");
    setLeadName("");
    setLeadEmail("");
    setConsentMarketing(false);
  }

  async function handleCheckout() {
    setPaymentLoading(true);
    setPaymentError("");

    const res = await fetch("/api/stripe/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productSlug: PRODUCT_SLUG }),
    });

    const data = await res.json();
    setPaymentLoading(false);

    if (!res.ok || !data.url) {
      setPaymentError(data.error ?? "No pudimos iniciar el pago. Intenta de nuevo.");
      return;
    }

    window.location.assign(data.url);
  }

  return (
    <main className="min-h-screen bg-[#070707] text-white">
      <section className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 gap-12 px-5 py-6 md:grid-cols-[1fr_420px] md:px-8 lg:px-12">
        <div className="flex flex-col justify-between">
          <nav className="flex items-center justify-between border-b border-white/10 py-5">
            <Image
              src="/brand/logo_letras.png"
              alt="Protocolo Atlas"
              width={170}
              height={56}
              priority
              className="h-auto opacity-90"
            />
            <a
              href="/acceso"
              className="text-sm text-neutral-400 transition hover:text-white"
            >
              Acceder
            </a>
          </nav>

          <div className="py-14 md:max-w-3xl md:py-20">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500">
              Estrategia gratuita de 3 días
            </p>
            <h1 className="max-w-4xl text-5xl font-bold leading-[0.95] md:text-7xl lg:text-8xl">
              Protocolo Atlas
            </h1>
            <p className="mt-7 max-w-2xl text-xl leading-8 text-neutral-300 md:text-2xl md:leading-9">
              Claridad, disciplina y dirección para el hombre que quiere dejar
              de improvisar su vida.
            </p>

            <div className="mt-10 grid max-w-2xl grid-cols-1 gap-3 text-sm text-neutral-300 sm:grid-cols-3">
              {[
                { icon: FileText, label: "PDF accionable" },
                { icon: MailCheck, label: "Seguimiento a 3 días" },
                { icon: ShieldCheck, label: "Sin spam" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 border border-white/10 bg-white/[0.03] px-3 py-3"
                >
                  <Icon className="h-4 w-4 text-white" aria-hidden />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden border-t border-white/10 py-5 text-sm text-neutral-500 md:block">
            Primero ejecutas el PDF gratis. Si te sirve, el paquete completo te
            espera con guías y audios.
          </div>
        </div>

        <aside className="flex items-center md:min-h-screen">
          <div className="w-full border border-white/10 bg-[#101010] p-5 shadow-2xl shadow-black/30 md:p-6">
            <div className="mb-6 flex h-12 w-12 items-center justify-center border border-white/10 bg-white text-black">
              <Download className="h-5 w-5" aria-hidden />
            </div>
            <h2 className="text-2xl font-semibold leading-tight">
              Recibe el PDF gratuito
            </h2>
            <p className="mt-3 text-sm leading-6 text-neutral-400">
              Un plan de 3 días para ordenar foco, hábitos y decisiones. Te lo
              enviamos al correo y 3 días después te preguntamos cómo te fue.
            </p>

            <form onSubmit={handleLeadSubmit} className="mt-7 space-y-4">
              <label className="block">
                <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
                  Nombre
                </span>
                <input
                  type="text"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  required
                  minLength={2}
                  placeholder="Tu nombre"
                  className="w-full border border-white/10 bg-black px-4 py-3 text-white outline-none transition placeholder:text-neutral-700 focus:border-white"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
                  Email
                </span>
                <input
                  type="email"
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  required
                  placeholder="tu@email.com"
                  className="w-full border border-white/10 bg-black px-4 py-3 text-white outline-none transition placeholder:text-neutral-700 focus:border-white"
                />
              </label>

              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />

              <label className="flex gap-3 text-sm leading-5 text-neutral-400">
                <input
                  type="checkbox"
                  checked={consentMarketing}
                  onChange={(e) => setConsentMarketing(e.target.checked)}
                  required
                  className="mt-1 h-4 w-4 shrink-0 accent-white"
                />
                <span>
                  Acepto recibir el PDF y comunicaciones por email de Protocolo
                  Atlas, incluyendo el seguimiento y ofertas relacionadas.
                </span>
              </label>

              {leadError && <p className="text-sm text-red-400">{leadError}</p>}
              {leadMessage && <p className="text-sm text-emerald-400">{leadMessage}</p>}

              <button
                type="submit"
                disabled={leadLoading}
                className="flex w-full items-center justify-center gap-2 bg-white px-5 py-4 font-semibold text-black transition hover:bg-neutral-200 disabled:opacity-50"
              >
                {leadLoading ? "Enviando..." : "Enviar PDF gratis"}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </form>
          </div>
        </aside>
      </section>

      <section className="border-y border-white/10 bg-white text-black">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-5 py-16 md:grid-cols-3 md:px-8 lg:px-12">
          {[
            {
              value: "01",
              title: "Ejecuta",
              text: "Empiezas con una estrategia concreta de 3 días. Nada de teoría inflada.",
            },
            {
              value: "02",
              title: "Evalúa",
              text: "A los 3 días recibes un correo para revisar qué cambió y qué te faltó.",
            },
            {
              value: "03",
              title: "Profundiza",
              text: "Si quieres continuar, entras al paquete completo con guías y audios.",
            },
          ].map((item) => (
            <div key={item.value} className="border-l border-black/15 pl-5">
              <div className="text-sm font-bold text-neutral-500">{item.value}</div>
              <h3 className="mt-5 text-2xl font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-neutral-600">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="paquete" className="mx-auto max-w-7xl px-5 py-20 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_420px]">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500">
              Paquete completo
            </p>
            <h2 className="max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
              Guías y audios para construir con más claridad.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-400">
              El PDF gratuito abre la puerta. El paquete pago te da el sistema:
              lectura profunda, audios para integrar en movimiento y acceso
              privado de por vida.
            </p>

            <div className="mt-10 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                { icon: FileText, text: "Guía completa: ¿En realidad amo?" },
                { icon: FileText, text: "Guía completa: El hombre proveedor" },
                { icon: Headphones, text: "Audios MP3 del protocolo" },
                { icon: LockKeyhole, text: "Biblioteca privada con OTP" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 border border-white/10 p-4">
                  <Icon className="h-5 w-5 text-neutral-300" aria-hidden />
                  <span className="text-sm text-neutral-300">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-[#101010] p-6">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <h3 className="text-xl font-semibold">Acceso completo</h3>
                <p className="mt-2 text-sm text-neutral-500">Pago único</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">$47</div>
                <div className="text-sm text-neutral-500">USD</div>
              </div>
            </div>

            <ul className="my-6 space-y-3 text-sm text-neutral-300">
              {[
                "Entrega inmediata por email",
                "Acceso de por vida, sin suscripción",
                "Descargas privadas desde la biblioteca",
                "Pago seguro vía Stripe",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-white" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {paymentError && <p className="mb-4 text-sm text-red-400">{paymentError}</p>}
            {paymentLoading && <p className="mb-4 text-sm text-neutral-400">Procesando...</p>}

            <button
              type="button"
              onClick={handleCheckout}
              disabled={paymentLoading}
              className="flex w-full items-center justify-center gap-2 bg-white px-5 py-4 font-semibold text-black transition hover:bg-neutral-200 disabled:opacity-50"
            >
              {paymentLoading ? "Abriendo pago..." : "Comprar con Stripe"}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
