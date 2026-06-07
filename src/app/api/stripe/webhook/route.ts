import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getDb } from "@/lib/db";
import { env } from "@/lib/env";
import { sendPurchaseConfirmationEmail } from "@/lib/resend";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

function centsToUsd(cents: number | null | undefined) {
  return Number(((cents ?? 0) / 100).toFixed(2));
}

async function completedCheckout(sessionId: string) {
  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["payment_intent.latest_charge.balance_transaction"],
  });
}

function getStripeFeeUsd(session: Stripe.Checkout.Session) {
  const paymentIntent = session.payment_intent;
  if (!paymentIntent || typeof paymentIntent === "string") return 0;

  const latestCharge = paymentIntent.latest_charge;
  if (!latestCharge || typeof latestCharge === "string") return 0;

  const balanceTransaction = latestCharge.balance_transaction;
  if (!balanceTransaction || typeof balanceTransaction === "string") return 0;

  return centsToUsd(balanceTransaction.fee);
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Firma faltante" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Firma invalida";
    console.warn("Webhook Stripe rechazado:", message);
    return NextResponse.json({ error: "Firma invalida" }, { status: 401 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const eventSession = event.data.object as Stripe.Checkout.Session;
  const session = await completedCheckout(eventSession.id);
  const productSlug = session.metadata?.productSlug ?? "protocolo-atlas";
  const email = session.customer_details?.email?.toLowerCase();
  const payerName = session.customer_details?.name ?? "";
  const countryCode = session.customer_details?.address?.country ?? "XX";

  if (!email) {
    console.error("Stripe checkout sin email:", session.id);
    return NextResponse.json({ error: "Email faltante" }, { status: 400 });
  }

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;
  const grossUsd = centsToUsd(session.amount_total);
  const stripeFeeUsd = getStripeFeeUsd(session);
  const netUsd = Number((grossUsd - stripeFeeUsd).toFixed(2));
  const taxAmountUsd = Number(((netUsd * env.TAX_RATE_PCT) / 100).toFixed(2));
  const paidAt = new Date();
  const db = await getDb();

  await db.collection("sales").updateOne(
    { stripeSessionId: session.id },
    {
      $set: {
        stripePaymentIntentId: paymentIntentId,
        email,
        productSlug,
        grossUsd,
        stripeFeeUsd,
        netUsd,
        taxRatePct: env.TAX_RATE_PCT,
        taxAmountUsd,
        status: "completed",
        paidAt,
        payer: { name: payerName, countryCode },
      },
    },
    { upsert: true }
  );

  await db.collection("access").updateOne(
    { email },
    {
      $setOnInsert: {
        otpHash: null,
        otpExpiresAt: null,
        attempts: 0,
        lastSentAt: null,
      },
      $addToSet: { entitlements: productSlug },
    },
    { upsert: true }
  );

  await db.collection("leads").updateOne(
    { email },
    {
      $set: {
        status: "converted",
        convertedAt: paidAt,
        updatedAt: paidAt,
      },
    }
  );

  sendPurchaseConfirmationEmail(email, payerName).catch((e) =>
    console.error("Error enviando email de confirmacion:", e)
  );

  return NextResponse.json({ received: true });
}
