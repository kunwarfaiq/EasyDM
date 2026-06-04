"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Workflow, Zap, MessageSquare, UserPlus, Search } from "lucide-react";

interface Flow {
  id: string;
  name: string;
  description?: string;
  status: "DRAFT" | "ACTIVE" | "PAUSED";
  triggerType: string;
  createdAt: string;
  updatedAt: string;
  _count: { executions: number };
}

const triggerIcons: Record<string, typeof Zap> = {
  COMMENT: MessageSquare,
  STORY_REPLY: MessageSquare,
  DM: MessageSquare,
  FOLLOW: UserPlus,
};

const statusColors: Record<string, string> = {
  DRAFT: "text-white/40 bg-white/5 border-white/10",
  ACTIVE: "text-green-400 bg-green-400/10 border-green-400/20",
  PAUSED: "text-amber-400 bg-amber-400/10 border-amber-400/20",
};

export default function FlowsPage() {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newFlowName, setNewFlowName] = useState("");
  const [newFlowTrigger, setNewFlowTrigger] = useState("COMMENT");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/flows")
      .then((r) => r.json())
      .then(setFlows)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const createFlow = async () => {
    if (!newFlowName.trim()) return;
    const res = await fetch("/api/flows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newFlowName, triggerType: newFlowTrigger }),
    });
    if (res.ok) {
      const flow = await res.json();
      window.location.href = `/flows/${flow.id}`;
    }
  };

  const filtered = flows.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Flows</h1>
          <p className="text-sm text-white/40 mt-1">
            Build and manage your DM automation workflows.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[hsl(217,91%,60%)] to-[hsl(263,70%,50%)] hover:opacity-90 transition-all shadow-lg shadow-[hsl(217,91%,60%,0.2)]"
        >
          <Plus className="w-4 h-4" />
          New Flow
        </button>
      </motion.div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search flows..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/25 focus:border-[hsl(217,91%,60%)] focus:outline-none transition-colors"
        />
      </div>

      {/* Flow Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass rounded-2xl p-5 animate-pulse h-40" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass rounded-2xl p-12 flex flex-col items-center justify-center"
        >
          <Workflow className="w-12 h-12 text-white/10 mb-4" />
          <p className="text-white/30 text-sm text-center mb-4">
            {flows.length === 0
              ? "No flows yet. Create your first automation!"
              : "No flows match your search."}
          </p>
          {flows.length === 0 && (
            <button
              onClick={() => setShowCreate(true)}
              className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-[hsl(217,91%,60%)] to-[hsl(263,70%,50%)] hover:opacity-90 transition-all"
            >
              Create First Flow
            </button>
          )}
        </motion.div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((flow, idx) => {
            const Icon = triggerIcons[flow.triggerType] || Zap;
            return (
              <motion.div
                key={flow.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link href={`/flows/${flow.id}`}>
                  <div className="glass rounded-2xl p-5 hover:bg-white/5 transition-all duration-200 cursor-pointer group h-full">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-[hsl(217,91%,60%,0.12)] flex items-center justify-center">
                        <Icon className="w-5 h-5 text-[hsl(217,91%,60%)]" />
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${statusColors[flow.status]}`}
                      >
                        {flow.status}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-white group-hover:text-white/90 mb-1">
                      {flow.name}
                    </h3>
                    <p className="text-xs text-white/30">
                      {flow.triggerType} trigger · {flow._count.executions} runs
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-strong rounded-2xl p-6 w-full max-w-md"
          >
            <h2 className="text-lg font-bold text-white mb-4">Create New Flow</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5">
                  Flow Name
                </label>
                <input
                  type="text"
                  value={newFlowName}
                  onChange={(e) => setNewFlowName(e.target.value)}
                  placeholder="e.g., Comment Lead Capture"
                  autoFocus
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/25 focus:border-[hsl(217,91%,60%)] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5">
                  Trigger Type
                </label>
                <select
                  value={newFlowTrigger}
                  onChange={(e) => setNewFlowTrigger(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:border-[hsl(217,91%,60%)] focus:outline-none transition-colors"
                >
                  <option value="COMMENT">Comment on Post</option>
                  <option value="STORY_REPLY">Story Reply</option>
                  <option value="DM">Direct Message</option>
                  <option value="FOLLOW">New Follower</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 rounded-xl text-sm text-white/50 hover:text-white/80 hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={createFlow}
                disabled={!newFlowName.trim()}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[hsl(217,91%,60%)] to-[hsl(263,70%,50%)] hover:opacity-90 disabled:opacity-40 transition-all"
              >
                Create Flow
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
