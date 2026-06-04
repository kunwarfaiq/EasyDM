"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, MoreVertical, Send, Loader2, User, Inbox as InboxIcon, MessageSquare } from "lucide-react";
import type { Lead, Message } from "@prisma/client";

interface LeadWithMessages extends Lead {
  messages: Message[];
}

export default function InboxPage() {
  const [leads, setLeads] = useState<LeadWithMessages[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await fetch("/api/inbox");
      const data = await res.json();
      setLeads(data);
    } catch (err) {
      console.error("Failed to fetch inbox:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!replyText.trim() || !selectedLeadId) return;
    setSending(true);

    try {
      const res = await fetch(`/api/inbox/${selectedLeadId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: replyText }),
      });

      if (res.ok) {
        const newMessage = await res.json();
        setLeads((prev) =>
          prev.map((l) =>
            l.id === selectedLeadId
              ? { ...l, messages: [...l.messages, newMessage] }
              : l
          )
        );
        setReplyText("");
      }
    } catch (err) {
      console.error("Send failed:", err);
    } finally {
      setSending(false);
    }
  };

  const filteredLeads = leads.filter(
    (l) =>
      l.igUsername?.toLowerCase().includes(search.toLowerCase()) ||
      l.name?.toLowerCase().includes(search.toLowerCase())
  );

  const selectedLead = leads.find((l) => l.id === selectedLeadId);

  return (
    <div className="h-[calc(100vh-4rem)] md:h-screen flex flex-col md:flex-row p-4 md:p-6 max-w-7xl mx-auto gap-4 md:gap-6">
      {/* Sidebar: Lead List */}
      <div className="w-full md:w-80 glass-strong rounded-2xl flex flex-col overflow-hidden flex-shrink-0 h-1/3 md:h-full">
        <div className="p-4 border-b border-white/5">
          <h2 className="text-lg font-bold text-white mb-4">Inbox</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:border-[hsl(217,91%,60%)] focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="w-5 h-5 text-white/30 animate-spin" />
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-white/30">
              <InboxIcon className="w-6 h-6 mb-2 opacity-50" />
              <p className="text-xs">No conversations found</p>
            </div>
          ) : (
            filteredLeads.map((lead) => {
              const lastMessage = lead.messages[lead.messages.length - 1];
              return (
                <button
                  key={lead.id}
                  onClick={() => setSelectedLeadId(lead.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
                    selectedLeadId === lead.id
                      ? "bg-gradient-to-r from-[hsl(217,91%,60%,0.15)] to-[hsl(263,70%,50%,0.15)] border border-white/10"
                      : "hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-white text-sm truncate pr-2">
                      @{lead.igUsername || lead.name || "Unknown"}
                    </span>
                    {lastMessage && (
                      <span className="text-[10px] text-white/30 flex-shrink-0">
                        {new Date(lastMessage.sentAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/50 truncate">
                    {lastMessage
                      ? `${lastMessage.direction === "OUTBOUND" ? "You: " : ""}${
                          lastMessage.content
                        }`
                      : "No messages yet"}
                  </p>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 glass-strong rounded-2xl flex flex-col overflow-hidden h-2/3 md:h-full">
        {selectedLead ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between glass">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(217,91%,60%)] to-[hsl(263,70%,50%)] flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">
                    @{selectedLead.igUsername || selectedLead.name}
                  </h3>
                  <p className="text-xs text-white/40">Instagram DM</p>
                </div>
              </div>
              <button className="p-2 rounded-lg hover:bg-white/5 text-white/40 transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
              {selectedLead.messages.map((msg) => {
                const isOutbound = msg.direction === "OUTBOUND";
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isOutbound ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                        isOutbound
                          ? "bg-gradient-to-r from-[hsl(217,91%,60%)] to-[hsl(263,70%,50%)] text-white rounded-br-sm"
                          : "glass border border-white/10 text-white/90 rounded-bl-sm"
                      }`}
                    >
                      {msg.content}
                      <div
                        className={`text-[9px] mt-1 ${
                          isOutbound ? "text-white/50 text-right" : "text-white/30"
                        }`}
                      >
                        {new Date(msg.sentAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              {selectedLead.messages.length === 0 && (
                <div className="h-full flex items-center justify-center text-white/30 text-sm">
                  No message history
                </div>
              )}
            </div>

            {/* Reply Input */}
            <div className="p-4 border-t border-white/5 glass">
              <div className="flex items-end gap-2">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 max-h-32 min-h-[44px] px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:border-[hsl(217,91%,60%)] focus:outline-none transition-colors resize-none"
                  rows={1}
                />
                <button
                  onClick={handleSend}
                  disabled={!replyText.trim() || sending}
                  className="p-3 rounded-xl bg-gradient-to-r from-[hsl(217,91%,60%)] to-[hsl(263,70%,50%)] text-white hover:opacity-90 disabled:opacity-50 transition-all flex-shrink-0"
                >
                  {sending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-white/30">
            <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
            <p>Select a conversation to view</p>
          </div>
        )}
      </div>
    </div>
  );
}
