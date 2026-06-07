import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { getDb } from "@/lib/db";
import { getSignedUrl } from "@/lib/cloudinary";

const schema = z.object({
  productSlug: z.string().min(1),
  filename: z.string().min(1),
});

export async function POST(req: Request) {
  const session = await getSession();

  if (!session.email || !session.entitlements?.length) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = schema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { productSlug, filename } = body.data;

  if (!session.entitlements.includes(productSlug)) {
    return NextResponse.json({ error: "Sin acceso a este producto" }, { status: 403 });
  }

  const db = await getDb();
  const product = await db.collection("products").findOne({ slug: productSlug });

  if (!product) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }

  const asset = product.cloudinaryAssets.find(
    (a: { filename: string }) => a.filename === filename
  );

  if (!asset) {
    return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });
  }

  const url = getSignedUrl(asset.publicId, asset.filename);
  return NextResponse.json({ url });
}
