import type { FlowGraph, FlowGraphNode, NodeType } from "@/types";

interface ReactFlowNode {
  id: string;
  type: string;
  data: Record<string, unknown>;
  position: { x: number; y: number };
}

interface ReactFlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
}

interface CanvasData {
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
}

/**
 * Parse React Flow canvas JSON into a traversable graph structure.
 */
export function parseFlowGraph(canvasData: CanvasData): FlowGraph {
  const nodes = new Map<string, FlowGraphNode>();
  const edges = new Map<string, string[]>();
  let triggerNodeId = "";

  // Build node map
  for (const node of canvasData.nodes) {
    const graphNode: FlowGraphNode = {
      id: node.id,
      type: node.type as NodeType,
      data: node.data as FlowGraphNode["data"],
    };
    nodes.set(node.id, graphNode);

    if (node.type === "trigger") {
      triggerNodeId = node.id;
    }

    // Initialize edges array
    edges.set(node.id, []);
  }

  // Build adjacency list
  for (const edge of canvasData.edges) {
    const targets = edges.get(edge.source) || [];
    targets.push(edge.target);
    edges.set(edge.source, targets);
  }

  if (!triggerNodeId) {
    throw new Error("Flow must have exactly one trigger node");
  }

  return { nodes, edges, triggerNodeId };
}

/**
 * Get the next node(s) after the given node.
 * For condition nodes, returns targets labeled by handle.
 */
export function getNextNodes(
  graph: FlowGraph,
  nodeId: string,
  canvasEdges: ReactFlowEdge[]
): { yes?: string; no?: string; default?: string[] } {
  const node = graph.nodes.get(nodeId);
  if (!node) return {};

  if (node.type === "condition") {
    // Condition nodes have "yes" and "no" handles
    const yesEdge = canvasEdges.find(
      (e) => e.source === nodeId && e.sourceHandle === "yes"
    );
    const noEdge = canvasEdges.find(
      (e) => e.source === nodeId && e.sourceHandle === "no"
    );
    return {
      yes: yesEdge?.target,
      no: noEdge?.target,
    };
  }

  // All other nodes: return list of targets
  return {
    default: graph.edges.get(nodeId) || [],
  };
}
