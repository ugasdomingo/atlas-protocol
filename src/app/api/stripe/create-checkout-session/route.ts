import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { env } from "@/lib/env";
import { stripe } from "@/lib/stripe";
import { checkRateLimit, rateLimitKey, rateLimitResponse } from "@/lib/rate-limit";

const schema = z.object({
  productSlug: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const checkoutLimit = await checkRateLimit({
      key: rateLimitKey(req, "checkout:ip"),
      limit: 20,
      windowMs: 10 * 60 * 1000,
    });
    if (!checkoutLimit.allowed) {
      return rateLimitResponse(checkoutLimit.retryAfter);
    }

    const db = await getDb();
    const product = await db
      .collection("products")
      .findOne({ slug: body.productSlug });

    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_creation: "if_required",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: Math.round(product.priceUsd * 100),
            product_data: {
              name: product.title,
              description: "Guias y audios de Protocolo Atlas con acceso privado.",
            },
          },
        },
      ],
      metadata: {
        productSlug: product.slug,
      },
      success_url: `${env.NEXT_PUBLIC_APP_URL}/gracias?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.NEXT_PUBLIC_APP_URL}/?checkout=cancelled#paquete`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("stripe checkout error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
