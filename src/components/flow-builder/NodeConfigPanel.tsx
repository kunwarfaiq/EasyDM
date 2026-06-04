"use client";

import { useState, useEffect } from "react";
import { type Node } from "@xyflow/react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, MessageSquare, Clock, GitBranch, Rocket } from "lucide-react";

interface NodeConfigPanelProps {
  selectedNode: Node | null;
  onNodeUpdate: (nodeId: string, data: Record<string, unknown>) => void;
  onClose: () => void;
}

export function NodeConfigPanel({
  selectedNode,
  onNodeUpdate,
  onClose,
}: NodeConfigPanelProps) {
  const [localData, setLocalData] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (selectedNode) {
      setLocalData({ ...selectedNode.data });
    }
  }, [selectedNode]);

  const updateField = (field: string, value: unknown) => {
    const newData = { ...localData, [field]: value };
    setLocalData(newData);
    if (selectedNode) {
      onNodeUpdate(selectedNode.id, newData);
    }
  };

  const getIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      trigger: <Zap className="w-4 h-4 text-[hsl(142,71%,45%)]" />,
      sendMessage: <MessageSquare className="w-4 h-4 text-[hsl(217,91%,60%)]" />,
      delay: <Clock className="w-4 h-4 text-[hsl(38,92%,50%)]" />,
      condition: <GitBranch className="w-4 h-4 text-[hsl(263,70%,50%)]" />,
      action: <Rocket className="w-4 h-4 text-[hsl(330,81%,60%)]" />,
    };
    return icons[type] || null;
  };

  const getTitle = (type: string) => {
    const titles: Record<string, string> = {
      trigger: "Trigger Settings",
      sendMessage: "Message Settings",
      delay: "Delay Settings",
      condition: "Condition Settings",
      action: "Action Settings",
    };
    return titles[type] || "Node Settings";
  };

  return (
    <AnimatePresence>
      {selectedNode && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="w-80 glass-strong border-l border-white/5 p-5 overflow-y-auto h-full"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              {getIcon(selectedNode.type || "")}
              <h3 className="text-sm font-semibold text-white">
                {getTitle(selectedNode.type || "")}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4 text-white/50" />
            </button>
          </div>

          {/* Trigger config */}
          {selectedNode.type === "trigger" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5">
                  Trigger Type
                </label>
                <select
                  value={(localData.triggerType as string) || "COMMENT"}
                  onChange={(e) => updateField("triggerType", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:border-[hsl(142,71%,45%)] focus:outline-none transition-colors"
                >
                  <option value="COMMENT">Comment on Post</option>
                  <option value="STORY_REPLY">Story Reply</option>
                  <option value="DM">Direct Message</option>
                  <option value="FOLLOW">New Follower</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5">
                  Post ID (optional)
                </label>
                <input
                  type="text"
                  value={(localData.postId as string) || ""}
                  onChange={(e) => updateField("postId", e.target.value)}
                  placeholder="e.g., 17854360229135492"
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:border-[hsl(142,71%,45%)] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5">
                  Keyword Filter (optional)
                </label>
                <input
                  type="text"
                  value={(localData.keyword as string) || ""}
                  onChange={(e) => updateField("keyword", e.target.value)}
                  placeholder="e.g., price, info, buy"
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:border-[hsl(142,71%,45%)] focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}

          {/* Send Message config */}
          {selectedNode.type === "sendMessage" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5">
                  Message Type
                </label>
                <select
                  value={(localData.messageType as string) || "text"}
                  onChange={(e) => updateField("messageType", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:border-[hsl(217,91%,60%)] focus:outline-none transition-colors"
                >
                  <option value="text">Text</option>
                  <option value="image">Image</option>
                  <option value="quick_reply">Quick Reply</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5">
                  Message Text
                </label>
                <textarea
                  value={(localData.text as string) || ""}
                  onChange={(e) => updateField("text", e.target.value)}
                  placeholder="Type your message... Use {{lead.name}} for variables"
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:border-[hsl(217,91%,60%)] focus:outline-none transition-colors resize-none"
                />
                <p className="mt-1 text-[10px] text-white/30">
                  Variables: {"{{lead.name}}"}, {"{{lead.username}}"}
                </p>
              </div>
              {localData.messageType === "quick_reply" && (
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-white/60 mb-1.5">
                    Quick Reply Buttons
                  </label>
                  {((localData.buttons as Array<{ title: string; payload: string }>) || []).map((btn, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={btn.title}
                        onChange={(e) => {
                          const newBtns = [...((localData.buttons as any) || [])];
                          newBtns[idx].title = e.target.value;
                          newBtns[idx].payload = e.target.value.toLowerCase().replace(/\s+/g, "_");
                          updateField("buttons", newBtns);
                        }}
                        placeholder="Button text"
                        className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:border-[hsl(217,91%,60%)] focus:outline-none transition-colors"
                      />
                      <button
                        onClick={() => {
                          const newBtns = ((localData.buttons as any) || []).filter((_, i) => i !== idx);
                          updateField("buttons", newBtns);
                        }}
                        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {((localData.buttons as any) || []).length < 3 && (
                    <button
                      onClick={() => {
                        const newBtns = [...((localData.buttons as any) || []), { title: "", payload: "" }];
                        updateField("buttons", newBtns);
                      }}
                      className="w-full py-2 rounded-lg border border-dashed border-white/20 text-xs font-medium text-white/60 hover:text-white/90 hover:border-white/40 transition-colors"
                    >
                      + Add Button
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Delay config */}
          {selectedNode.type === "delay" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5">
                  Duration
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={(localData.duration as number) || 10}
                    onChange={(e) => updateField("duration", parseInt(e.target.value) || 0)}
                    min={1}
                    className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:border-[hsl(38,92%,50%)] focus:outline-none transition-colors"
                  />
                  <select
                    value={(localData.unit as string) || "minutes"}
                    onChange={(e) => updateField("unit", e.target.value)}
                    className="w-28 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:border-[hsl(38,92%,50%)] focus:outline-none transition-colors"
                  >
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Condition config */}
          {selectedNode.type === "condition" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5">
                  Field
                </label>
                <select
                  value={(localData.field as string) || "message"}
                  onChange={(e) => updateField("field", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:border-[hsl(263,70%,50%)] focus:outline-none transition-colors"
                >
                  <option value="message">Message Text</option>
                  <option value="username">Username</option>
                  <option value="comment_text">Comment Text</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5">
                  Operator
                </label>
                <select
                  value={(localData.operator as string) || "contains"}
                  onChange={(e) => updateField("operator", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:border-[hsl(263,70%,50%)] focus:outline-none transition-colors"
                >
                  <option value="contains">Contains</option>
                  <option value="equals">Equals</option>
                  <option value="startsWith">Starts with</option>
                  <option value="endsWith">Ends with</option>
                  <option value="exists">Exists</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5">
                  Value
                </label>
                <input
                  type="text"
                  value={(localData.value as string) || ""}
                  onChange={(e) => updateField("value", e.target.value)}
                  placeholder="e.g., price"
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:border-[hsl(263,70%,50%)] focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}

          {/* Action config */}
          {selectedNode.type === "action" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5">
                  Action Type
                </label>
                <select
                  value={(localData.actionType as string) || "tag_lead"}
                  onChange={(e) => updateField("actionType", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:border-[hsl(330,81%,60%)] focus:outline-none transition-colors"
                >
                  <option value="tag_lead">Tag Lead</option>
                  <option value="set_field">Set Custom Field</option>
                  <option value="remove_tag">Remove Tag</option>
                </select>
              </div>
              {(localData.actionType === "tag_lead" || localData.actionType === "remove_tag") && (
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5">
                    Tag Name
                  </label>
                  <input
                    type="text"
                    value={((localData.config as Record<string, string>)?.tag as string) || ""}
                    onChange={(e) =>
                      updateField("config", { ...(localData.config as Record<string, string>), tag: e.target.value })
                    }
                    placeholder="e.g., interested, vip"
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:border-[hsl(330,81%,60%)] focus:outline-none transition-colors"
                  />
                </div>
              )}
              {localData.actionType === "set_field" && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-white/60 mb-1.5">
                      Field Name
                    </label>
                    <input
                      type="text"
                      value={((localData.config as Record<string, string>)?.field as string) || ""}
                      onChange={(e) =>
                        updateField("config", { ...(localData.config as Record<string, string>), field: e.target.value })
                      }
                      placeholder="e.g., lead_source"
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:border-[hsl(330,81%,60%)] focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/60 mb-1.5">
                      Value
                    </label>
                    <input
                      type="text"
                      value={((localData.config as Record<string, string>)?.value as string) || ""}
                      onChange={(e) =>
                        updateField("config", { ...(localData.config as Record<string, string>), value: e.target.value })
                      }
                      placeholder="e.g., instagram_comment"
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:border-[hsl(330,81%,60%)] focus:outline-none transition-colors"
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
