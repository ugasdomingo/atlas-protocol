import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { generateOtp, hashOtp, otpExpiresAt, canSendOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/resend";
import { checkRateLimit, rateLimitKey, rateLimitResponse } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().email().transform((e) => e.toLowerCase().trim()),
});

const GENERIC_RESPONSE = {
  message: "Si tu compra es válida, recibirás un código en tu correo.",
};

export async function POST(req: Request) {
  try {
    const body = schema.safeParse(await req.json());
    if (!body.success) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    const { email } = body.data;
    const ipLimit = await checkRateLimit({
      key: rateLimitKey(req, "otp-request:ip"),
      limit: 12,
      windowMs: 60 * 60 * 1000,
    });
    if (!ipLimit.allowed) return rateLimitResponse(ipLimit.retryAfter);

    const emailLimit = await checkRateLimit({
      key: rateLimitKey(req, "otp-request:email", email),
      limit: 5,
      windowMs: 60 * 60 * 1000,
    });
    if (!emailLimit.allowed) return rateLimitResponse(emailLimit.retryAfter);

    const db = await getDb();
    const access = await db.collection("access").findOne({ email });

    // Respuesta genérica si no existe o no tiene entitlements — nunca filtrar
    if (!access || !access.entitlements?.length) {
      return NextResponse.json(GENERIC_RESPONSE);
    }

    if (!canSendOtp(access.lastSentAt)) {
      return NextResponse.json(
        { error: "Espera un momento antes de solicitar otro código." },
        { status: 429 }
      );
    }

    const otp = generateOtp();
    const hash = await hashOtp(otp);

    await db.collection("access").updateOne(
      { email },
      {
        $set: {
          otpHash: hash,
          otpExpiresAt: otpExpiresAt(),
          attempts: 0,
          lastSentAt: new Date(),
        },
      }
    );

    await sendOtpEmail(email, otp);
    return NextResponse.json(GENERIC_RESPONSE);
  } catch (err) {
    console.error("request-otp error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
