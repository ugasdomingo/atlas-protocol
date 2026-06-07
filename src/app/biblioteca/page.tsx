"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FileText, Headphones } from "lucide-react";

type Asset = { type: string; filename: string };
type Product = { slug: string; title: string; assets: Asset[] };

export default function BibliotecaPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/library/list")
      .then((r) => {
        if (r.status === 401) {
          router.replace("/acceso");
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data) setProducts(data.products ?? []);
        setLoading(false);
      });
  }, [router]);

  async function download(productSlug: string, filename: string) {
    setDownloading(`${productSlug}/${filename}`);
    const res = await fetch("/api/library/signed-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productSlug, filename }),
    });

    const data = await res.json();
    setDownloading(null);

    if (res.ok && data.url) {
      window.open(data.url, "_blank");
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#070707] text-white">
        <p className="text-neutral-400">Cargando...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#070707] text-white">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="mb-12 flex items-center justify-between">
          <Image
            src="/brand/logo_letras.png"
            alt="Protocolo Atlas"
            width={160}
            height={54}
          />
          <button
            onClick={logout}
            className="text-sm text-neutral-500 transition hover:text-white"
          >
            Cerrar sesión
          </button>
        </div>

        <h1 className="mb-2 text-2xl font-bold">Tu biblioteca</h1>
        <p className="mb-8 text-sm text-neutral-400">
          Acceso completo a todos tus materiales.
        </p>

        {products.map((product) => (
          <div key={product.slug} className="mb-4 border border-white/10 bg-[#101010] p-6">
            <h2 className="mb-4 font-semibold">{product.title}</h2>
            <div className="space-y-2">
              {product.assets.map((asset) => {
                const Icon = asset.type === "audio" ? Headphones : FileText;
                return (
                  <button
                    key={asset.filename}
                    onClick={() => download(product.slug, asset.filename)}
                    disabled={downloading === `${product.slug}/${asset.filename}`}
                    className="flex w-full items-center gap-3 text-left text-sm text-neutral-300 transition hover:text-white disabled:opacity-50"
                  >
                    <Icon className="h-4 w-4 text-neutral-500" aria-hidden />
                    <span>{asset.filename}</span>
                    {downloading === `${product.slug}/${asset.filename}` && (
                      <span className="ml-auto text-neutral-500">Descargando...</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
