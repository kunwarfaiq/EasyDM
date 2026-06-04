// ─── React Flow Node Types ───────────────────────────────────────────────

export type NodeType = "trigger" | "sendMessage" | "delay" | "condition" | "action";

export interface TriggerNodeData {
  label: string;
  triggerType: "COMMENT" | "STORY_REPLY" | "DM" | "FOLLOW";
  postId?: string;
  keyword?: string;
}

export interface SendMessageNodeData {
  label: string;
  messageType: "text" | "image" | "quick_reply";
  text?: string;
  imageUrl?: string;
  buttons?: { title: string; payload: string }[];
}

export interface DelayNodeData {
  label: string;
  duration: number;
  unit: "minutes" | "hours" | "days";
}

export interface ConditionNodeData {
  label: string;
  field: string;
  operator: "contains" | "equals" | "startsWith" | "endsWith" | "exists";
  value: string;
}

export interface ActionNodeData {
  label: string;
  actionType: "tag_lead" | "set_field" | "http_request" | "remove_tag";
  config: Record<string, string>;
}

export type FlowNodeData =
  | TriggerNodeData
  | SendMessageNodeData
  | DelayNodeData
  | ConditionNodeData
  | ActionNodeData;

// ─── Meta Webhook Types ──────────────────────────────────────────────────

export interface MetaWebhookPayload {
  object: "instagram";
  entry: MetaWebhookEntry[];
}

export interface MetaWebhookEntry {
  id: string;
  time: number;
  messaging?: MetaMessagingEvent[];
  changes?: MetaChangeEvent[];
}

export interface MetaMessagingEvent {
  sender: { id: string };
  recipient: { id: string };
  timestamp: number;
  message?: {
    mid: string;
    text?: string;
    attachments?: { type: string; payload: { url: string } }[];
    quick_reply?: { payload: string };
  };
}

export interface MetaChangeEvent {
  field: string;
  value: {
    from: { id: string; username?: string };
    media?: { id: string; media_product_type: string };
    id: string;
    text?: string;
    created_time?: number;
  };
}

// ─── Meta API Response Types ─────────────────────────────────────────────

export interface MetaSendMessageResponse {
  recipient_id: string;
  message_id: string;
}

export interface MetaTokenExchangeResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

// ─── Flow Execution Types ────────────────────────────────────────────────

export interface FlowGraph {
  nodes: Map<string, FlowGraphNode>;
  edges: Map<string, string[]>; // nodeId -> [targetNodeId]
  triggerNodeId: string;
}

export interface FlowGraphNode {
  id: string;
  type: NodeType;
  data: FlowNodeData;
}

export interface ExecutionContext {
  leadId: string;
  igUserId: string;
  igUsername?: string;
  messageText?: string;
  variables: Record<string, string>;
}
