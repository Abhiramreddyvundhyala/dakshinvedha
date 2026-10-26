"use client";

import React, { useState, useMemo } from "react";
import { usePlatform } from "@/context/PlatformContext";
import { UniversityInfo } from "@/types";
import {
  collegeHasScholarship,
  courseIntakes,
  extremeFee,
  type FeeSort,
  intakeBounds,
  intakeOptions,
} from "@/lib/catalogOffers";
import {
  Search,
  Filter,
  MapPin,
  Building2,
  BookOpen,
  Calendar,
  Sparkles,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  X,
} from "lucide-react";

interface StudentUniversitiesViewProps {
  onSelectUniversity: (univ: UniversityInfo, targetSection?: "details" | "courses") => void;
}

export const StudentUniversitiesView: React.FC<StudentUniversitiesViewProps> = ({
  onSelectUniversity,
}) => {
  const { universities, courses } = usePlatform();

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedStudyLevel, setSelectedStudyLevel] = useState("all");
  const [selectedIntake, setSelectedIntake] = useState("all");
  const [feeSort, setFeeSort] = useState<FeeSort>("low");
  const [scholarshipOnly, setScholarshipOnly] = useState(false);

  // Available countries
  const countries = useMemo(() => {
    const set = new Set<string>();
    universities.forEach((u) => set.add(u.country));
    return Array.from(set);
  }, [universities]);

  const intakeChoices = useMemo(() => intakeOptions(courses), [courses]);

  // Filtered universities
  const filteredUniversities = useMemo(() => {
    const matched = universities.filter((u) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = u.name.toLowerCase().includes(q);
        const matchesCity = u.city.toLowerCase().includes(q);
        const matchesCountry = u.country.toLowerCase().includes(q);
        if (!matchesName && !matchesCity && !matchesCountry) return false;
      }

      // 2. Country
      if (selectedCountry !== "all" && u.country !== selectedCountry) {
        return false;
      }

      const univCourses = courses.filter((c) => c.universityId === u.id);

      if (selectedIntake !== "all") {
        const hasIntake = univCourses.some((course) =>
          courseIntakes(course).some((intake) => intake.toLowerCase() === selectedIntake.toLowerCase())
        );
        if (!hasIntake) return false;
      }

      if (selectedStudyLevel !== "all") {
        const hasLevel = univCourses.some((c) => c.studyLevel === selectedStudyLevel);
        if (!hasLevel) return false;
      }

      if (scholarshipOnly && !collegeHasScholarship(univCourses)) {
        return false;
      }

      return true;
    });
    return [...matched].sort((left, right) => {
      const leftCourses = courses.filter((course) => course.universityId === left.id);
      const rightCourses = courses.filter((course) => course.universityId === right.id);
      const delta = extremeFee(leftCourses, feeSort) - extremeFee(rightCourses, feeSort);
      return (feeSort === "low" ? delta : -delta) || left.name.localeCompare(right.name);
    });
  }, [
    universities,
    courses,
    searchQuery,
    selectedCountry,
    selectedStudyLevel,
    selectedIntake,
    feeSort,
    scholarshipOnly,
  ]);

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCountry("all");
    setSelectedStudyLevel("all");
    setSelectedIntake("all");
    setFeeSort("low");
    setScholarshipOnly(false);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Title & Introduction */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-800 text-xs font-bold border border-orange-200 mb-2">
          <Building2 className="w-3.5 h-3.5" />
          <span>Global Partner Network</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Discover Universities
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
          Browse world-recognized higher education institutions across the UK, Australia, Europe, and North America. Click on any university to view available degree courses and admission criteria.
        </p>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search University by name, city, or country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600 transition-all bg-slate-50/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          {/* Country */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Country</label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
            >
              <option value="all">All Countries</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Study Level */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Study Level</label>
            <select
              value={selectedStudyLevel}
              onChange={(e) => setSelectedStudyLevel(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
            >
              <option value="all">All Levels</option>
              <option value="Undergraduate">Undergraduate</option>
              <option value="Postgraduate">Postgraduate</option>
              <option value="Doctorate">Doctorate</option>
            </select>
          </div>

          {/* Intake */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Intake</label>
            <select
              value={selectedIntake}
              onChange={(e) => setSelectedIntake(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
            >
              <option value="all">All Intakes</option>
              {intakeChoices.map((intake) => (
                <option key={intake} value={intake}>
                  {intake}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Sort by tuition</label>
            <select
              value={feeSort}
              onChange={(e) => setFeeSort(e.target.value as FeeSort)}
              className="w-full p-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
            >
              <option value="low">Low to high</option>
              <option value="high">High to low</option>
            </select>
          </div>

          {/* Scholarship Available Checkbox */}
          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 bg-white cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={scholarshipOnly}
                onChange={(e) => setScholarshipOnly(e.target.checked)}
                className="rounded text-orange-600 focus:ring-orange-500 w-3.5 h-3.5"
              />
              <span className="font-bold text-slate-700 text-[11px]">Scholarship Available</span>
            </label>
          </div>

          {/* Reset Filters */}
          <div className="flex flex-col justify-end">
            <button
              onClick={clearAllFilters}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold transition-colors cursor-pointer text-center"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Count Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong>{filteredUniversities.length}</strong> Universities
        </span>
      </div>

      {/* UNIVERSITIES GRID */}
      {filteredUniversities.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-extrabold text-slate-900">No Universities Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try resetting your filters or adjusting your search keywords to view available institutions.
          </p>
          <button
            onClick={clearAllFilters}
            className="px-4 py-2 bg-orange-700 hover:bg-orange-800 text-white font-bold text-xs rounded-xl cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUniversities.map((univ) => {
            const univCourses = courses.filter((c) => c.universityId === univ.id);
            return (
              <div
                key={univ.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-lg hover:border-orange-300 transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* University Image & Logo Header */}
                <div>
                  <div className="h-44 bg-slate-100 relative overflow-hidden">
                    <img
                      src={univ.image}
                      alt={univ.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                    {/* Logo & Country Flag */}
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl shadow-sm flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <span>{univ.logo}</span>
                      <span>{univ.country}</span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <span className="text-[10px] font-bold text-orange-300 bg-black/40 px-2 py-0.5 rounded backdrop-blur-xs">
                        {univ.city}
                      </span>
                      <h2 className="text-base font-black tracking-tight leading-snug mt-1 drop-shadow-xs">
                        {univ.name}
                      </h2>
                    </div>
                  </div>

                  {/* University Info Body */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Available Programs:</span>
                      <span className="font-extrabold text-orange-800 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200/60">
                        {univCourses.length || univ.availableCoursesCount} Courses
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-500">Intake</span>
                        <span className="font-semibold text-slate-800 text-right">{intakeBounds(univCourses)}</span>
                      </div>
                      {collegeHasScholarship(univCourses) && (
                        <span className="inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                          Scholarship available
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Buttons: VIEW UNIVERSITY & VIEW COURSES */}
                <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onSelectUniversity(univ, "details")}
                    className="py-2.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer text-center"
                  >
                    VIEW UNIVERSITY
                  </button>
                  <button
                    onClick={() => onSelectUniversity(univ, "courses")}
                    className="py-2.5 text-xs font-extrabold text-white bg-orange-700 hover:bg-orange-800 rounded-xl shadow-xs transition-all cursor-pointer text-center flex items-center justify-center gap-1 active:scale-98"
                  >
                    <span>VIEW COURSES</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
