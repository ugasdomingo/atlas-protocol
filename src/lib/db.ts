import { MongoClient, Db } from "mongodb";
import { env } from "./env";

declare global {
  var _mongoClient: MongoClient | undefined;
}

let client: MongoClient;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClient) {
    global._mongoClient = new MongoClient(env.MONGODB_URI);
  }
  client = global._mongoClient;
} else {
  client = new MongoClient(env.MONGODB_URI);
}

export async function getDb(): Promise<Db> {
  await client.connect();
  return client.db(env.MONGODB_DB);
}

export type Sale = {
  _id?: string;
  stripeSessionId: string;
  stripePaymentIntentId: string | null;
  email: string;
  productSlug: string;
  grossUsd: number;
  stripeFeeUsd: number;
  netUsd: number;
  taxRatePct: number;
  taxAmountUsd: number;
  status: "pending" | "completed" | "refunded";
  paidAt: Date;
  payer: { name: string; countryCode: string };
};

export type Lead = {
  _id?: string;
  email: string;
  name: string;
  consentMarketing: true;
  consentedAt: Date;
  source: "landing";
  leadMagnetPublicId: string;
  leadMagnetFilename: string;
  followUpDueAt: Date;
  followUpSentAt: Date | null;
  status: "lead_magnet_sent" | "offer_sent" | "converted";
  createdAt: Date;
  updatedAt: Date;
};

export type Access = {
  _id?: string;
  email: string;
  otpHash: string | null;
  otpExpiresAt: Date | null;
  attempts: number;
  lastSentAt: Date | null;
  entitlements: string[];
};

export type Product = {
  _id?: string;
  slug: string;
  title: string;
  priceUsd: number;
  cloudinaryAssets: Array<{
    type: "pdf" | "audio";
    publicId: string;
    filename: string;
  }>;
};
