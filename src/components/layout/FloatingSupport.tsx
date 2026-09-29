"use client";

import React, { useState } from "react";
import { MessageCircle, X, Send, PhoneCall, Headphones, Clock, CheckCircle, MessageSquare } from "lucide-react";

interface FloatingSupportProps {
  onStartChat?: () => void;
}

export const FloatingSupport: React.FC<FloatingSupportProps> = ({ onStartChat }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<"menu" | "message" | "call">("menu");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setMessage("");
      setSubmitted(false);
      setActiveMode("menu");
      setIsOpen(false);
    }, 2000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Floating Popup Window */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-88 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-fade-in text-slate-800">
          {/* Header matching exact prompt: Need Help? / Our support team is available to assist you. */}
          <div className="bg-gradient-to-r from-orange-500 to-[#FF5A20] p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-xs">
                <Headphones className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold tracking-tight">Need Help?</h4>
                <p className="text-[11px] text-white/90 font-medium">
                  Our support team is available to assist you.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                setActiveMode("menu");
              }}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          {activeMode === "menu" && (
            <div className="p-4 space-y-3 bg-slate-50/50">
              {/* Option 1: Start Chat */}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  if (onStartChat) onStartChat();
                }}
                className="w-full p-3 bg-white hover:bg-orange-50/60 rounded-xl border border-slate-200 hover:border-orange-300 flex items-center justify-between transition-all group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                      Start Chat
                    </p>
                    <p className="text-[10px] text-slate-500">Live agent & university desk instant chat</p>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </button>

              {/* Option 2: Call Support */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Call Support</p>
                    <p className="text-[10px] text-slate-500">+44 20 8331 8000 / +971 4 391 2000</p>
                  </div>
                </div>
                <a
                  href="tel:+442083318000"
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors"
                >
                  Call
                </a>
              </div>

              {/* Option 3: Send Message */}
              <button
                type="button"
                onClick={() => setActiveMode("message")}
                className="w-full p-3 bg-white hover:bg-slate-100/70 rounded-xl border border-slate-200 flex items-center justify-between transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Send Message</p>
                    <p className="text-[10px] text-slate-500">Drop an admissions inquiry or ticket</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-orange-600">Write &rarr;</span>
              </button>
            </div>
          )}

          {/* Send Message Sub-Form */}
          {activeMode === "message" && (
            <div className="p-4 bg-white">
              {submitted ? (
                <div className="py-6 text-center text-emerald-600 flex flex-col items-center gap-1.5 animate-fade-in">
                  <CheckCircle className="w-8 h-8" />
                  <span className="text-xs font-bold">Ticket Submitted Successfully!</span>
                  <span className="text-[11px] text-slate-500">Your counselor will follow up in 10 mins.</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <button
                      type="button"
                      onClick={() => setActiveMode("menu")}
                      className="text-orange-600 font-bold hover:underline"
                    >
                      &larr; Back
                    </button>
                    <span className="flex items-center gap-1 font-semibold text-slate-600">
                      <Clock className="w-3 h-3" /> ~10m response
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Include CAMS ID, student issue, or question..."
                    className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Message to Support</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      )}

      {/* Floating Action Button (Fixed circular orange support/WhatsApp-style button at bottom-right) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#FF5A20] to-orange-500 hover:from-orange-600 hover:to-orange-500 text-white shadow-xl shadow-orange-500/35 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 focus:outline-none relative group cursor-pointer"
        title="Need Help? Admissions & WhatsApp Support"
        aria-label="Open Admissions Support Widget"
      >
        {isOpen ? (
          <X className="w-6 h-6 stroke-[2.5]" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6 fill-white/20" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-[9px] font-bold text-white">
              1
            </span>
          </>
        )}
      </button>
    </div>
  );
};
