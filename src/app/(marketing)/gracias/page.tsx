import Link from "next/link";
import { Check } from "lucide-react";

export default function GraciasPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#070707] px-6 text-white">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center border border-white/10 bg-white text-black">
          <Check className="h-6 w-6" aria-hidden />
        </div>
        <h1 className="mb-4 text-3xl font-bold">Pago confirmado</h1>
        <p className="mb-8 leading-7 text-neutral-400">
          Recibirás un email de confirmación en breve. Para acceder a tu
          biblioteca, ingresa con el email que usaste para comprar.
        </p>
        <Link
          href="/acceso"
          className="inline-flex items-center justify-center bg-white px-6 py-3 font-semibold text-black transition hover:bg-neutral-200"
        >
          Acceder a mi biblioteca
        </Link>
      </div>
    </main>
  );
}
