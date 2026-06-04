"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

function SendMessageNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as { label?: string; text?: string; messageType?: string };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`node-message glass-strong rounded-xl px-4 py-3 min-w-[220px] max-w-[280px] cursor-pointer transition-all duration-200 ${
        selected ? "glow-blue ring-1 ring-[hsl(217,91%,60%)]" : ""
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !border-2 !border-[hsl(217,91%,60%)] !bg-[hsl(224,71%,4%)]"
      />
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[hsl(217,91%,60%,0.15)]">
          <MessageSquare className="w-4 h-4 text-[hsl(217,91%,60%)]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-[hsl(217,91%,60%)] uppercase tracking-wider">
            Send Message
          </p>
          <p className="text-sm text-white/80 truncate">
            {nodeData.text || "Configure message..."}
          </p>
        </div>
      </div>
      {nodeData.messageType === "quick_reply" && (
        <div className="mt-2 flex gap-1 flex-wrap">
          <span className="px-2 py-0.5 text-[10px] rounded-full bg-[hsl(217,91%,60%,0.15)] text-[hsl(217,91%,60%)] border border-[hsl(217,91%,60%,0.3)]">
            Quick Reply
          </span>
        </div>
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !border-2 !border-[hsl(217,91%,60%)] !bg-[hsl(224,71%,4%)]"
      />
    </motion.div>
  );
}

export const SendMessageNode = memo(SendMessageNodeComponent);
