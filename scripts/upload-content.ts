import { v2 as cloudinary } from "cloudinary";
import * as dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

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

const paidPdfs = [
  {
    localPath: path.resolve("content/en-realidad-amo.pdf"),
    publicId: "protocolo-atlas/en-realidad-amo",
  },
  {
    localPath: path.resolve("content/hombre-proveedor.pdf"),
    publicId: "protocolo-atlas/hombre-proveedor",
  },
];

const leadMagnet = {
  localPath: path.resolve("content/estrategia-3-dias.pdf"),
  publicId: process.env.LEAD_MAGNET_PUBLIC_ID ?? "protocolo-atlas/estrategia-3-dias",
};

const audioFiles = fs.existsSync(CONTENT_DIR)
  ? fs
      .readdirSync(CONTENT_DIR)
      .filter((filename) => filename.toLowerCase().endsWith(".mp3"))
      .map((filename) => ({
        localPath: path.join(CONTENT_DIR, filename),
        publicId: `protocolo-atlas/audios/${slugifyFilename(filename)}`,
      }))
  : [];

const files = [...paidPdfs, leadMagnet, ...audioFiles];

async function upload(localPath: string, publicId: string) {
  if (!fs.existsSync(localPath)) {
    console.warn(`Saltando archivo no encontrado: ${localPath}`);
    return;
  }

  console.log(`Subiendo: ${localPath}`);
  const result = await cloudinary.uploader.upload(localPath, {
    public_id: publicId,
    resource_type: "raw",
    type: "authenticated",
    use_filename: false,
    overwrite: true,
  });
  console.log(`${publicId} -> ${result.secure_url}`);
}

async function main() {
  for (const file of files) {
    await upload(file.localPath, file.publicId);
  }

  console.log("\nListo. Despues corre npm run seed para guardar el producto en MongoDB.");
  console.log(`LEAD_MAGNET_PUBLIC_ID=${leadMagnet.publicId}`);
  console.log("Si agregaste MP3 nuevos, npm run seed los detecta automaticamente.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
