"use client";

import React, { useEffect, useState } from "react";
import { UserCog, Plus, Search, Shield, ShieldCheck, User, Users, Crown, Clock, Edit3, Trash2, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { generatePassword, readSessionValue } from "@/utils/accounts";
import { listDirectory, manageAccount, provisionAccount, removeAccount, updateAccountProfile } from "@/lib/portalDb";
import type { DirectoryAccount } from "@/lib/records";
import { ModalOverlay } from "@/components/ui/ModalOverlay";

interface AdminTeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "Super Admin" | "Admin" | "Counselor" | "Ops Executive" | "Finance";
  department: string;
  status: "Active" | "Inactive";
  joinedDate: string;
  lastActive: string;
  trackingId?: string;
}

const ROLES: AdminTeamMember["role"][] = ["Super Admin", "Admin", "Counselor", "Ops Executive", "Finance"];
const DEPARTMENTS = ["Management", "Operations", "Student Services", "Finance", "Marketing"];

const ROLE_CFG: Record<AdminTeamMember["role"], { color: string; bg: string; icon: React.ElementType }> = {
  "Super Admin":   { color: "#d97706", bg: "#fffbeb", icon: Crown      },
  Admin:           { color: "#7c3aed", bg: "#f5f3ff", icon: ShieldCheck },
  Counselor:       { color: "#0284c7", bg: "#f0f9ff", icon: User        },
  "Ops Executive": { color: "#2563eb", bg: "#eff6ff", icon: Users       },
  Finance:         { color: "#dc2626", bg: "#fef2f2", icon: Shield      },
};

const CARD = { background: "#ffffff", border: "1px solid #dde1e7", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" };
const INPUT_STYLE = { width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #dde1e7", background: "#ffffff", color: "#1e293b", fontSize: 13, outline: "none" };

const emptyForm = (): Omit<AdminTeamMember, "id" | "joinedDate" | "lastActive"> => ({
  name: "", email: "", phone: "", role: "Counselor", department: "Student Services", status: "Active",
});

function toMember(account: DirectoryAccount): AdminTeamMember {
  const role = ROLES.includes(account.staffTitle as AdminTeamMember["role"]) ? (account.staffTitle as AdminTeamMember["role"]) : "Admin";
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    phone: account.phone,
    role,
    department: DEPARTMENTS.includes(account.department) ? account.department : "Operations",
    status: account.status === "Active" ? "Active" : "Inactive",
    joinedDate: "",
    lastActive: "",
    trackingId: account.trackingId,
  };
}

export const AdminTeamView: React.FC = () => {
  const [team, setTeam] = useState<AdminTeamMember[]>([]);
  const [password, setPassword] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editMember, setEditMember] = useState<AdminTeamMember | null>(null);
  const [form, setForm] = useState<Omit<AdminTeamMember, "id" | "joinedDate" | "lastActive">>(emptyForm());
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filtered = team.filter((m) => {
    const q = searchQ.toLowerCase();
    return (!q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.role.toLowerCase().includes(q))
      && (filterRole === "All" || m.role === filterRole)
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

  const openAdd = () => { setForm(emptyForm()); setPassword(generatePassword()); setEditMember(null); setFormError(null); setShowModal(true); };
  const openEdit = (m: AdminTeamMember) => { setForm({ name: m.name, email: m.email, phone: m.phone || "", role: m.role, department: m.department, status: m.status }); setPassword(""); setEditMember(m); setFormError(null); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!form.name.trim() || !form.email.trim()) { setFormError("Name and email are required."); return; }
    const email = form.email.trim().toLowerCase();
    if (team.find((m) => m.email.toLowerCase() === email && m.id !== editMember?.id)) { setFormError("Email already exists."); return; }
    if (editMember) {
      if (email !== editMember.email.toLowerCase()) {
        setFormError("Email stays with the login. Create a new member to use a different email.");
        return;
      }
      const failure = await updateAccountProfile({
        userId: editMember.id,
        fullName: form.name.trim(),
        phone: form.phone || "",
        status: form.status === "Active" ? "Active" : "Suspended",
        staffTitle: form.role,
        department: form.department,
      });
      if (failure) { setFormError(failure); return; }
      if (password.trim().length >= 6) {
        const reset = await manageAccount({ userId: editMember.id, action: "password", password: password.trim() });
        if (!reset.ok) { setFormError(reset.error); return; }
        setSuccessMsg(`${form.name} updated. New password ${password.trim()}.`);
      } else {
        setSuccessMsg(`${form.name} updated.`);
      }
    } else {
      if (password.trim().length < 6) { setFormError("Set a password of at least 6 characters."); return; }
      const issued = password.trim();
      const result = await provisionAccount({
        role: "admin",
        email,
        password: issued,
        fullName: form.name.trim(),
        phone: form.phone,
        staffTitle: form.role,
        department: form.department,
      });
      if (!result.ok || !result.account) {
        setFormError(result.ok ? "The admin login was not created." : result.error);
        return;
      }
      if (form.status !== "Active") {
        await updateAccountProfile({
          userId: result.account.id,
          fullName: form.name.trim(),
          phone: form.phone || "",
          status: "Suspended",
          staffTitle: form.role,
          department: form.department,
        });
      }
      setSuccessMsg(`${form.name} can sign in with ${email} / ${issued}. Tracking ID ${result.account.trackingId}.`);
    }
    setShowModal(false);
    await refresh();
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleDelete = async (id: string) => {
    const member = team.find((item) => item.id === id);
    if (id === readSessionValue("dakshin_account_id")) {
      setSuccessMsg("You cannot remove the account you are signed in with.");
      setConfirmDeleteId(null);
      return;
    }
    const result = await removeAccount(id);
    if (!result.ok) {
      setSuccessMsg(result.error);
      setConfirmDeleteId(null);
      return;
    }
    setConfirmDeleteId(null);
    setSuccessMsg(`${member?.name || "Member"} removed.`);
    await refresh();
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const roleCounts = ROLES.reduce<Record<string, number>>((acc, r) => { acc[r] = team.filter((m) => m.role === r).length; return acc; }, {});

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#1e293b", margin: 0 }}>Team Management</h1>
          <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{team.length} members · {team.filter((m) => m.status === "Active").length} active</p>
        </div>
        <button onClick={openAdd} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 8, background: "#f97316", color: "#ffffff", fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer" }}>
          <Plus style={{ width: 15, height: 15 }} /> Add Member
        </button>
      </div>

      {successMsg && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 8, background: "#f0f9ff", border: "1px solid #bae6fd", color: "#0369a1", fontSize: 13 }}>
          <CheckCircle2 style={{ width: 15, height: 15 }} /> {successMsg}
        </div>
      )}

      {/* Role Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
        {ROLES.map((role) => {
          const cfg = ROLE_CFG[role];
          const Icon = cfg.icon;
          return (
            <div key={role} style={{ ...CARD, padding: 14, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon style={{ width: 15, height: 15, color: cfg.color }} />
              </div>
              <div>
                <p style={{ fontSize: 18, fontWeight: 900, color: "#1e293b", margin: 0 }}>{roleCounts[role] || 0}</p>
                <p style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>{role}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 200, padding: "8px 12px", background: "#ffffff", border: "1px solid #dde1e7", borderRadius: 8 }}>
          <Search style={{ width: 14, height: 14, color: "#94a3b8", flexShrink: 0 }} />
          <input value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder="Search by name, email, role..." style={{ background: "transparent", border: "none", outline: "none", fontSize: 13, color: "#1e293b", width: "100%" }} />
        </div>
        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} style={{ padding: "8px 12px", background: "#ffffff", border: "1px solid #dde1e7", borderRadius: 8, fontSize: 13, color: "#1e293b", cursor: "pointer", outline: "none" }}>
          <option value="All">All Roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: "8px 12px", background: "#ffffff", border: "1px solid #dde1e7", borderRadius: 8, fontSize: 13, color: "#1e293b", cursor: "pointer", outline: "none" }}>
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
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
                  {["Member", "Role", "Department", "Status", "Last Active", ""].map((h) => (
                    <th key={h} style={{ padding: "10px 16px", fontSize: 10, fontWeight: 700, color: "#94a3b8", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((member, idx) => {
                  const cfg = ROLE_CFG[member.role];
                  const RoleIcon = cfg.icon;
                  const initials = member.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
                  return (
                    <tr key={member.id} style={{ borderBottom: idx < filtered.length - 1 ? "1px solid #f8fafc" : "none" }}>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 8, background: cfg.bg, border: `1px solid ${cfg.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: cfg.color, flexShrink: 0 }}>
                            {initials}
                          </div>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", margin: 0 }}>{member.name}</p>
                            <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>{member.email}</p>
                            <p style={{ fontSize: 10, color: "#ea580c", margin: 0, fontFamily: "ui-monospace, monospace", fontWeight: 700 }}>{member.trackingId || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20, background: cfg.bg, color: cfg.color }}>
                          <RoleIcon style={{ width: 11, height: 11 }} /> {member.role}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "#64748b" }}>{member.department}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: member.status === "Active" ? "#f0f9ff" : "#f8fafc", color: member.status === "Active" ? "#0284c7" : "#94a3b8", border: `1px solid ${member.status === "Active" ? "#bae6fd" : "#e2e8f0"}` }}>
                          {member.status}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#94a3b8" }}>
                          <Clock style={{ width: 11, height: 11 }} /> {member.lastActive}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <button onClick={() => openEdit(member)} style={{ padding: 6, border: "none", background: "none", cursor: "pointer", color: "#94a3b8", borderRadius: 6 }} title="Edit">
                            <Edit3 style={{ width: 14, height: 14 }} />
                          </button>
                          {member.role !== "Super Admin" && (
                            <button onClick={() => setConfirmDeleteId(member.id)} style={{ padding: 6, border: "none", background: "none", cursor: "pointer", color: "#94a3b8", borderRadius: 6 }} title="Remove">
                              <Trash2 style={{ width: 14, height: 14 }} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirm */}
      {confirmDeleteId && (
        <ModalOverlay onClose={() => setConfirmDeleteId(null)}>
          <div style={{ width: "100%", maxWidth: 360, background: "#ffffff", border: "1px solid #fecaca", borderRadius: 14, padding: 24, textAlign: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
              <Trash2 style={{ width: 22, height: 22, color: "#dc2626" }} />
            </div>
            <p style={{ fontSize: 15, fontWeight: 800, color: "#1e293b", margin: "0 0 6px" }}>Remove Member?</p>
            <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 20px" }}>
              This will permanently remove <strong>{team.find((m) => m.id === confirmDeleteId)?.name}</strong>.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirmDeleteId(null)} style={{ flex: 1, padding: "9px 0", background: "#f8fafc", border: "1px solid #dde1e7", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#64748b", cursor: "pointer" }}>Cancel</button>
              <button onClick={() => handleDelete(confirmDeleteId)} style={{ flex: 1, padding: "9px 0", background: "#dc2626", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, color: "#ffffff", cursor: "pointer" }}>Remove</button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <ModalOverlay onClose={() => setShowModal(false)}>
          <div style={{ width: "100%", maxWidth: 460, maxHeight: "calc(100dvh - 32px)", overflowY: "auto", background: "#ffffff", border: "1px solid #dde1e7", borderRadius: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #f0f2f5" }}>
              <p style={{ fontSize: 15, fontWeight: 800, color: "#1e293b", margin: 0 }}>{editMember ? "Edit Member" : "Add Member"}</p>
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
                { key: "name",  label: "Full Name *",     placeholder: "Ravi Kumar",           type: "text"  },
                { key: "email", label: "Email *",          placeholder: "ravi@dakshinvedha.com", type: "email" },
                { key: "phone", label: "Phone",            placeholder: "+91 98765 43210",       type: "text"  },
              ].map(({ key, label, placeholder, type }) => (
                <div key={key}>
                  <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>{label}</label>
                  <input type={type} value={(form as Record<string, string>)[key] || ""} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))} placeholder={placeholder} style={INPUT_STYLE} />
                </div>
              ))}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>{editMember ? "New password (optional)" : "Login password *"}</label>
                  <button type="button" onClick={() => setPassword(generatePassword())} style={{ border: "none", background: "none", color: "#ea580c", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Generate</button>
                </div>
                <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={editMember ? "Leave blank to keep the current password" : ""} style={INPUT_STYLE} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>Role</label>
                  <select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as AdminTeamMember["role"] }))} style={{ ...INPUT_STYLE, cursor: "pointer" }}>
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>Department</label>
                  <select value={form.department} onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))} style={{ ...INPUT_STYLE, cursor: "pointer" }}>
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: "9px 0", background: "#f8fafc", border: "1px solid #dde1e7", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#64748b", cursor: "pointer" }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: "9px 0", background: "#f97316", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, color: "#ffffff", cursor: "pointer" }}>{editMember ? "Save" : "Add Member"}</button>
              </div>
            </form>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
};
