"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Clock } from "lucide-react";
import { motion } from "framer-motion";

function DelayNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as { label?: string; duration?: number; unit?: string };
  const unitLabels: Record<string, string> = {
    minutes: "min",
    hours: "hr",
    days: "day",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`node-delay glass-strong rounded-xl px-4 py-3 min-w-[200px] cursor-pointer transition-all duration-200 ${
        selected ? "glow-amber ring-1 ring-[hsl(38,92%,50%)]" : ""
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !border-2 !border-[hsl(38,92%,50%)] !bg-[hsl(224,71%,4%)]"
      />
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[hsl(38,92%,50%,0.15)]">
          <Clock className="w-4 h-4 text-[hsl(38,92%,50%)]" />
        </div>
        <div>
          <p className="text-xs font-medium text-[hsl(38,92%,50%)] uppercase tracking-wider">
            Delay
          </p>
          <p className="text-sm font-semibold text-white">
            {nodeData.duration
              ? `Wait ${nodeData.duration} ${unitLabels[nodeData.unit || "minutes"] || nodeData.unit}`
              : "Set delay..."}
          </p>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !border-2 !border-[hsl(38,92%,50%)] !bg-[hsl(224,71%,4%)]"
      />
    </motion.div>
  );
}

export const DelayNode = memo(DelayNodeComponent);
