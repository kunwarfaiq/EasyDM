"use client";

import { Zap, MessageSquare, Clock, GitBranch, Rocket } from "lucide-react";
import { motion } from "framer-motion";

const nodeCategories = [
  {
    title: "Triggers",
    items: [
      { type: "trigger", label: "Trigger", icon: Zap, color: "142, 71%, 45%", description: "Start your flow" },
    ],
  },
  {
    title: "Messages",
    items: [
      { type: "sendMessage", label: "Send Message", icon: MessageSquare, color: "217, 91%, 60%", description: "Send a DM" },
    ],
  },
  {
    title: "Logic",
    items: [
      { type: "condition", label: "Condition", icon: GitBranch, color: "263, 70%, 50%", description: "Branch logic" },
      { type: "delay", label: "Delay", icon: Clock, color: "38, 92%, 50%", description: "Wait before next step" },
    ],
  },
  {
    title: "Actions",
    items: [
      { type: "action", label: "Action", icon: Rocket, color: "330, 81%, 60%", description: "Tag, set field, etc." },
    ],
  },
];

export function NodeSidebar() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="w-64 glass-strong border-r border-white/5 p-4 overflow-y-auto h-full">
      <h3 className="text-sm font-semibold text-white/90 mb-4 uppercase tracking-wider">
        Node Palette
      </h3>
      {nodeCategories.map((category, catIdx) => (
        <motion.div
          key={category.title}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: catIdx * 0.1, duration: 0.3 }}
          className="mb-5"
        >
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.15em] mb-2">
            {category.title}
          </p>
          <div className="space-y-2">
            {category.items.map((item) => (
              <div
                key={item.type}
                draggable
                onDragStart={(e) => onDragStart(e, item.type)}
                className="flex items-center gap-3 p-2.5 rounded-lg glass cursor-grab 
                           hover:bg-white/5 active:cursor-grabbing transition-all duration-200
                           border border-transparent hover:border-white/10
                           group"
                style={{
                  borderLeftColor: `hsl(${item.color})`,
                  borderLeftWidth: "3px",
                }}
              >
                <div
                  className="flex items-center justify-center w-7 h-7 rounded-md transition-all duration-200"
                  style={{ backgroundColor: `hsl(${item.color} / 0.15)` }}
                >
                  <item.icon
                    className="w-3.5 h-3.5 transition-all duration-200 group-hover:scale-110"
                    style={{ color: `hsl(${item.color})` }}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/90">{item.label}</p>
                  <p className="text-[10px] text-white/40">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
