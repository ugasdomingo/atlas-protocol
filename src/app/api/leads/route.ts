import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { env } from "@/lib/env";
import { getSignedUrl } from "@/lib/cloudinary";
import { sendLeadMagnetEmail } from "@/lib/resend";
import { checkRateLimit, rateLimitKey, rateLimitResponse } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().email().transform((email) => email.toLowerCase().trim()),
  consentMarketing: z.literal(true),
  website: z.string().max(0).optional().or(z.literal("")),
});

function followUpDate() {
  return new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
}

export async function POST(req: Request) {
  try {
    const body = schema.safeParse(await req.json());
    if (!body.success) {
      return NextResponse.json(
        { error: "Completa tu nombre, email y consentimiento." },
        { status: 400 }
      );
    }

    const { name, email, consentMarketing, website } = body.data;
    if (website) {
      return NextResponse.json({
        success: true,
        message: "Te enviamos el PDF a tu correo.",
      });
    }

    const ipLimit = await checkRateLimit({
      key: rateLimitKey(req, "lead:ip"),
      limit: 8,
      windowMs: 60 * 60 * 1000,
    });
    if (!ipLimit.allowed) return rateLimitResponse(ipLimit.retryAfter);

    const emailLimit = await checkRateLimit({
      key: rateLimitKey(req, "lead:email", email),
      limit: 3,
      windowMs: 24 * 60 * 60 * 1000,
    });
    if (!emailLimit.allowed) return rateLimitResponse(emailLimit.retryAfter);

    const now = new Date();
    const db = await getDb();

    await db.collection("leads").updateOne(
      { email },
      {
        $set: {
          name,
          consentMarketing,
          consentedAt: now,
          source: "landing",
          leadMagnetPublicId: env.LEAD_MAGNET_PUBLIC_ID,
          leadMagnetFilename: env.LEAD_MAGNET_FILENAME,
          followUpDueAt: followUpDate(),
          followUpSentAt: null,
          status: "lead_magnet_sent",
          updatedAt: now,
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      { upsert: true }
    );

    const downloadUrl = getSignedUrl(
      env.LEAD_MAGNET_PUBLIC_ID,
      env.LEAD_MAGNET_FILENAME,
      7 * 24 * 60 * 60
    );

    await sendLeadMagnetEmail({ to: email, name, downloadUrl });

    return NextResponse.json({
      success: true,
      message: "Te enviamos el PDF a tu correo.",
    });
  } catch (err) {
    console.error("lead capture error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
