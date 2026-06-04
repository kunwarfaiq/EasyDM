"use client";

import { useState, useEffect, useCallback, use } from "react";
import { type Node, type Edge } from "@xyflow/react";
import { FlowCanvas } from "@/components/flow-builder/FlowCanvas";
import { NodeSidebar } from "@/components/flow-builder/NodeSidebar";
import { NodeConfigPanel } from "@/components/flow-builder/NodeConfigPanel";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Play, Pause, Loader2 } from "lucide-react";
import Link from "next/link";

export default function FlowBuilderPage({
  params,
}: {
  params: Promise<{ flowId: string }>;
}) {
  const { flowId } = use(params);
  const [flow, setFlow] = useState<{
    id: string;
    name: string;
    status: string;
    canvasData: { nodes: Node[]; edges: Edge[] };
  } | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    fetch(`/api/flows/${flowId}`)
      .then((r) => r.json())
      .then((data) => {
        setFlow(data);
      })
      .catch(console.error);
  }, [flowId]);

  const handleSave = useCallback(
    async (nodes: Node[], edges: Edge[]) => {
      if (!flow) return;
      setSaving(true);
      try {
        await fetch(`/api/flows/${flowId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            canvasData: { nodes, edges },
          }),
        });
        setLastSaved(new Date());
      } catch (err) {
        console.error("Save failed:", err);
      } finally {
        setSaving(false);
      }
    },
    [flow, flowId]
  );

  const handleNodeUpdate = useCallback(
    (nodeId: string, data: Record<string, unknown>) => {
      if (!flow) return;
      const updatedNodes = flow.canvasData.nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
      );
      setFlow({
        ...flow,
        canvasData: { ...flow.canvasData, nodes: updatedNodes },
      });
    },
    [flow]
  );

  const toggleStatus = async () => {
    if (!flow) return;
    const newStatus = flow.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
    await fetch(`/api/flows/${flowId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setFlow({ ...flow, status: newStatus });
  };

  if (!flow) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong border-b border-white/5 px-4 h-14 flex items-center justify-between flex-shrink-0 z-10"
      >
        <div className="flex items-center gap-3">
          <Link
            href="/flows"
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-white/50" />
          </Link>
          <div>
            <h1 className="text-sm font-semibold text-white">{flow.name}</h1>
            <p className="text-[10px] text-white/30">
              {saving ? (
                "Saving..."
              ) : lastSaved ? (
                `Saved ${lastSaved.toLocaleTimeString()}`
              ) : (
                "Auto-save enabled"
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleStatus}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
              flow.status === "ACTIVE"
                ? "bg-green-400/10 text-green-400 border border-green-400/20"
                : "bg-white/5 text-white/50 border border-white/10 hover:text-white/80"
            }`}
          >
            {flow.status === "ACTIVE" ? (
              <>
                <Pause className="w-3 h-3" /> Pause
              </>
            ) : (
              <>
                <Play className="w-3 h-3" /> Activate
              </>
            )}
          </button>
          <button
            onClick={() =>
              handleSave(flow.canvasData.nodes, flow.canvasData.edges)
            }
            disabled={saving}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-[hsl(217,91%,60%)] to-[hsl(263,70%,50%)] hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {saving ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Save className="w-3 h-3" />
            )}
            Save
          </button>
        </div>
      </motion.div>

      {/* Canvas */}
      <div className="flex flex-1 overflow-hidden">
        <NodeSidebar />
        <div className="flex-1">
          <FlowCanvas
            initialNodes={flow.canvasData.nodes}
            initialEdges={flow.canvasData.edges}
            onNodeSelect={setSelectedNode}
            onSave={handleSave}
          />
        </div>
        <NodeConfigPanel
          selectedNode={selectedNode}
          onNodeUpdate={handleNodeUpdate}
          onClose={() => setSelectedNode(null)}
        />
      </div>
    </div>
  );
}
