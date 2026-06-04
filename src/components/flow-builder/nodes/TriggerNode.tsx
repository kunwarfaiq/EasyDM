"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Zap } from "lucide-react";
import { motion } from "framer-motion";

function TriggerNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as { label?: string; triggerType?: string };
  const triggerLabels: Record<string, string> = {
    COMMENT: "Comment on Post",
    STORY_REPLY: "Story Reply",
    DM: "Direct Message",
    FOLLOW: "New Follower",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`node-trigger glass-strong rounded-xl px-4 py-3 min-w-[220px] cursor-pointer transition-all duration-200 ${
        selected ? "glow-green ring-1 ring-[hsl(142,71%,45%)]" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[hsl(142,71%,45%,0.15)]">
          <Zap className="w-4 h-4 text-[hsl(142,71%,45%)]" />
        </div>
        <div>
          <p className="text-xs font-medium text-[hsl(142,71%,45%)] uppercase tracking-wider">
            Trigger
          </p>
          <p className="text-sm font-semibold text-white">
            {triggerLabels[nodeData.triggerType || "COMMENT"] || nodeData.label || "Trigger"}
          </p>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !border-2 !border-[hsl(142,71%,45%)] !bg-[hsl(224,71%,4%)]"
      />
    </motion.div>
  );
}

export const TriggerNode = memo(TriggerNodeComponent);
