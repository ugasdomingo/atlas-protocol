import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { env } from "@/lib/env";
import { sendFollowUpOfferEmail } from "@/lib/resend";

function authGuard(req: Request): boolean {
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${env.CRON_SECRET}`;
}

async function handleFollowUp(req: Request) {
  if (!authGuard(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const db = await getDb();
  const now = new Date();
  const leads = await db
    .collection("leads")
    .find({
      consentMarketing: true,
      status: "lead_magnet_sent",
      followUpSentAt: null,
      followUpDueAt: { $lte: now },
    })
    .limit(50)
    .toArray();

  const sent: string[] = [];
  const failed: string[] = [];

  for (const lead of leads) {
    try {
      await sendFollowUpOfferEmail({
        to: lead.email,
        name: lead.name,
      });

      await db.collection("leads").updateOne(
        { _id: lead._id },
        {
          $set: {
            status: "offer_sent",
            followUpSentAt: now,
            updatedAt: now,
          },
          $unset: { lastFollowUpError: "" },
        }
      );

      sent.push(lead.email);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await db.collection("leads").updateOne(
        { _id: lead._id },
        {
          $set: {
            lastFollowUpError: message,
            updatedAt: now,
          },
        }
      );
      failed.push(lead.email);
    }
  }

  return NextResponse.json({ success: true, sent, failed });
}

export async function GET(req: Request) {
  return handleFollowUp(req);
}

export async function POST(req: Request) {
  return handleFollowUp(req);
}
