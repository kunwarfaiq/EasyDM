import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendTextMessage } from "@/lib/meta/messages";
import { decryptToken } from "@/lib/encryption";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { leadId } = await params;
  const { text } = await request.json();

  if (!text) {
    return NextResponse.json({ error: "Message text is required" }, { status: 400 });
  }

  const lead = await db.lead.findUnique({
    where: { id: leadId },
    include: { workspace: true },
  });

  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  // Verify access
  const membership = await db.workspaceMember.findFirst({
    where: { userId: session.user.id, workspaceId: lead.workspaceId },
  });

  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get Meta connection
  const metaConnection = await db.metaConnection.findFirst({
    where: { workspaceId: lead.workspaceId },
  });

  if (!metaConnection) {
    return NextResponse.json(
      { error: "Instagram account not connected" },
      { status: 400 }
    );
  }

  try {
    // Send via Meta Graph API
    await sendTextMessage({
      igUserId: metaConnection.igUserId,
      recipientId: lead.igUserId,
      text,
      accessToken: decryptToken(metaConnection.accessToken),
    });

    // Save to DB
    const message = await db.message.create({
      data: {
        leadId: lead.id,
        direction: "OUTBOUND",
        content: text,
        messageType: "TEXT",
      },
    });

    // Update lead timestamp
    await db.lead.update({
      where: { id: lead.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error: any) {
    console.error("Failed to send message:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send message" },
      { status: 500 }
    );
  }
}
