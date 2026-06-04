import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!email || !password || password.length < 8) {
      return NextResponse.json(
        { error: "Email and password (min 8 chars) are required" },
        { status: 400 }
      );
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Auto-create workspace
    const workspace = await db.workspace.create({
      data: {
        name: `${name || email.split("@")[0]}'s Workspace`,
        members: {
          create: {
            userId: user.id,
            role: "OWNER",
          },
        },
      },
    });

    // Seed default automation templates
    await db.flow.createMany({
      data: [
        {
          name: "Lead Capture (Comment to DM)",
          description: "Automatically reply to comments with a DM and tag the lead.",
          workspaceId: workspace.id,
          status: "DRAFT",
          triggerType: "COMMENT",
          canvasData: {
            nodes: [
              { id: "node_1", type: "trigger", position: { x: 400, y: 50 }, data: { label: "Trigger", triggerType: "COMMENT" } },
              { id: "node_2", type: "sendMessage", position: { x: 400, y: 200 }, data: { label: "Send Message", messageType: "text", text: "Thanks for your comment! Here is the link: https://example.com" } },
              { id: "node_3", type: "action", position: { x: 400, y: 350 }, data: { label: "Action", actionType: "tag_lead", config: { tag: "lead" } } }
            ],
            edges: [
              { id: "edge_1", source: "node_1", target: "node_2", animated: true },
              { id: "edge_2", source: "node_2", target: "node_3", animated: true }
            ]
          }
        },
        {
          name: "Story Reply Thank You",
          description: "Thank users when they reply to your stories.",
          workspaceId: workspace.id,
          status: "DRAFT",
          triggerType: "STORY_REPLY",
          canvasData: {
            nodes: [
              { id: "node_1", type: "trigger", position: { x: 400, y: 50 }, data: { label: "Trigger", triggerType: "STORY_REPLY" } },
              { id: "node_2", type: "sendMessage", position: { x: 400, y: 200 }, data: { label: "Send Message", messageType: "text", text: "Thanks for engaging with my story, {{lead.name}}! ❤️" } }
            ],
            edges: [
              { id: "edge_1", source: "node_1", target: "node_2", animated: true }
            ]
          }
        }
      ]
    });

    return NextResponse.json(
      { message: "Account created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
