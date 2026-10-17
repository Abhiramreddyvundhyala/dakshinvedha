"use client";

import React, { useState } from "react";
import {
  Eye,
  ArrowRight,
  Search,
  Filter,
  GraduationCap,
  Calendar,
  Building,
  User,
  Phone,
  FileCheck2,
} from "lucide-react";
import { ApplicationRecord } from "@/types";

interface LatestApplicationsProps {
  applications: ApplicationRecord[];
  onSelectApplication: (app: ApplicationRecord) => void;
  onViewAllClick: () => void;
}

export const LatestApplications: React.FC<LatestApplicationsProps> = ({
  applications,
  onSelectApplication,
  onViewAllClick,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      searchTerm === "" ||
      app.camsId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.student.passportNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.university.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.course.courseName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || app.primaryStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getPrimaryStatusStyle = (status: string) => {
    switch (status) {
      case "Offer Issued":
        return "bg-[#FDF5F0] text-[#D56732] border-[#F5D2C1]";
      case "Full and Final Payment Done":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "With CAS Team":
        return "bg-[#FDF5F0] text-[#D56732] border-[#F5D2C1]";
      case "Visa Granted":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Case Closed":
        return "bg-slate-100 text-slate-700 border-slate-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 space-y-4">
      {/* Table Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#FDF5F0] border border-[#F5D2C1] flex items-center justify-center text-[#D56732]">
            <FileCheck2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Latest Applications
            </h3>
            <p className="text-[11px] text-slate-400">
              Live tracking of recent student admissions records
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter applications..."
              className="pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#D56732] w-36 sm:w-48"
            />
          </div>

          {/* Status Filter */}
          <div className="relative flex items-center">
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-8 pr-6 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#D56732]"
            >
              <option value="all">All Statuses</option>
              <option value="Offer Issued">Offer Issued</option>
              <option value="Full and Final Payment Done">Full Payment Done</option>
              <option value="With CAS Team">With CAS Team</option>
              <option value="Visa Granted">Visa Granted</option>
              <option value="Application Submitted">Application Submitted</option>
              <option value="Case Closed">Case Closed</option>
            </select>
          </div>

          {/* VIEW ALL Link */}
          <button
            onClick={onViewAllClick}
            className="group flex items-center gap-1 text-xs font-bold text-[#D56732] hover:text-[#BA5322] tracking-wide transition-colors shrink-0 ml-1"
          >
            <span>VIEW ALL</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-y border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              <th className="py-3 px-3">CAMS ID</th>
              <th className="py-3 px-3">Student Name</th>
              <th className="py-3 px-3">University Name</th>
              <th className="py-3 px-3">Course Name</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Date Added</th>
              <th className="py-3 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredApps.length > 0 ? (
              filteredApps.map((app) => (
                <tr
                  key={app.camsId}
                  className="hover:bg-slate-50 transition-colors group"
                >
                  {/* CAMS ID (Clickable) */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <button
                      onClick={() => onSelectApplication(app)}
                      className="font-mono font-bold text-[#D56732] hover:text-[#BA5322] hover:underline flex items-center gap-1"
                      title="Open Application Details"
                    >
                      {app.camsId}
                    </button>
                  </td>

                  {/* Student Column: Name, Passport Number, Student ID */}
                  <td className="py-3.5 px-3">
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-900 group-hover:text-[#D56732] transition-colors">
                        {app.student.name}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <span>
                          Passport: <strong className="font-mono text-slate-700">{app.student.passportNumber}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          ID: <strong className="font-mono text-slate-700">{app.student.studentId}</strong>
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* University Column: University, URM Representative, Contact Number */}
                  <td className="py-3.5 px-3">
                    <div className="space-y-0.5 max-w-[240px]">
                      <p className="font-semibold text-slate-800 line-clamp-1">
                        {app.university.name}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <User className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">
                          {typeof app.university.urmRepresentative === "object"
                            ? app.university.urmRepresentative?.name
                            : app.university.urmRepresentative || "Marcus Sterling"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="font-mono">
                          {typeof app.university.urmRepresentative === "object"
                            ? app.university.urmRepresentative?.phone
                            : (app.university as any).urmContactNumber || "+44 20 8331 8000"}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Course Column: Course Name, Intake */}
                  <td className="py-3.5 px-3">
                    <div className="space-y-0.5 max-w-[240px]">
                      <p className="font-semibold text-slate-800 line-clamp-1">
                        {app.course.courseName}
                      </p>
                      <p className="text-[10px] text-[#D56732] font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {app.course.activeIntake || (app.course as any).intake}
                      </p>
                    </div>
                  </td>

                  {/* Status Column: Primary Status + Secondary Status */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="space-y-1">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getPrimaryStatusStyle(
                          app.primaryStatus
                        )}`}
                      >
                        {app.primaryStatus}
                      </span>
                      <p className="text-[10px] text-slate-500 font-medium pl-1">
                        {app.secondaryStatus}
                      </p>
                    </div>
                  </td>

                  {/* Date Added */}
                  <td className="py-3.5 px-3 whitespace-nowrap text-slate-600 text-xs">
                    {app.dateAdded}
                  </td>

                  {/* Action Column: Eye Icon */}
                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    <button
                      onClick={() => onSelectApplication(app)}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-[#D56732] hover:text-white text-slate-600 inline-flex items-center justify-center transition-colors shadow-2xs"
                      title="View Application Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                  No applications found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Pagination / Footer Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 text-xs text-slate-500">
        <span>
          Showing <strong className="text-slate-800">{filteredApps.length}</strong> of{" "}
          <strong className="text-slate-800">{applications.length}</strong> applications
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-400">
            Real-time status synced with University Central Admissions
          </span>
        </div>
      </div>
    </div>
  );
};
