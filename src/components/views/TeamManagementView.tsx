"use client";

import React, { useState } from "react";
import {
  Users,
  Plus,
  Eye,
  EyeOff,
  Trash2,
  UserCheck,
  UserX,
  Copy,
  CheckCircle2,
  AlertCircle,
  X,
  Mail,
  Key,
  User,
} from "lucide-react";
import { usePlatform } from "@/context/PlatformContext";
import { B2BTeamMember } from "@/types";
import { generatePassword } from "@/utils/accounts";
import { manageAccount } from "@/lib/portalDb";

export const TeamManagementView: React.FC = () => {
  const { activeB2BPartner, addB2BTeamMember, removeB2BTeamMember, updateB2BTeamMember } = usePlatform();

  // Form state
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Credential reveal state
  const [revealedCredentials, setRevealedCredentials] = useState<Record<string, boolean>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Delete confirm state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [resetId, setResetId] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState("");

  if (!activeB2BPartner) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400 text-sm">
        No active partner profile found.
      </div>
    );
  }

  const teamMembers: B2BTeamMember[] = activeB2BPartner.teamMembers || [];
  const MAX_MEMBERS = 5;
  const canAddMore = teamMembers.length < MAX_MEMBERS;

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!name.trim() || !email.trim() || !password.trim()) {
      setFormError("All fields are required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }
    setIsSubmitting(true);
    const result = await addB2BTeamMember(activeB2BPartner.id, { name: name.trim(), email: email.trim(), password });
    setIsSubmitting(false);

    if ("error" in result) {
      setFormError(result.error);
    } else {
      setSuccessMsg(`Team member "${result.name}" created. Tracking ID ${result.trackingId}. Share ${result.email} and the password with them.`);
      setTimeout(() => setSuccessMsg(""), 6000);
      setName("");
      setEmail("");
      setPassword("");
      setIsAddingMember(false);
    }
  };

  const handleCopy = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDelete = (memberId: string) => {
    void removeB2BTeamMember(activeB2BPartner.id, memberId);
    setDeletingId(null);
  };

  const handleToggleStatus = async (member: B2BTeamMember) => {
    const newStatus = member.status === "Active" ? "Suspended" : "Active";
    const result = await manageAccount({ userId: member.id, action: "status", status: newStatus });
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    updateB2BTeamMember(activeB2BPartner.id, member.id, { status: newStatus });
  };

  const handleResetPassword = async (member: B2BTeamMember) => {
    if (resetPassword.trim().length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }
    const result = await manageAccount({ userId: member.id, action: "password", password: resetPassword.trim() });
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    setSuccessMsg(`New password for ${member.name}: ${result.password || resetPassword.trim()}`);
    setTimeout(() => setSuccessMsg(""), 6000);
    setResetId(null);
    setResetPassword("");
  };

  const toggleReveal = (memberId: string) => {
    setRevealedCredentials((prev) => ({ ...prev, [memberId]: !prev[memberId] }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="bg-[#ea580c] rounded-2xl p-6 text-white relative overflow-hidden shadow-xs border border-[#c2410c]">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-white">Team Management</h1>
              <p className="text-xs text-white/75 mt-0.5">
                Create and manage team member login credentials — up to {MAX_MEMBERS} members
              </p>
            </div>
          </div>

          {canAddMore && (
            <button
              onClick={() => { setIsAddingMember(true); setFormError(""); }}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-[#ea580c] font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Add Team Member</span>
            </button>
          )}
        </div>

        {/* Slot indicator */}
        <div className="relative z-10 mt-4 flex items-center gap-2">
          {Array.from({ length: MAX_MEMBERS }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full flex-1 transition-all ${
                i < teamMembers.length ? "bg-white" : "bg-white/25"
              }`}
            />
          ))}
          <span className="text-xs text-white/80 ml-2 shrink-0">
            {teamMembers.length}/{MAX_MEMBERS} slots used
          </span>
        </div>
      </div>

      {/* Success Toast */}
      {successMsg && (
        <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-xl p-4">
          <CheckCircle2 className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
          <p className="text-sm text-orange-800 font-medium">{successMsg}</p>
        </div>
      )}

      {/* Add Member Form Panel */}
      {isAddingMember && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#ea580c]/10 flex items-center justify-center">
                <Plus className="w-4 h-4 text-[#ea580c]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Create New Team Member</h2>
                <p className="text-[11px] text-slate-500">Set their login credentials to share with them</p>
              </div>
            </div>
            <button
              onClick={() => { setIsAddingMember(false); setFormError(""); }}
              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          <form onSubmit={handleAddMember} className="p-6">
            {formError && (
              <div className="flex items-center gap-2.5 bg-rose-50 border border-rose-200 rounded-xl p-3.5 mb-5">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <p className="text-xs text-rose-700 font-medium">{formError}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ea580c] focus:border-[#ea580c] transition-all"
                  autoFocus
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  Login Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rahul@yourcompany.com"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ea580c] focus:border-[#ea580c] transition-all"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-slate-400" />
                  Login Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Set a password (min. 6 characters)"
                    className="w-full px-3.5 py-2.5 pr-11 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ea580c] focus:border-[#ea580c] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Share these credentials privately with your team member. They can use this email &amp; password to log in.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-bold rounded-xl transition-all active:scale-98 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? "Creating..." : "Create Team Member"}
              </button>
              <button
                type="button"
                onClick={() => { setIsAddingMember(false); setFormError(""); }}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Team Members List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-[#ea580c]">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Team Members</h2>
              <p className="text-[11px] text-slate-400">
                {teamMembers.length === 0
                  ? "No team members yet — add your first one above"
                  : `${teamMembers.filter((m) => m.status === "Active").length} active, ${teamMembers.filter((m) => m.status === "Suspended").length} suspended`}
              </p>
            </div>
          </div>
          {!canAddMore && (
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
              Limit Reached (5/5)
            </span>
          )}
        </div>

        {teamMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-sm font-semibold text-slate-500">No team members yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Create up to 5 team members and share their login credentials so they can access the portal.
            </p>
            {canAddMore && (
              <button
                onClick={() => setIsAddingMember(true)}
                className="mt-4 px-4 py-2 bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-bold rounded-xl cursor-pointer transition-all"
              >
                + Add First Team Member
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {teamMembers.map((member, idx) => {
              const isRevealed = revealedCredentials[member.id];
              const isConfirmDelete = deletingId === member.id;

              return (
                <div
                  key={member.id}
                  className={`p-5 transition-colors ${
                    member.status === "Suspended" ? "bg-slate-50/50 opacity-75" : "hover:bg-slate-50/40"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Avatar & Basic Info */}
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-extrabold shrink-0 ${
                          member.status === "Active"
                            ? "bg-[#ea580c]/10 text-[#ea580c]"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {member.name
                          .split(" ")
                          .map((w) => w[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-slate-900 text-sm truncate">{member.name}</p>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              member.status === "Active"
                                ? "bg-orange-50 text-orange-700 border-orange-200"
                                : "bg-slate-100 text-slate-500 border-slate-200"
                            }`}
                          >
                            {member.status}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                            {member.role}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {member.email}
                        </p>
                        {member.trackingId && (
                          <p className="mt-0.5 font-mono text-[11px] font-bold text-orange-700">{member.trackingId}</p>
                        )}
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Added: {member.createdAt}
                          {member.lastLogin && ` • Last login: ${member.lastLogin}`}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    {resetId === member.id ? (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 self-start sm:self-auto shrink-0 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2">
                        <input
                          value={resetPassword}
                          onChange={(e) => setResetPassword(e.target.value)}
                          className="px-2 py-1 rounded-lg border border-orange-200 text-xs font-mono min-w-[140px]"
                        />
                        <button type="button" onClick={() => setResetPassword(generatePassword())} className="px-2.5 py-1 text-xs font-bold text-orange-800">Generate</button>
                        <button type="button" onClick={() => void handleResetPassword(member)} className="px-2.5 py-1 bg-orange-600 text-white text-xs font-bold rounded-lg">Save</button>
                        <button type="button" onClick={() => setResetId(null)} className="px-2.5 py-1 text-xs font-semibold text-slate-600">Cancel</button>
                      </div>
                    ) : !isConfirmDelete ? (
                      <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                        {/* Toggle Credentials */}
                        <button
                          onClick={() => toggleReveal(member.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                          title="View credentials"
                        >
                          {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          <span>{isRevealed ? "Hide" : "Credentials"}</span>
                        </button>

                        <button
                          onClick={() => {
                            setResetId(member.id);
                            setResetPassword(generatePassword());
                            setFormError("");
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                          title="Reset password"
                        >
                          <Key className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Password</span>
                        </button>

                        {/* Suspend / Activate */}
                        <button
                          onClick={() => void handleToggleStatus(member)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                            member.status === "Active"
                              ? "bg-amber-50 hover:bg-amber-100 text-amber-700"
                              : "bg-orange-50 hover:bg-orange-100 text-orange-700"
                          }`}
                          title={member.status === "Active" ? "Suspend member" : "Reactivate member"}
                        >
                          {member.status === "Active" ? (
                            <UserX className="w-3.5 h-3.5" />
                          ) : (
                            <UserCheck className="w-3.5 h-3.5" />
                          )}
                          <span className="hidden sm:inline">
                            {member.status === "Active" ? "Suspend" : "Activate"}
                          </span>
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setDeletingId(member.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer"
                          title="Remove member"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>
                    ) : (
                      /* Delete Confirmation */
                      <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                        <p className="text-xs font-semibold text-rose-700">Remove {member.name}?</p>
                        <button
                          onClick={() => handleDelete(member.id)}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setDeletingId(null)}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg cursor-pointer border border-slate-200"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Credentials Panel */}
                  {isRevealed && (
                    <div className="mt-4 bg-slate-900 rounded-xl p-4 animate-fade-in">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                        Login Credentials — Share privately
                      </p>
                      <div className="space-y-2.5">
                        {/* Email */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="text-[11px] text-slate-400 shrink-0">Email</span>
                            <span className="font-mono text-xs text-orange-300 truncate">{member.email}</span>
                          </div>
                          <button
                            onClick={() => handleCopy(member.email, `email-${member.id}`)}
                            className="shrink-0 p-1.5 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors cursor-pointer"
                            title="Copy email"
                          >
                            {copiedField === `email-${member.id}` ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-orange-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        {/* Password */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <Key className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="text-[11px] text-slate-400 shrink-0">Password</span>
                            <span className="font-mono text-xs text-orange-300 truncate">{member.password}</span>
                          </div>
                          <button
                            onClick={() => handleCopy(member.password, `pwd-${member.id}`)}
                            className="shrink-0 p-1.5 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors cursor-pointer"
                            title="Copy password"
                          >
                            {copiedField === `pwd-${member.id}` ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-orange-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
