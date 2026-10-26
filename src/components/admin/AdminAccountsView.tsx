"use client";

import React, { useEffect, useState } from "react";
import { KeyRound, PauseCircle, PlayCircle, Trash2, X } from "lucide-react";
import { ModalOverlay } from "@/components/ui/ModalOverlay";
import { usePlatform } from "@/context/PlatformContext";
import { listAccountHistory, listDirectory, manageAccount, removeAccount } from "@/lib/portalDb";
import type { DirectoryAccount } from "@/lib/records";
import type { PortalRole } from "@/types";
import { generatePassword, readSessionValue } from "@/utils/accounts";

const ROLE_LABEL: Record<PortalRole, string> = {
  student: "Student",
  partner: "B2B owner",
  team: "Team",
  agent: "Agent",
  admin: "Admin",
};

type HistoryEvent = {
  id: string;
  accountId: string;
  email: string;
  fullName: string;
  role: string;
  action: "paused" | "resumed" | "deleted";
  actorName: string;
  note: string;
  createdAt: string;
};

function formatWhen(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export const AdminAccountsView: React.FC = () => {
  const { staffTitle, canAccessAdminFeature, syncAccountAccess } = usePlatform();
  const [accounts, setAccounts] = useState<DirectoryAccount[]>([]);
  const [history, setHistory] = useState<HistoryEvent[]>([]);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | PortalRole>("all");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pauseTarget, setPauseTarget] = useState<DirectoryAccount | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DirectoryAccount | null>(null);
  const [resetTarget, setResetTarget] = useState<DirectoryAccount | null>(null);
  const [password, setPassword] = useState("");
  const sessionId = readSessionValue("dakshin_account_id");
  const superAdmin = staffTitle.trim() === "Super Admin";

  const canTouch = (role: PortalRole) => {
    if (superAdmin) return true;
    if (role === "student") return canAccessAdminFeature("students");
    if (role === "partner" || role === "team") return canAccessAdminFeature("partners");
    if (role === "agent") return canAccessAdminFeature("agents");
    return false;
  };

  const refresh = async () => {
    const [directory, events] = await Promise.all([listDirectory(), listAccountHistory()]);
    if (directory.error) setError(directory.error);
    setAccounts(directory.accounts.filter((account) => canTouch(account.role)));
    setHistory(events.events.filter((event) => event.action === "paused" || event.action === "deleted"));
    setHistoryError(events.error);
  };

  useEffect(() => {
    void refresh();
  }, []);

  const visible = accounts.filter((account) => {
    if (roleFilter !== "all" && account.role !== roleFilter) return false;
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return (
      account.name.toLowerCase().includes(query) ||
      account.email.toLowerCase().includes(query) ||
      account.trackingId.toLowerCase().includes(query) ||
      account.role.includes(query)
    );
  });

  const pause = async () => {
    if (!pauseTarget) return;
    const next = pauseTarget.status === "Suspended" ? "Active" : "Suspended";
    setBusy(true);
    const result = await manageAccount({ userId: pauseTarget.id, action: "status", status: next });
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    syncAccountAccess({ userId: pauseTarget.id, role: pauseTarget.role, status: next, partner: result.partner });
    setNotice(next === "Suspended" ? `${pauseTarget.name} is paused and cannot sign in.` : `${pauseTarget.name} can sign in again.`);
    setPauseTarget(null);
    await refresh();
  };

  const remove = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    const result = await removeAccount(deleteTarget.id);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    syncAccountAccess({ userId: deleteTarget.id, role: deleteTarget.role, removed: true });
    setNotice(`${deleteTarget.name} was deleted.`);
    setDeleteTarget(null);
    await refresh();
  };

  const reset = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!resetTarget) return;
    if (password.trim().length < 6) {
      setError("Set a password of at least 6 characters.");
      return;
    }
    setBusy(true);
    const result = await manageAccount({ userId: resetTarget.id, action: "password", password: password.trim() });
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setNotice(`New password for ${resetTarget.name}: ${result.password || password.trim()}`);
    setResetTarget(null);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">Account access</h1>
        <p className="mt-1 text-xs text-slate-500">
          Pause, reset, or delete each login from this list. These actions are not repeated on the other admin screens.
        </p>
      </div>

      {notice && <p className="rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-800">{notice}</p>}
      {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">{error}</p>}

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name, email, or tracking ID"
          className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
        />
        <select
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value as "all" | PortalRole)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          <option value="all">All logins</option>
          <option value="student">Students</option>
          <option value="partner">B2B owners</option>
          <option value="team">Team</option>
          <option value="agent">Agents</option>
          {superAdmin && <option value="admin">Admins</option>}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Login</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((account) => {
                const mine = account.id === sessionId;
                const paused = account.status === "Suspended";
                return (
                  <tr key={account.id}>
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-900">{account.name}</p>
                      <p className="text-[11px] text-slate-500">{account.email}</p>
                      <p className="font-mono text-[10px] font-bold text-orange-700">{account.trackingId || "—"}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{ROLE_LABEL[account.role]}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${paused ? "bg-slate-100 text-slate-600" : "bg-orange-50 text-orange-800"}`}>
                        {paused ? "Paused" : "Active"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {mine ? (
                        <p className="text-right text-[11px] font-semibold text-slate-400">Signed in</p>
                      ) : (
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            title={paused ? "Resume" : "Pause"}
                            onClick={() => {
                              setError(null);
                              setPauseTarget(account);
                            }}
                            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"
                          >
                            {paused ? <PlayCircle className="h-4 w-4" /> : <PauseCircle className="h-4 w-4" />}
                          </button>
                          <button
                            type="button"
                            title="Reset password"
                            onClick={() => {
                              setError(null);
                              setResetTarget(account);
                              setPassword(generatePassword());
                            }}
                            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"
                          >
                            <KeyRound className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            title="Delete"
                            onClick={() => {
                              setError(null);
                              setDeleteTarget(account);
                            }}
                            className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-sm text-slate-400">
                    No logins match this search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-extrabold text-slate-900">Paused and deleted accounts</h2>
        <p className="mt-1 text-[11px] text-slate-500">History stays after a login is paused or removed.</p>
        {historyError && <p className="mt-3 text-xs text-amber-700">{historyError}</p>}
        {history.length === 0 && !historyError && <p className="mt-4 text-sm text-slate-400">No paused or deleted accounts yet.</p>}
        {history.length > 0 && (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="py-2 pr-3">When</th>
                  <th className="py-2 pr-3">Account</th>
                  <th className="py-2 pr-3">Role</th>
                  <th className="py-2 pr-3">Action</th>
                  <th className="py-2">By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((event) => (
                  <tr key={event.id}>
                    <td className="py-2 pr-3 text-slate-500">{formatWhen(event.createdAt)}</td>
                    <td className="py-2 pr-3">
                      <p className="font-bold text-slate-800">{event.fullName || event.email}</p>
                      <p className="text-[11px] text-slate-500">{event.email}</p>
                    </td>
                    <td className="py-2 pr-3 text-slate-600">{ROLE_LABEL[event.role as PortalRole] || event.role}</td>
                    <td className="py-2 pr-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${event.action === "deleted" ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-700"}`}>
                        {event.action === "deleted" ? "Deleted" : "Paused"}
                      </span>
                    </td>
                    <td className="py-2 text-slate-500">{event.actorName || "Admin"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pauseTarget && (
        <ModalOverlay onClose={() => setPauseTarget(null)}>
          <div className="w-full max-w-md space-y-4 rounded-2xl bg-white p-5">
            <h2 className="text-lg font-extrabold text-slate-900">
              {pauseTarget.status === "Suspended" ? "Resume this login?" : "Pause this login?"}
            </h2>
            <p className="text-sm text-slate-600">
              {pauseTarget.status === "Suspended"
                ? `${pauseTarget.name} will be able to sign in again.`
                : `${pauseTarget.name} will be blocked from signing in. Their records stay in the portal.`}
            </p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setPauseTarget(null)} className="flex-1 rounded-xl border py-2.5 text-sm font-bold">Cancel</button>
              <button type="button" disabled={busy} onClick={() => void pause()} className="flex-1 rounded-xl bg-orange-500 py-2.5 text-sm font-bold text-white disabled:opacity-70">
                {busy ? "Saving..." : pauseTarget.status === "Suspended" ? "Resume" : "Pause"}
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {resetTarget && (
        <ModalOverlay onClose={() => setResetTarget(null)}>
          <form onSubmit={reset} className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-900">Reset password</h2>
              <button type="button" onClick={() => setResetTarget(null)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <p className="text-xs text-slate-500">{resetTarget.name} · {resetTarget.email}</p>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">New password</label>
                <button type="button" onClick={() => setPassword(generatePassword())} className="text-[11px] font-bold text-orange-700">Generate</button>
              </div>
              <input value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono" />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setResetTarget(null)} className="flex-1 rounded-xl border py-2.5 text-sm font-bold">Cancel</button>
              <button type="submit" disabled={busy} className="flex-1 rounded-xl bg-orange-500 py-2.5 text-sm font-bold text-white disabled:opacity-70">{busy ? "Saving..." : "Issue password"}</button>
            </div>
          </form>
        </ModalOverlay>
      )}

      {deleteTarget && (
        <ModalOverlay onClose={() => setDeleteTarget(null)}>
          <div className="w-full max-w-md space-y-4 rounded-2xl bg-white p-5">
            <h2 className="text-lg font-extrabold text-slate-900">Delete {deleteTarget.name}?</h2>
            <p className="text-sm text-slate-600">
              This removes the login. The account is kept in the paused and deleted history.
              {deleteTarget.role === "partner" ? " Team logins for this organization are removed with it." : ""}
            </p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setDeleteTarget(null)} className="flex-1 rounded-xl border py-2.5 text-sm font-bold">Cancel</button>
              <button type="button" disabled={busy} onClick={() => void remove()} className="flex-1 rounded-xl bg-rose-600 py-2.5 text-sm font-bold text-white disabled:opacity-70">
                {busy ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
};
