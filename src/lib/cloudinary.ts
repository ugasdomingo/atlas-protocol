import { v2 as cloudinary } from "cloudinary";
import { env } from "./env";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

function extensionFromFilename(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  return ext && ext !== filename ? ext : "pdf";
}

export function getSignedUrl(
  publicId: string,
  filename = "archivo.pdf",
  expiresInSeconds = 300
): string {
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;

  return cloudinary.utils.private_download_url(publicId, extensionFromFilename(filename), {
    attachment: true,
    expires_at: expiresAt,
  });
}

export async function uploadFile(
  filePath: string,
  publicId: string,
  resourceType: "raw" | "video" | "image" = "raw"
) {
  return cloudinary.uploader.upload(filePath, {
    public_id: publicId,
    resource_type: resourceType,
    type: "authenticated",
    folder: "protocolo-atlas",
  });
}

export async function uploadFromUrl(
  url: string,
  publicId: string,
  resourceType: "raw" | "video" | "image" = "image"
) {
  return cloudinary.uploader.upload(url, {
    public_id: publicId,
    resource_type: resourceType,
    folder: "protocolo-atlas/content",
  });
}
