"use client";

import React, { useState } from "react";
import { StudentProfile, StudentDocumentItem } from "@/types";
import { newestFirst } from "@/lib/recent";
import { usePlatform } from "@/context/PlatformContext";
import { StoredFileButton } from "@/components/shared/StoredFileButton";
import { STORAGE_BUCKETS } from "@/lib/storage";
import {
  X,
  User,
  ShieldCheck,
  GraduationCap,
  Languages,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Flag,
  Award,
  DollarSign,
  MessageSquare,
  History,
  Send,
  Plus,
} from "lucide-react";

interface AdminStudentDetailsModalProps {
  student: StudentProfile | null;
  onClose: () => void;
}

export const AdminStudentDetailsModal: React.FC<AdminStudentDetailsModalProps> = ({
  student,
  onClose,
}) => {
  const {
    rejectStudentDocument,
    requestDocumentReupload,
    reviewStudentEducation,
    applications,
    students,
  } = usePlatform();

  // Internal tab state
  const [activeTab, setActiveTab] = useState<
    "basic" | "education" | "tests" | "documents" | "applications" | "offers" | "messages" | "history"
  >("education");

  // Reason modal for Reject or Request Re-upload
  const [docActionTarget, setDocActionTarget] = useState<{
    docId: string;
    docTitle: string;
    action: "reject" | "reupload";
  } | null>(null);
  const [actionReason, setActionReason] = useState("");

  if (!student) return null;

  const profile =
    students.find((item) => item.id === student.id || item.studentId === student.studentId) || student;

  const studentApps = newestFirst(
    applications.filter((a) => a.student.studentId === student.studentId || a.student.email === student.email),
    (app) => app.dateModified || app.dateAdded
  );

  // Submit document action with mandatory reason
  const handleConfirmDocAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docActionTarget) return;

    if (!actionReason.trim()) {
      alert("A reason is mandatory when rejecting or requesting re-upload.");
      return;
    }

    if (docActionTarget.action === "reject") {
      rejectStudentDocument(student.id, docActionTarget.docId, actionReason);
    } else {
      requestDocumentReupload(student.id, docActionTarget.docId, actionReason);
    }

    setDocActionTarget(null);
    setActionReason("");
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-600 text-white font-black text-2xl flex items-center justify-center shrink-0 shadow-lg">
              {student.firstName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">{student.name}</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/30 text-orange-300 border border-orange-400/40">
                  {student.accountStatus}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                ID: <span className="font-mono text-orange-300 font-bold">{student.studentId}</span> • {student.email} • {student.mobile}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b px-6 gap-2 sm:gap-6 bg-slate-50 text-xs font-bold text-slate-600 overflow-x-auto">
          {[
            { key: "education", label: "Education Review", icon: GraduationCap },
            { key: "documents", label: `Documents (${student.documents.length})`, icon: FileText },
            { key: "basic", label: "Basic & Passport", icon: User },
            { key: "tests", label: "English & Tests", icon: Languages },
            { key: "applications", label: `Applications (${studentApps.length})`, icon: ShieldCheck },
            { key: "offers", label: "Offers & Grants", icon: Award },
            { key: "messages", label: "Direct Messages", icon: MessageSquare },
            { key: "history", label: "Audit Log", icon: History },
          ].map((tab) => {
            const isSelected = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-3.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? "border-orange-600 text-orange-700 font-extrabold"
                    : "border-transparent hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 text-xs">
          {/* ======================================================== */}
          {/* TAB 1: ADMIN EDUCATION REVIEW (CRITICAL)                 */}
          {/* ======================================================== */}
          {activeTab === "education" && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Compact Education Review Interface
                  </h3>
                  <p className="text-slate-500 text-[11px]">
                    Verify or flag individual qualifications (10th, 12th, Diploma, Bachelor&apos;s, Master&apos;s).
                  </p>
                </div>
              </div>

              {profile.education.length === 0 ? (
                <div className="p-8 border-2 border-dashed rounded-2xl text-center text-slate-400">
                  No academic qualifications entered by student yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {profile.education.map((edu) => (
                    <div
                      key={edu.id}
                      className="p-4 bg-slate-50 border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 text-xs">
                            {edu.degree || edu.level}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                            {edu.level}
                          </span>
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              edu.verificationStatus === "Verified"
                                ? "bg-orange-100 text-orange-800"
                                : edu.verificationStatus === "Flagged"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            Status: {edu.verificationStatus}
                          </span>
                        </div>

                        <p className="text-slate-700 text-xs">
                          {edu.course || edu.stream || edu.level} • {edu.institutionName} ({edu.boardOrUniversity})
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                          <span>Years: {edu.startYear ? `${edu.startYear}–` : ""}{edu.passOutYear}</span>
                          <span>•</span>
                          <span>Score: <strong>{edu.percentageOrCgpa}</strong> {edu.cgpaScale ? `(${edu.cgpaScale} scale)` : ""}</span>
                          <span>•</span>
                          <span>Backlogs: <strong>{edu.numberOfBacklogs || 0}</strong></span>
                          {edu.englishMarks && (
                            <>
                              <span>•</span>
                              <span className="text-orange-700 font-bold bg-orange-50 px-1.5 py-0.5 rounded">
                                English Marks: {edu.englishMarks}/{edu.maxEnglishMarks || 100}
                              </span>
                            </>
                          )}
                        </div>

                        {edu.adminFeedback && (
                          <p className="text-[11px] text-rose-700 font-semibold mt-1">
                            Flag Note: &quot;{edu.adminFeedback}&quot;
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            const reason = prompt("Enter reason to flag this qualification:");
                            if (reason) {
                              reviewStudentEducation(student.id, edu.id, "Flagged", reason);
                            }
                          }}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                        >
                          FLAG
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: ADMIN DOCUMENT VERIFICATION (CRITICAL)            */}
          {/* ======================================================== */}
          {activeTab === "documents" && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Document Verification Management
                </h3>
                <p className="text-slate-500 text-[11px]">
                  Inspect student files. Approvals or rejections with mandatory feedback automatically notify the student.
                </p>
              </div>

              <div className="space-y-3">
                {student.documents.map((doc) => {
                  const isVerified = doc.status === "Verified";
                  const isRejected = doc.status === "Rejected";
                  const isReupload = doc.status === "Re-upload Required";

                  return (
                    <div
                      key={doc.id}
                      className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isVerified
                          ? "bg-orange-50/50 border-orange-200"
                          : isRejected
                          ? "bg-rose-50/60 border-rose-200"
                          : isReupload
                          ? "bg-amber-50/60 border-amber-200"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-xs">{doc.title}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                            {doc.category}
                          </span>
                          <span
                            className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                              isVerified
                                ? "bg-orange-100 text-orange-800"
                                : isRejected
                                ? "bg-rose-100 text-rose-800"
                                : isReupload
                                ? "bg-amber-100 text-amber-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {doc.status}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500">
                          {doc.fileName || "No file"} • Uploaded: {doc.uploadedDate || "—"}
                        </p>

                        {doc.rejectionReason && (
                          <p className="text-[11px] text-rose-700 font-semibold bg-white p-2 rounded-lg border border-rose-200 mt-1">
                            Logged Reason: &quot;{doc.rejectionReason}&quot;
                          </p>
                        )}
                      </div>

                      {/* View the file, request a re-upload, or reject it. */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <StoredFileButton bucket={doc.storageBucket || STORAGE_BUCKETS.student} path={doc.storagePath} />
                        <button
                          type="button"
                          onClick={() =>
                            setDocActionTarget({
                              docId: doc.id,
                              docTitle: doc.title,
                              action: "reupload",
                            })
                          }
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                        >
                          REQUEST RE-UPLOAD
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setDocActionTarget({
                              docId: doc.id,
                              docTitle: doc.title,
                              action: "reject",
                            })
                          }
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                        >
                          REJECT
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: BASIC & PERSONAL & PASSPORT                       */}
          {/* ======================================================== */}
          {activeTab === "basic" && (
            <div className="space-y-6 animate-fade-in">
              {/* Basic Information */}
              <div className="p-4 bg-slate-50 border rounded-2xl space-y-3">
                <span className="font-extrabold text-slate-900 block">BASIC INFORMATION</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[10px]">NAME</span>
                    <strong>{student.name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">PHONE</span>
                    <strong>{student.mobile}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">EMAIL</span>
                    <strong>{student.email}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">ACCOUNT STATUS</span>
                    <strong className="text-orange-700">{student.accountStatus}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">REGISTRATION DATE</span>
                    <strong>{student.registrationDate}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">LAST LOGIN</span>
                    <strong>{student.lastLogin}</strong>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="p-4 bg-slate-50 border rounded-2xl space-y-3">
                <span className="font-extrabold text-slate-900 block">PERSONAL INFORMATION</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[10px]">DOB</span>
                    <strong>{student.personal.dob}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">GENDER</span>
                    <strong>{student.personal.gender}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">NATIONALITY</span>
                    <strong>{student.personal.nationality}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">CITY, STATE</span>
                    <strong>
                      {student.personal.address.city}, {student.personal.address.state}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Passport Details */}
              <div className="p-4 bg-slate-50 border rounded-2xl space-y-3">
                <span className="font-extrabold text-slate-900 block">PASSPORT DETAILS</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[10px]">PASSPORT STATUS</span>
                    <strong className="text-orange-700">{student.passport.status}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">PASSPORT NUMBER</span>
                    <strong className="font-mono">{student.passport.passportNumber || "N/A"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">COUNTRY</span>
                    <strong>{student.passport.passportCountry || "N/A"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">EXPIRY DATE</span>
                    <strong>{student.passport.expiryDate || "N/A"}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: ENGLISH & STANDARDIZED TESTS                      */}
          {/* ======================================================== */}
          {activeTab === "tests" && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl">
                <span className="font-bold text-orange-950 block">Academic English Marks:</span>
                <p className="text-slate-700 mt-1">
                  {(() => {
                    const academic = student.education.find((item) => item.level === "12th" || item.level === "Diploma");
                    if (!academic?.englishMarks) return "No academic English marks recorded.";
                    return `${academic.level} English: ${academic.englishMarks} / ${academic.maxEnglishMarks || 100}`;
                  })()}
                </p>
              </div>

              <div className="space-y-2">
                <span className="font-extrabold text-slate-900 block">Standardized Test Scores:</span>
                {student.standardizedTests.length === 0 ? (
                  <p className="text-slate-400">No standardized test scores reported.</p>
                ) : (
                  student.standardizedTests.map((t) => (
                    <div key={t.id} className="p-3 bg-slate-50 border rounded-xl flex items-center justify-between">
                      <div>
                        <strong>{t.type}</strong> — Score: {t.overallScore} (Date: {t.testDate})
                        <p className="text-[11px] text-slate-500">
                          {Object.entries(t.subScores).map(([k, v]) => `${k}: ${v}`).join(" • ")}
                        </p>
                      </div>
                      <span className="text-orange-700 font-bold bg-orange-100 px-2 py-0.5 rounded text-[10px]">
                        {t.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: STUDENT APPLICATIONS                              */}
          {/* ======================================================== */}
          {activeTab === "applications" && (
            <div className="space-y-3 animate-fade-in">
              <h3 className="font-extrabold text-slate-900">Student Applications</h3>
              {studentApps.length === 0 ? (
                <p className="text-slate-400">No applications created yet.</p>
              ) : (
                studentApps.map((app) => (
                  <div key={app.camsId} className="p-3.5 bg-slate-50 border rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-mono text-orange-700 font-bold">{app.camsId}</span>
                      <p className="font-bold text-slate-900 text-xs mt-0.5">{app.course.courseName}</p>
                      <p className="text-slate-500 text-[11px]">{app.university.name} • {app.course.activeIntake}</p>
                    </div>
                    <div className="text-right">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800">
                        {app.primaryStatus}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">Submitted: {app.dateAdded}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 6: OFFERS, MESSAGES & HISTORY                        */}
          {/* ======================================================== */}
          {activeTab === "offers" && (
            <div className="p-5 bg-orange-50 border border-orange-200 rounded-2xl space-y-2">
              <span className="font-bold text-orange-950">Offers</span>
              {studentApps.filter((app) => ["Offer Issued", "Payment Pending", "Payment Done", "CAS Processing", "CAS Issued", "Visa Processing", "Completed"].includes(app.primaryStatus)).length === 0 ? (
                <p className="text-slate-700">No offers recorded for this student yet.</p>
              ) : (
                studentApps
                  .filter((app) => ["Offer Issued", "Payment Pending", "Payment Done", "CAS Processing", "CAS Issued", "Visa Processing", "Completed"].includes(app.primaryStatus))
                  .map((app) => (
                    <p key={app.camsId} className="text-slate-700">
                      {app.university.name}: {app.course.courseName} • {app.primaryStatus}
                    </p>
                  ))
              )}
            </div>
          )}

          {activeTab === "messages" && (
            <div className="p-4 bg-slate-50 border rounded-2xl space-y-3">
              <span className="font-bold text-slate-900">Direct In-App Messages</span>
              <p className="text-slate-500 text-[11px]">Chat channel connected with student.</p>
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-2 text-[11px] text-slate-600">
              <p>• {student.registrationDate}: Student account created via SMS OTP.</p>
              <p>• {student.registrationDate}: High school and Bachelor credentials uploaded.</p>
              <p>• {student.lastLogin}: Active session logged.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>

      {/* MANDATORY REASON MODAL FOR REJECT / REQUEST RE-UPLOAD */}
      {docActionTarget && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmDocAction}
            className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-black text-sm text-slate-900">
                {docActionTarget.action === "reject" ? "Reject Document" : "Request Document Re-Upload"}
              </h3>
              <button
                type="button"
                onClick={() => setDocActionTarget(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-600">
              Document: <strong>{docActionTarget.docTitle}</strong>
            </p>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">
                Mandatory Reason / Note to Student: <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder='e.g. "Uploaded transcript is unclear. Please upload a complete scanned copy."'
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500/20"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setDocActionTarget(null)}
                className="px-4 py-2 border rounded-xl font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-5 py-2 text-white font-extrabold rounded-xl ${
                  docActionTarget.action === "reject" ? "bg-rose-600 hover:bg-rose-700" : "bg-amber-600 hover:bg-amber-700"
                }`}
              >
                Confirm & Notify Student
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
