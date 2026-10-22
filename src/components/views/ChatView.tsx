"use client";

import React, { useEffect, useState } from "react";
import {
  MessageSquare,
  Send,
  Paperclip,
  Clock,
  CheckCircle2,
  Search,
  Building,
  Headphones,
  User,
} from "lucide-react";
import { ChatConversation } from "@/types";
import { loadConversations, sendChatMessage, startConversation } from "@/lib/portalDb";
import { readSessionValue } from "@/utils/accounts";

export const ChatView: React.FC = () => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>("");
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const activeConv = conversations.find((c) => c.id === activeConvId);
  const senderName = readSessionValue("dakshin_user_name") || "Portal user";
  const speakerRole = readSessionValue("dakshin_portal_role") === "agent" ? "agent" : "support";

  useEffect(() => {
    void loadConversations().then((result) => {
      if (result.error) setChatError(result.error);
      setConversations(result.conversations);
      if (result.conversations[0]) setActiveConvId(result.conversations[0].id);
    });
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputMessage.trim();
    if (!text) return;
    setChatError(null);
    if (!activeConv) {
      const started = await startConversation({
        participantName: "Admissions support",
        participantRole: "support",
        organization: "Dakshinvedha",
        text,
        senderName,
        speakerRole,
      });
      if ("error" in started) {
        setChatError(started.error);
        return;
      }
      setConversations((prev) => [started.conversation, ...prev]);
      setActiveConvId(started.conversation.id);
      setInputMessage("");
      return;
    }
    const sent = await sendChatMessage({
      conversationId: activeConv.id,
      text,
      senderName,
      speakerRole,
    });
    if ("error" in sent) {
      setChatError(sent.error);
      return;
    }
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === activeConv.id
          ? { ...conversation, messages: [...conversation.messages, sent.message], lastMessage: text, lastMessageTime: "Just now" }
          : conversation
      )
    );
    setInputMessage("");
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Live Admissions & Liaison Chat
            </h2>
            <p className="text-xs text-slate-400">
              Real-time messaging with university admissions officers and internal counselor support
            </p>
          </div>
        </div>
      </div>

      {/* Main 2-Column Chat Container */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs grid grid-cols-1 md:grid-cols-12 min-h-[580px] overflow-hidden">
        {/* Left: Conversation List (col-span-4) */}
        <div className="md:col-span-4 border-r border-slate-200 flex flex-col bg-slate-50/40">
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full pl-8.5 pr-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto flex-1 max-h-[520px]">
            {conversations.map((c) => {
              const isSelected = c.id === activeConvId;
              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setActiveConvId(c.id);
                    setConversations((prev) =>
                      prev.map((item) =>
                        item.id === c.id ? { ...item, unreadCount: 0 } : item
                      )
                    );
                  }}
                  className={`p-3 text-xs cursor-pointer transition-colors flex items-start gap-3 ${
                    isSelected
                      ? "bg-orange-50/70 border-l-4 border-orange-500 font-semibold"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                      {c.avatar}
                    </div>
                    {c.isOnline && (
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-500 border-2 border-white absolute bottom-0 right-0" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-slate-900 truncate">
                        {c.participantName}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0 font-normal">
                        {c.lastMessageTime}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      {c.organization}
                    </p>
                    <p className="text-[11px] text-slate-600 line-clamp-1 mt-1 font-normal">
                      {c.lastMessage}
                    </p>
                  </div>

                  {c.unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 bg-orange-500 text-white text-[10px] font-bold rounded-full shrink-0">
                      {c.unreadCount}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Conversation (col-span-8) */}
        <div className="md:col-span-8 flex flex-col justify-between h-[580px]">
          {activeConv ? (
            <>
              {/* Active Conversation Top Bar */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                      {activeConv.avatar}
                    </div>
                    {activeConv.isOnline && (
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-500 border-2 border-white absolute bottom-0 right-0" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {activeConv.participantName}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {activeConv.participantRole} • {activeConv.organization}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-orange-600 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                  <span>Active Session</span>
                </div>
              </div>

              {/* Message Bubbles Area */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/30">
                {activeConv.messages.map((m) => {
                  const isAgent = m.senderId === readSessionValue("dakshin_account_id") || m.senderName === senderName;
                  return (
                    <div
                      key={m.id}
                      className={`flex gap-3 max-w-[80%] ${
                        isAgent ? "ml-auto flex-row-reverse" : "mr-auto"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          isAgent ? "bg-orange-500 text-white" : "bg-slate-800 text-white"
                        }`}
                      >
                        {(m.senderName || "DV").slice(0, 2).toUpperCase()}
                      </div>

                      <div>
                        <div
                          className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                            isAgent
                              ? "bg-orange-500 text-white rounded-tr-none shadow-xs"
                              : "bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-xs"
                          }`}
                        >
                          <p className="font-bold text-[10px] mb-1 opacity-90">
                            {m.senderName}
                          </p>
                          <p>{m.text}</p>
                        </div>
                        <span
                          className={`text-[10px] text-slate-400 mt-1 block ${
                            isAgent ? "text-right" : "text-left"
                          }`}
                        >
                          {m.timestamp}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Typing Placeholder */}
                {isTyping && (
                  <div className="flex items-center gap-2 text-slate-400 text-xs italic animate-pulse">
                    <span>{activeConv.participantName} is typing...</span>
                  </div>
                )}
              </div>

              {/* Message Input Bar */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
              >
                <button
                  type="button"
                  onClick={() => alert("Simulated document attachment selected.")}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Attach File"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type a message or candidate update..."
                  className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <form onSubmit={handleSendMessage} className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
              <p className="text-xs text-slate-400">No conversation yet. Send a message to open one with admissions support.</p>
              {chatError && <p className="text-xs font-semibold text-rose-700">{chatError}</p>}
              <div className="flex w-full max-w-md gap-2">
                <input
                  value={inputMessage}
                  onChange={(event) => setInputMessage(event.target.value)}
                  placeholder="Write the first message"
                  className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs"
                />
                <button type="submit" className="rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-white">Send</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
