"use client";

import { motion } from "framer-motion";
import {
  Users,
  Workflow,
  MessageSquare,
  TrendingUp,
  Plus,
  ArrowUpRight,
  Activity,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface DashboardClientProps {
  metrics: {
    totalLeads: number;
    activeFlows: number;
    messages24h: number;
  };
  recentExecutions: any[];
}

export function DashboardClient({ metrics, recentExecutions }: DashboardClientProps) {
  const metricCards = [
    {
      label: "Total Leads",
      value: metrics.totalLeads.toString(),
      icon: Users,
      color: "142, 71%, 45%",
    },
    {
      label: "Active Flows",
      value: metrics.activeFlows.toString(),
      icon: Workflow,
      color: "217, 91%, 60%",
    },
    {
      label: "Messages (24h)",
      value: metrics.messages24h.toString(),
      icon: MessageSquare,
      color: "263, 70%, 50%",
    },
    {
      label: "Conversion Rate",
      value: "N/A",
      icon: TrendingUp,
      color: "38, 92%, 50%",
    },
  ];

  const quickActions = [
    {
      label: "Create New Flow",
      description: "Build a DM automation",
      icon: Plus,
      href: "/flows",
      color: "217, 91%, 60%",
    },
    {
      label: "Connect Instagram",
      description: "Link your IG account",
      icon: ArrowUpRight,
      href: "/settings",
      color: "330, 81%, 60%",
    },
    {
      label: "View Inbox",
      description: "Check your messages",
      icon: MessageSquare,
      href: "/inbox",
      color: "142, 71%, 45%",
    },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-white/40 mt-1">
          Welcome to EasyDM. Here&apos;s your automation overview.
        </p>
      </motion.div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metricCards.map((metric, idx) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass rounded-2xl p-5 group hover:bg-white/5 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `hsl(${metric.color} / 0.12)` }}
              >
                <metric.icon
                  className="w-5 h-5"
                  style={{ color: `hsl(${metric.color})` }}
                />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{metric.value}</p>
            <p className="text-xs text-white/40 mt-1">{metric.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-1"
        >
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            {quickActions.map((action) => (
              <Link key={action.label} href={action.href}>
                <div className="glass rounded-xl p-4 flex items-center gap-4 hover:bg-white/5 transition-all duration-200 group cursor-pointer">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `hsl(${action.color} / 0.12)` }}
                  >
                    <action.icon
                      className="w-5 h-5"
                      style={{ color: `hsl(${action.color})` }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white group-hover:text-white/90">
                      {action.label}
                    </p>
                    <p className="text-xs text-white/30">{action.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
            Recent Flow Executions
          </h2>
          <div className="glass rounded-2xl overflow-hidden min-h-[300px]">
            {recentExecutions.length === 0 ? (
              <div className="p-8 flex flex-col items-center justify-center h-full">
                <Activity className="w-10 h-10 text-white/10 mb-4" />
                <p className="text-white/30 text-sm text-center">
                  No activity yet. Create your first flow to get started!
                </p>
                <Link
                  href="/flows"
                  className="mt-4 px-5 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-[hsl(217,91%,60%)] to-[hsl(263,70%,50%)] hover:opacity-90 transition-all"
                >
                  Create a Flow
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {recentExecutions.map((exec) => (
                  <div key={exec.id} className="p-4 hover:bg-white/5 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {exec.status === "COMPLETED" ? (
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      ) : exec.status === "FAILED" ? (
                        <XCircle className="w-5 h-5 text-red-400" />
                      ) : (
                        <Activity className="w-5 h-5 text-yellow-400 animate-pulse" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-white">
                          {exec.flow.name}
                        </p>
                        <p className="text-xs text-white/40">
                          Lead: {exec.lead?.igUsername || exec.lead?.igUserId || "Unknown"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-white/60">
                        {exec.status}
                      </p>
                      <p className="text-[10px] text-white/30">
                        {formatDistanceToNow(new Date(exec.startedAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
