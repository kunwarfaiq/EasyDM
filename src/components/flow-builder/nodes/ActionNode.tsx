"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Rocket } from "lucide-react";
import { motion } from "framer-motion";

function ActionNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as { label?: string; actionType?: string; config?: Record<string, string> };
  const actionLabels: Record<string, string> = {
    tag_lead: "Tag Lead",
    set_field: "Set Custom Field",
    http_request: "HTTP Request",
    remove_tag: "Remove Tag",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`node-action glass-strong rounded-xl px-4 py-3 min-w-[200px] cursor-pointer transition-all duration-200 ${
        selected ? "glow-pink ring-1 ring-[hsl(330,81%,60%)]" : ""
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !border-2 !border-[hsl(330,81%,60%)] !bg-[hsl(224,71%,4%)]"
      />
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[hsl(330,81%,60%,0.15)]">
          <Rocket className="w-4 h-4 text-[hsl(330,81%,60%)]" />
        </div>
        <div>
          <p className="text-xs font-medium text-[hsl(330,81%,60%)] uppercase tracking-wider">
            Action
          </p>
          <p className="text-sm font-semibold text-white">
            {actionLabels[nodeData.actionType || ""] || nodeData.label || "Configure action..."}
          </p>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !border-2 !border-[hsl(330,81%,60%)] !bg-[hsl(224,71%,4%)]"
      />
    </motion.div>
  );
}

export const ActionNode = memo(ActionNodeComponent);
