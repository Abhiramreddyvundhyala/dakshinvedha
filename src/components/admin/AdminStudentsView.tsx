"use client";

import React, { useState, useMemo } from "react";
import { usePlatform } from "@/context/PlatformContext";
import { StudentProfile } from "@/types";
import {
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  GraduationCap,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

interface AdminStudentsViewProps {
  onSelectStudent: (student: StudentProfile) => void;
}

export const AdminStudentsView: React.FC<AdminStudentsViewProps> = ({ onSelectStudent }) => {
  const { students } = usePlatform();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    return students.filter((s) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesEmail = s.email.toLowerCase().includes(q);
        const matchesMobile = s.mobile.toLowerCase().includes(q);
        const matchesId = s.studentId.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesMobile && !matchesId) return false;
      }
      if (statusFilter !== "all" && s.accountStatus !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [students, search, statusFilter]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Registered Students
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Complete platform directory of all registered student profiles. Click a student to review education, verify documents, and manage status.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name, ID, email, or mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 rounded-xl border border-slate-200 text-xs"
        >
          <option value="all">All Account Statuses</option>
          <option value="Active">Active</option>
          <option value="Pending Verification">Pending Verification</option>
        </select>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b text-[11px] font-black text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-4">Student</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Passport</th>
                <th className="p-4">Highest Education</th>
                <th className="p-4">English Score</th>
                <th className="p-4">Profile %</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s) => {
                const highestEdu = s.education[s.education.length - 1];
                const test = s.standardizedTests[0];

                return (
                  <tr
                    key={s.id}
                    onClick={() => onSelectStudent(s)}
                    className="hover:bg-purple-50/50 transition-colors cursor-pointer"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 font-extrabold flex items-center justify-center shrink-0">
                          {s.firstName.charAt(0)}
                        </div>
                        <div>
                          <strong className="text-slate-900 block">{s.name}</strong>
                          <span className="font-mono text-[10px] text-purple-700 font-bold">
                            {s.studentId}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="block">{s.email}</span>
                      <span className="text-slate-400 text-[11px] block">{s.mobile}</span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          s.passport.hasPassport === "YES"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {s.passport.status}
                      </span>
                    </td>

                    <td className="p-4">
                      {highestEdu ? (
                        <div>
                          <strong className="text-slate-800 block">
                            {highestEdu.degree || highestEdu.level}
                          </strong>
                          <span className="text-slate-400 text-[11px]">
                            {highestEdu.percentageOrCgpa} ({highestEdu.passOutYear})
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">None entered</span>
                      )}
                    </td>

                    <td className="p-4">
                      {test ? (
                        <span className="font-bold text-slate-800">
                          {test.type}: {test.overallScore}
                        </span>
                      ) : (
                        <span className="text-slate-500">12th Eng: 82/100</span>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-600 rounded-full"
                            style={{ width: `${s.profileCompletion}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-800 text-[11px]">
                          {s.profileCompletion}%
                        </span>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full font-extrabold text-[10px] bg-emerald-100 text-emerald-800">
                        {s.accountStatus}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectStudent(s);
                        }}
                        className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
