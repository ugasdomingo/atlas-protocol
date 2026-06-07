import { NextResponse } from "next/server";
import { getDb } from "./db";

type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

type RateLimitRecord = {
  _id: string;
  count: number;
  resetAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

function clientIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";

  return (
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export function rateLimitKey(req: Request, scope: string, value?: string) {
  const normalized = value?.toLowerCase().trim() || clientIp(req);
  return `${scope}:${normalized}`;
}

export async function checkRateLimit({
  key,
  limit,
  windowMs,
}: RateLimitOptions) {
  const db = await getDb();
  const now = new Date();
  const resetAt = new Date(Date.now() + windowMs);

  const result = await db.collection<RateLimitRecord>("rate_limits").findOneAndUpdate(
    { _id: key },
    [
      {
        $set: {
          count: {
            $cond: [
              { $gt: ["$resetAt", now] },
              { $add: [{ $ifNull: ["$count", 0] }, 1] },
              1,
            ],
          },
          resetAt: {
            $cond: [{ $gt: ["$resetAt", now] }, "$resetAt", resetAt],
          },
          createdAt: { $ifNull: ["$createdAt", now] },
          updatedAt: now,
        },
      },
    ],
    { upsert: true, returnDocument: "after" }
  );

  const count = result?.count ?? 1;
  const currentResetAt = result?.resetAt instanceof Date ? result.resetAt : resetAt;
  const retryAfter = Math.max(
    1,
    Math.ceil((currentResetAt.getTime() - Date.now()) / 1000)
  );

  return {
    allowed: count <= limit,
    limit,
    remaining: Math.max(0, limit - count),
    resetAt: currentResetAt,
    retryAfter,
  };
}

export function rateLimitResponse(retryAfter: number) {
  return NextResponse.json(
    { error: "Demasiadas solicitudes. Intenta de nuevo en unos minutos." },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
      },
    }
  );
}
