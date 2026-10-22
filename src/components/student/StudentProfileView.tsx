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
  const [degreeName, setDegreeName] = useState("");
  const [institution, setInstitution] = useState("");
  const [board, setBoard] = useState("");
  const [stream, setStream] = useState("MPC");
  const [score, setScore] = useState("");
  const [startYear, setStartYear] = useState("2021");
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
      degree: degreeName || (eduLevel === "Bachelor" ? "Bachelor's Degree" : eduLevel === "Master" ? "Master's Degree" : eduLevel),
      institutionName: institution.trim(),
      boardOrUniversity: board.trim(),
      stream: eduLevel === "12th" ? stream : undefined,
      percentageOrCgpa: score.trim(),
      startYear: startYear.trim(),
      passOutYear: passYear.trim(),
      englishMarks: eduLevel === "12th" || eduLevel === "Diploma" ? engMarks : undefined,
      maxEnglishMarks: eduLevel === "12th" || eduLevel === "Diploma" ? maxEngMarks : undefined,
    });
    // Reset form
    setDegreeName("");
    setInstitution("");
    setBoard("");
    setScore("");
    setStartYear("2021");
    setPassYear("2025");
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

  if (!activeStudent) {
    return <p className="text-sm text-slate-500">Sign in as a student to view this profile.</p>;
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Title & Profile Header */}
      <div className="bg-white p-6 rounded-xl border border-[#E7E5E0] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-[#ea580c] text-white font-bold text-2xl flex items-center justify-center shrink-0 shadow-xs">
            {activeStudent.firstName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {activeStudent.name}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-[#fff7ed] text-[#ea580c]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c]" />
                {activeStudent.accountStatus}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Student ID: <strong className="text-slate-700">{activeStudent.studentId}</strong> • Registered on {activeStudent.registrationDate}
            </p>
          </div>
        </div>

        {/* Profile Completion Indicator */}
        <div className="bg-[#FAFAF8] p-3.5 rounded-xl border border-[#E7E5E0] flex items-center gap-3">
          <div className="w-20 h-2 bg-[#F0EEE9] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#ea580c] rounded-full transition-all duration-500"
              style={{ width: `${activeStudent.profileCompletion}%` }}
            />
          </div>
          <span className="text-xs font-bold text-slate-900">
            {activeStudent.profileCompletion}% Complete
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E7E5E0] overflow-x-auto gap-2 text-xs font-semibold pb-1">
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
              className={`py-2 px-3.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                isSelected
                  ? "bg-[#ea580c] text-white shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-[#F4F3EF] font-medium"
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
                  className={`p-5 sm:p-6 rounded-xl border transition-all flex flex-col justify-between space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.02)] ${
                    isRejected
                      ? "bg-rose-50/50 border-rose-200"
                      : isReupload
                      ? "bg-amber-50/50 border-amber-200"
                      : "bg-white border-[#E7E5E0]"
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900 text-sm tracking-tight">{cat}</span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                          isVerified
                            ? "bg-[#fff7ed] text-[#ea580c]"
                            : isRejected
                            ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                            : isReupload
                            ? "bg-amber-50 text-amber-800 border border-amber-200/60 animate-pulse"
                            : existingDoc
                            ? "bg-[#fff7ed] text-[#ea580c]"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isVerified || existingDoc
                              ? "bg-[#ea580c]"
                              : isRejected
                              ? "bg-rose-500"
                              : isReupload
                              ? "bg-amber-500"
                              : "bg-slate-400"
                          }`}
                        />
                        <span>{existingDoc?.status || "Not Uploaded"}</span>
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 font-medium">
                      {existingDoc ? `${existingDoc.fileName} • ${existingDoc.fileSize || "1.5 MB"}` : "No file uploaded yet"}
                    </p>

                    {/* Rejection / Action Required Reason from Super Admin */}
                    {(isRejected || isReupload) && existingDoc?.rejectionReason && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900 font-medium space-y-0.5 mt-2">
                        <span className="text-[11px] uppercase font-bold text-rose-700 block tracking-wide">
                          Admissions Compliance Note:
                        </span>
                        <p>&quot;{existingDoc.rejectionReason}&quot;</p>
                      </div>
                    )}
                  </div>

                  {/* Actions: Upload, Replace, Delete (Refined 40px Secondary Button) */}
                  <div className="flex items-center gap-2 pt-3 border-t border-[#F0EEE9]">
                    <button
                      onClick={() =>
                        uploadDocument({
                          category: cat,
                          title: cat,
                          fileName: `${cat.replace(/[\s/]+/g, "_")}_${activeStudent.firstName}.pdf`,
                        })
                      }
                      className="flex-1 h-10 px-4 bg-white hover:bg-slate-50 border border-[#E7E5E0] hover:border-slate-300 rounded-lg text-xs font-semibold text-slate-700 transition-all duration-150 cursor-pointer text-center active:scale-[0.98] shadow-xs flex items-center justify-center"
                    >
                      {existingDoc ? "REPLACE" : "UPLOAD"}
                    </button>
                    {existingDoc && (
                      <button
                        onClick={() => deleteDocument(existingDoc.id)}
                        className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                        title="Delete Document"
                      >
                        <Trash2 className="w-4 h-4" />
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
              className="h-10 px-4 bg-[#ea580c] hover:bg-[#c2410c] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98] transition-all"
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
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                        Admin Verified
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 mt-0.5 font-medium">
                    {q.institutionName} • {q.boardOrUniversity}
                  </p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Years: <strong className="text-slate-700">{q.startYear ? `${q.startYear} – ${q.passOutYear}` : q.passOutYear}</strong> • Score: <strong className="text-slate-700">{q.percentageOrCgpa}</strong>
                    {q.englishMarks && ` • English Marks: ${q.englishMarks}/${q.maxEnglishMarks || 100}`}
                  </p>
                </div>
                <button
                  onClick={() => deleteEducation(q.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 self-end sm:self-center cursor-pointer"
                  title="Remove Qualification"
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
                  <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 font-bold text-[10px]">
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
              </strong>
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Level</label>
                <select
                  value={eduLevel}
                  onChange={(e) => setEduLevel(e.target.value as EducationLevelType)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-slate-800"
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
                <label className="font-bold text-slate-700 block mb-1">Degree / Specialization</label>
                <input
                  type="text"
                  value={degreeName}
                  onChange={(e) => setDegreeName(e.target.value)}
                  placeholder="e.g. B.Tech Computer Science"
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Institution Name *</label>
              <input
                type="text"
                required
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g. SVKM / Mithibai College / IIT"
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Board / University *</label>
              <input
                type="text"
                required
                value={board}
                onChange={(e) => setBoard(e.target.value)}
                placeholder="e.g. University of Mumbai / CBSE"
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Start Year *</label>
                <input
                  type="text"
                  required
                  value={startYear}
                  onChange={(e) => setStartYear(e.target.value)}
                  placeholder="e.g. 2020"
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Completion Year *</label>
                <input
                  type="text"
                  required
                  value={passYear}
                  onChange={(e) => setPassYear(e.target.value)}
                  placeholder="e.g. 2024"
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Grade / CGPA *</label>
                <input
                  type="text"
                  required
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="e.g. 8.5 / 85%"
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-mono"
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
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
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
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Max Marks</label>
                  <input
                    type="number"
                    value={maxEngMarks}
                    onChange={(e) => setMaxEngMarks(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowAddEdu(false)}
                className="h-10 px-4 border border-[#E7E5E0] hover:bg-slate-50 rounded-lg font-semibold text-xs text-slate-700 cursor-pointer transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-10 px-5 bg-[#ea580c] hover:bg-[#c2410c] text-white font-semibold text-xs rounded-lg shadow-xs cursor-pointer active:scale-[0.98] transition-all"
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
