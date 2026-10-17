"use client";

import React, { useState, useEffect } from "react";
import { X, Globe, Building, GraduationCap, Calendar, ArrowRight, ShieldCheck } from "lucide-react";
import { MOCK_UNIVERSITIES, MOCK_COURSES } from "@/data/mockData";
import { CourseInfo } from "@/types";

interface ApplyNewCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToWizard: (selection: {
    countryToApply: string;
    studentPassportCountry: string;
    intake: string;
    courseType: string;
    university: string;
    course: CourseInfo;
  }) => void;
}

export const ApplyNewCourseModal: React.FC<ApplyNewCourseModalProps> = ({
  isOpen,
  onClose,
  onProceedToWizard,
}) => {
  // State for dependent fields
  const [countryToApply, setCountryToApply] = useState("");
  const [studentPassportCountry, setStudentPassportCountry] = useState("India");
  const [intake, setIntake] = useState("");
  const [courseType, setCourseType] = useState("");
  const [universityId, setUniversityId] = useState("");
  const [courseId, setCourseId] = useState("");

  // Countries available
  const availableCountries = Array.from(
    new Set(MOCK_UNIVERSITIES.map((u) => u.country))
  );

  const passportCountries = [
    "India",
    "Pakistan",
    "Nigeria",
    "Ghana",
    "Vietnam",
    "China",
    "Bangladesh",
    "Nepal",
    "United Arab Emirates",
    "Egypt",
    "Kenya",
    "Brazil",
    "Malaysia",
    "Other",
  ];

  // Reset downstream fields when parent changes
  const handleCountryChange = (c: string) => {
    setCountryToApply(c);
    setIntake("");
    setCourseType("");
    setUniversityId("");
    setCourseId("");
  };

  const handleIntakeChange = (i: string) => {
    setIntake(i);
    setCourseType("");
    setUniversityId("");
    setCourseId("");
  };

  const handleCourseTypeChange = (ct: string) => {
    setCourseType(ct);
    setUniversityId("");
    setCourseId("");
  };

  const handleUniversityChange = (uId: string) => {
    setUniversityId(uId);
    setCourseId("");
  };

  // 1. Available Intakes based on Country
  const availableIntakes = countryToApply
    ? Array.from(
        new Set(
          MOCK_COURSES.filter((c) => c.country === countryToApply).flatMap(
            (c) => c.availableIntakes
          )
        )
      )
    : [];

  // 2. Available Course Types based on Country & Intake
  const availableCourseTypes =
    countryToApply && intake
      ? Array.from(
          new Set(
            MOCK_COURSES.filter(
              (c) =>
                c.country === countryToApply && c.availableIntakes.includes(intake)
            ).map((c) => c.studyLevel)
          )
        )
      : [];

  // 3. Available Universities based on Country, Intake, and Course Type
  const availableUniversities =
    countryToApply && intake && courseType
      ? MOCK_UNIVERSITIES.filter((u) => {
          if (u.country !== countryToApply) return false;
          return MOCK_COURSES.some(
            (c) =>
              c.universityId === u.id &&
              c.availableIntakes.includes(intake) &&
              c.studyLevel === courseType
          );
        })
      : [];

  // 4. Available Courses based on selected University, Intake, and Course Type
  const availableCourses =
    universityId && intake && courseType
      ? MOCK_COURSES.filter(
          (c) =>
            c.universityId === universityId &&
            c.availableIntakes.includes(intake) &&
            c.studyLevel === courseType
        )
      : [];

  // Check if all fields are validly selected
  const isFormComplete =
    Boolean(countryToApply) &&
    Boolean(studentPassportCountry) &&
    Boolean(intake) &&
    Boolean(courseType) &&
    Boolean(universityId) &&
    Boolean(courseId);

  const selectedCourseObj = MOCK_COURSES.find((c) => c.id === courseId);
  const selectedUnivObj = MOCK_UNIVERSITIES.find((u) => u.id === universityId);

  const handleApplyClick = () => {
    if (!isFormComplete || !selectedCourseObj || !selectedUnivObj) return;

    onProceedToWizard({
      countryToApply,
      studentPassportCountry,
      intake,
      courseType,
      university: selectedUnivObj.name,
      course: selectedCourseObj,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D56732]/20 border border-[#D56732]/30 flex items-center justify-center text-[#E58D5F]">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">
                Apply For New Course
              </h3>
              <p className="text-xs text-slate-400">
                Configure student pathway and destination program
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body with Dependent Selections */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="p-3 bg-[#FDF5F0]/60 border border-[#F5D2C1] rounded-xl text-[#3C1609] text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#D56732] shrink-0" />
            <span>
              Selections are dynamically linked. Choose the destination country first to unlock intakes, universities, and courses.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Country to Apply */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Country to Apply *
              </label>
              <select
                value={countryToApply}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#D56732]/20 focus:border-[#D56732] font-medium"
              >
                <option value="">Select Target Country...</option>
                {availableCountries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Country of Student Passport */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Country of Student Passport *
              </label>
              <select
                value={studentPassportCountry}
                onChange={(e) => setStudentPassportCountry(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#D56732]/20 focus:border-[#D56732] font-medium"
              >
                {passportCountries.map((pc) => (
                  <option key={pc} value={pc}>
                    {pc}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Intake (Dependent on Country) */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Intake *
              </label>
              <select
                disabled={!countryToApply}
                value={intake}
                onChange={(e) => handleIntakeChange(e.target.value)}
                className={`w-full p-2.5 border rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#D56732]/20 focus:border-[#D56732] font-medium ${
                  !countryToApply
                    ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-white border-slate-200"
                }`}
              >
                <option value="">
                  {!countryToApply ? "Select Country first..." : "Select Available Intake..."}
                </option>
                {availableIntakes.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Course Type (Dependent on Intake) */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Course Type *
              </label>
              <select
                disabled={!intake}
                value={courseType}
                onChange={(e) => handleCourseTypeChange(e.target.value)}
                className={`w-full p-2.5 border rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#D56732]/20 focus:border-[#D56732] font-medium ${
                  !intake
                    ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-white border-slate-200"
                }`}
              >
                <option value="">
                  {!intake ? "Select Intake first..." : "Select Course Type..."}
                </option>
                {availableCourseTypes.map((ct) => (
                  <option key={ct} value={ct}>
                    {ct} (Degree)
                  </option>
                ))}
              </select>
            </div>

            {/* 5. University (Dependent on Course Type) */}
            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">
                University *
              </label>
              <select
                disabled={!courseType}
                value={universityId}
                onChange={(e) => handleUniversityChange(e.target.value)}
                className={`w-full p-2.5 border rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#D56732]/20 focus:border-[#D56732] font-medium ${
                  !courseType
                    ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-white border-slate-200"
                }`}
              >
                <option value="">
                  {!courseType ? "Select Course Type first..." : "Select University..."}
                </option>
                {availableUniversities.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.city}, {u.country})
                  </option>
                ))}
              </select>
            </div>

            {/* 6. Course (Dependent on University) */}
            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">
                Course *
              </label>
              <select
                disabled={!universityId}
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className={`w-full p-2.5 border rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#D56732]/20 focus:border-[#D56732] font-medium ${
                  !universityId
                    ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-white border-slate-200"
                }`}
              >
                <option value="">
                  {!universityId ? "Select University first..." : "Select Course..."}
                </option>
                {availableCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.courseName} — {c.tuitionFee} ({c.duration})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Selection Summary Box */}
          {selectedCourseObj && selectedUnivObj && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{selectedCourseObj.courseName}</span>
                <span className="font-bold text-[#D56732] font-mono">{selectedCourseObj.tuitionFee}</span>
              </div>
              <p className="text-slate-600">
                {selectedUnivObj.name} • {selectedCourseObj.campus} • {selectedCourseObj.studyLevel}
              </p>
              <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                <span>Intake: <strong>{intake}</strong></span>
                <span>•</span>
                <span>Commission: <strong>{selectedCourseObj.commissionRate}</strong></span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with disabled/enabled APPLY NEW COURSE button */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 text-xs font-semibold"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!isFormComplete}
            onClick={handleApplyClick}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold tracking-wide uppercase transition-all flex items-center gap-2 ${
              isFormComplete
                ? "bg-[#D56732] hover:bg-[#BA5322] text-white shadow-md shadow-[#D56732]/20 cursor-pointer active:scale-98"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            <span>APPLY NEW COURSE</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
