"use client";

import React, { useState, useMemo } from "react";
import { usePlatform } from "@/context/PlatformContext";
import { UniversityInfo, CourseInfo } from "@/types";
import { evaluateFrontendEligibility } from "@/data/studentSeedData";
import {
  compareByFee,
  courseIntakes,
  type FeeSort,
  hasScholarship,
  intakeBounds,
  intakeOptions,
} from "@/lib/catalogOffers";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  Award,
  BookOpen,
  Mail,
  Phone,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Filter,
  DollarSign,
  Tag,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

interface StudentUniversityDetailsViewProps {
  university: UniversityInfo;
  initialTab?: "details" | "courses";
  onBack: () => void;
  onApplyCourse?: (course: CourseInfo) => void;
  onOpenCourseDetails: (course: CourseInfo) => void;
  allowApply?: boolean;
}

export const StudentUniversityDetailsView: React.FC<StudentUniversityDetailsViewProps> = ({
  university,
  initialTab = "details",
  onBack,
  onApplyCourse,
  onOpenCourseDetails,
  allowApply = true,
}) => {
  const { courses, activeStudent } = usePlatform();

  const [activeTab, setActiveTab] = useState<"details" | "courses">(initialTab);

  // Filters inside university courses
  const [levelFilter, setLevelFilter] = useState<"all" | "Undergraduate" | "Postgraduate">("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [intakeFilter, setIntakeFilter] = useState<string>("all");
  const [durationFilter, setDurationFilter] = useState<string>("all");
  const [feeSort, setFeeSort] = useState<FeeSort>("low");

  // Courses belonging to this university
  const univCourses = useMemo(() => {
    return courses.filter((c) => c.universityId === university.id);
  }, [courses, university.id]);

  // Unique departments for filter
  const departments = useMemo(() => {
    const set = new Set<string>();
    univCourses.forEach((c) => {
      if (c.department) set.add(c.department);
    });
    return Array.from(set);
  }, [univCourses]);

  const intakeChoices = useMemo(() => intakeOptions(univCourses), [univCourses]);
  const scholarshipCourses = useMemo(() => univCourses.filter(hasScholarship), [univCourses]);
  const campuses = useMemo(() => {
    const names = univCourses.map((course) => (course.campus || "").trim()).filter(Boolean);
    return [...new Set(names)];
  }, [univCourses]);

  // Filtered courses
  const filteredCourses = useMemo(() => {
    const matched = univCourses.filter((c) => {
      if (levelFilter !== "all" && c.studyLevel !== levelFilter) return false;
      if (departmentFilter !== "all" && c.department !== departmentFilter) return false;
      if (
        intakeFilter !== "all" &&
        !courseIntakes(c).some((intake) => intake.toLowerCase() === intakeFilter.toLowerCase())
      ) {
        return false;
      }
      if (durationFilter !== "all" && !c.duration.includes(durationFilter)) return false;
      return true;
    });
    return [...matched].sort((left, right) => compareByFee(left, right, feeSort));
  }, [univCourses, levelFilter, departmentFilter, intakeFilter, durationFilter, feeSort]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to All Universities</span>
      </button>

      {/* 1. UNIVERSITY HERO BANNER & HEADER */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Banner Image */}
        <div className="h-48 sm:h-64 relative bg-slate-900">
          <img
            src={university.image}
            alt={university.name}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />

          <div className="absolute bottom-6 left-6 right-6 text-white">
            <div className="flex items-center gap-2 text-xs font-bold text-orange-300">
              <MapPin className="w-3.5 h-3.5" />
              <span>{university.city}, {university.country}</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white mt-0.5">
              {university.name}
            </h1>
          </div>
        </div>

        {/* Inner Tabs: University Profile vs Available Courses */}
        <div className="flex border-b border-slate-200 px-6 gap-6 bg-slate-50/50">
          <button
            onClick={() => setActiveTab("details")}
            className={`py-3.5 text-xs sm:text-sm font-extrabold border-b-2 transition-all cursor-pointer ${
              activeTab === "details"
                ? "border-orange-700 text-orange-800"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            About & Admission Overview
          </button>
          <button
            onClick={() => setActiveTab("courses")}
            className={`py-3.5 text-xs sm:text-sm font-extrabold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "courses"
                ? "border-orange-700 text-orange-800"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>Available Courses</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-orange-100 text-orange-800">
              {univCourses.length}
            </span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: ABOUT & ADMISSIONS OVERVIEW                       */}
      {/* ======================================================== */}
      {activeTab === "details" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Main 2 Columns: Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* About University */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-orange-600" />
                <span>About {university.name}</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {university.about?.trim() ||
                  `${university.name} is listed in ${university.city}, ${university.country}. Course fees and intakes below come from the programmes on file.`}
              </p>

              <div className="pt-2">
                <span className="text-xs font-bold text-slate-800 block mb-1">Campuses:</span>
                <div className="flex flex-wrap gap-2 text-xs">
                  {(campuses.length > 0 ? campuses : [university.city]).map((campus) => (
                    <span key={campus} className="px-3 py-1 bg-slate-100 rounded-lg text-slate-700 font-medium">
                      {campus}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Scholarships & Funding */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-orange-600" />
                <span>Scholarships & Financial Aid</span>
              </h2>
              {scholarshipCourses.length === 0 ? (
                <p className="text-xs text-slate-500">No scholarship is listed for this university.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {scholarshipCourses.map((course) => (
                    <div key={course.id} className="p-4 bg-orange-50/70 border border-orange-200/80 rounded-2xl space-y-1">
                      <span className="font-extrabold text-orange-900 block">{course.courseName}</span>
                      <p className="text-orange-800 font-bold">Scholarship available</p>
                      {course.scholarshipsInfo ? (
                        <p className="text-[11px] text-orange-700">{course.scholarshipsInfo}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Entry Requirements & English Requirements */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-orange-600" />
                <span>Entry & English Requirements</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Academic Criteria */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <span className="font-extrabold text-slate-900 block">
                    Undergraduate Admission
                  </span>
                  <ul className="list-disc list-inside text-slate-600 space-y-1 text-[11px]">
                    <li>Minimum 60%–65% in 12th Standard / CBSE / State Board</li>
                    <li>Mathematics required for Computer Science / Engineering</li>
                    <li>Recognized Diploma transfers eligible for Year 2 entry</li>
                  </ul>

                  <span className="font-extrabold text-slate-900 block pt-2">
                    Postgraduate Admission
                  </span>
                  <ul className="list-disc list-inside text-slate-600 space-y-1 text-[11px]">
                    <li>Recognized 3 or 4-year Bachelor&apos;s degree (min 58%–65% or 6.5/10 CGPA)</li>
                    <li>Maximum 2 to 4 active backlogs accepted</li>
                    <li>Relevant work experience considered for mature applicants</li>
                  </ul>
                </div>

                {/* English Language Criteria */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <span className="font-extrabold text-slate-900 block">
                    Accepted English Examinations
                  </span>
                  <div className="space-y-1 text-[11px] text-slate-700">
                    <p>• <strong>IELTS:</strong> Overall 6.5 (Minimum 6.0 in each sub-band)</p>
                    <p>• <strong>TOEFL iBT:</strong> Overall 88 (Reading 20, Writing 20)</p>
                    <p>• <strong>PTE Academic:</strong> Overall 58 (no element below 51)</p>
                    <p>• <strong>Duolingo (DET):</strong> Overall 115–125</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <span className="font-bold text-orange-700 block text-[11px]">
                      English Waiver Criteria:
                    </span>
                    <p className="text-[11px] text-slate-600">
                      70%+ in standard 12th English (CBSE / ICSE / State Board) can qualify for full language test exemption.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact & Quick Links */}
          <div className="space-y-6">
            {/* Available Intakes Card */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-3 text-xs">
              <h3 className="font-extrabold text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-orange-600" />
                <span>Available Intakes</span>
              </h3>
              <p className="text-[11px] text-slate-500">Intake range {intakeBounds(univCourses)}</p>
              <div className="space-y-2">
                {intakeChoices.length === 0 ? (
                  <p className="text-slate-500">Intake not set</p>
                ) : (
                  intakeChoices.map((intake) => (
                    <div
                      key={intake}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <span className="font-bold text-slate-800">{intake}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* University Representative Contact */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-3 text-xs">
              <h3 className="font-extrabold text-slate-900 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-orange-600" />
                <span>Admissions Liaison Office</span>
              </h3>
              <div className="p-3 bg-slate-50 rounded-2xl space-y-2 text-slate-700">
                <p className="font-bold text-slate-900 text-sm">
                  {university.urmRepresentative.name}
                </p>
                <p className="text-slate-500 text-[11px]">
                  {university.urmRepresentative.designation}
                </p>
                <div className="pt-2 border-t border-slate-200 space-y-1 text-[11px]">
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{university.urmRepresentative.phone}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{university.urmRepresentative.email}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{university.urmRepresentative.officeHours || "09:00 - 17:30"}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* CTA to view courses */}
            <button
              onClick={() => setActiveTab("courses")}
              className="w-full py-3 bg-orange-700 hover:bg-orange-800 text-white font-extrabold text-xs rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore All {univCourses.length} Courses</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: AVAILABLE COURSES WITH INNER FILTERS              */}
      {/* ======================================================== */}
      {activeTab === "courses" && (
        <div className="space-y-6 animate-fade-in">
          {/* Inner Courses Filter Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-orange-600" />
                <span>Filter Courses at {university.name}</span>
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {filteredCourses.length} matching course(s)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              {/* Study Level Filter */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Study Level</label>
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value as any)}
                  className="w-full p-2 rounded-xl border border-slate-200 text-xs"
                >
                  <option value="all">All Study Levels</option>
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="Postgraduate">Postgraduate</option>
                </select>
              </div>

              {/* Department */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Department</label>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 text-xs"
                >
                  <option value="all">All Departments</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Intake */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Intake</label>
                <select
                  value={intakeFilter}
                  onChange={(e) => setIntakeFilter(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 text-xs"
                >
                  <option value="all">All Intakes</option>
                  {intakeChoices.map((intake) => (
                    <option key={intake} value={intake}>
                      {intake}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Duration</label>
                <select
                  value={durationFilter}
                  onChange={(e) => setDurationFilter(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 text-xs"
                >
                  <option value="all">All Durations</option>
                  <option value="1">1 Year</option>
                  <option value="2">2 Years</option>
                  <option value="3">3 Years</option>
                  <option value="4">4 Years</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Sort by tuition</label>
                <select
                  value={feeSort}
                  onChange={(e) => setFeeSort(e.target.value as FeeSort)}
                  className="w-full p-2 rounded-xl border border-slate-200 text-xs"
                >
                  <option value="low">Low to high</option>
                  <option value="high">High to low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Courses List */}
          {filteredCourses.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No courses match the active filters.</p>
              <button
                onClick={() => {
                  setLevelFilter("all");
                  setDepartmentFilter("all");
                  setIntakeFilter("all");
                  setDurationFilter("all");
                  setFeeSort("low");
                }}
                className="text-xs text-orange-700 font-bold hover:underline cursor-pointer"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredCourses.map((course) => {
                const eligibility = evaluateFrontendEligibility(activeStudent, course);
                return (
                  <div
                    key={course.id}
                    className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs hover:shadow-md hover:border-orange-300 transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-3">
                      {/* Badges row: Scholarship, No App Fee, Applications Open */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {course.studyLevel}
                        </span>
                        {hasScholarship(course) && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                            Scholarship available
                          </span>
                        )}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                          Applications Open
                        </span>
                        {course.badges.noAppFee && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                            No App Fee
                          </span>
                        )}
                      </div>

                      {/* Course Name & University */}
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 group-hover:text-orange-700 transition-colors">
                          {course.courseName}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {course.campus} • {course.department}
                        </p>
                      </div>

                      {/* Key specs */}
                      <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl text-[11px]">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Duration</span>
                          <strong className="text-slate-800">{course.duration}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Tuition Fee</span>
                          <strong className="text-slate-800">{course.tuitionFee || "Fee not set"}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Intake</span>
                          <strong className="text-slate-800 block truncate">
                            {intakeBounds([course])}
                          </strong>
                        </div>
                      </div>

                      {/* Live Eligibility Badge */}
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">Your Match Status:</span>
                        <span
                          className={`font-extrabold px-2 py-0.5 rounded-md ${
                            eligibility.status === "Likely Eligible"
                              ? "bg-orange-100 text-orange-800"
                              : eligibility.status === "Requirements Need Review"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-sky-100 text-sky-800"
                          }`}
                        >
                          {eligibility.status}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons: VIEW DETAILS & APPLY NOW */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => onOpenCourseDetails(course)}
                        className="flex-1 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer text-center"
                      >
                        VIEW DETAILS
                      </button>
                      {allowApply && onApplyCourse && (
                        <button
                          onClick={() => onApplyCourse(course)}
                          className="flex-1 py-2 text-xs font-black text-white bg-orange-700 hover:bg-orange-800 rounded-xl shadow-xs transition-all cursor-pointer text-center flex items-center justify-center gap-1 active:scale-98"
                        >
                          <span>APPLY NOW</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
