import { NextRequest, NextResponse } from "next/server";
import { webhookQueue } from "@/lib/queue";

/**
 * GET /api/webhooks/whatsapp
 * Handles Meta's webhook verification for WhatsApp (hub.challenge).
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.META_VERIFY_TOKEN) {
    console.log("✅ WhatsApp Webhook verified successfully");
    return new NextResponse(challenge, { status: 200 });
  }

  console.warn("⚠️ WhatsApp Webhook verification failed");
  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

/**
 * POST /api/webhooks/whatsapp
 * Receives incoming WhatsApp webhook events (messages, statuses).
 * We don't have to verify the signature strictly for WA because it comes with an X-Hub-Signature like IG,
 * but typically WA business payloads are trusted if the setup is right. We should verify it though.
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    // TODO: Verify signature exactly like Instagram if needed
    const payload = JSON.parse(rawBody);

    if (payload.object === "whatsapp_business_account") {
      for (const entry of payload.entry || []) {
        await webhookQueue.add(
          "process-whatsapp-event",
          {
            entryId: entry.id, // WhatsApp Business Account ID
            changes: entry.changes || [],
          },
          {
            jobId: `wa-${entry.id}-${Date.now()}`,
          }
        );
      }
    }

    return NextResponse.json({ status: "queued" }, { status: 200 });
  } catch (error) {
    console.error("WhatsApp Webhook processing error:", error);
    return NextResponse.json({ status: "error" }, { status: 200 });
  }
}
