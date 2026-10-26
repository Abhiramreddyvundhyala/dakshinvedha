"use client";

import React, { useEffect, useState } from "react";
import { Headset, Plus, X, Pencil } from "lucide-react";
import { generatePassword } from "@/utils/accounts";
import { listDirectory, manageAccount, provisionAccount } from "@/lib/portalDb";
import type { DirectoryAccount } from "@/lib/records";
import { ModalOverlay } from "@/components/ui/ModalOverlay";

export const AdminAgentsView: React.FC = () => {
  const [agents, setAgents] = useState<DirectoryAccount[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [editAgent, setEditAgent] = useState<DirectoryAccount | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    const result = await listDirectory();
    if (result.error) setNotice(result.error);
    setAgents(result.accounts.filter((account) => account.role === "agent"));
  };

  useEffect(() => {
    void refresh();
  }, []);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const cleanEmail = email.trim().toLowerCase();
    if (!name.trim() || !cleanEmail) {
      setError("Name and email are required.");
      return;
    }
    if (password.trim().length < 6) {
      setError("Set a password of at least 6 characters.");
      return;
    }
    const issued = password.trim();
    const result = await provisionAccount({
      role: "agent",
      email: cleanEmail,
      password: issued,
      fullName: name.trim(),
      phone: phone.trim(),
    });
    if (!result.ok || !result.account) {
      setError(result.ok ? "The agent login was not created." : result.error);
      return;
    }
    setNotice(`${name.trim()} can sign in as an agent. Tracking ID ${result.account.trackingId}. Password ${issued}.`);
    setName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setOpen(false);
    await refresh();
  };

  const handleEdit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editAgent) return;
    setBusy(true);
    const result = await manageAccount({
      userId: editAgent.id,
      action: "update",
      fullName: name.trim(),
      phone: phone.trim(),
    });
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setNotice(`${name.trim()} updated.`);
    setEditAgent(null);
    await refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Agents</h1>
          <p className="mt-1 max-w-2xl text-xs text-slate-500">
            Agents are Dakshinvedha counselors with their own login. Edit their details here. Pause, reset, and delete are on Accounts.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setPassword(generatePassword());
            setError(null);
          }}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-orange-700"
        >
          <Plus className="h-4 w-4" />
          Create agent login
        </button>
      </div>

      {notice && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-xs font-semibold text-orange-900">{notice}</div>
      )}

      {open && (
        <form onSubmit={handleCreate} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">New agent</h2>
            <button type="button" onClick={() => setOpen(false)} className="text-slate-400">
              <X className="h-4 w-4" />
            </button>
          </div>
          {error && <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">{error}</p>}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Work email" type="email" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Phone" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <div className="flex gap-2">
              <input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono" />
              <button type="button" onClick={() => setPassword(generatePassword())} className="rounded-xl bg-slate-100 px-3 text-[11px] font-bold text-slate-600">
                Generate
              </button>
            </div>
          </div>
          <button type="submit" className="mt-4 rounded-xl bg-orange-600 px-4 py-2 text-xs font-bold text-white">
            Issue agent login
          </button>
        </form>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {agents.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-slate-500">No agent logins yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-xs">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Agent</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Tracking ID</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {agents.map((agent) => (
                  <tr key={agent.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Headset className="h-4 w-4 text-orange-500" />
                        <div>
                          <p className="font-bold text-slate-900">{agent.name}</p>
                          <p className="text-[11px] text-slate-500">{agent.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{agent.phone || "—"}</td>
                    <td className="px-4 py-3 font-mono font-bold text-orange-700">{agent.trackingId}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${agent.status === "Active" ? "bg-orange-50 text-orange-800" : "bg-slate-100 text-slate-500"}`}>
                        {agent.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        title="Edit"
                        onClick={() => {
                          setEditAgent(agent);
                          setName(agent.name);
                          setPhone(agent.phone);
                          setError(null);
                        }}
                        className="mr-1 rounded-lg bg-slate-100 p-1.5 text-slate-700"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editAgent && (
        <ModalOverlay onClose={() => setEditAgent(null)}>
          <form onSubmit={handleEdit} className="w-full max-w-lg rounded-2xl bg-white p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-900">Edit agent</h2>
              <button type="button" onClick={() => setEditAgent(null)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <p className="text-xs text-slate-500">Email stays with the login: {editAgent.email}</p>
            {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">{error}</p>}
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" required className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Phone" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <div className="flex gap-3">
              <button type="button" onClick={() => setEditAgent(null)} className="flex-1 rounded-xl border py-2.5 text-sm font-bold">Cancel</button>
              <button type="submit" disabled={busy} className="flex-1 rounded-xl bg-orange-500 py-2.5 text-sm font-bold text-white disabled:opacity-70">{busy ? "Saving..." : "Save"}</button>
            </div>
          </form>
        </ModalOverlay>
      )}


    </div>
  );
};
