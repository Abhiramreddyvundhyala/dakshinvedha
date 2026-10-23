"use client";

import React, { useState } from "react";
import { usePlatform } from "@/context/PlatformContext";
import { Megaphone, Plus, Calendar, Building2, CheckCircle2 } from "lucide-react";
import { ModalOverlay } from "@/components/ui/ModalOverlay";

export const AdminNoticesView: React.FC = () => {
  const { notices, publishNotice } = usePlatform();

  const [showAddNotice, setShowAddNotice] = useState(false);
  const [title, setTitle] = useState("");
  const [university, setUniversity] = useState("Central Admissions Registry");
  const [country, setCountry] = useState("Global");
  const [category, setCategory] = useState<any>("Admissions");
  const [description, setDescription] = useState("");
  const [fullContent, setFullContent] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    publishNotice({
      title,
      university,
      country,
      category,
      description,
      fullContent: fullContent || description,
      isUrgent,
    });
    setShowAddNotice(false);
    setTitle("");
    setDescription("");
    setFullContent("");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Platform Announcements & Student Notices
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Publish official admission circulars, deadline extensions, or scholarship updates visible directly in Student and Partner dashboards.
          </p>
        </div>

        <button
          onClick={() => setShowAddNotice(true)}
          style={{ background: "#f97316", color: "#ffffff" }}
          className="px-4 py-2.5 font-extrabold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto border-0"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Notice</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {notices.map((n) => (
          <div key={n.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#fff4ed", color: "#ea580c" }}>
                {n.category}
              </span>
              <span className="text-slate-400 text-[11px]">{n.dateAdded}</span>
            </div>
            <h3 className="font-black text-slate-900 text-sm">{n.title}</h3>
            <p className="text-slate-500 text-xs">{n.university} • {n.country}</p>
            <p className="text-slate-700 text-xs pt-1">{n.description}</p>
          </div>
        ))}
      </div>

      {showAddNotice && (
        <ModalOverlay onClose={() => setShowAddNotice(false)}>
          <form
            onSubmit={handlePublish}
            className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-black text-sm text-slate-900">Publish Platform Notice</h3>
              <button
                type="button"
                onClick={() => setShowAddNotice(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Notice Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Priority Admission Window Extended for UK Institutions"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 text-xs"
                >
                  <option>Admissions</option>
                  <option>Scholarship</option>
                  <option>Deadline</option>
                  <option>Requirements</option>
                  <option>Campus Update</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Issuing Body</label>
                <input
                  type="text"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Brief Description</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isUrgent}
                onChange={(e) => setIsUrgent(e.target.checked)}
                className="rounded text-purple-600 w-4 h-4"
              />
              <span className="font-bold text-slate-800">Mark as Urgent Notice</span>
            </label>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setShowAddNotice(false)}
                className="px-4 py-2 border rounded-xl font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ background: "#f97316", color: "#ffffff" }}
                className="px-5 py-2 font-extrabold rounded-xl border-0 cursor-pointer"
              >
                Publish Notice
              </button>
            </div>
          </form>
        </ModalOverlay>
      )}
    </div>
  );
};
