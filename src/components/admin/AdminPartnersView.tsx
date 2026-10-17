"use client";

import React, { useState } from "react";
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
} from "lucide-react";

export const AdminPartnersView: React.FC = () => {
  const { b2bPartners, createB2BAccount, verifyB2BPartner } = usePlatform();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchQ, setSearchQ] = useState("");
  const [viewPartner, setViewPartner] = useState<string | null>(null);

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

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim() || !newEmail.trim()) {
      setCreateError("Please fill in all fields.");
      return;
    }
    // Check for duplicate email
    if (b2bPartners.find((p) => p.email.toLowerCase() === newEmail.trim().toLowerCase())) {
      setCreateError("A partner with this email already exists.");
      return;
    }
    const created = createB2BAccount({
      name: newName.trim(),
      phone: newPhone.trim().startsWith("+") ? newPhone.trim() : `+91 ${newPhone.trim()}`,
      email: newEmail.trim(),
    });
    setSuccessMsg(`B2B account created! Partner ID: ${created.partnerId} | Email: ${created.email} | Password: password123`);
    setTimeout(() => setSuccessMsg(null), 8000);
    setNewName("");
    setNewPhone("");
    setNewEmail("");
    setCreateError(null);
    setIsCreateOpen(false);
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      Active: "bg-emerald-100 text-emerald-700 border-emerald-200",
      "Pending Profile": "bg-amber-100 text-amber-700 border-amber-200",
      "Under Verification": "bg-blue-100 text-blue-700 border-blue-200",
      Suspended: "bg-red-100 text-red-700 border-red-200",
    };
    return map[status] || "bg-slate-100 text-slate-700 border-slate-200";
  };

  const verificationIcon = (status: string) => {
    switch (status) {
      case "Verified": return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
      case "Pending": return <Clock className="w-3.5 h-3.5 text-amber-500" />;
      case "Under Review": return <Clock className="w-3.5 h-3.5 text-blue-500" />;
      default: return <AlertCircle className="w-3.5 h-3.5 text-red-500" />;
    }
  };

  const viewing = viewPartner ? b2bPartners.find((p) => p.id === viewPartner) : null;

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
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 flex items-center gap-2 cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          Create B2B Account
        </button>
      </div>

      {/* Success Toast */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Account Created Successfully!</p>
            <p className="mt-1 font-mono bg-emerald-100 px-2 py-1 rounded">{successMsg}</p>
            <p className="mt-1 text-emerald-600">Share these credentials with the partner. They will complete their profile on first login.</p>
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
                    <div className="flex items-center gap-1.5 justify-end">
                      <button
                        onClick={() => setViewPartner(partner.id)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 cursor-pointer transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {partner.verificationStatus !== "Verified" && partner.profileCompleted && (
                        <button
                          onClick={() => {
                            verifyB2BPartner(partner.id);
                            setSuccessMsg(`Partner ${partner.name} has been verified successfully!`);
                            setTimeout(() => setSuccessMsg(null), 4000);
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setIsCreateOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  Create B2B Account
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Create login credentials for a new B2B partner or agent.
                </p>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {createError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Contact Person Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
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
                  placeholder="partner@company.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800">
                <strong>Default password:</strong> <code className="bg-blue-100 px-1.5 py-0.5 rounded font-mono">password123</code>
                <br />
                Partner will complete their profile (organization details, documents, bank info) after first login.
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold shadow-sm shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition-all cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Partner Details Modal */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setViewPartner(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">{viewing.name}</h2>
                <p className="text-xs text-slate-500">{viewing.partnerId} • Created {viewing.createdDate}</p>
              </div>
              <button onClick={() => setViewPartner(null)} className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                <div className="grid grid-cols-2 gap-3">
                  <DocStatus label="Aadhaar" status={viewing.personalDocuments.aadhaarStatus} value={viewing.personalDocuments.aadhaarNumber} />
                  <DocStatus label="PAN" status={viewing.personalDocuments.panStatus} value={viewing.personalDocuments.panNumber} />
                  <DocStatus label="Org PAN" status={viewing.organizationDocuments.orgPanStatus} value={viewing.organizationDocuments.orgPanNumber} />
                  <DocStatus label="GST" status={viewing.organizationDocuments.gstCertificateStatus} value={viewing.organizationDocuments.gstNumber} />
                </div>

                <h3 className="text-sm font-extrabold text-slate-900 pt-2">Bank Details</h3>
                <div className="grid grid-cols-2 gap-3">
                  <InfoBlock label="Bank" value={viewing.bankDetails.bankName || "Not filled"} />
                  <InfoBlock label="Account #" value={viewing.bankDetails.accountNumber || "Not filled"} />
                  <InfoBlock label="IFSC" value={viewing.bankDetails.ifsc || "Not filled"} />
                  <InfoBlock label="SWIFT" value={viewing.bankDetails.swiftCode || "Not filled"} />
                </div>
              </>
            )}

            <h3 className="text-sm font-extrabold text-slate-900 pt-2">Dashboard Metrics</h3>
            <div className="grid grid-cols-4 gap-3">
              <MetricCard label="Total Apps" value={viewing.metrics.totalApplications} color="bg-blue-50 text-blue-700" />
              <MetricCard label="Processing" value={viewing.metrics.processingApplications} color="bg-amber-50 text-amber-700" />
              <MetricCard label="Completed" value={viewing.metrics.completedApplications} color="bg-emerald-50 text-emerald-700" />
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
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-sm rounded-xl shadow-sm cursor-pointer hover:from-emerald-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                Verify This Partner
              </button>
            )}
          </div>
        </div>
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
      status === "Verified" ? "bg-emerald-100 text-emerald-700" :
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
