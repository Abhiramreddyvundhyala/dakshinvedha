"use client";

import React, { useEffect, useState } from "react";
import { usePlatform } from "@/context/PlatformContext";
import {
  Building2,
  Plus,
  User,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  Eye,
  X,
  Copy,
  Search,
  KeyRound,
  Pencil,
  Snowflake,
  Trash2,
} from "lucide-react";
import { generatePassword } from "@/utils/accounts";
import { listDirectory, manageAccount, removeAccount } from "@/lib/portalDb";
import type { DirectoryAccount } from "@/lib/records";
import type { B2BPartnerProfile } from "@/types";
import { ModalOverlay } from "@/components/ui/ModalOverlay";

export const AdminPartnersView: React.FC = () => {
  const { b2bPartners, createB2BAccount, verifyB2BPartner, updateB2BProfile, dropB2BPartner, accessRequests, rejectB2BRequest } = usePlatform();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newOrg, setNewOrg] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [issued, setIssued] = useState<{ name: string; email: string; password: string; partnerId: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [viewPartner, setViewPartner] = useState<string | null>(null);
  const [owners, setOwners] = useState<DirectoryAccount[]>([]);
  const [editPartner, setEditPartner] = useState<B2BPartnerProfile | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editOrg, setEditOrg] = useState("");
  const [resetPartner, setResetPartner] = useState<B2BPartnerProfile | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [freezePartner, setFreezePartner] = useState<B2BPartnerProfile | null>(null);
  const [deletePartner, setDeletePartner] = useState<B2BPartnerProfile | null>(null);
  const [actionBusy, setActionBusy] = useState(false);

  useEffect(() => {
    void listDirectory().then((result) => {
      setOwners(result.accounts.filter((account) => account.role === "partner"));
    });
  }, [b2bPartners.length]);

  const ownerIdFor = (partner: B2BPartnerProfile) =>
    partner.ownerProfileId || owners.find((account) => account.email.toLowerCase() === partner.email.toLowerCase())?.id || "";

  const filtered = b2bPartners.filter((p) => {
    if (!searchQ.trim()) return true;
    const q = searchQ.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.partnerId.toLowerCase().includes(q) ||
      p.organizationName.toLowerCase().includes(q)
    );
  });

  const openCreate = (prefill?: { name?: string; phone?: string; email?: string; organizationName?: string }) => {
    setNewName(prefill?.name || "");
    setNewPhone(prefill?.phone || "");
    setNewEmail(prefill?.email || "");
    setNewOrg(prefill?.organizationName || "");
    setNewPassword(generatePassword());
    setCreateError(null);
    setIsCreateOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim() || !newEmail.trim() || newPassword.trim().length < 6) {
      setCreateError("Name, phone, email, and a password of at least 6 characters are required.");
      return;
    }
    const created = await createB2BAccount({
      name: newName.trim(),
      phone: newPhone.trim().startsWith("+") ? newPhone.trim() : `+91 ${newPhone.trim()}`,
      email: newEmail.trim(),
      password: newPassword.trim(),
      organizationName: newOrg.trim(),
    });
    if ("error" in created) {
      setCreateError(created.error);
      return;
    }
    setIssued({
      name: created.name,
      email: created.email,
      password: created.password || newPassword.trim(),
      partnerId: created.partnerId,
    });
    setSuccessMsg(`${created.name} can now sign in. Share the password privately.`);
    setNewName("");
    setNewPhone("");
    setNewEmail("");
    setNewOrg("");
    setNewPassword("");
    setCreateError(null);
    setIsCreateOpen(false);
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      Active: "bg-orange-100 text-orange-700 border-orange-200",
      "Pending Profile": "bg-amber-100 text-amber-700 border-amber-200",
      "Under Verification": "bg-blue-100 text-blue-700 border-blue-200",
      Suspended: "bg-red-100 text-red-700 border-red-200",
    };
    return map[status] || "bg-slate-100 text-slate-700 border-slate-200";
  };

  const verificationIcon = (status: string) => {
    switch (status) {
      case "Verified": return <CheckCircle2 className="w-3.5 h-3.5 text-orange-500" />;
      case "Pending": return <Clock className="w-3.5 h-3.5 text-amber-500" />;
      case "Under Review": return <Clock className="w-3.5 h-3.5 text-blue-500" />;
      default: return <AlertCircle className="w-3.5 h-3.5 text-red-500" />;
    }
  };

  const viewing = viewPartner ? b2bPartners.find((p) => p.id === viewPartner) : null;

  const openEdit = (partner: B2BPartnerProfile) => {
    setEditPartner(partner);
    setEditName(partner.name);
    setEditPhone(partner.phone);
    setEditOrg(partner.organizationName);
    setCreateError(null);
  };

  const handleEdit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editPartner) return;
    const userId = ownerIdFor(editPartner);
    if (!userId) {
      setCreateError("This organization has no owner login linked. Recreate the account.");
      return;
    }
    setActionBusy(true);
    const result = await manageAccount({
      userId,
      action: "update",
      fullName: editName.trim(),
      phone: editPhone.trim(),
      organizationName: editOrg.trim(),
    });
    setActionBusy(false);
    if (!result.ok) {
      setCreateError(result.error);
      return;
    }
    updateB2BProfile(editPartner.id, {
      name: editName.trim(),
      phone: editPhone.trim(),
      organizationName: editOrg.trim(),
    });
    setSuccessMsg(`${editName.trim()} details saved.`);
    setEditPartner(null);
  };

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!resetPartner) return;
    const userId = ownerIdFor(resetPartner);
    if (!userId) {
      setCreateError("This organization has no owner login linked. Recreate the account.");
      return;
    }
    if (resetPassword.trim().length < 6) {
      setCreateError("Set a password of at least 6 characters.");
      return;
    }
    setActionBusy(true);
    const result = await manageAccount({ userId, action: "password", password: resetPassword.trim() });
    setActionBusy(false);
    if (!result.ok) {
      setCreateError(result.error);
      return;
    }
    setIssued({
      name: resetPartner.name,
      email: resetPartner.email,
      password: result.password || resetPassword.trim(),
      partnerId: resetPartner.partnerId,
    });
    setSuccessMsg(`New password issued for ${resetPartner.name}. Share it privately.`);
    setResetPartner(null);
  };

  const handleFreeze = async () => {
    if (!freezePartner) return;
    const userId = ownerIdFor(freezePartner);
    if (!userId) {
      setCreateError("This organization has no owner login linked. Recreate the account.");
      return;
    }
    const next = freezePartner.accountStatus === "Suspended" ? "Active" : "Suspended";
    setActionBusy(true);
    const result = await manageAccount({ userId, action: "status", status: next });
    setActionBusy(false);
    if (!result.ok) {
      setCreateError(result.error);
      return;
    }
    if (result.partner) updateB2BProfile(freezePartner.id, result.partner);
    else updateB2BProfile(freezePartner.id, { accountStatus: next });
    setSuccessMsg(next === "Suspended" ? `${freezePartner.name} is frozen and cannot sign in.` : `${freezePartner.name} can sign in again.`);
    setFreezePartner(null);
  };

  const handleDeletePartner = async () => {
    if (!deletePartner) return;
    const userId = ownerIdFor(deletePartner);
    if (!userId) {
      setCreateError("This organization has no owner login linked. Recreate the account.");
      return;
    }
    setActionBusy(true);
    const result = await removeAccount(userId);
    setActionBusy(false);
    if (!result.ok) {
      setCreateError(result.error);
      return;
    }
    dropB2BPartner(deletePartner.id);
    setSuccessMsg(`${deletePartner.name} and their team logins were removed.`);
    setDeletePartner(null);
    setViewPartner(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div>
          <h1 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            B2B Partners Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create B2B/Agent login credentials. Partners complete their profile after first login.
          </p>
        </div>
        <button
          onClick={() => openCreate()}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 flex items-center gap-2 cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          Create B2B Account
        </button>
      </div>

      {accessRequests.filter((request) => request.status === "Pending").length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h2 className="text-sm font-extrabold text-slate-900">Access requests</h2>
            <p className="text-xs text-slate-500">Organizations that asked for a B2B owner login.</p>
          </div>
          <div className="divide-y divide-slate-100">
            {accessRequests.filter((request) => request.status === "Pending").map((request) => (
              <div key={request.id} className="p-4 flex flex-col lg:flex-row lg:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900">{request.organizationName}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{request.contactName} · {request.email} · {request.phone}</p>
                  <p className="text-xs text-slate-600 mt-1">{request.message}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => openCreate({
                      name: request.contactName,
                      phone: request.phone,
                      email: request.email,
                      organizationName: request.organizationName,
                    })}
                    className="px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold cursor-pointer"
                  >
                    Issue login
                  </button>
                  <button
                    onClick={() => rejectB2BRequest(request.id)}
                    className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {issued && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl text-sm text-orange-900">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-extrabold">Login issued for {issued.name}</p>
              <p className="mt-1 text-xs">Partner ID {issued.partnerId}. They will complete the organization profile on first sign-in.</p>
            </div>
            <button onClick={() => setIssued(null)} className="text-orange-700 cursor-pointer"><X className="w-4 h-4" /></button>
          </div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
            <div className="bg-white rounded-lg px-3 py-2 border border-orange-100">Email: {issued.email}</div>
            <div className="bg-white rounded-lg px-3 py-2 border border-orange-100">Password: {issued.password}</div>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`Email: ${issued.email}\nPassword: ${issued.password}`).catch(() => {});
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-orange-800 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            {copied ? "Copied" : "Copy credentials"}
          </button>
        </div>
      )}

      {createError && !isCreateOpen && !editPartner && !resetPartner && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{createError}</span>
        </div>
      )}

      {/* Success Toast */}
      {successMsg && !issued && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl text-xs text-orange-800 flex items-start gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Account Created Successfully!</p>
            <p className="mt-1 font-mono bg-orange-100 px-2 py-1 rounded">{successMsg}</p>
            <p className="mt-1 text-orange-600">Share these credentials with the partner. They will complete their profile on first login.</p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search partners by name, email, ID, or organization..."
          value={searchQ}
          onChange={(e) => setSearchQ(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
      </div>

      {/* Partners Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Partner</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Organization</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Verification</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Applications</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((partner) => (
                <tr key={partner.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                        {partner.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{partner.name}</p>
                        <p className="text-[11px] text-slate-500">{partner.partnerId} • {partner.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-slate-700">{partner.organizationName || <span className="text-slate-400 italic">Not yet filled</span>}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusBadge(partner.accountStatus)}`}>
                      {partner.accountStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {verificationIcon(partner.verificationStatus)}
                      <span className="text-xs font-medium text-slate-600">{partner.verificationStatus}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-slate-700">
                    {partner.metrics.totalApplications}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center gap-1 justify-end flex-wrap">
                      <button
                        onClick={() => setViewPartner(partner.id)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 cursor-pointer transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(partner)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 cursor-pointer"
                        title="Edit details"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setResetPartner(partner);
                          setResetPassword(generatePassword());
                          setCreateError(null);
                        }}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 cursor-pointer"
                        title="Reset password"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setFreezePartner(partner)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 cursor-pointer"
                        title={partner.accountStatus === "Suspended" ? "Unfreeze login" : "Freeze login"}
                      >
                        <Snowflake className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletePartner(partner)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {partner.verificationStatus !== "Verified" && partner.profileCompleted && (
                        <button
                          onClick={() => {
                            verifyB2BPartner(partner.id);
                            setSuccessMsg(`Partner ${partner.name} has been verified successfully!`);
                            setTimeout(() => setSuccessMsg(null), 4000);
                          }}
                          className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                        >
                          Verify
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400 text-sm">
                    No partners found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create B2B Account Modal */}
      {isCreateOpen && (
        <ModalOverlay onClose={() => setIsCreateOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[calc(100dvh-2rem)] overflow-hidden">
            <div className="flex items-center justify-between px-5 sm:px-6 pt-5 pb-3 border-b border-slate-100 shrink-0">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  Create B2B Account
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Issue an owner login. You stay on this admin console.
                </p>
              </div>
              <button type="button" onClick={() => setIsCreateOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="flex flex-col min-h-0 flex-1">
              <div className="overflow-y-auto flex-1 px-5 sm:px-6 py-4 space-y-4">
                {createError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{createError}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Contact Person Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="e.g. Rajesh Kumar"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    autoComplete="tel"
                    placeholder="+91 98765 43210"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    autoComplete="off"
                    placeholder="partner@company.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    Organization name
                  </label>
                  <input
                    type="text"
                    placeholder="Filled now, or later by the owner"
                    value={newOrg}
                    onChange={(e) => setNewOrg(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                      Temporary password <span className="text-rose-500">*</span>
                    </label>
                    <button type="button" onClick={() => setNewPassword(generatePassword())} className="text-[11px] font-bold text-blue-700 cursor-pointer">
                      Generate
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800">
                  Share this email and password with the owner. They complete organization documents and bank details after the first login, then you verify the account.
                </div>
              </div>

              <div className="flex gap-3 px-5 sm:px-6 py-4 border-t border-slate-100 shrink-0 bg-white">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </ModalOverlay>
      )}

      {/* View Partner Details Modal */}
      {viewing && (
        <ModalOverlay onClose={() => setViewPartner(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[calc(100dvh-2rem)] overflow-y-auto p-4 sm:p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">{viewing.name}</h2>
                <p className="text-xs text-slate-500">{viewing.partnerId} • Created {viewing.createdDate}</p>
              </div>
              <button onClick={() => setViewPartner(null)} className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoBlock label="Email" value={viewing.email} />
              <InfoBlock label="Phone" value={viewing.phone} />
              <InfoBlock label="Account Status" value={viewing.accountStatus} />
              <InfoBlock label="Verification" value={viewing.verificationStatus} />
              <InfoBlock label="Organization" value={viewing.organizationName || "Not filled"} />
              <InfoBlock label="Org Email" value={viewing.organizationEmail || "Not filled"} />
              <InfoBlock label="Incorporation #" value={viewing.incorporationNumber || "Not filled"} />
              <InfoBlock label="Registration #" value={viewing.registrationNumber || "Not filled"} />
            </div>

            {viewing.profileCompleted && (
              <>
                <h3 className="text-sm font-extrabold text-slate-900 pt-2">Documents Status</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <DocStatus label="Aadhaar" status={viewing.personalDocuments.aadhaarStatus} value={viewing.personalDocuments.aadhaarNumber} />
                  <DocStatus label="PAN" status={viewing.personalDocuments.panStatus} value={viewing.personalDocuments.panNumber} />
                  <DocStatus label="Org PAN" status={viewing.organizationDocuments.orgPanStatus} value={viewing.organizationDocuments.orgPanNumber} />
                  <DocStatus label="GST" status={viewing.organizationDocuments.gstCertificateStatus} value={viewing.organizationDocuments.gstNumber} />
                </div>

                <h3 className="text-sm font-extrabold text-slate-900 pt-2">Bank Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InfoBlock label="Bank" value={viewing.bankDetails.bankName || "Not filled"} />
                  <InfoBlock label="Account #" value={viewing.bankDetails.accountNumber || "Not filled"} />
                  <InfoBlock label="IFSC" value={viewing.bankDetails.ifsc || "Not filled"} />
                  <InfoBlock label="SWIFT" value={viewing.bankDetails.swiftCode || "Not filled"} />
                </div>
              </>
            )}

            <h3 className="text-sm font-extrabold text-slate-900 pt-2">Dashboard Metrics</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <MetricCard label="Total Apps" value={viewing.metrics.totalApplications} color="bg-blue-50 text-blue-700" />
              <MetricCard label="Processing" value={viewing.metrics.processingApplications} color="bg-amber-50 text-amber-700" />
              <MetricCard label="Completed" value={viewing.metrics.completedApplications} color="bg-orange-50 text-orange-700" />
              <MetricCard label="Rejected" value={viewing.metrics.rejectedApplications} color="bg-red-50 text-red-700" />
            </div>

            {/* Verify Button */}
            {viewing.verificationStatus !== "Verified" && viewing.profileCompleted && (
              <button
                onClick={() => {
                  verifyB2BPartner(viewing.id);
                  setSuccessMsg(`Partner ${viewing.name} verified!`);
                  setTimeout(() => setSuccessMsg(null), 4000);
                  setViewPartner(null);
                }}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm rounded-xl shadow-sm cursor-pointer hover:from-orange-600 hover:to-orange-700 transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                Verify This Partner
              </button>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button type="button" onClick={() => openEdit(viewing)} className="py-2 rounded-xl border text-xs font-bold">Edit</button>
              <button type="button" onClick={() => { setResetPartner(viewing); setResetPassword(generatePassword()); setCreateError(null); }} className="py-2 rounded-xl border text-xs font-bold">Password</button>
              <button type="button" onClick={() => setFreezePartner(viewing)} className="py-2 rounded-xl border text-xs font-bold">
                {viewing.accountStatus === "Suspended" ? "Unfreeze" : "Freeze"}
              </button>
              <button type="button" onClick={() => setDeletePartner(viewing)} className="py-2 rounded-xl border border-rose-200 text-rose-700 text-xs font-bold">Remove</button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {editPartner && (
        <ModalOverlay onClose={() => setEditPartner(null)}>
          <form onSubmit={handleEdit} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-900">Edit partner</h2>
              <button type="button" onClick={() => setEditPartner(null)} className="p-1.5"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            {createError && <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">{createError}</p>}
            <p className="text-xs text-slate-500">Email stays with the login: {editPartner.email}</p>
            <label className="block text-xs font-bold text-slate-700">Contact name
              <input value={editName} onChange={(e) => setEditName(e.target.value)} required className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm" />
            </label>
            <label className="block text-xs font-bold text-slate-700">Phone
              <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm" />
            </label>
            <label className="block text-xs font-bold text-slate-700">Organization name
              <input value={editOrg} onChange={(e) => setEditOrg(e.target.value)} className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm" />
            </label>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setEditPartner(null)} className="flex-1 py-2.5 rounded-xl border text-sm font-bold">Cancel</button>
              <button type="submit" disabled={actionBusy} className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold disabled:opacity-70">{actionBusy ? "Saving..." : "Save"}</button>
            </div>
          </form>
        </ModalOverlay>
      )}

      {resetPartner && (
        <ModalOverlay onClose={() => setResetPartner(null)}>
          <form onSubmit={handleResetPassword} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-900">Reset password</h2>
              <button type="button" onClick={() => setResetPartner(null)} className="p-1.5"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <p className="text-xs text-slate-500">{resetPartner.name} · {resetPartner.email}</p>
            {createError && <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">{createError}</p>}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">New password</label>
                <button type="button" onClick={() => setResetPassword(generatePassword())} className="text-[11px] font-bold text-orange-700">Generate</button>
              </div>
              <input value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} required minLength={6} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono" />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setResetPartner(null)} className="flex-1 py-2.5 rounded-xl border text-sm font-bold">Cancel</button>
              <button type="submit" disabled={actionBusy} className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold disabled:opacity-70">{actionBusy ? "Saving..." : "Issue password"}</button>
            </div>
          </form>
        </ModalOverlay>
      )}

      {freezePartner && (
        <ModalOverlay onClose={() => setFreezePartner(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-5 space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900">
              {freezePartner.accountStatus === "Suspended" ? "Unfreeze this login?" : "Freeze this login?"}
            </h2>
            <p className="text-sm text-slate-600">
              {freezePartner.accountStatus === "Suspended"
                ? `${freezePartner.name} and their team will be able to sign in again.`
                : `${freezePartner.name} and their team will be blocked from signing in. Organization records stay in the portal.`}
            </p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setFreezePartner(null)} className="flex-1 py-2.5 rounded-xl border text-sm font-bold">Cancel</button>
              <button type="button" disabled={actionBusy} onClick={() => void handleFreeze()} className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold disabled:opacity-70">
                {actionBusy ? "Saving..." : freezePartner.accountStatus === "Suspended" ? "Unfreeze" : "Freeze"}
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {deletePartner && (
        <ModalOverlay onClose={() => setDeletePartner(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-5 space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900">Remove {deletePartner.name}?</h2>
            <p className="text-sm text-slate-600">This deletes the owner login and every team login for the organization. Applications stay, unlinked from the org.</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setDeletePartner(null)} className="flex-1 py-2.5 rounded-xl border text-sm font-bold">Cancel</button>
              <button type="button" disabled={actionBusy} onClick={() => void handleDeletePartner()} className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-bold disabled:opacity-70">
                {actionBusy ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
};

const InfoBlock = ({ label, value }: { label: string; value: string }) => (
  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
    <p className="text-sm font-semibold text-slate-800 mt-0.5">{value}</p>
  </div>
);

const DocStatus = ({ label, status, value }: { label: string; status: string; value: string }) => (
  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-xs font-semibold text-slate-800 mt-0.5">{value || "Not uploaded"}</p>
    </div>
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
      status === "Verified" ? "bg-orange-100 text-orange-700" :
      status === "Pending" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
    }`}>{status}</span>
  </div>
);

const MetricCard = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className={`p-3 rounded-xl ${color}`}>
    <p className="text-2xl font-black">{value}</p>
    <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5 opacity-70">{label}</p>
  </div>
);
