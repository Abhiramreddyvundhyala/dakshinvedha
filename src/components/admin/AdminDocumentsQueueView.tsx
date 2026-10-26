"use client";

import React, { useState } from "react";
import { usePlatform } from "@/context/PlatformContext";
import { Search } from "lucide-react";
import { ModalOverlay } from "@/components/ui/ModalOverlay";
import { StoredFileButton } from "@/components/shared/StoredFileButton";
import { STORAGE_BUCKETS, hasStoredFile } from "@/lib/storage";

export const AdminDocumentsQueueView: React.FC = () => {
  const { students, verifyStudentDocument, rejectStudentDocument, requestDocumentReupload } =
    usePlatform();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("pending_only");

  // Reason modal
  const [targetAction, setTargetAction] = useState<{
    studentId: string;
    docId: string;
    docTitle: string;
    studentName: string;
    action: "reject" | "reupload";
  } | null>(null);
  const [actionReason, setActionReason] = useState("");

  // Gather all documents across all students
  const allDocs = students.flatMap((s) =>
    s.documents.map((d) => ({
      ...d,
      studentId: s.id,
      studentName: s.name,
      studentCode: s.studentId,
    }))
  );

  const filtered = allDocs.filter((d) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        d.title.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        d.studentName.toLowerCase().includes(q) ||
        d.studentCode.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (filterStatus === "pending_only") {
      return d.status === "Uploaded" || d.status === "Under Review";
    }
    if (filterStatus !== "all") {
      return d.status === filterStatus;
    }
    return true;
  });

  const handleConfirmAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAction || !actionReason.trim()) {
      alert("A reason is mandatory when declining or requesting document re-upload.");
      return;
    }

    if (targetAction.action === "reject") {
      rejectStudentDocument(targetAction.studentId, targetAction.docId, actionReason);
    } else {
      requestDocumentReupload(targetAction.studentId, targetAction.docId, actionReason);
    }

    setTargetAction(null);
    setActionReason("");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Document Verification Queue
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review student uploaded credentials. Verified documents update student status in real-time. Rejection or re-upload requires a logged reason.
        </p>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name, document title, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="p-2 rounded-xl border border-slate-200 text-xs"
        >
          <option value="pending_only">Pending Action Only (Uploaded / Under Review)</option>
          <option value="all">All Documents</option>
          <option value="Verified">Verified</option>
          <option value="Re-upload Required">Re-upload Required</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b text-[11px] font-black text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-4">Student</th>
                <th className="p-4">Document Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">File Name</th>
                <th className="p-4">Uploaded Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No documents matching queue filters.
                  </td>
                </tr>
              ) : (
                filtered.map((doc) => (
                  <tr key={`${doc.studentId}-${doc.id}`} className="hover:bg-orange-50/40">
                    <td className="p-4">
                      <strong className="text-slate-900 block">{doc.studentName}</strong>
                      <span className="font-mono text-[10px] text-orange-700 font-bold">
                        {doc.studentCode}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-900">{doc.title}</td>
                    <td className="p-4">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-medium text-slate-700">
                        {doc.category}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">{doc.fileName || "No file"}</td>
                    <td className="p-4 text-slate-500">{doc.uploadedDate || "—"}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          doc.status === "Verified"
                            ? "bg-orange-100 text-orange-800"
                            : doc.status === "Rejected"
                            ? "bg-rose-100 text-rose-800"
                            : doc.status === "Re-upload Required"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <StoredFileButton bucket={doc.storageBucket || STORAGE_BUCKETS.student} path={doc.storagePath} />
                        <button
                          disabled={!hasStoredFile(doc.storagePath)}
                          title={hasStoredFile(doc.storagePath) ? "Verify this file" : "Upload a file before verifying"}
                          onClick={() => verifyStudentDocument(doc.studentId, doc.id)}
                          className="px-2.5 py-1 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg text-xs disabled:opacity-40"
                        >
                          VERIFY
                        </button>
                        <button
                          onClick={() =>
                            setTargetAction({
                              studentId: doc.studentId,
                              docId: doc.id,
                              docTitle: doc.title,
                              studentName: doc.studentName,
                              action: "reupload",
                            })
                          }
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs"
                        >
                          RE-UPLOAD
                        </button>
                        <button
                          onClick={() =>
                            setTargetAction({
                              studentId: doc.studentId,
                              docId: doc.id,
                              docTitle: doc.title,
                              studentName: doc.studentName,
                              action: "reject",
                            })
                          }
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs"
                        >
                          REJECT
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mandatory Reason Modal */}
      {targetAction && (
        <ModalOverlay onClose={() => setTargetAction(null)}>
          <form
            onSubmit={handleConfirmAction}
            className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-black text-sm text-slate-900">
                {targetAction.action === "reject" ? "Reject Document" : "Request Document Re-Upload"}
              </h3>
              <button
                type="button"
                onClick={() => setTargetAction(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-600">
              Student: <strong>{targetAction.studentName}</strong> • Document: <strong>{targetAction.docTitle}</strong>
            </p>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Mandatory Reason for Student: <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder='e.g. "Uploaded transcript is unclear. Please upload a complete scanned copy."'
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setTargetAction(null)}
                className="px-4 py-2 border rounded-xl font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-5 py-2 text-white font-extrabold rounded-xl ${
                  targetAction.action === "reject" ? "bg-rose-600" : "bg-amber-600"
                }`}
              >
                Confirm & Notify
              </button>
            </div>
          </form>
        </ModalOverlay>
      )}
    </div>
  );
};
