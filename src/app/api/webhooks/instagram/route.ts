import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/meta/webhook-verify";
import { webhookQueue } from "@/lib/queue";

/**
 * GET /api/webhooks/instagram
 * Handles Meta's webhook verification (hub.challenge).
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.META_VERIFY_TOKEN) {
    console.log("✅ Webhook verified successfully");
    return new NextResponse(challenge, { status: 200 });
  }

  console.warn("⚠️ Webhook verification failed");
  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

/**
 * POST /api/webhooks/instagram
 * Receives incoming Meta webhook events.
 * Validates signature, queues for async processing, returns 200 immediately.
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-hub-signature-256");

    // Verify webhook signature
    if (!signature || !verifyWebhookSignature(rawBody, signature)) {
      console.warn("⚠️ Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);

    // Validate it's an Instagram webhook
    if (payload.object !== "instagram") {
      return NextResponse.json({ error: "Not an Instagram event" }, { status: 400 });
    }

    // Queue each entry for async processing
    for (const entry of payload.entry || []) {
      await webhookQueue.add(
        "process-instagram-event",
        {
          entryId: entry.id,
          time: entry.time,
          messaging: entry.messaging || [],
          changes: entry.changes || [],
        },
        {
          jobId: `ig-${entry.id}-${entry.time}`, // Deduplicate
        }
      );
    }

    // Return 200 immediately (Meta requires response within 20s)
    return NextResponse.json({ status: "queued" }, { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    // Still return 200 to prevent Meta from retrying
    return NextResponse.json({ status: "error" }, { status: 200 });
  }
}
