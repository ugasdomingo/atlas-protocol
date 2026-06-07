import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { verifyOtp, isOtpExpired, OTP_MAX_ATTEMPTS } from "@/lib/otp";
import { getSession } from "@/lib/session";
import { env } from "@/lib/env";

const schema = z.object({
  email: z.string().email().transform((e) => e.toLowerCase().trim()),
  otp: z.string().length(6).regex(/^\d+$/),
});

export async function POST(req: Request) {
  try {
    const body = schema.safeParse(await req.json());
    if (!body.success) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const { email, otp } = body.data;
    const db = await getDb();
    const access = await db.collection("access").findOne({ email });

    if (!access || !access.otpHash || isOtpExpired(access.otpExpiresAt)) {
      return NextResponse.json(
        { error: "Código inválido o expirado." },
        { status: 401 }
      );
    }

    if (access.attempts >= OTP_MAX_ATTEMPTS) {
      return NextResponse.json(
        { error: "Demasiados intentos. Solicita un código nuevo." },
        { status: 429 }
      );
    }

    const isValid = await verifyOtp(otp, access.otpHash);

    if (!isValid) {
      await db.collection("access").updateOne(
        { email },
        { $inc: { attempts: 1 } }
      );
      return NextResponse.json(
        { error: "Código incorrecto." },
        { status: 401 }
      );
    }

    // OTP correcto — invalidar y crear sesión
    await db.collection("access").updateOne(
      { email },
      { $set: { otpHash: null, otpExpiresAt: null, attempts: 0 } }
    );

    const session = await getSession();
    session.email = email;
    session.entitlements = access.entitlements ?? [];
    session.isAdmin = email === env.ADMIN_EMAIL;
    await session.save();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("verify-otp error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
