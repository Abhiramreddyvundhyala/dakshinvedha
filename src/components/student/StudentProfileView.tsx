"use client";

import React, { useState } from "react";
import { usePlatform } from "@/context/PlatformContext";
import { DocumentCategoryType, EducationLevelType } from "@/types";
import {
  User,
  ShieldCheck,
  GraduationCap,
  Languages,
  FileText,
  Upload,
  Trash2,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Compass,
  Sparkles,
  MapPin,
  Calendar,
  Phone,
  Mail,
} from "lucide-react";

export const StudentProfileView: React.FC = () => {
  const {
    activeStudent,
    updateActiveStudentProfile,
    addEducation,
    deleteEducation,
    uploadDocument,
    deleteDocument,
  } = usePlatform();

  // Tab inside profile view
  const [profileTab, setProfileTab] = useState<
    "personal" | "education" | "tests" | "preferences" | "documents"
  >("documents");

  // Add Qualification submodal state
  const [showAddEdu, setShowAddEdu] = useState(false);
  const [eduLevel, setEduLevel] = useState<EducationLevelType>("Bachelor");
  const [institution, setInstitution] = useState("");
  const [board, setBoard] = useState("");
  const [stream, setStream] = useState("MPC");
  const [score, setScore] = useState("8.3");
  const [passYear, setPassYear] = useState("2025");
  const [engMarks, setEngMarks] = useState("82");
  const [maxEngMarks, setMaxEngMarks] = useState("100");

  if (!activeStudent) {
    return <div className="p-8 text-center text-slate-500">No active student profile found.</div>;
  }

  const handleSaveEdu = (e: React.FormEvent) => {
    e.preventDefault();
    addEducation({
      level: eduLevel,
      institutionName: institution || "Sample Institution",
      boardOrUniversity: board || "State Board / University",
      stream: eduLevel === "12th" ? stream : undefined,
      percentageOrCgpa: score,
      passOutYear: passYear,
      englishMarks: eduLevel === "12th" || eduLevel === "Diploma" ? engMarks : undefined,
      maxEnglishMarks: eduLevel === "12th" || eduLevel === "Diploma" ? maxEngMarks : undefined,
    });
    setShowAddEdu(false);
  };

  const documentCategories: DocumentCategoryType[] = [
    "Passport",
    "Profile Photograph",
    "10th Certificate",
    "12th Certificate",
    "Diploma Certificate",
    "Bachelor Degree",
    "Bachelor Transcripts",
    "Master Degree",
    "Master Transcripts",
    "IELTS",
    "TOEFL",
    "PTE",
    "Duolingo",
    "GRE",
    "GMAT",
    "CV / Resume",
    "Statement of Purpose",
    "Letter of Recommendation",
    "Experience Letter",
    "Financial Documents",
    "Other Documents",
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Title & Profile Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white font-black text-2xl flex items-center justify-center shrink-0 shadow-md">
            {activeStudent.firstName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {activeStudent.name}
              </h1>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {activeStudent.accountStatus}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Student ID: <strong>{activeStudent.studentId}</strong> • Registered on {activeStudent.registrationDate}
            </p>
          </div>
        </div>

        {/* Profile Completion Indicator */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center gap-3">
          <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-amber-500"
              style={{ width: `${activeStudent.profileCompletion}%` }}
            />
          </div>
          <span className="text-xs font-black text-slate-900">
            {activeStudent.profileCompletion}% Complete
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2 text-xs font-bold pb-1">
        {[
          { key: "documents", label: "Documents & Files", icon: FileText },
          { key: "education", label: "Education Qualifications", icon: GraduationCap },
          { key: "tests", label: "English & Tests", icon: Languages },
          { key: "personal", label: "Personal & Passport", icon: User },
          { key: "preferences", label: "Study Preferences", icon: Compass },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = profileTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setProfileTab(tab.key as any)}
              className={`py-2 px-3.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                isSelected
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* TAB: DOCUMENTS MANAGER (CRITICAL)                        */}
      {/* ======================================================== */}
      {profileTab === "documents" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Student Document Registry
              </h2>
              <p className="text-xs text-slate-500">
                Upload verified academic documents, test score reports, and personal identification.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documentCategories.map((cat) => {
              const existingDoc = activeStudent.documents.find((d) => d.category === cat);
              const isRejected = existingDoc?.status === "Rejected";
              const isReupload = existingDoc?.status === "Re-upload Required";
              const isVerified = existingDoc?.status === "Verified";

              return (
                <div
                  key={cat}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                    isRejected
                      ? "bg-rose-50/70 border-rose-200"
                      : isReupload
                      ? "bg-amber-50/70 border-amber-200"
                      : isVerified
                      ? "bg-emerald-50/40 border-emerald-200"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-extrabold text-slate-900 text-xs">{cat}</span>
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          isVerified
                            ? "bg-emerald-100 text-emerald-800"
                            : isRejected
                            ? "bg-rose-100 text-rose-800"
                            : isReupload
                            ? "bg-amber-100 text-amber-800 animate-pulse"
                            : existingDoc
                            ? "bg-blue-100 text-blue-800"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {existingDoc?.status || "Not Uploaded"}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500">
                      {existingDoc ? `${existingDoc.fileName} • ${existingDoc.fileSize || "1.5 MB"}` : "No file uploaded yet"}
                    </p>

                    {/* Rejection / Action Required Reason from Super Admin */}
                    {(isRejected || isReupload) && existingDoc?.rejectionReason && (
                      <div className="p-2.5 bg-rose-100/70 border border-rose-300 rounded-xl text-[11px] text-rose-900 font-semibold space-y-0.5 mt-2">
                        <span className="text-[10px] uppercase font-bold text-rose-700 block">
                          Admissions Compliance Note:
                        </span>
                        <p>&quot;{existingDoc.rejectionReason}&quot;</p>
                      </div>
                    )}
                  </div>

                  {/* Actions: Upload, Replace, Delete */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() =>
                        uploadDocument({
                          category: cat,
                          title: cat,
                          fileName: `${cat.replace(/[\s/]+/g, "_")}_${activeStudent.firstName}.pdf`,
                        })
                      }
                      className="flex-1 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer text-center"
                    >
                      {existingDoc ? "REPLACE" : "UPLOAD"}
                    </button>
                    {existingDoc && (
                      <button
                        onClick={() => deleteDocument(existingDoc.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        title="Delete Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB: EDUCATION QUALIFICATIONS                            */}
      {/* ======================================================== */}
      {profileTab === "education" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900">
              Education Qualifications
            </h2>
            <button
              onClick={() => setShowAddEdu(true)}
              className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Qualification</span>
            </button>
          </div>

          <div className="space-y-3">
            {activeStudent.education.map((q) => (
              <div
                key={q.id}
                className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900 text-sm">{q.degree || q.level}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {q.level}
                    </span>
                    {q.verificationStatus === "Verified" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Admin Verified
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 mt-0.5">
                    {q.institutionName} • {q.boardOrUniversity}
                  </p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Year Completed: {q.passOutYear} • Score: <strong>{q.percentageOrCgpa}</strong>
                    {q.englishMarks && ` • English Marks: ${q.englishMarks}/${q.maxEnglishMarks || 100}`}
                  </p>
                </div>
                <button
                  onClick={() => deleteEducation(q.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 self-end sm:self-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB: PERSONAL & PASSPORT                                 */}
      {/* ======================================================== */}
      {profileTab === "personal" && (
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-4 text-xs">
          <h2 className="text-base font-extrabold text-slate-900">Personal & Passport Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <span className="text-slate-400 block text-[10px] font-bold">FULL NAME</span>
              <strong className="text-slate-800">{activeStudent.name}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-bold">DOB & GENDER</span>
              <strong className="text-slate-800">
                {activeStudent.personal.dob} ({activeStudent.personal.gender})
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-bold">NATIONALITY</span>
              <strong className="text-slate-800">{activeStudent.personal.nationality}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-bold">MOBILE</span>
              <strong className="text-slate-800">{activeStudent.mobile}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-bold">EMAIL</span>
              <strong className="text-slate-800">{activeStudent.email}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-bold">CITY & STATE</span>
              <strong className="text-slate-800">
                {activeStudent.personal.address.city}, {activeStudent.personal.address.state}
              </strong>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border space-y-2 mt-4">
            <h3 className="font-bold text-slate-900">Passport Status: {activeStudent.passport.status}</h3>
            {activeStudent.passport.hasPassport === "YES" ? (
              <p className="text-slate-600">
                Passport Number: <strong>{activeStudent.passport.passportNumber}</strong> • Country:{" "}
                {activeStudent.passport.passportCountry} • Expires: {activeStudent.passport.expiryDate}
              </p>
            ) : (
              <p className="text-amber-700 font-semibold">
                Passport pending. Can be submitted prior to CAS / visa issuance.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB: ENGLISH & TESTS                                     */}
      {/* ======================================================== */}
      {profileTab === "tests" && (
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-4 text-xs">
          <h2 className="text-base font-extrabold text-slate-900">English Language & Standardized Tests</h2>

          <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl space-y-1">
            <span className="font-bold text-orange-900 text-xs">Academic English Standard</span>
            <p className="text-slate-800">
              12th / Intermediate English Marks: <strong>82 / 100</strong> (Eligible for English Waiver)
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-slate-900">Recorded Test Reports</h3>
            {activeStudent.standardizedTests.length === 0 ? (
              <p className="text-slate-400">No standardized tests recorded.</p>
            ) : (
              activeStudent.standardizedTests.map((t) => (
                <div key={t.id} className="p-4 bg-slate-50 border rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="font-black text-slate-900 text-sm">{t.type}</span>
                    <p className="text-slate-500">
                      Overall Score: <strong>{t.overallScore}</strong> • Date: {t.testDate}
                    </p>
                    <p className="text-slate-400 text-[11px]">
                      {Object.entries(t.subScores)
                        .map(([k, v]) => `${k.toUpperCase()}: ${v}`)
                        .join(" • ")}
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    {t.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB: STUDY PREFERENCES                                   */}
      {/* ======================================================== */}
      {profileTab === "preferences" && (
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-3 text-xs">
          <h2 className="text-base font-extrabold text-slate-900">Study Preferences</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-slate-400 block text-[10px] font-bold">STUDY LEVEL</span>
              <strong className="text-slate-800">
                {activeStudent.studyPreferences.preferredStudyLevel}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-bold">DESTINATION COUNTRIES</span>
              <strong className="text-slate-800">
                {activeStudent.studyPreferences.preferredCountries.join(", ")}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-bold">INTAKE</span>
              <strong className="text-slate-800">
                {activeStudent.studyPreferences.preferredIntake}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-bold">SCHOLARSHIP REQUIRED</span>
              <strong className="text-slate-800">
                {activeStudent.studyPreferences.scholarshipRequired}
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* Add Qualification Submodal */}
      {showAddEdu && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveEdu}
            className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-black text-sm text-slate-900">Add Education Qualification</h3>
              <button
                type="button"
                onClick={() => setShowAddEdu(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Level</label>
              <select
                value={eduLevel}
                onChange={(e) => setEduLevel(e.target.value as EducationLevelType)}
                className="w-full p-2 border rounded-xl"
              >
                <option value="10th">Secondary / 10th</option>
                <option value="12th">Intermediate / 12th</option>
                <option value="Diploma">Diploma</option>
                <option value="Bachelor">Bachelor&apos;s / Undergraduate</option>
                <option value="Master">Master&apos;s / Postgraduate</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Institution Name</label>
              <input
                type="text"
                required
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g. University of Mumbai / DPS"
                className="w-full p-2 border rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Board / University</label>
                <input
                  type="text"
                  required
                  value={board}
                  onChange={(e) => setBoard(e.target.value)}
                  placeholder="e.g. CBSE / State Board"
                  className="w-full p-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Percentage / CGPA</label>
                <input
                  type="text"
                  required
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="e.g. 8.3 / 10 or 84.5%"
                  className="w-full p-2 border rounded-xl"
                />
              </div>
            </div>

            {eduLevel === "12th" && (
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Stream</label>
                  <select
                    value={stream}
                    onChange={(e) => setStream(e.target.value)}
                    className="w-full p-2 border rounded-xl"
                  >
                    <option>MPC</option>
                    <option>BiPC</option>
                    <option>CEC</option>
                    <option>MEC</option>
                    <option>Science</option>
                    <option>Commerce</option>
                    <option>Arts</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">English Marks</label>
                  <input
                    type="number"
                    value={engMarks}
                    onChange={(e) => setEngMarks(e.target.value)}
                    className="w-full p-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Max Marks</label>
                  <input
                    type="number"
                    value={maxEngMarks}
                    onChange={(e) => setMaxEngMarks(e.target.value)}
                    className="w-full p-2 border rounded-xl"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setShowAddEdu(false)}
                className="px-4 py-2 border rounded-xl font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-extrabold rounded-xl"
              >
                Save Qualification
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
