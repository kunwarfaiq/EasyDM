import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user?.id) return null;

  const member = await db.workspaceMember.findFirst({
    where: { userId: session.user.id },
  });

  if (!member) return null;

  const workspaceId = member.workspaceId;

  // Fetch real metrics
  const [totalLeads, activeFlows, messages] = await Promise.all([
    db.lead.count({ where: { workspaceId } }),
    db.flow.count({ where: { workspaceId, status: "ACTIVE" } }),
    db.message.count({
      where: {
        lead: { workspaceId },
        sentAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  // Fetch recent executions
  const recentExecutions = await db.flowExecution.findMany({
    where: { flow: { workspaceId } },
    orderBy: { startedAt: "desc" },
    take: 5,
    include: {
      flow: { select: { name: true } },
      lead: { select: { igUsername: true, igUserId: true } },
    },
  });

  return (
    <DashboardClient
      metrics={{
        totalLeads,
        activeFlows,
        messages24h: messages,
      }}
      recentExecutions={recentExecutions}
    />
  );
}
