import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getDb } from "@/lib/db";

export async function GET() {
  const session = await getSession();

  if (!session.email || !session.entitlements?.length) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const db = await getDb();
  const products = await db
    .collection("products")
    .find({ slug: { $in: session.entitlements } })
    .toArray();

  // No devolver los publicIds — solo metadata para listar
  const sanitized = products.map((p) => ({
    slug: p.slug,
    title: p.title,
    assets: p.cloudinaryAssets.map((a: { type: string; filename: string }) => ({
      type: a.type,
      filename: a.filename,
    })),
  }));

  return NextResponse.json({ products: sanitized });
}
