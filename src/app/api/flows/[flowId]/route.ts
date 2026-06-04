import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * GET /api/flows/[flowId] — Get a single flow with canvas data.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ flowId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { flowId } = await params;
  const flow = await db.flow.findUnique({
    where: { id: flowId },
    include: {
      _count: { select: { executions: true } },
    },
  });

  if (!flow) {
    return NextResponse.json({ error: "Flow not found" }, { status: 404 });
  }

  // Verify workspace access
  const membership = await db.workspaceMember.findFirst({
    where: { userId: session.user.id, workspaceId: flow.workspaceId },
  });

  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(flow);
}

/**
 * PUT /api/flows/[flowId] — Save canvas data and flow config.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ flowId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { flowId } = await params;
  const body = await request.json();
  const { canvasData, name, description, triggerConfig } = body;

  const flow = await db.flow.findUnique({ where: { id: flowId } });
  if (!flow) {
    return NextResponse.json({ error: "Flow not found" }, { status: 404 });
  }

  const membership = await db.workspaceMember.findFirst({
    where: { userId: session.user.id, workspaceId: flow.workspaceId },
  });

  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await db.flow.update({
    where: { id: flowId },
    data: {
      ...(canvasData && { canvasData }),
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(triggerConfig !== undefined && { triggerConfig }),
    },
  });

  return NextResponse.json(updated);
}

/**
 * PATCH /api/flows/[flowId] — Update flow status.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ flowId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { flowId } = await params;
  const body = await request.json();
  const { status } = body;

  if (!["DRAFT", "ACTIVE", "PAUSED"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const flow = await db.flow.findUnique({ where: { id: flowId } });
  if (!flow) {
    return NextResponse.json({ error: "Flow not found" }, { status: 404 });
  }

  const membership = await db.workspaceMember.findFirst({
    where: { userId: session.user.id, workspaceId: flow.workspaceId },
  });

  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await db.flow.update({
    where: { id: flowId },
    data: { status },
  });

  return NextResponse.json(updated);
}

/**
 * DELETE /api/flows/[flowId] — Delete a flow.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ flowId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { flowId } = await params;
  const flow = await db.flow.findUnique({ where: { id: flowId } });
  if (!flow) {
    return NextResponse.json({ error: "Flow not found" }, { status: 404 });
  }

  const membership = await db.workspaceMember.findFirst({
    where: { userId: session.user.id, workspaceId: flow.workspaceId },
  });

  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.flow.delete({ where: { id: flowId } });

  return NextResponse.json({ success: true });
}
