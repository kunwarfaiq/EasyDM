"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  Workflow,
  Zap,
  Inbox,
  BarChart3,
  ArrowRight,
  MessageSquare,
  Bot,
  Users,
} from "lucide-react";

const features = [
  {
    icon: Workflow,
    title: "Visual Flow Builder",
    description: "Drag-and-drop automation canvas. Build complex DM funnels without writing a single line of code.",
    color: "217, 91%, 60%",
  },
  {
    icon: Zap,
    title: "Smart Triggers",
    description: "Auto-respond to comments, story replies, DMs, and new followers with precision targeting.",
    color: "142, 71%, 45%",
  },
  {
    icon: Inbox,
    title: "Live Inbox",
    description: "Unified inbox with human takeover. Pause automations and jump in when high-value leads engage.",
    color: "263, 70%, 50%",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "Track open rates, click-through, and conversions per flow. Optimize with real-time data.",
    color: "38, 92%, 50%",
  },
];

const stats = [
  { value: "10x", label: "More Replies" },
  { value: "85%", label: "Open Rate" },
  { value: "3min", label: "Setup Time" },
  { value: "24/7", label: "Automation" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[hsl(224,71%,4%)] overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 glass-strong border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(217,91%,60%)] to-[hsl(263,70%,50%)] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">EasyDM</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-[hsl(217,91%,60%)] to-[hsl(263,70%,50%)] hover:opacity-90 transition-opacity"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative">
        {/* Background gradient orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-[hsl(217,91%,60%,0.08)] rounded-full blur-[120px]" />
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-[hsl(263,70%,50%,0.08)] rounded-full blur-[120px]" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-white/70 mb-6">
              <Bot className="w-3.5 h-3.5 text-[hsl(217,91%,60%)]" />
              Instagram DM Automation for Growth
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
              <span className="text-white">Turn Every</span>{" "}
              <span className="gradient-text">Comment</span>
              <br />
              <span className="text-white">Into a</span>{" "}
              <span className="gradient-text">Customer</span>
            </h1>
            <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
              Build visual DM automation workflows that capture leads, nurture
              prospects, and close sales — all on autopilot. No code required.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/register"
                className="group px-8 py-3.5 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-[hsl(217,91%,60%)] to-[hsl(263,70%,50%)] hover:opacity-90 transition-all shadow-lg shadow-[hsl(217,91%,60%,0.25)] flex items-center gap-2"
              >
                Start Building Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#features"
                className="px-8 py-3.5 rounded-xl text-base font-medium text-white/70 glass hover:bg-white/10 transition-all"
              >
                See How It Works
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="glass rounded-2xl p-5 text-center"
              >
                <p className="text-3xl font-bold gradient-text">{stat.value}</p>
                <p className="text-sm text-white/40 mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need to{" "}
              <span className="gradient-text">Automate & Grow</span>
            </h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto">
              A complete toolkit for Instagram DM automation, from first contact to conversion.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="glass rounded-2xl p-6 group hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-white/10"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `hsl(${feature.color} / 0.12)` }}
                >
                  <feature.icon
                    className="w-6 h-6"
                    style={{ color: `hsl(${feature.color})` }}
                  />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-white/40 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto glass rounded-3xl p-12 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(217,91%,60%,0.1)] to-[hsl(263,70%,50%,0.1)]" />
          <div className="relative z-10">
            <MessageSquare className="w-10 h-10 text-[hsl(217,91%,60%)] mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Automate Your DMs?
            </h2>
            <p className="text-white/50 text-lg mb-8 max-w-lg mx-auto">
              Join thousands of businesses using EasyDM to turn social engagement into revenue.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-[hsl(217,91%,60%)] to-[hsl(263,70%,50%)] hover:opacity-90 transition-all shadow-lg shadow-[hsl(217,91%,60%,0.25)]"
            >
              <Users className="w-5 h-5" />
              Get Started Free
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[hsl(217,91%,60%)]" />
            <span className="text-sm text-white/30">EasyDM © 2026</span>
          </div>
          <p className="text-xs text-white/20">
            Built for Instagram Business & Creator accounts
          </p>
        </div>
      </footer>
    </div>
  );
}
