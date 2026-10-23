"use client";

import React, { useState } from "react";
import { usePlatform } from "@/context/PlatformContext";
import { CatalogStatusNote } from "@/components/admin/CatalogStatusNote";
import { DEFAULT_REQUIREMENTS } from "@/data/studentSeedData";
import { CourseInfo, CourseRequirementsConfig } from "@/types";
import { BookOpen, Search, Edit2, X, Trash2, Plus, AlertCircle } from "lucide-react";
import { ModalOverlay } from "@/components/ui/ModalOverlay";

const INPUT = "w-full p-2 rounded-xl border border-slate-300 text-xs";

function blankCourse(universityId = ""): CourseInfo {
  return {
    id: "",
    universityId,
    universityName: "",
    campus: "",
    city: "",
    country: "",
    courseName: "",
    studyLevel: "Postgraduate",
    courseType: "Full-Time",
    department: "",
    subject: "",
    duration: "",
    tuitionFee: "",
    tuitionFeeNum: 0,
    applicationFee: "",
    activeIntake: "",
    availableIntakes: [],
    applicationDeadline: "",
    images: [],
    badges: { scholarship: false, freeToApply: false, noAppFee: false, interviewRequired: false },
    entryRequirements: { academic: "", english: "", workExperience: "" },
    scholarshipsInfo: "",
    additionalNotes: "",
    commissionRate: "",
    requirementsConfig: { ...DEFAULT_REQUIREMENTS, acceptedDegrees: [...DEFAULT_REQUIREMENTS.acceptedDegrees], requiredDocuments: [...DEFAULT_REQUIREMENTS.requiredDocuments] },
  };
}

export const AdminCoursesView: React.FC = () => {
  const { courses, universities, addCourse, updateCourse, deleteCourse, catalogStatus, catalogError } = usePlatform();
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<CourseInfo | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [intakeInput, setIntakeInput] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<CourseInfo | null>(null);

  const filteredCourses = courses.filter((course) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return course.courseName.toLowerCase().includes(q) || course.universityName.toLowerCase().includes(q) || course.department.toLowerCase().includes(q);
  });

  const openCreate = () => {
    const first = universities[0];
    const next = blankCourse(first?.id || "");
    if (first) {
      next.universityName = first.name;
      next.country = first.country;
      next.city = first.city;
      next.campus = first.city;
      next.availableIntakes = [...first.availableIntakes];
      next.activeIntake = first.availableIntakes[0] || "";
      next.aboutUniversity = first.about || "";
    }
    setEditingId(null);
    setDraft(next);
    setIntakeInput("");
    setFormError(universities.length === 0 ? "Add an institution before adding a course." : null);
  };

  const openEdit = (course: CourseInfo) => {
    setEditingId(course.id);
    setDraft({
      ...course,
      badges: { ...course.badges },
      entryRequirements: { ...course.entryRequirements },
      availableIntakes: [...course.availableIntakes],
      requirementsConfig: course.requirementsConfig
        ? { ...course.requirementsConfig, acceptedDegrees: [...course.requirementsConfig.acceptedDegrees], requiredDocuments: [...course.requirementsConfig.requiredDocuments] }
        : blankCourse().requirementsConfig,
    });
    setIntakeInput("");
    setFormError(null);
  };

  const patch = (updates: Partial<CourseInfo>) => setDraft((prev) => (prev ? { ...prev, ...updates } : prev));

  const onUniversityChange = (universityId: string) => {
    const university = universities.find((item) => item.id === universityId);
    if (!university || !draft) return;
    setDraft({
      ...draft,
      universityId,
      universityName: university.name,
      country: university.country,
      city: university.city,
      campus: draft.campus || university.city,
      aboutUniversity: university.about || draft.aboutUniversity,
    });
  };

  const requirements = draft?.requirementsConfig || DEFAULT_REQUIREMENTS;
  const patchReq = (updates: Partial<CourseRequirementsConfig>) => {
    if (!draft) return;
    patch({ requirementsConfig: { ...requirements, ...updates } });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    if (!draft.universityId) {
      setFormError("Choose the institution that offers this course.");
      return;
    }
    if (!draft.courseName.trim() || !draft.duration.trim()) {
      setFormError("Course name and duration are required.");
      return;
    }
    const university = universities.find((item) => item.id === draft.universityId);
    const tuitionFeeNum = Number(String(draft.tuitionFee).replace(/[^0-9.]/g, "")) || draft.tuitionFeeNum || 0;
    const record: CourseInfo = {
      ...draft,
      id: editingId || `crs-${Date.now()}`,
      universityName: university?.name || draft.universityName,
      country: university?.country || draft.country,
      city: draft.city || university?.city || "",
      campus: draft.campus || university?.city || "",
      courseName: draft.courseName.trim(),
      tuitionFeeNum,
      activeIntake: draft.activeIntake || draft.availableIntakes[0] || "",
      images: draft.images.filter(Boolean),
    };
    setSaving(true);
    const result = editingId ? await updateCourse(record) : await addCourse(record);
    setSaving(false);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    setDraft(null);
    setFormError(null);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setSaving(true);
    const result = await deleteCourse(pendingDelete.id);
    setSaving(false);
    if (!result.ok) {
      setFormError(result.error);
      setPendingDelete(null);
      return;
    }
    setPendingDelete(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Courses Offered</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Add the programmes each institution offers, including fees, intakes, deadlines, and admission requirements.
          </p>
        </div>
        <button type="button" onClick={openCreate} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl flex items-center gap-1.5 cursor-pointer self-start">
          <Plus className="w-4 h-4" /> Add Course
        </button>
      </div>

      <CatalogStatusNote status={catalogStatus} error={catalogError} />
      {formError && !draft && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4" /> {formError}
        </div>
      )}

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="text" placeholder="Search courses, institutions, or departments" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs" />
        </div>
      </div>

      {filteredCourses.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-400">
          <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-semibold">No courses yet</p>
          <p className="text-xs mt-1">Courses you add here show up in search, apply, and the student catalogue.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCourses.map((course) => {
          const req = course.requirementsConfig;
          return (
            <div key={course.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">{course.studyLevel}</span>
                  <span className="text-xs font-bold text-slate-500 text-right">{course.universityName}</span>
                </div>
                <h3 className="font-black text-slate-900 text-sm">{course.courseName}</h3>
                <p className="text-slate-500 text-xs">{course.campus || course.city} • {course.duration} • {course.tuitionFee || "Fee not set"}</p>
                <p className="text-slate-500 text-xs">{course.department}{course.subject ? ` • ${course.subject}` : ""} • Intake: {course.activeIntake || "Not set"}</p>
                {req && (
                  <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-[11px] text-slate-700">
                    <p><strong>Min Academic:</strong> {req.minQualification} (Min {req.minCgpa}/10 or {req.minPercentage}%)</p>
                    <p><strong>English Cutoff:</strong> IELTS {req.minIelts} • TOEFL {req.minToefl} • PTE {req.minPte}</p>
                  </div>
                )}
              </div>
              <div className="pt-2 border-t flex justify-end gap-2">
                <button type="button" onClick={() => setPendingDelete(course)} className="px-3 py-1.5 border border-rose-200 text-rose-700 font-bold text-xs rounded-xl cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5 inline mr-1" /> Delete
                </button>
                <button type="button" onClick={() => openEdit(course)} className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer">
                  <Edit2 className="w-3.5 h-3.5" /> Edit course
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {draft && (
        <ModalOverlay onClose={() => setDraft(null)}>
          <form onSubmit={handleSave} className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl text-xs flex flex-col max-h-[calc(100dvh-2rem)] overflow-hidden">
            <div className="flex items-center justify-between border-b px-6 pt-5 pb-3 shrink-0">
              <h3 className="font-black text-sm text-slate-900">{editingId ? "Edit course" : "Add course"}</h3>
              <button type="button" onClick={() => setDraft(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
            {formError && <p className="text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">{formError}</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block sm:col-span-2">
                <span className="font-bold text-slate-700 block mb-1">Institution *</span>
                <select value={draft.universityId} onChange={(e) => onUniversityChange(e.target.value)} className={INPUT} required>
                  <option value="">Select institution</option>
                  {universities.map((university) => <option key={university.id} value={university.id}>{university.name}</option>)}
                </select>
              </label>
              <label className="block sm:col-span-2">
                <span className="font-bold text-slate-700 block mb-1">Course name *</span>
                <input value={draft.courseName} onChange={(e) => patch({ courseName: e.target.value })} className={INPUT} required />
              </label>
              <label className="block">
                <span className="font-bold text-slate-700 block mb-1">Study level</span>
                <select value={draft.studyLevel} onChange={(e) => patch({ studyLevel: e.target.value as CourseInfo["studyLevel"] })} className={INPUT}>
                  <option>Undergraduate</option>
                  <option>Postgraduate</option>
                  <option>Doctorate</option>
                </select>
              </label>
              <label className="block">
                <span className="font-bold text-slate-700 block mb-1">Course type</span>
                <select value={draft.courseType} onChange={(e) => patch({ courseType: e.target.value as CourseInfo["courseType"] })} className={INPUT}>
                  <option>Full-Time</option>
                  <option>Part-Time</option>
                  <option>Distance Learning</option>
                </select>
              </label>
              <label className="block"><span className="font-bold text-slate-700 block mb-1">Department</span><input value={draft.department} onChange={(e) => patch({ department: e.target.value })} className={INPUT} /></label>
              <label className="block"><span className="font-bold text-slate-700 block mb-1">Subject</span><input value={draft.subject} onChange={(e) => patch({ subject: e.target.value })} className={INPUT} /></label>
              <label className="block"><span className="font-bold text-slate-700 block mb-1">Campus</span><input value={draft.campus} onChange={(e) => patch({ campus: e.target.value })} className={INPUT} /></label>
              <label className="block"><span className="font-bold text-slate-700 block mb-1">Duration *</span><input value={draft.duration} onChange={(e) => patch({ duration: e.target.value })} placeholder="e.g. 1 Year" className={INPUT} required /></label>
              <label className="block"><span className="font-bold text-slate-700 block mb-1">Tuition fee</span><input value={draft.tuitionFee} onChange={(e) => patch({ tuitionFee: e.target.value })} placeholder="e.g. £17,500" className={INPUT} /></label>
              <label className="block"><span className="font-bold text-slate-700 block mb-1">Application fee</span><input value={draft.applicationFee} onChange={(e) => patch({ applicationFee: e.target.value })} className={INPUT} /></label>
              <label className="block"><span className="font-bold text-slate-700 block mb-1">Commission rate</span><input value={draft.commissionRate} onChange={(e) => patch({ commissionRate: e.target.value })} placeholder="e.g. 15%" className={INPUT} /></label>
              <label className="block"><span className="font-bold text-slate-700 block mb-1">Application deadline</span><input value={draft.applicationDeadline} onChange={(e) => patch({ applicationDeadline: e.target.value })} placeholder="e.g. 2026-11-30" className={INPUT} /></label>
            </div>

            <div>
              <span className="font-bold text-slate-700 block mb-1">Intakes</span>
              <div className="flex gap-2">
                <input value={intakeInput} onChange={(e) => setIntakeInput(e.target.value)} placeholder="September 2026" className={INPUT} />
                <button type="button" onClick={() => {
                  const value = intakeInput.trim();
                  if (!value) return;
                  patch({ availableIntakes: [...draft.availableIntakes, value], activeIntake: draft.activeIntake || value });
                  setIntakeInput("");
                }} className="px-3 rounded-xl border border-slate-300 font-bold">Add</button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {draft.availableIntakes.map((intake, index) => (
                  <button type="button" key={`${intake}-${index}`} onClick={() => patch({ availableIntakes: draft.availableIntakes.filter((_, i) => i !== index) })} className="px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                    {intake} ×
                  </button>
                ))}
              </div>
              <label className="block mt-2">
                <span className="font-bold text-slate-700 block mb-1">Active intake</span>
                <input value={draft.activeIntake} onChange={(e) => patch({ activeIntake: e.target.value })} className={INPUT} />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block"><span className="font-bold text-slate-700 block mb-1">Academic requirement</span><textarea value={draft.entryRequirements.academic} onChange={(e) => patch({ entryRequirements: { ...draft.entryRequirements, academic: e.target.value } })} className={INPUT} rows={2} /></label>
              <label className="block"><span className="font-bold text-slate-700 block mb-1">English requirement</span><textarea value={draft.entryRequirements.english} onChange={(e) => patch({ entryRequirements: { ...draft.entryRequirements, english: e.target.value } })} className={INPUT} rows={2} /></label>
              <label className="block sm:col-span-2"><span className="font-bold text-slate-700 block mb-1">Work experience</span><input value={draft.entryRequirements.workExperience || ""} onChange={(e) => patch({ entryRequirements: { ...draft.entryRequirements, workExperience: e.target.value } })} className={INPUT} /></label>
              <label className="block sm:col-span-2"><span className="font-bold text-slate-700 block mb-1">Scholarship notes</span><textarea value={draft.scholarshipsInfo || ""} onChange={(e) => patch({ scholarshipsInfo: e.target.value })} className={INPUT} rows={2} /></label>
              <label className="block sm:col-span-2"><span className="font-bold text-slate-700 block mb-1">Additional notes</span><textarea value={draft.additionalNotes || ""} onChange={(e) => patch({ additionalNotes: e.target.value })} className={INPUT} rows={2} /></label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {([
                ["scholarship", "Scholarship available"],
                ["freeToApply", "Free to apply"],
                ["noAppFee", "No application fee"],
                ["interviewRequired", "Interview required"],
              ] as const).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2">
                  <input type="checkbox" checked={draft.badges[key]} onChange={(e) => patch({ badges: { ...draft.badges, [key]: e.target.checked } })} />
                  <span className="font-bold text-slate-700">{label}</span>
                </label>
              ))}
            </div>

            <div className="border-t pt-3 space-y-3">
              <p className="font-black text-slate-900">Admission cutoffs</p>
              <label className="block"><span className="font-bold text-slate-700 block mb-1">Minimum qualification</span><input value={requirements.minQualification} onChange={(e) => patchReq({ minQualification: e.target.value })} className={INPUT} /></label>
              <label className="block"><span className="font-bold text-slate-700 block mb-1">Accepted degrees (comma separated)</span><input value={requirements.acceptedDegrees.join(", ")} onChange={(e) => patchReq({ acceptedDegrees: e.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} className={INPUT} /></label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <label className="block"><span className="font-bold text-slate-700 block mb-1">Min %</span><input type="number" value={requirements.minPercentage} onChange={(e) => patchReq({ minPercentage: Number(e.target.value) || 0 })} className={INPUT} /></label>
                <label className="block"><span className="font-bold text-slate-700 block mb-1">Min CGPA</span><input type="number" step="0.1" value={requirements.minCgpa} onChange={(e) => patchReq({ minCgpa: Number(e.target.value) || 0 })} className={INPUT} /></label>
                <label className="block"><span className="font-bold text-slate-700 block mb-1">Max backlogs</span><input type="number" value={requirements.maxBacklogs} onChange={(e) => patchReq({ maxBacklogs: Number(e.target.value) || 0 })} className={INPUT} /></label>
                <label className="block"><span className="font-bold text-slate-700 block mb-1">Min IELTS</span><input type="number" step="0.5" value={requirements.minIelts} onChange={(e) => patchReq({ minIelts: Number(e.target.value) || 0 })} className={INPUT} /></label>
                <label className="block"><span className="font-bold text-slate-700 block mb-1">Min TOEFL</span><input type="number" value={requirements.minToefl} onChange={(e) => patchReq({ minToefl: Number(e.target.value) || 0 })} className={INPUT} /></label>
                <label className="block"><span className="font-bold text-slate-700 block mb-1">Min PTE</span><input type="number" value={requirements.minPte} onChange={(e) => patchReq({ minPte: Number(e.target.value) || 0 })} className={INPUT} /></label>
                <label className="block"><span className="font-bold text-slate-700 block mb-1">Min Duolingo</span><input type="number" value={requirements.minDuolingo} onChange={(e) => patchReq({ minDuolingo: Number(e.target.value) || 0 })} className={INPUT} /></label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {([
                  ["greRequired", "GRE required"],
                  ["gmatRequired", "GMAT required"],
                  ["academicEnglishAccepted", "Academic English accepted"],
                  ["englishWaiverAvailable", "English waiver available"],
                  ["passportRequiredAtApplication", "Passport required at application"],
                ] as const).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2">
                    <input type="checkbox" checked={Boolean(requirements[key])} onChange={(e) => patchReq({ [key]: e.target.checked })} />
                    <span className="font-bold text-slate-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t shrink-0 bg-white">
              <button type="button" onClick={() => setDraft(null)} className="px-4 py-2 border rounded-xl font-bold text-slate-600">Cancel</button>
              <button type="submit" disabled={saving} className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-extrabold rounded-xl disabled:opacity-70">{saving ? "Saving..." : "Save course"}</button>
            </div>
          </form>
        </ModalOverlay>
      )}

      {pendingDelete && (
        <ModalOverlay onClose={() => setPendingDelete(null)} zIndex={70}>
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-3">
            <p className="font-black text-slate-900 text-sm">Delete {pendingDelete.courseName}?</p>
            <p className="text-xs text-slate-500">Students will no longer see this course in search or apply.</p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setPendingDelete(null)} className="px-3 py-2 border rounded-xl text-xs font-bold">Cancel</button>
              <button type="button" onClick={confirmDelete} disabled={saving} className="px-3 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold">{saving ? "Deleting..." : "Delete"}</button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
};
