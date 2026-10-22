"use client";

import React, { useState } from "react";
import {
  Search,
  Building,
  GraduationCap,
  Calendar,
  Globe,
  DollarSign,
  SlidersHorizontal,
  ChevronDown,
  Award,
  Clock,
  ArrowRight,
  BookOpen,
  CheckSquare,
  Square,
  FileCheck2,
} from "lucide-react";
import { usePlatform } from "@/context/PlatformContext";
import { CourseInfo, UniversityInfo } from "@/types";
import { ProgramDetailsModal } from "@/components/modals/ProgramDetailsModal";

interface SearchProgramViewProps {
  onApplyCourse: (course: CourseInfo) => void;
}

export const SearchProgramView: React.FC<SearchProgramViewProps> = ({
  onApplyCourse,
}) => {
  const { courses, universities } = usePlatform();
  // Tabs: Courses or Universities
  const [activeTab, setActiveTab] = useState<"courses" | "universities">("courses");

  // Top Search Bar State
  const [searchCourseName, setSearchCourseName] = useState("");
  const [searchCountry, setSearchCountry] = useState("all");
  const [searchNationality, setSearchNationality] = useState("all");
  const [searchCourseType, setSearchCourseType] = useState("all");

  // Left Filter Panel State
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>([]);
  const [activeIntakeOnly, setActiveIntakeOnly] = useState(false);
  const [selectedIntakes, setSelectedIntakes] = useState<string[]>([]);
  const [showMoreIntakes, setShowMoreIntakes] = useState(false);
  const [maxTuition, setMaxTuition] = useState<number>(50000);
  const [selectedDurations, setSelectedDurations] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedEnglishTests, setSelectedEnglishTests] = useState<string[]>([]);
  const [filterScholarship, setFilterScholarship] = useState(false);
  const [filterNoAppFee, setFilterNoAppFee] = useState(false);
  const [interviewFilter, setInterviewFilter] = useState<"all" | "required" | "no-interview">("all");

  // Modal & Selection State
  const [selectedCourseForModal, setSelectedCourseForModal] = useState<CourseInfo | null>(null);
  const [selectedCardCheckboxes, setSelectedCardCheckboxes] = useState<string[]>([]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Intakes list
  const allIntakeOptions = [
    "September/October 2026",
    "November/December 2026",
    "January/February 2027",
    "March/April 2027",
    "Spring 2026",
    "Summer 2026",
    "Spring 2027",
    "May/June 2027",
  ];

  const durationsList = [
    "1 Year",
    "16 Months",
    "1.5 Years",
    "18 Months",
    "20 Months",
    "2 Years",
    "3 Years",
    "3.5 Years",
  ];

  const departmentsList = [
    "Science & Technology",
    "Engineering and Applied Technology",
    "Commerce, Finance and Business",
    "Health and Medical Sciences",
    "Law and Legal Studies",
    "Design, Media and Architecture",
    "Arts and Humanities",
    "Education and Social Sciences",
    "Agriculture and Veterinary Sciences",
    "Hospitality and Tourism Management",
  ];

  const subjectsList = [
    "Computer Science",
    "Engineering",
    "Business",
    "Accounting",
    "Management",
    "Chemistry",
    "Fine Arts",
    "English Literature",
    "History",
    "Modern Languages",
    "Cultural Studies",
    "Sociology",
    "Physics",
  ];

  // Filtering Courses
  const filteredCourses = courses.filter((c) => {
    if (searchCourseName && !c.courseName.toLowerCase().includes(searchCourseName.toLowerCase())) {
      return false;
    }
    if (searchCountry !== "all" && c.country !== searchCountry) {
      return false;
    }
    if (searchCourseType !== "all" && c.studyLevel !== searchCourseType) {
      return false;
    }
    if (selectedUniversities.length > 0 && !selectedUniversities.includes(c.universityName)) {
      return false;
    }
    if (selectedIntakes.length > 0 && !selectedIntakes.some((i) => c.availableIntakes.includes(i))) {
      return false;
    }
    if (c.tuitionFeeNum > maxTuition) {
      return false;
    }
    if (selectedDurations.length > 0 && !selectedDurations.includes(c.duration)) {
      return false;
    }
    if (selectedDepartments.length > 0 && !selectedDepartments.includes(c.department)) {
      return false;
    }
    if (selectedSubjects.length > 0 && !selectedSubjects.includes(c.subject)) {
      return false;
    }
    if (filterScholarship && !c.badges.scholarship) {
      return false;
    }
    if (filterNoAppFee && !c.badges.noAppFee) {
      return false;
    }
    if (interviewFilter === "required" && !c.badges.interviewRequired) {
      return false;
    }
    if (interviewFilter === "no-interview" && c.badges.interviewRequired) {
      return false;
    }
    return true;
  });

  // Pagination Slice
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage) || 1;
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleUniversityCheckbox = (name: string) => {
    setSelectedUniversities((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const toggleIntakeCheckbox = (intakeName: string) => {
    setSelectedIntakes((prev) =>
      prev.includes(intakeName) ? prev.filter((i) => i !== intakeName) : [...prev, intakeName]
    );
  };

  const toggleCardCheckbox = (id: string) => {
    setSelectedCardCheckboxes((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* 1. TOP SEARCH BAR */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Search by Course Name */}
          <div className="relative">
            <label className="block text-slate-500 font-semibold mb-1">
              Search by Course Name
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchCourseName}
                onChange={(e) => {
                  setSearchCourseName(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="e.g. Data Science, MBA..."
<<<<<<< HEAD
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#ea580c]"
=======
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#D56732]"
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
              />
            </div>
          </div>

          {/* University Country */}
          <div>
            <label className="block text-slate-500 font-semibold mb-1">
              University Country
            </label>
            <select
              value={searchCountry}
              onChange={(e) => {
                setSearchCountry(e.target.value);
                setCurrentPage(1);
              }}
<<<<<<< HEAD
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#ea580c]"
=======
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#D56732]"
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
            >
              <option value="all">All Countries</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Australia">Australia</option>
              <option value="Germany">Germany</option>
              <option value="Canada">Canada</option>
              <option value="United States">United States</option>
              <option value="Ireland">Ireland</option>
            </select>
          </div>

          {/* Student Nationality */}
          <div>
            <label className="block text-slate-500 font-semibold mb-1">
              Student Nationality
            </label>
            <select
              value={searchNationality}
              onChange={(e) => setSearchNationality(e.target.value)}
<<<<<<< HEAD
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#ea580c]"
=======
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#D56732]"
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
            >
              <option value="all">All Nationalities</option>
              <option value="Indian">Indian</option>
              <option value="Pakistani">Pakistani</option>
              <option value="Nigerian">Nigerian</option>
              <option value="Ghanaian">Ghanaian</option>
              <option value="Vietnamese">Vietnamese</option>
              <option value="Emirati">Emirati</option>
            </select>
          </div>

          {/* Course Type */}
          <div>
            <label className="block text-slate-500 font-semibold mb-1">
              Course Type
            </label>
            <select
              value={searchCourseType}
              onChange={(e) => {
                setSearchCourseType(e.target.value);
                setCurrentPage(1);
              }}
<<<<<<< HEAD
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#ea580c]"
=======
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#D56732]"
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
            >
              <option value="all">All Study Levels</option>
              <option value="Undergraduate">Undergraduate (Bachelor&apos;s)</option>
              <option value="Postgraduate">Postgraduate (Master&apos;s)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs Row: Courses vs Universities */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("courses")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === "courses"
<<<<<<< HEAD
                ? "bg-[#ea580c] text-white shadow-xs"
=======
                ? "bg-[#D56732] text-white shadow-xs"
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            Courses ({filteredCourses.length})
          </button>
          <button
            onClick={() => setActiveTab("universities")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === "universities"
<<<<<<< HEAD
                ? "bg-[#ea580c] text-white shadow-xs"
=======
                ? "bg-[#D56732] text-white shadow-xs"
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            Universities ({universities.length})
          </button>
        </div>

        <div className="text-xs text-slate-500">
          Showing <strong>{filteredCourses.length}</strong> matching programs
        </div>
      </div>

      {/* Main Grid: LEFT FILTER PANEL + RESULTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT FILTER PANEL (col-span-3) */}
        <div className="lg:col-span-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-5 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
<<<<<<< HEAD
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#ea580c]" />
=======
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#D56732]" />
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
              Filter Programs
            </span>
            <button
              onClick={() => {
                setSelectedUniversities([]);
                setSelectedIntakes([]);
                setSelectedDurations([]);
                setSelectedDepartments([]);
                setSelectedSubjects([]);
                setFilterScholarship(false);
                setFilterNoAppFee(false);
                setMaxTuition(50000);
                setInterviewFilter("all");
              }}
<<<<<<< HEAD
              className="text-[11px] text-[#ea580c] font-bold hover:underline"
=======
              className="text-[11px] text-[#D56732] font-bold hover:underline"
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
            >
              Reset All
            </button>
          </div>

          {/* 1. UNIVERSITY CHECKBOXES */}
          <div className="space-y-2">
            <label className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block">
              University
            </label>
            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
              {universities.slice(0, 8).map((u) => (
                <label key={u.id} className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900">
                  <input
                    type="checkbox"
                    checked={selectedUniversities.includes(u.name)}
                    onChange={() => toggleUniversityCheckbox(u.name)}
<<<<<<< HEAD
                    className="accent-[#ea580c] rounded"
=======
                    className="accent-[#D56732] rounded"
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                  />
                  <span className="truncate">{u.name}</span>
                </label>
              ))}
            </div>
            <button
              onClick={() => alert("Search other universities opened.")}
<<<<<<< HEAD
              className="text-[11px] text-[#ea580c] font-semibold hover:underline block pt-1"
=======
              className="text-[11px] text-[#D56732] font-semibold hover:underline block pt-1"
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
            >
              + Search other universities
            </button>
          </div>

          {/* 2. ACTIVE INTAKE TOGGLE */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
              Active Intake Only
            </span>
            <button
              onClick={() => setActiveIntakeOnly(!activeIntakeOnly)}
              className={`w-9 h-5 rounded-full transition-colors relative ${
<<<<<<< HEAD
                activeIntakeOnly ? "bg-[#ea580c]" : "bg-slate-300"
=======
                activeIntakeOnly ? "bg-[#D56732]" : "bg-slate-300"
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
              }`}
            >
              <div
                className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-transform ${
                  activeIntakeOnly ? "left-4.5" : "left-1"
                }`}
              />
            </button>
          </div>

          {/* 3. COURSE INTAKE CHECKBOXES */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <label className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block">
              Course Intake
            </label>
            <div className="space-y-1.5">
              {(showMoreIntakes ? allIntakeOptions : allIntakeOptions.slice(0, 4)).map((intakeName) => (
                <label key={intakeName} className="flex items-center gap-2 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={selectedIntakes.includes(intakeName)}
                    onChange={() => toggleIntakeCheckbox(intakeName)}
<<<<<<< HEAD
                    className="accent-[#ea580c] rounded"
=======
                    className="accent-[#D56732] rounded"
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                  />
                  <span>{intakeName}</span>
                </label>
              ))}
            </div>
            <button
              onClick={() => setShowMoreIntakes(!showMoreIntakes)}
<<<<<<< HEAD
              className="text-[11px] text-[#ea580c] font-semibold hover:underline pt-1 block"
=======
              className="text-[11px] text-[#D56732] font-semibold hover:underline pt-1 block"
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
            >
              {showMoreIntakes ? "Show less" : "Show more"}
            </button>
          </div>

          {/* 4. TUITION PER YEAR (Range Slider) */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                Tuition Per Year
              </label>
<<<<<<< HEAD
              <span className="font-mono font-bold text-[#ea580c]">
=======
              <span className="font-mono font-bold text-[#D56732]">
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                £0 — £{maxTuition.toLocaleString()}+
              </span>
            </div>
            <input
              type="range"
              min={10000}
              max={50000}
              step={2000}
              value={maxTuition}
              onChange={(e) => setMaxTuition(Number(e.target.value))}
<<<<<<< HEAD
              className="w-full accent-[#ea580c] cursor-pointer"
=======
              className="w-full accent-[#D56732] cursor-pointer"
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
            />
          </div>

          {/* 5. DURATION */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <label className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block">
              Duration
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {durationsList.slice(0, 6).map((dur) => (
                <label key={dur} className="flex items-center gap-1.5 cursor-pointer text-slate-700 text-[11px]">
                  <input
                    type="checkbox"
                    checked={selectedDurations.includes(dur)}
                    onChange={() =>
                      setSelectedDurations((prev) =>
                        prev.includes(dur) ? prev.filter((d) => d !== dur) : [...prev, dur]
                      )
                    }
<<<<<<< HEAD
                    className="accent-[#ea580c] rounded"
=======
                    className="accent-[#D56732] rounded"
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                  />
                  <span>{dur}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 6. DEPARTMENT */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <label className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block">
              Department
            </label>
            <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
              {departmentsList.map((dep) => (
                <label key={dep} className="flex items-center gap-2 cursor-pointer text-slate-700 text-[11px]">
                  <input
                    type="checkbox"
                    checked={selectedDepartments.includes(dep)}
                    onChange={() =>
                      setSelectedDepartments((prev) =>
                        prev.includes(dep) ? prev.filter((d) => d !== dep) : [...prev, dep]
                      )
                    }
<<<<<<< HEAD
                    className="accent-[#ea580c] rounded"
=======
                    className="accent-[#D56732] rounded"
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                  />
                  <span className="truncate">{dep}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 7. OFFERS & INTERVIEW */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <label className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block">
              Offers & Admissions
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-slate-700">
              <input
                type="checkbox"
                checked={filterScholarship}
                onChange={() => setFilterScholarship(!filterScholarship)}
<<<<<<< HEAD
                className="accent-[#ea580c] rounded"
=======
                className="accent-[#D56732] rounded"
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
              />
              <span>Scholarship available</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-slate-700">
              <input
                type="checkbox"
                checked={filterNoAppFee}
                onChange={() => setFilterNoAppFee(!filterNoAppFee)}
<<<<<<< HEAD
                className="accent-[#ea580c] rounded"
=======
                className="accent-[#D56732] rounded"
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
              />
              <span>No application fee</span>
            </label>
          </div>
        </div>

        {/* PROGRAM RESULTS AREA (col-span-9) */}
        <div className="lg:col-span-9 space-y-5">
          {/* TAB 1: COURSES GRID */}
          {activeTab === "courses" && (
            <>
              {/* Responsive Cards: Desktop ~3, Tablet ~2, Mobile ~1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {paginatedCourses.map((c) => {
                  const isChecked = selectedCardCheckboxes.includes(c.id);
                  return (
                    <div
                      key={c.id}
<<<<<<< HEAD
                      className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group hover:border-orange-300"
=======
                      className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group hover:border-[#F5D2C1]"
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                    >
                      {/* Image Gallery */}
                      <div className="h-32 bg-slate-100 relative overflow-hidden">
                        <img
                          src={c.images[0]}
                          alt={c.courseName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />

                        {/* Selection Checkbox */}
                        <button
                          type="button"
                          onClick={() => toggleCardCheckbox(c.id)}
<<<<<<< HEAD
                          className="absolute top-2 left-2 p-1 bg-white/90 rounded-md text-slate-700 hover:text-[#ea580c] shadow-xs cursor-pointer"
                          title="Select program"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-[#ea580c]" />
=======
                          className="absolute top-2 left-2 p-1 bg-white/90 rounded-md text-slate-700 hover:text-[#D56732] shadow-xs cursor-pointer"
                          title="Select program"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-[#D56732]" />
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </button>

                        {/* Top Badges */}
                        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
<<<<<<< HEAD
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ea580c] text-white shadow-xs">
=======
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D56732] text-white shadow-xs">
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                            {c.studyLevel}
                          </span>
                        </div>

                        {/* Bottom Campus & City */}
                        <div className="absolute bottom-2 left-3 right-3 text-white flex items-center justify-between text-[11px]">
                          <span className="truncate font-semibold">{c.universityName}</span>
                          <span className="shrink-0 text-slate-300">{c.city}</span>
                        </div>
                      </div>

                      {/* Card Content Body */}
                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <div className="space-y-1.5">
<<<<<<< HEAD
                          <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-[#ea580c] transition-colors line-clamp-2">
=======
                          <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-[#D56732] transition-colors line-clamp-2">
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                            {c.courseName}
                          </h3>

                          {/* Extra Badges: Scholarship, No App fee, etc. */}
                          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                            {c.badges.scholarship && (
                              <span className="px-1.5 py-0.2 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[9px] font-bold">
                                Scholarship
                              </span>
                            )}
                            {c.badges.noAppFee && (
<<<<<<< HEAD
                              <span className="px-1.5 py-0.2 bg-orange-50 text-orange-700 border border-orange-200 rounded text-[9px] font-bold">
=======
                              <span className="px-1.5 py-0.2 bg-[#FDF5F0] text-[#D56732] border border-[#F5D2C1] rounded text-[9px] font-bold">
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                                No app fee
                              </span>
                            )}
                            {c.badges.interviewRequired && (
                              <span className="px-1.5 py-0.2 bg-purple-50 text-purple-700 border border-purple-200 rounded text-[9px] font-bold">
                                Interview required
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Specs Box */}
                        <div className="p-2.5 bg-slate-50 rounded-xl space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Tuition Fee:</span>
                            <span className="font-bold text-slate-900 font-mono">{c.tuitionFee} / yr</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Duration:</span>
                            <span className="font-medium text-slate-700">{c.duration}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Active Intake:</span>
<<<<<<< HEAD
                            <span className="font-semibold text-[#ea580c]">{c.activeIntake}</span>
=======
                            <span className="font-semibold text-[#D56732]">{c.activeIntake}</span>
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                          </div>
                        </div>

                        {/* Action Buttons: VIEW DETAILS & APPLY NOW */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setSelectedCourseForModal(c)}
                            className="py-2 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>VIEW DETAILS</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onApplyCourse(c)}
<<<<<<< HEAD
                            className="py-2 px-2 bg-[#ea580c] hover:bg-[#c2410c] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition-colors cursor-pointer"
=======
                            className="py-2 px-2 bg-[#D56732] hover:bg-[#BA5322] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition-colors cursor-pointer"
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                          >
                            <span>APPLY NOW</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <span>Page {currentPage} of {totalPages}</span>

                <div className="flex items-center gap-1">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="px-3 py-1.5 bg-slate-100 disabled:opacity-40 rounded-lg font-semibold hover:bg-slate-200"
                  >
                    Previous
                  </button>
                  {[...Array(Math.min(5, totalPages))].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-7 h-7 rounded-lg font-bold ${
                        currentPage === i + 1
<<<<<<< HEAD
                          ? "bg-[#ea580c] text-white"
=======
                          ? "bg-[#D56732] text-white"
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="px-3 py-1.5 bg-slate-100 disabled:opacity-40 rounded-lg font-semibold hover:bg-slate-200"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: UNIVERSITIES TAB */}
          {activeTab === "universities" && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {universities.map((u) => (
                <div
                  key={u.id}
<<<<<<< HEAD
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group hover:border-orange-300"
=======
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group hover:border-[#F5D2C1]"
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                >
                  <div className="h-32 bg-orange-50 relative overflow-hidden">
                    {u.image ? (
                      <img
                        src={u.image}
                        alt={u.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl font-black text-orange-600">{u.name.charAt(0)}</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
                    <span className="absolute top-2 left-2 text-2xl">{u.logo}</span>
                    <div className="absolute bottom-2 left-3 right-3 text-white">
                      <p className="font-bold text-sm truncate">{u.name}</p>
                      <p className="text-[11px] text-slate-300">{u.city}, {u.country}</p>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="space-y-1 text-xs text-slate-600">
                      <p>Available Courses: <strong>{u.availableCoursesCount} programs</strong></p>
                      <p className="text-[11px]">Intakes: {u.availableIntakes.join(", ")}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedUniversities([u.name]);
                          setActiveTab("courses");
                        }}
                        className="py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-center cursor-pointer"
                      >
                        VIEW COURSES
                      </button>
                      <button
                        type="button"
                        onClick={() => alert(`University Prospectus opened for ${u.name}`)}
<<<<<<< HEAD
                        className="py-2 bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold rounded-lg text-center cursor-pointer"
=======
                        className="py-2 bg-[#D56732] hover:bg-[#BA5322] text-white font-bold rounded-lg text-center cursor-pointer"
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                      >
                        VIEW UNIV
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Program Details Modal */}
      <ProgramDetailsModal
        course={selectedCourseForModal}
        onClose={() => setSelectedCourseForModal(null)}
        onApplyNow={(course) => {
          setSelectedCourseForModal(null);
          onApplyCourse(course);
        }}
      />
    </div>
  );
};
