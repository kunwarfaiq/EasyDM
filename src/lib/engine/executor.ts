import { db } from "@/lib/db";
import { parseFlowGraph } from "./graph-parser";
import { sendTextMessage, sendQuickReplyMessage } from "@/lib/meta/messages";
import { decryptToken } from "@/lib/encryption";
import type {
  ExecutionContext,
  FlowGraphNode,
  SendMessageNodeData,
  DelayNodeData,
  ConditionNodeData,
  ActionNodeData,
} from "@/types";
import { delayQueue } from "@/lib/queue";

/**
 * Execute a flow starting from its trigger node.
 */
export async function executeFlow(
  flowId: string,
  context: ExecutionContext
): Promise<void> {
  const flow = await db.flow.findUnique({ where: { id: flowId } });
  if (!flow || flow.status !== "ACTIVE") {
    console.log(`Flow ${flowId} is not active, skipping execution`);
    return;
  }

  // Get the Meta connection for this workspace
  const metaConnection = await db.metaConnection.findFirst({
    where: { workspaceId: flow.workspaceId },
  });

  if (!metaConnection) {
    console.error(`No Meta connection found for workspace ${flow.workspaceId}`);
    return;
  }

  // Upsert lead
  const lead = await db.lead.upsert({
    where: {
      workspaceId_igUserId: {
        workspaceId: flow.workspaceId,
        igUserId: context.igUserId,
      },
    },
    update: {
      igUsername: context.igUsername || undefined,
      updatedAt: new Date(),
    },
    create: {
      workspaceId: flow.workspaceId,
      igUserId: context.igUserId,
      igUsername: context.igUsername,
    },
  });

  // Create execution record
  const execution = await db.flowExecution.create({
    data: {
      flowId,
      leadId: lead.id,
      status: "RUNNING",
      context: context as unknown as Record<string, unknown>,
    },
  });

  try {
    const canvasData = flow.canvasData as { nodes: Array<Record<string, unknown>>; edges: Array<Record<string, unknown>> };
    const graph = parseFlowGraph(canvasData as Parameters<typeof parseFlowGraph>[0]);

    // Start traversal from trigger node
    await traverseNode(
      graph.triggerNodeId,
      graph,
      canvasData.edges as Parameters<typeof import("./graph-parser").getNextNodes>[2],
      execution.id,
      {
        ...context,
        leadId: lead.id,
      },
      {
        igUserId: metaConnection.igUserId,
        accessToken: decryptToken(metaConnection.accessToken),
      }
    );

    // Mark execution complete
    await db.flowExecution.update({
      where: { id: execution.id },
      data: { status: "COMPLETED", completedAt: new Date() },
    });
  } catch (error) {
    console.error(`Flow execution ${execution.id} failed:`, error);
    await db.flowExecution.update({
      where: { id: execution.id },
      data: { status: "FAILED", completedAt: new Date() },
    });
  }
}

/**
 * Recursively traverse and execute nodes in the flow graph.
 */
async function traverseNode(
  nodeId: string,
  graph: ReturnType<typeof parseFlowGraph>,
  canvasEdges: Array<{ id: string; source: string; target: string; sourceHandle?: string }>,
  executionId: string,
  context: ExecutionContext,
  metaConnection: { igUserId: string; accessToken: string }
): Promise<void> {
  const node = graph.nodes.get(nodeId);
  if (!node) return;

  // Update current node in execution
  await db.flowExecution.update({
    where: { id: executionId },
    data: { currentNode: nodeId },
  });

  // Execute based on node type
  switch (node.type) {
    case "trigger":
      // Trigger node is just the entry point, move to next
      break;

    case "sendMessage":
      await executeSendMessage(node, context, metaConnection);
      break;

    case "delay":
      await executeDelay(node, executionId, context);
      return; // Stop traversal — will resume after delay

    case "condition":
      await executeCondition(node, graph, canvasEdges, executionId, context, metaConnection);
      return; // Condition handles its own branching

    case "action":
      await executeAction(node, context);
      break;
  }

  // Move to next node(s)
  const nextNodeIds = graph.edges.get(nodeId) || [];
  for (const nextId of nextNodeIds) {
    await traverseNode(nextId, graph, canvasEdges, executionId, context, metaConnection);
  }
}

async function executeSendMessage(
  node: FlowGraphNode,
  context: ExecutionContext,
  metaConnection: { igUserId: string; accessToken: string }
): Promise<void> {
  const data = node.data as SendMessageNodeData;

  // Variable interpolation
  const text = interpolateVariables(data.text || "", context);

  if (data.messageType === "quick_reply" && data.buttons?.length) {
    await sendQuickReplyMessage({
      igUserId: metaConnection.igUserId,
      recipientId: context.igUserId,
      text,
      buttons: data.buttons,
      accessToken: metaConnection.accessToken,
    });
  } else {
    await sendTextMessage({
      igUserId: metaConnection.igUserId,
      recipientId: context.igUserId,
      text,
      accessToken: metaConnection.accessToken,
    });
  }

  // Store outbound message
  await db.message.create({
    data: {
      leadId: context.leadId,
      direction: "OUTBOUND",
      content: text,
      messageType: data.messageType === "quick_reply" ? "QUICK_REPLY" : "TEXT",
    },
  });
}

async function executeDelay(
  node: FlowGraphNode,
  executionId: string,
  context: ExecutionContext
): Promise<void> {
  const data = node.data as DelayNodeData;
  const multipliers = { minutes: 60000, hours: 3600000, days: 86400000 };
  const delayMs = data.duration * (multipliers[data.unit] || 60000);

  // Mark execution as waiting
  await db.flowExecution.update({
    where: { id: executionId },
    data: { status: "WAITING" },
  });

  // Schedule delayed job
  await delayQueue.add(
    "resume-flow",
    { executionId, nodeId: node.id, context },
    { delay: delayMs }
  );
}

async function executeCondition(
  node: FlowGraphNode,
  graph: ReturnType<typeof parseFlowGraph>,
  canvasEdges: Array<{ id: string; source: string; target: string; sourceHandle?: string }>,
  executionId: string,
  context: ExecutionContext,
  metaConnection: { igUserId: string; accessToken: string }
): Promise<void> {
  const data = node.data as ConditionNodeData;
  const fieldValue = context.variables[data.field] || context.messageText || "";

  let result = false;
  switch (data.operator) {
    case "contains":
      result = fieldValue.toLowerCase().includes(data.value.toLowerCase());
      break;
    case "equals":
      result = fieldValue.toLowerCase() === data.value.toLowerCase();
      break;
    case "startsWith":
      result = fieldValue.toLowerCase().startsWith(data.value.toLowerCase());
      break;
    case "endsWith":
      result = fieldValue.toLowerCase().endsWith(data.value.toLowerCase());
      break;
    case "exists":
      result = fieldValue.length > 0;
      break;
  }

  // Find the correct branch
  const yesEdge = canvasEdges.find(
    (e) => e.source === node.id && e.sourceHandle === "yes"
  );
  const noEdge = canvasEdges.find(
    (e) => e.source === node.id && e.sourceHandle === "no"
  );

  const nextNodeId = result ? yesEdge?.target : noEdge?.target;
  if (nextNodeId) {
    await traverseNode(nextNodeId, graph, canvasEdges, executionId, context, metaConnection);
  }
}

async function executeAction(
  node: FlowGraphNode,
  context: ExecutionContext
): Promise<void> {
  const data = node.data as ActionNodeData;

  switch (data.actionType) {
    case "tag_lead":
      if (data.config.tag) {
        await db.lead.update({
          where: { id: context.leadId },
          data: {
            tags: {
              push: data.config.tag,
            },
          },
        });
      }
      break;

    case "set_field":
      if (data.config.field && data.config.value) {
        context.variables[data.config.field] = data.config.value;
        // Also persist to lead's customFields
        const lead = await db.lead.findUnique({ where: { id: context.leadId } });
        const customFields = (lead?.customFields as Record<string, string>) || {};
        customFields[data.config.field] = data.config.value;
        await db.lead.update({
          where: { id: context.leadId },
          data: { customFields },
        });
      }
      break;

    case "remove_tag":
      if (data.config.tag) {
        const lead = await db.lead.findUnique({ where: { id: context.leadId } });
        if (lead) {
          await db.lead.update({
            where: { id: context.leadId },
            data: {
              tags: lead.tags.filter((t) => t !== data.config.tag),
            },
          });
        }
      }
      break;
  }
}

/**
 * Replace {{variable}} placeholders with context values.
 */
function interpolateVariables(text: string, context: ExecutionContext): string {
  return text.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, key) => {
    const parts = key.split(".");
    if (parts[0] === "lead") {
      switch (parts[1]) {
        case "name":
          return context.igUsername || "there";
        case "username":
          return context.igUsername || "";
        default:
          return context.variables[parts[1]] || match;
      }
    }
    return context.variables[key] || match;
  });
}
