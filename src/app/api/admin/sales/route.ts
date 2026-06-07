import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getDb } from "@/lib/db";

export async function GET(req: Request) {
  const session = await getSession();

  if (!session.isAdmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const format = searchParams.get("format");

  const db = await getDb();

  const filter: Record<string, unknown> = { status: "completed" };
  if (from || to) {
    filter.paidAt = {};
    if (from) (filter.paidAt as Record<string, Date>).$gte = new Date(from);
    if (to) (filter.paidAt as Record<string, Date>).$lte = new Date(to);
  }

  const sales = await db
    .collection("sales")
    .find(filter)
    .sort({ paidAt: -1 })
    .toArray();

  const totals = sales.reduce(
    (acc, s) => ({
      gross: acc.gross + (s.grossUsd ?? 0),
      fees: acc.fees + (s.stripeFeeUsd ?? 0),
      net: acc.net + (s.netUsd ?? 0),
      tax: acc.tax + (s.taxAmountUsd ?? 0),
    }),
    { gross: 0, fees: 0, net: 0, tax: 0 }
  );

  if (format === "csv") {
    const rows = [
      "Fecha,Email,Pais,Bruto USD,Fee Stripe,Neto,Impuesto,Stripe Session ID,Payment Intent ID",
      ...sales.map((s) =>
        [
          new Date(s.paidAt).toISOString(),
          s.email,
          s.payer?.countryCode ?? "",
          s.grossUsd,
          s.stripeFeeUsd,
          s.netUsd,
          s.taxAmountUsd,
          s.stripeSessionId,
          s.stripePaymentIntentId,
        ].join(",")
      ),
    ].join("\n");

    return new NextResponse(rows, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="ventas-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  return NextResponse.json({ sales, totals });
}
