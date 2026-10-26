"use client";

import React, { useEffect, useState } from "react";
import { UserCog, Plus, Search, Clock, Edit3, X, AlertCircle, CheckCircle2, Crown } from "lucide-react";
import { generatePassword } from "@/utils/accounts";
import { listDirectory, manageAccount, provisionAccount } from "@/lib/portalDb";
import type { DirectoryAccount } from "@/lib/records";
import { ModalOverlay } from "@/components/ui/ModalOverlay";
import {
  ADMIN_FEATURE_COPY,
  GRANTABLE_ADMIN_FEATURES,
  isSuperAdminTitle,
  parseTeamFeatures,
  type AdminFeatureKey,
} from "@/lib/adminAccess";

interface AdminTeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isOwner: boolean;
  status: "Active" | "Inactive";
  lastActive: string;
  trackingId?: string;
  features: AdminFeatureKey[];
}

const CARD = { background: "#ffffff", border: "1px solid #dde1e7", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" };
const INPUT_STYLE = { width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #dde1e7", background: "#ffffff", color: "#1e293b", fontSize: 13, outline: "none" };

const emptyForm = () => ({
  name: "",
  email: "",
  phone: "",
  status: "Active" as "Active" | "Inactive",
  features: parseTeamFeatures([]),
});

function toMember(account: DirectoryAccount): AdminTeamMember {
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    phone: account.phone,
    isOwner: isSuperAdminTitle(account.staffTitle),
    status: account.status === "Active" ? "Active" : "Inactive",
    lastActive: "",
    trackingId: account.trackingId,
    features: parseTeamFeatures(account.allowedFeatures),
  };
}

export const AdminTeamView: React.FC = () => {
  const [team, setTeam] = useState<AdminTeamMember[]>([]);
  const [password, setPassword] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editMember, setEditMember] = useState<AdminTeamMember | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const filtered = team.filter((m) => {
    const q = searchQ.toLowerCase();
    return (!q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q))
      && (filterStatus === "All" || m.status === filterStatus);
  });

  const refresh = async () => {
    const result = await listDirectory();
    if (result.error) setFormError(result.error);
    setTeam(result.accounts.filter((account) => account.role === "admin").map(toMember));
  };

  useEffect(() => {
    void refresh();
  }, []);

  const openAdd = () => {
    setForm(emptyForm());
    setPassword(generatePassword());
    setEditMember(null);
    setFormError(null);
    setShowModal(true);
  };

  const openEdit = (m: AdminTeamMember) => {
    setForm({ name: m.name, email: m.email, phone: m.phone || "", status: m.status, features: m.features });
    setPassword("");
    setEditMember(m);
    setFormError(null);
    setShowModal(true);
  };

  const toggleFeature = (feature: AdminFeatureKey) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((item) => item !== feature)
        : [...prev.features, feature],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!form.name.trim() || !form.email.trim()) {
      setFormError("Name and email are required.");
      return;
    }
    const email = form.email.trim().toLowerCase();
    if (team.find((m) => m.email.toLowerCase() === email && m.id !== editMember?.id)) {
      setFormError("Email already exists.");
      return;
    }
    const features = parseTeamFeatures(form.features);

    if (editMember) {
      if (email !== editMember.email.toLowerCase()) {
        setFormError("Email stays with the login. Create a new member to use a different email.");
        return;
      }
      if (editMember.isOwner) {
        setFormError("The Super Admin login is not edited as a team member.");
        return;
      }
      const result = await manageAccount({
        userId: editMember.id,
        action: "update",
        fullName: form.name.trim(),
        phone: form.phone || "",
        features,
      });
      if (!result.ok) {
        setFormError(result.error);
        return;
      }
      setSuccessMsg(`${form.name} updated.`);
    } else {
      if (password.trim().length < 6) {
        setFormError("Set a password of at least 6 characters.");
        return;
      }
      const issued = password.trim();
      const result = await provisionAccount({
        role: "admin",
        email,
        password: issued,
        fullName: form.name.trim(),
        phone: form.phone,
        features,
      });
      if (!result.ok || !result.account) {
        setFormError(result.ok ? "The admin login was not created." : result.error);
        return;
      }
      setSuccessMsg(`${form.name} can sign in with ${email} / ${issued}. Tracking ID ${result.account.trackingId}.`);
    }
    setShowModal(false);
    await refresh();
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#1e293b", margin: 0 }}>Team</h1>
          <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
            Create a login for each staff member and tick the screens they may use. Pause, reset, and delete are on Accounts.
          </p>
        </div>
        <button onClick={openAdd} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 8, background: "#f97316", color: "#ffffff", fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer" }}>
          <Plus style={{ width: 15, height: 15 }} /> Add team member
        </button>
      </div>

      {successMsg && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 8, background: "#fff7ed", border: "1px solid #fed7aa", color: "#9a3412", fontSize: 13 }}>
          <CheckCircle2 style={{ width: 15, height: 15 }} /> {successMsg}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 200, padding: "8px 12px", background: "#ffffff", border: "1px solid #dde1e7", borderRadius: 8 }}>
          <Search style={{ width: 14, height: 14, color: "#94a3b8", flexShrink: 0 }} />
          <input value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder="Search by name or email..." style={{ background: "transparent", border: "none", outline: "none", fontSize: 13, color: "#1e293b", width: "100%" }} />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: "8px 12px", background: "#ffffff", border: "1px solid #dde1e7", borderRadius: 8, fontSize: 13, color: "#1e293b", cursor: "pointer", outline: "none" }}>
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      <div style={{ ...CARD, overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
            <UserCog style={{ width: 40, height: 40, margin: "0 auto 8px", opacity: 0.3 }} />
            <p style={{ fontSize: 13, fontWeight: 600 }}>No team members found</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #f0f2f5" }}>
                  {["Member", "Access", "Status", "Last Active", ""].map((h) => (
                    <th key={h} style={{ padding: "10px 16px", fontSize: 10, fontWeight: 700, color: "#94a3b8", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((member, idx) => {
                  const initials = member.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
                  return (
                    <tr key={member.id} style={{ borderBottom: idx < filtered.length - 1 ? "1px solid #f8fafc" : "none" }}>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 8, background: member.isOwner ? "#fffbeb" : "#fff7ed", border: "1px solid #fed7aa", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#ea580c", flexShrink: 0 }}>
                            {member.isOwner ? <Crown style={{ width: 14, height: 14 }} /> : initials}
                          </div>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", margin: 0 }}>{member.name}</p>
                            <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>{member.email}</p>
                            <p style={{ fontSize: 10, color: "#ea580c", margin: 0, fontFamily: "ui-monospace, monospace", fontWeight: 700 }}>{member.trackingId || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", maxWidth: 320 }}>
                        {member.isOwner ? (
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#d97706" }}>All screens</span>
                        ) : (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                            {member.features.filter((item) => item !== "dashboard").map((feature) => (
                              <span key={feature} style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 20, background: "#fff7ed", color: "#c2410c" }}>
                                {ADMIN_FEATURE_COPY[feature].label}
                              </span>
                            ))}
                            {member.features.filter((item) => item !== "dashboard").length === 0 && (
                              <span style={{ fontSize: 11, color: "#94a3b8" }}>Dashboard only</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: member.status === "Active" ? "#f0f9ff" : "#f8fafc", color: member.status === "Active" ? "#0284c7" : "#94a3b8", border: `1px solid ${member.status === "Active" ? "#bae6fd" : "#e2e8f0"}` }}>
                          {member.status}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#94a3b8" }}>
                          <Clock style={{ width: 11, height: 11 }} /> {member.lastActive || "—"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {!member.isOwner && (
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <button onClick={() => openEdit(member)} style={{ padding: 6, border: "none", background: "none", cursor: "pointer", color: "#94a3b8", borderRadius: 6 }} title="Edit">
                              <Edit3 style={{ width: 14, height: 14 }} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <ModalOverlay onClose={() => setShowModal(false)}>
          <div style={{ width: "100%", maxWidth: 520, maxHeight: "calc(100dvh - 32px)", overflowY: "auto", background: "#ffffff", border: "1px solid #dde1e7", borderRadius: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #f0f2f5" }}>
              <p style={{ fontSize: 15, fontWeight: 800, color: "#1e293b", margin: 0 }}>{editMember ? "Edit team member" : "Add team member"}</p>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
              {formError && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 12, color: "#dc2626" }}>
                  <AlertCircle style={{ width: 14, height: 14 }} /> {formError}
                </div>
              )}
              {[
                { key: "name", label: "Full Name *", placeholder: "Ravi Kumar", type: "text" },
                { key: "email", label: "Email *", placeholder: "ravi@dakshinvedha.com", type: "email" },
                { key: "phone", label: "Phone", placeholder: "+91 98765 43210", type: "text" },
              ].map(({ key, label, placeholder, type }) => (
                <div key={key}>
                  <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>{label}</label>
                  <input type={type} value={key === "name" ? form.name : key === "email" ? form.email : form.phone} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))} placeholder={placeholder} style={INPUT_STYLE} />
                </div>
              ))}
              {!editMember && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>Login password *</label>
                    <button type="button" onClick={() => setPassword(generatePassword())} style={{ border: "none", background: "none", color: "#ea580c", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Generate</button>
                  </div>
                  <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} style={INPUT_STYLE} />
                </div>
              )}
              {editMember && (
                <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>Pause, password reset, and delete for this login are on Accounts.</p>
              )}
              <div>
                <p style={{ fontSize: 12, fontWeight: 800, color: "#1e293b", margin: "4px 0 8px" }}>Screens this person may use</p>
                <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 10px" }}>Dashboard stays on so they have a home page. Tick the rest for this login only.</p>
                <label style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", opacity: 0.7 }}>
                  <input type="checkbox" checked disabled />
                  <span>
                    <span style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{ADMIN_FEATURE_COPY.dashboard.label}</span>
                    <span style={{ display: "block", fontSize: 11, color: "#94a3b8" }}>{ADMIN_FEATURE_COPY.dashboard.description}</span>
                  </span>
                </label>
                {GRANTABLE_ADMIN_FEATURES.map((feature) => {
                  const copy = ADMIN_FEATURE_COPY[feature];
                  return (
                    <label key={feature} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", cursor: "pointer", borderTop: "1px solid #f1f5f9" }}>
                      <input type="checkbox" checked={form.features.includes(feature)} onChange={() => toggleFeature(feature)} className="accent-orange-500" style={{ marginTop: 3 }} />
                      <span>
                        <span style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{copy.label}</span>
                        <span style={{ display: "block", fontSize: 11, color: "#94a3b8" }}>{copy.description}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: "9px 0", background: "#f8fafc", border: "1px solid #dde1e7", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#64748b", cursor: "pointer" }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: "9px 0", background: "#f97316", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, color: "#ffffff", cursor: "pointer" }}>{editMember ? "Save" : "Create login"}</button>
              </div>
            </form>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
};
