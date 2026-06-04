"use client";

import { useCallback, useRef, useMemo } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge,
  type Node,
  type ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { TriggerNode } from "./nodes/TriggerNode";
import { SendMessageNode } from "./nodes/SendMessageNode";
import { DelayNode } from "./nodes/DelayNode";
import { ConditionNode } from "./nodes/ConditionNode";
import { ActionNode } from "./nodes/ActionNode";

interface FlowCanvasProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onNodesChange?: (nodes: Node[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
  onNodeSelect?: (node: Node | null) => void;
  onSave?: (nodes: Node[], edges: Edge[]) => void;
}

const nodeTypes = {
  trigger: TriggerNode,
  sendMessage: SendMessageNode,
  delay: DelayNode,
  condition: ConditionNode,
  action: ActionNode,
};

const getNodeId = () => `node_${Math.random().toString(36).substr(2, 9)}`;

export function FlowCanvas({
  initialNodes = [],
  initialEdges = [],
  onNodeSelect,
  onSave,
}: FlowCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChangeHandler] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChangeHandler] = useEdgesState(initialEdges);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  // Memoize node types
  const memoizedNodeTypes = useMemo(() => nodeTypes, []);

  // Debounced save
  const triggerSave = useCallback(() => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      onSave?.(nodes, edges);
    }, 2000);
  }, [nodes, edges, onSave]);

  // Connection handler
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { stroke: "hsl(215, 20%, 55%)", strokeWidth: 2 },
          },
          eds
        )
      );
      triggerSave();
    },
    [setEdges, triggerSave]
  );

  // Drop handler for adding new nodes
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      if (!type || !reactFlowInstance.current) return;

      const position = reactFlowInstance.current.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const defaultData: Record<string, Record<string, unknown>> = {
        trigger: { label: "Trigger", triggerType: "COMMENT" },
        sendMessage: { label: "Send Message", messageType: "text", text: "" },
        delay: { label: "Delay", duration: 10, unit: "minutes" },
        condition: { label: "Condition", field: "message", operator: "contains", value: "" },
        action: { label: "Action", actionType: "tag_lead", config: {} },
      };

      const newNode: Node = {
        id: getNodeId(),
        type,
        position,
        data: defaultData[type] || { label: type },
      };

      setNodes((nds) => [...nds, newNode]);
      triggerSave();
    },
    [setNodes, triggerSave]
  );

  // Node click handler
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onNodeSelect?.(node);
    },
    [onNodeSelect]
  );

  const onPaneClick = useCallback(() => {
    onNodeSelect?.(null);
  }, [onNodeSelect]);

  return (
    <div ref={reactFlowWrapper} className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={(changes) => {
          onNodesChangeHandler(changes);
          triggerSave();
        }}
        onEdgesChange={(changes) => {
          onEdgesChangeHandler(changes);
          triggerSave();
        }}
        onConnect={onConnect}
        onInit={(instance) => {
          reactFlowInstance.current = instance;
        }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={memoizedNodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: "hsl(215, 20%, 55%)", strokeWidth: 2 },
        }}
        className="bg-[hsl(224,71%,4%)]"
      >
        <Controls className="!rounded-xl" />
        <MiniMap
          className="!rounded-xl"
          nodeColor={(node) => {
            const colors: Record<string, string> = {
              trigger: "hsl(142, 71%, 45%)",
              sendMessage: "hsl(217, 91%, 60%)",
              delay: "hsl(38, 92%, 50%)",
              condition: "hsl(263, 70%, 50%)",
              action: "hsl(330, 81%, 60%)",
            };
            return colors[node.type || ""] || "#666";
          }}
          maskColor="rgba(0, 0, 0, 0.7)"
        />
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="hsl(216, 34%, 17%)"
        />
      </ReactFlow>
    </div>
  );
}
