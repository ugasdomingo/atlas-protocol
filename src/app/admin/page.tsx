"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Sale = {
  _id: string;
  email: string;
  paidAt: string;
  grossUsd: number;
  stripeFeeUsd: number;
  netUsd: number;
  taxAmountUsd: number;
  payer: { name: string; countryCode: string };
};

type Totals = { gross: number; fees: number; net: number; tax: number };

export default function AdminPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const router = useRouter();

  async function fetchSales() {
    setLoading(true);
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);

    const res = await fetch(`/api/admin/sales?${params}`);
    if (res.status === 403) { router.replace("/acceso"); return; }

    const data = await res.json();
    setSales(data.sales ?? []);
    setTotals(data.totals ?? null);
    setLoading(false);
  }

  useEffect(() => { fetchSales(); }, []);

  function exportCsv() {
    const params = new URLSearchParams({ format: "csv" });
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    window.open(`/api/admin/sales?${params}`, "_blank");
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <h1 className="text-2xl font-bold mb-8">Panel de ventas</h1>

        {/* Filtros */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-sm"
          />
          <button
            onClick={fetchSales}
            className="bg-neutral-800 px-4 py-2 rounded text-sm hover:bg-neutral-700 transition"
          >
            Filtrar
          </button>
          <button
            onClick={exportCsv}
            className="bg-white text-black px-4 py-2 rounded text-sm font-semibold hover:bg-neutral-200 transition"
          >
            Exportar CSV
          </button>
        </div>

        {/* Totales */}
        {totals && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Bruto", value: totals.gross },
              { label: "Fees Stripe", value: totals.fees },
              { label: "Neto", value: totals.net },
              { label: "Impuesto est.", value: totals.tax },
            ].map(({ label, value }) => (
              <div key={label} className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                <div className="text-neutral-400 text-xs mb-1">{label}</div>
                <div className="text-xl font-bold">${value.toFixed(2)}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tabla */}
        {loading ? (
          <p className="text-neutral-400">Cargando...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-neutral-500 text-left border-b border-neutral-800">
                  <th className="pb-3 pr-4">Fecha</th>
                  <th className="pb-3 pr-4">Email</th>
                  <th className="pb-3 pr-4">País</th>
                  <th className="pb-3 pr-4">Bruto</th>
                  <th className="pb-3 pr-4">Neto</th>
                  <th className="pb-3">Impuesto</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s) => (
                  <tr key={s._id} className="border-b border-neutral-900 hover:bg-neutral-900/50">
                    <td className="py-3 pr-4 text-neutral-400">
                      {new Date(s.paidAt).toLocaleDateString("es")}
                    </td>
                    <td className="py-3 pr-4">{s.email}</td>
                    <td className="py-3 pr-4 text-neutral-400">{s.payer?.countryCode}</td>
                    <td className="py-3 pr-4">${s.grossUsd}</td>
                    <td className="py-3 pr-4">${s.netUsd?.toFixed(2)}</td>
                    <td className="py-3">${s.taxAmountUsd?.toFixed(2)}</td>
                  </tr>
                ))}
                {!sales.length && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-neutral-500">
                      Sin ventas en este período
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
