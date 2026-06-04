import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * GET /api/flows — List all flows for the current workspace.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membership = await db.workspaceMember.findFirst({
    where: { userId: session.user.id },
  });

  if (!membership) {
    return NextResponse.json({ error: "No workspace found" }, { status: 404 });
  }

  const flows = await db.flow.findMany({
    where: { workspaceId: membership.workspaceId },
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      triggerType: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { executions: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(flows);
}

/**
 * POST /api/flows — Create a new flow.
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membership = await db.workspaceMember.findFirst({
    where: { userId: session.user.id },
  });

  if (!membership) {
    return NextResponse.json({ error: "No workspace found" }, { status: 404 });
  }

  const body = await request.json();
  const { name, triggerType, description } = body;

  if (!name || !triggerType) {
    return NextResponse.json(
      { error: "Name and triggerType are required" },
      { status: 400 }
    );
  }

  const flow = await db.flow.create({
    data: {
      name,
      description,
      triggerType,
      workspaceId: membership.workspaceId,
      canvasData: {
        nodes: [
          {
            id: "trigger-1",
            type: "trigger",
            position: { x: 400, y: 50 },
            data: {
              label: "Trigger",
              triggerType,
            },
          },
        ],
        edges: [],
      },
    },
  });

  return NextResponse.json(flow, { status: 201 });
}
