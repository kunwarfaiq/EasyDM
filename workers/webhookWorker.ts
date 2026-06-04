import { Worker } from "bullmq";
import Redis from "ioredis";

const connection = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
  tls: process.env.REDIS_URL?.startsWith("rediss://") ? { rejectUnauthorized: false } : undefined,
});

console.log("🚀 Starting EasyDM webhook worker...");

/**
 * Worker: Process incoming Instagram webhook events.
 */
const webhookWorker = new Worker(
  "instagram-webhooks",
  async (job) => {
    console.log(`📥 Processing job ${job.id}: ${job.name}`);
    const { entryId, messaging, changes } = job.data;

    try {
      // Dynamic import to use the same DB/engine code
      const { db } = await import("../src/lib/db");
      const { executeFlow } = await import("../src/lib/engine/executor");

      // Process DM messages
      for (const event of messaging || []) {
        if (event.message) {
          const messageText = event.message.quick_reply?.payload || event.message.text || "";
          console.log(`💬 DM from ${event.sender.id}: ${messageText}`);

          // Find active DM-triggered flows for this recipient
          const connection = await db.metaConnection.findFirst({
            where: { igUserId: event.recipient.id },
            include: { workspace: true },
          });

          if (!connection) continue;

          const flows = await db.flow.findMany({
            where: {
              workspaceId: connection.workspaceId,
              status: "ACTIVE",
              triggerType: "DM",
            },
          });

          for (const flow of flows) {
            await executeFlow(flow.id, {
              leadId: "",
              igUserId: event.sender.id,
              igUsername: undefined,
              messageText,
              variables: { message: messageText },
            });
          }

          // Store inbound message
          const lead = await db.lead.findFirst({
            where: {
              workspaceId: connection.workspaceId,
              igUserId: event.sender.id,
            },
          });

          if (lead) {
            await db.message.create({
              data: {
                leadId: lead.id,
                direction: "INBOUND",
                content: event.message.text || "",
                igMessageId: event.message.mid,
              },
            });
          }
        }
      }

      // Process comment events
      for (const change of changes || []) {
        if (change.field === "comments") {
          console.log(`💬 Comment from ${change.value.from.id}: ${change.value.text}`);

          // Find active comment-triggered flows
          const connection = await db.metaConnection.findFirst({
            where: { igUserId: entryId },
            include: { workspace: true },
          });

          if (!connection) continue;

          const flows = await db.flow.findMany({
            where: {
              workspaceId: connection.workspaceId,
              status: "ACTIVE",
              triggerType: "COMMENT",
            },
          });

          for (const flow of flows) {
            const config = flow.triggerConfig as {
              postId?: string;
              keyword?: string;
            } | null;

            // Check if comment matches flow's trigger config
            const postId = change.value.media?.id;
            if (config?.postId && config.postId !== postId) continue;
            if (
              config?.keyword &&
              !change.value.text
                ?.toLowerCase()
                .includes(config.keyword.toLowerCase())
            )
              continue;

            await executeFlow(flow.id, {
              leadId: "",
              igUserId: change.value.from.id,
              igUsername: change.value.from.username,
              messageText: change.value.text,
              variables: {
                comment_text: change.value.text || "",
                post_id: postId || "",
              },
            });
          }
        } else if (change.field === "followers") {
          console.log(`👤 New follower: ${change.value.from?.id}`);

          const connection = await db.metaConnection.findFirst({
            where: { igUserId: entryId },
            include: { workspace: true },
          });

          if (!connection) continue;

          const flows = await db.flow.findMany({
            where: {
              workspaceId: connection.workspaceId,
              status: "ACTIVE",
              triggerType: "FOLLOW",
            },
          });

          for (const flow of flows) {
            await executeFlow(flow.id, {
              leadId: "",
              igUserId: change.value.from?.id,
              igUsername: change.value.from?.username,
              messageText: "",
              variables: {},
            });
          }
        }
      }

      console.log(`✅ Job ${job.id} completed`);
    } catch (error) {
      console.error(`❌ Job ${job.id} failed:`, error);
      throw error; // Let BullMQ handle retries
    }
  },
  {
    connection: connection as any,
    concurrency: 5,
  }
);

/**
 * Worker: Process delayed flow resumptions.
 */
const delayWorker = new Worker(
  "flow-delays",
  async (job) => {
    console.log(`⏰ Resuming delayed flow execution: ${job.data.executionId}`);
    // TODO: Resume flow traversal from the delay node
  },
  {
    connection: connection as any,
    concurrency: 3,
  }
);

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("🛑 Shutting down workers...");
  await webhookWorker.close();
  await delayWorker.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("🛑 Shutting down workers...");
  await webhookWorker.close();
  await delayWorker.close();
  process.exit(0);
});

webhookWorker.on("completed", (job) => {
  console.log(`✅ Webhook job ${job.id} completed`);
});

webhookWorker.on("failed", (job, err) => {
  console.error(`❌ Webhook job ${job?.id} failed:`, err.message);
});

console.log("✅ Workers started and listening for jobs");
