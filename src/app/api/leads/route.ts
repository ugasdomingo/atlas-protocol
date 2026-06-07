import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { env } from "@/lib/env";
import { getSignedUrl } from "@/lib/cloudinary";
import { sendLeadMagnetEmail } from "@/lib/resend";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().email().transform((email) => email.toLowerCase().trim()),
  consentMarketing: z.literal(true),
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

    const { name, email, consentMarketing } = body.data;
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
