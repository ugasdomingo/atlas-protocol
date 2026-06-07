import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI!;
const MONGODB_DB = process.env.MONGODB_DB ?? "protocolo_atlas";
const CONTENT_DIR = path.resolve("content");

function slugifyFilename(filename: string): string {
  return filename
    .replace(/\.[^/.]+$/, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const audioAssets = fs.existsSync(CONTENT_DIR)
  ? fs
      .readdirSync(CONTENT_DIR)
      .filter((filename) => filename.toLowerCase().endsWith(".mp3"))
      .map((filename) => ({
        type: "audio",
        publicId: `protocolo-atlas/audios/${slugifyFilename(filename)}`,
        filename,
      }))
  : [];

const PRODUCT = {
  slug: "protocolo-atlas",
  title: "Protocolo Atlas - Paquete completo",
  priceUsd: 47,
  cloudinaryAssets: [
    {
      type: "pdf",
      publicId: "protocolo-atlas/en-realidad-amo",
      filename: "En realidad amo.pdf",
    },
    {
      type: "pdf",
      publicId: "protocolo-atlas/hombre-proveedor",
      filename: "El hombre proveedor.pdf",
    },
    ...audioAssets,
  ],
};

async function main() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(MONGODB_DB);

  await db.collection("sales").createIndex({ stripeSessionId: 1 }, { unique: true });
  await db.collection("sales").createIndex({ email: 1 });
  await db.collection("access").createIndex({ email: 1 }, { unique: true });
  await db.collection("leads").createIndex({ email: 1 }, { unique: true });
  await db.collection("leads").createIndex({
    status: 1,
    followUpSentAt: 1,
    followUpDueAt: 1,
  });

  await db.collection("products").updateOne(
    { slug: PRODUCT.slug },
    { $set: PRODUCT },
    { upsert: true }
  );

  console.log("Producto insertado:", PRODUCT.slug);
  console.log("Assets del producto:", PRODUCT.cloudinaryAssets.length);
  console.log("Indices creados");

  await client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
