"use client";

import React, { useState } from "react";
import { usePlatform } from "@/context/PlatformContext";
import { CourseInfo, CourseRequirementsConfig } from "@/types";
import {
  BookOpen,
  Search,
  Building2,
  Edit2,
  CheckCircle2,
  ShieldCheck,
  X,
  Sparkles,
} from "lucide-react";

export const AdminCoursesView: React.FC = () => {
  const { courses, updateCourseRequirements } = usePlatform();

  const [search, setSearch] = useState("");
  const [selectedCourseForEdit, setSelectedCourseForEdit] = useState<CourseInfo | null>(null);

  // Form states for requirements config
  const [minQualification, setMinQualification] = useState("");
  const [acceptedDegreesStr, setAcceptedDegreesStr] = useState("");
  const [minPercentage, setMinPercentage] = useState(60);
  const [minCgpa, setMinCgpa] = useState(6.5);
  const [maxBacklogs, setMaxBacklogs] = useState(2);
  const [minIelts, setMinIelts] = useState(6.5);
  const [minToefl, setMinToefl] = useState(88);
  const [minPte, setMinPte] = useState(58);
  const [minDuolingo, setMinDuolingo] = useState(115);
  const [greRequired, setGreRequired] = useState(false);
  const [gmatRequired, setGmatRequired] = useState(false);
  const [academicEnglishAccepted, setAcademicEnglishAccepted] = useState(true);
  const [englishWaiverAvailable, setEnglishWaiverAvailable] = useState(true);
  const [passportRequired, setPassportRequired] = useState(false);

  const filteredCourses = courses.filter((c) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.courseName.toLowerCase().includes(q) ||
        c.universityName.toLowerCase().includes(q) ||
        c.department.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenEditRequirements = (course: CourseInfo) => {
    setSelectedCourseForEdit(course);
    const req = course.requirementsConfig;
    if (req) {
      setMinQualification(req.minQualification);
      setAcceptedDegreesStr(req.acceptedDegrees.join(", "));
      setMinPercentage(req.minPercentage);
      setMinCgpa(req.minCgpa);
      setMaxBacklogs(req.maxBacklogs);
      setMinIelts(req.minIelts);
      setMinToefl(req.minToefl);
      setMinPte(req.minPte);
      setMinDuolingo(req.minDuolingo);
      setGreRequired(req.greRequired);
      setGmatRequired(req.gmatRequired);
      setAcademicEnglishAccepted(req.academicEnglishAccepted);
      setEnglishWaiverAvailable(req.englishWaiverAvailable);
      setPassportRequired(req.passportRequiredAtApplication);
    }
  };

  const handleSaveRequirements = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForEdit) return;

    const updatedConfig: CourseRequirementsConfig = {
      minQualification,
      acceptedDegrees: acceptedDegreesStr.split(",").map((s) => s.trim()).filter(Boolean),
      minPercentage,
      minCgpa,
      maxBacklogs,
      acceptedEnglishTests: ["IELTS", "TOEFL", "PTE", "Duolingo"],
      minIelts,
      minToefl,
      minPte,
      minDuolingo,
      greRequired,
      gmatRequired,
      academicEnglishAccepted,
      englishWaiverAvailable,
      passportRequiredAtApplication: passportRequired,
      requiredDocuments: [
        "Passport",
        "Profile Photograph",
        "10th Certificate",
        "12th Certificate",
        "Bachelor Degree",
        "Transcripts",
        "IELTS",
        "CV",
        "SOP",
      ],
    };

    updateCourseRequirements(selectedCourseForEdit.id, updatedConfig);
    setSelectedCourseForEdit(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            University Course Requirements Configuration
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure academic criteria, minimum CGPA, English language cutoffs, and waivers. These rules directly power the student frontend eligibility indicators.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search programs to configure admission rules..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs"
          />
        </div>
      </div>

      {/* Courses List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCourses.map((c) => {
          const req = c.requirementsConfig;
          return (
            <div
              key={c.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {c.studyLevel}
                  </span>
                  <span className="text-xs font-bold text-slate-500">{c.universityName}</span>
                </div>
                <h3 className="font-black text-slate-900 text-sm">{c.courseName}</h3>
                <p className="text-slate-500 text-xs">{c.campus} • {c.tuitionFee}</p>

                {req && (
                  <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-[11px] text-slate-700">
                    <p>
                      <strong>Min Academic:</strong> {req.minQualification} (Min {req.minCgpa}/10 or {req.minPercentage}%)
                    </p>
                    <p>
                      <strong>English Cutoff:</strong> IELTS {req.minIelts} • TOEFL {req.minToefl} • PTE {req.minPte}
                    </p>
                    <p>
                      <strong>Waiver Allowed:</strong> {req.englishWaiverAvailable ? "Yes" : "No"} •{" "}
                      <strong>Passport Required:</strong> {req.passportRequiredAtApplication ? "Yes" : "No (Pending ok)"}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t flex justify-end">
                <button
                  type="button"
                  onClick={() => handleOpenEditRequirements(c)}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Configure Requirements</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Requirements Modal */}
      {selectedCourseForEdit && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveRequirements}
            className="bg-white w-full max-w-2xl rounded-3xl p-6 shadow-2xl space-y-4 text-xs max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold text-purple-600 uppercase font-mono">
                  {selectedCourseForEdit.universityName}
                </span>
                <h3 className="font-black text-sm text-slate-900">
                  Configure Admission Requirements for {selectedCourseForEdit.courseName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCourseForEdit(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Minimum Qualification Required
              </label>
              <input
                type="text"
                required
                value={minQualification}
                onChange={(e) => setMinQualification(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Accepted Degrees (Comma Separated)
              </label>
              <input
                type="text"
                required
                value={acceptedDegreesStr}
                onChange={(e) => setAcceptedDegreesStr(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Min Percentage (%)</label>
                <input
                  type="number"
                  value={minPercentage}
                  onChange={(e) => setMinPercentage(parseFloat(e.target.value))}
                  className="w-full p-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Min CGPA (/10)</label>
                <input
                  type="number"
                  step="0.1"
                  value={minCgpa}
                  onChange={(e) => setMinCgpa(parseFloat(e.target.value))}
                  className="w-full p-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Max Allowed Backlogs</label>
                <input
                  type="number"
                  value={maxBacklogs}
                  onChange={(e) => setMaxBacklogs(parseInt(e.target.value) || 0)}
                  className="w-full p-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Min IELTS Band</label>
                <input
                  type="number"
                  step="0.5"
                  value={minIelts}
                  onChange={(e) => setMinIelts(parseFloat(e.target.value))}
                  className="w-full p-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Min TOEFL iBT</label>
                <input
                  type="number"
                  value={minToefl}
                  onChange={(e) => setMinToefl(parseInt(e.target.value))}
                  className="w-full p-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Min PTE Score</label>
                <input
                  type="number"
                  value={minPte}
                  onChange={(e) => setMinPte(parseInt(e.target.value))}
                  className="w-full p-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Min Duolingo</label>
                <input
                  type="number"
                  value={minDuolingo}
                  onChange={(e) => setMinDuolingo(parseInt(e.target.value))}
                  className="w-full p-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={academicEnglishAccepted}
                  onChange={(e) => setAcademicEnglishAccepted(e.target.checked)}
                  className="rounded text-purple-600 w-4 h-4"
                />
                <span className="font-bold text-slate-800">Academic English Accepted?</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={englishWaiverAvailable}
                  onChange={(e) => setEnglishWaiverAvailable(e.target.checked)}
                  className="rounded text-purple-600 w-4 h-4"
                />
                <span className="font-bold text-slate-800">English Waiver Available?</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={passportRequired}
                  onChange={(e) => setPassportRequired(e.target.checked)}
                  className="rounded text-purple-600 w-4 h-4"
                />
                <span className="font-bold text-slate-800">Passport Required at Application?</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={greRequired}
                  onChange={(e) => setGreRequired(e.target.checked)}
                  className="rounded text-purple-600 w-4 h-4"
                />
                <span className="font-bold text-slate-800">GRE Score Mandatory?</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setSelectedCourseForEdit(null)}
                className="px-4 py-2 border rounded-xl font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl"
              >
                Save Requirements
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
