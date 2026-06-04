"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { GitBranch } from "lucide-react";
import { motion } from "framer-motion";

function ConditionNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as { label?: string; field?: string; operator?: string; value?: string };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`node-condition glass-strong rounded-xl px-4 py-3 min-w-[220px] cursor-pointer transition-all duration-200 ${
        selected ? "glow-purple ring-1 ring-[hsl(263,70%,50%)]" : ""
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !border-2 !border-[hsl(263,70%,50%)] !bg-[hsl(224,71%,4%)]"
      />
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[hsl(263,70%,50%,0.15)]">
          <GitBranch className="w-4 h-4 text-[hsl(263,70%,50%)]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-[hsl(263,70%,50%)] uppercase tracking-wider">
            Condition
          </p>
          <p className="text-sm text-white/80 truncate">
            {nodeData.field
              ? `${nodeData.field} ${nodeData.operator || "contains"} "${nodeData.value || ""}"`
              : "Set condition..."}
          </p>
        </div>
      </div>
      {/* Yes / No branch handles */}
      <div className="flex justify-between mt-3 px-2">
        <div className="relative">
          <span className="text-[10px] font-medium text-green-400 uppercase">Yes</span>
          <Handle
            type="source"
            position={Position.Bottom}
            id="yes"
            className="!w-3 !h-3 !border-2 !border-green-400 !bg-[hsl(224,71%,4%)] !left-2 !-bottom-3"
          />
        </div>
        <div className="relative">
          <span className="text-[10px] font-medium text-red-400 uppercase">No</span>
          <Handle
            type="source"
            position={Position.Bottom}
            id="no"
            className="!w-3 !h-3 !border-2 !border-red-400 !bg-[hsl(224,71%,4%)] !left-2 !-bottom-3"
          />
        </div>
      </div>
    </motion.div>
  );
}

export const ConditionNode = memo(ConditionNodeComponent);
