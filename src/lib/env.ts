import { z } from "zod";

const envSchema = z.object({
  MONGODB_URI: z.string().min(1),
  MONGODB_DB: z.string().default("protocolo_atlas"),

  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),

  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),

  RESEND_API_KEY: z.string().min(1),
  EMAIL_FROM: z.string().default("Protocolo Atlas <noreply@protocoloatlas.com>"),

  LEAD_MAGNET_PUBLIC_ID: z.string().min(1),
  LEAD_MAGNET_FILENAME: z.string().default("Estrategia gratuita 3 dias.pdf"),

  IRON_SESSION_PASSWORD: z.string().min(32),
  ADMIN_EMAIL: z.string().email(),

  CRON_SECRET: z.string().min(32),
  TAX_RATE_PCT: z.coerce.number().default(19),
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

function validateEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("Variables de entorno invalidas:");
    console.error(result.error.flatten().fieldErrors);
    throw new Error("Variables de entorno invalidas. Revisa .env.local");
  }
  return result.data;
}

export const env = validateEnv();
