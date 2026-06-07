import { z } from "zod";

const emptyToUndefined = (value: unknown) => value === "" ? undefined : value;

const envSchema = z.object({
  // Mongo
  MONGODB_URI: z.string().min(1),
  MONGODB_DB: z.string().default("protocolo_atlas"),

  // Stripe
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),

  // Email
  RESEND_API_KEY: z.string().min(1),
  EMAIL_FROM: z.string().default("Protocolo Atlas <noreply@protocoloatlas.com>"),

  // Lead magnet
  LEAD_MAGNET_PUBLIC_ID: z.string().min(1),
  LEAD_MAGNET_FILENAME: z.string().default("Estrategia gratuita 3 dias.pdf"),

  // Sesión
  IRON_SESSION_PASSWORD: z.string().min(32),
  ADMIN_EMAIL: z.string().email(),

  // IA (opcional si no se usa el agente de contenido)
  ANTHROPIC_API_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  OPENAI_API_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  RUNWAY_API_KEY: z.preprocess(emptyToUndefined, z.string().optional()),

  // Publicación + memoria
  BUFFER_ACCESS_TOKEN: z.preprocess(emptyToUndefined, z.string().optional()),
  AIRTABLE_TOKEN: z.preprocess(emptyToUndefined, z.string().optional()),
  AIRTABLE_BASE_ID: z.preprocess(emptyToUndefined, z.string().optional()),

  // Crons
  CRON_SECRET: z.string().min(32),

  // Rate limit (Upstash — opcional en dev, requerido en prod)
  UPSTASH_REDIS_REST_URL: z.preprocess(emptyToUndefined, z.string().url().optional()),
  UPSTASH_REDIS_REST_TOKEN: z.preprocess(emptyToUndefined, z.string().optional()),

  // Impuestos
  TAX_RATE_PCT: z.coerce.number().default(19),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

function validateEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("❌ Variables de entorno inválidas:");
    console.error(result.error.flatten().fieldErrors);
    throw new Error("Variables de entorno inválidas. Revisa .env.local");
  }
  return result.data;
}

export const env = validateEnv();
