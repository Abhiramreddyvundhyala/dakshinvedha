"use client";

import React, { useState } from "react";
import {
  Mail,
  Send,
  Inbox,
  Star,
  Trash2,
  Edit3,
  Search,
  Paperclip,
  CheckCircle,
  X,
  Building,
  Archive,
  AlertCircle,
  FileText,
  MailOpen,
} from "lucide-react";
import { MOCK_MAILS } from "@/data/mockData";
import { MailItem } from "@/types";

export const MailView: React.FC = () => {
  const [mails, setMails] = useState<MailItem[]>(MOCK_MAILS);
  const [activeFolder, setActiveFolder] = useState<
    "inbox" | "sent" | "draft" | "important" | "archived"
  >("inbox");
  const [selectedMailId, setSelectedMailId] = useState<string>(MOCK_MAILS[0].id);
  const [searchQuery, setSearchQuery] = useState("");

  // Compose Modal State
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeMessage, setComposeMessage] = useState("");
  const [composeAttachment, setComposeAttachment] = useState<string | null>(null);

  const filteredMails = mails.filter((m) => {
    if (m.folder !== activeFolder) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        m.subject.toLowerCase().includes(q) ||
        m.sender.toLowerCase().includes(q) ||
        m.snippet.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const selectedMail = mails.find((m) => m.id === selectedMailId);

  const toggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMails((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isStarred: !m.isStarred } : m))
    );
  };

  const toggleRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMails((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isRead: !m.isRead } : m))
    );
  };

  const handleSendCompose = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo || !composeSubject) return;

    const newMail: MailItem = {
      id: `mail-${Date.now()}`,
      sender: "Me (Sarah Jenkins)",
      email: "sarah.j@globaledu.com",
      subject: composeSubject,
      snippet: composeMessage.slice(0, 70),
      body: composeMessage,
      date: "Just now",
      folder: "sent",
      isRead: true,
      isStarred: false,
      attachment: composeAttachment ? { name: composeAttachment, size: "1.4 MB" } : undefined,
    };

    setMails([newMail, ...mails]);
    setIsComposeOpen(false);
    setComposeTo("");
    setComposeSubject("");
    setComposeMessage("");
    setComposeAttachment(null);
    alert("Admissions message sent successfully.");
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Admissions Internal Webmail
            </h2>
            <p className="text-xs text-slate-400">
              Official communication channel between agency counselors and university admissions
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsComposeOpen(true)}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Compose</span>
        </button>
      </div>

      {/* 3-Column Layout: Sidebar Folders, Message List, Message Viewer */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs grid grid-cols-1 md:grid-cols-12 min-h-[580px] overflow-hidden">
        {/* 1. Inbox Sidebar (col-span-3) */}
        <div className="md:col-span-3 border-r border-slate-200 p-3 space-y-1.5 bg-slate-50/50 text-xs">
          {[
            { id: "inbox", label: "Inbox", icon: Inbox, count: mails.filter((m) => m.folder === "inbox" && !m.isRead).length },
            { id: "sent", label: "Sent", icon: Send },
            { id: "draft", label: "Draft", icon: FileText, count: mails.filter((m) => m.folder === "draft").length },
            { id: "important", label: "Important", icon: AlertCircle, count: mails.filter((m) => m.folder === "important").length },
            { id: "archived", label: "Archived", icon: Archive },
          ].map((f) => {
            const Icon = f.icon;
            const isActive = activeFolder === f.id;
            return (
              <button
                key={f.id}
                onClick={() => {
                  setActiveFolder(f.id as any);
                  const firstInFolder = mails.find((m) => m.folder === f.id);
                  if (firstInFolder) setSelectedMailId(firstInFolder.id);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition-colors ${
                  isActive
                    ? "bg-orange-500 text-white shadow-xs font-bold"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{f.label}</span>
                </div>
                {f.count !== undefined && f.count > 0 && (
                  <span
                    className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? "bg-white/20 text-white" : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {f.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 2. Message List (col-span-4) */}
        <div className="md:col-span-4 border-r border-slate-200 flex flex-col">
          {/* Search bar */}
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                className="w-full pl-8.5 pr-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>
          </div>

          {/* List items */}
          <div className="divide-y divide-slate-100 overflow-y-auto flex-1 max-h-[520px]">
            {filteredMails.length > 0 ? (
              filteredMails.map((m) => (
                <div
                  key={m.id}
                  onClick={() => {
                    setSelectedMailId(m.id);
                    setMails((prev) =>
                      prev.map((item) =>
                        item.id === m.id ? { ...item, isRead: true } : item
                      )
                    );
                  }}
                  className={`p-3 text-xs cursor-pointer transition-colors ${
                    selectedMailId === m.id
                      ? "bg-orange-50/70 border-l-4 border-orange-500 font-semibold"
                      : "hover:bg-slate-50"
                  } ${!m.isRead ? "font-bold text-slate-900 bg-slate-50/60" : "text-slate-700"}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="truncate max-w-[170px]">{m.sender}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => toggleStar(m.id, e)}
                        className={`p-0.5 rounded ${
                          m.isStarred ? "text-amber-500" : "text-slate-300 hover:text-slate-500"
                        }`}
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                      </button>
                      <button
                        onClick={(e) => toggleRead(m.id, e)}
                        className="text-slate-300 hover:text-slate-600 p-0.5"
                        title={m.isRead ? "Mark unread" : "Mark read"}
                      >
                        <MailOpen className="w-3 h-3" />
                      </button>
                      <span className="text-[10px] text-slate-400 font-normal ml-1">
                        {m.date}
                      </span>
                    </div>
                  </div>
                  <p className="truncate font-semibold text-slate-900">{m.subject}</p>
                  <p className="text-[11px] text-slate-500 font-normal line-clamp-1 mt-0.5">
                    {m.snippet}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                No messages found in {activeFolder}.
              </div>
            )}
          </div>
        </div>

        {/* 3. Message Viewer (col-span-5) */}
        <div className="md:col-span-5 p-6 flex flex-col justify-between overflow-y-auto">
          {selectedMail ? (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  {selectedMail.subject}
                </h3>
                <div className="flex items-center justify-between mt-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-800">{selectedMail.sender}</span>
                    <span className="text-slate-400 block text-[11px]">&lt;{selectedMail.email}&gt;</span>
                  </div>
                  <span className="text-slate-400 text-[11px]">{selectedMail.date}</span>
                </div>
              </div>

              <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line py-2">
                {selectedMail.body}
              </div>

              {selectedMail.attachment && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-orange-500" />
                    <div>
                      <p className="font-bold text-slate-800 text-xs">{selectedMail.attachment.name}</p>
                      <p className="text-[10px] text-slate-400">{selectedMail.attachment.size}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => alert(`Downloading attachment: ${selectedMail.attachment?.name}`)}
                    className="text-xs text-orange-600 font-bold hover:underline"
                  >
                    Download
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 text-slate-400 text-xs">
              Select an email message to view its contents.
            </div>
          )}

          {/* Action row */}
          {selectedMail && (
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setComposeTo(selectedMail.email);
                  setComposeSubject(`Re: ${selectedMail.subject}`);
                  setIsComposeOpen(true);
                }}
                className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                Reply
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <span className="text-xs font-bold">New Message to University Liaison</span>
              <button
                onClick={() => setIsComposeOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendCompose} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">To:</label>
                <input
                  type="email"
                  required
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  placeholder="e.g. admissions@greenwich.ac.uk"
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Subject:</label>
                <input
                  type="text"
                  required
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="e.g. Urgent CAS Enquiry - Student Name"
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Message:</label>
                <textarea
                  rows={5}
                  required
                  value={composeMessage}
                  onChange={(e) => setComposeMessage(e.target.value)}
                  placeholder="Type your official admissions enquiry..."
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
                />
              </div>

              {/* Attachment placeholder */}
              <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600 text-[11px]">
                    {composeAttachment || "Attach student transcripts or offer copy..."}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setComposeAttachment("Student_Transcript_Dossier.pdf")}
                  className="text-xs text-orange-600 font-bold hover:underline"
                >
                  {composeAttachment ? "Attached ✓" : "Browse"}
                </button>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="px-4 py-2 text-slate-500 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  SEND
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
