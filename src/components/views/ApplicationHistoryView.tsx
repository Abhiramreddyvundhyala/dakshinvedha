"use client";

import React, { useState } from "react";
import {
  RefreshCw,
  Download,
  SlidersHorizontal,
  Eye,
  Settings,
  XCircle,
  Calendar,
  ArrowUpDown,
  Building,
  User,
  Phone,
  X,
  FileCheck2,
} from "lucide-react";
import { ApplicationRecord } from "@/types";
import {
  ApplicationFilterDrawer,
  ApplicationFilterState,
  initialFilterState,
} from "@/components/modals/ApplicationFilterDrawer";
import { ConfirmDialog } from "@/components/modals/ConfirmDialog";

interface ApplicationHistoryViewProps {
  applications: ApplicationRecord[];
  onSelectApplication: (app: ApplicationRecord) => void;
  onOpenAddNewModal: () => void;
  onCancelApplication?: (camsId: string) => void;
}

export const ApplicationHistoryView: React.FC<ApplicationHistoryViewProps> = ({
  applications,
  onSelectApplication,
  onOpenAddNewModal,
  onCancelApplication,
}) => {
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<ApplicationFilterState>(initialFilterState);
  const [sortAsc, setSortAsc] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [appToCancel, setAppToCancel] = useState<ApplicationRecord | null>(null);

  // Apply filtering
  const filteredApps = applications.filter((app) => {
    if (filters.camsId && !app.camsId.toLowerCase().includes(filters.camsId.toLowerCase())) {
      return false;
    }
    if (filters.studentName && !app.student.name.toLowerCase().includes(filters.studentName.toLowerCase())) {
      return false;
    }
    if (filters.passportNumber && !app.student.passportNumber.toLowerCase().includes(filters.passportNumber.toLowerCase())) {
      return false;
    }
    if (filters.studentId && !app.student.studentId.toLowerCase().includes(filters.studentId.toLowerCase())) {
      return false;
    }
    if (filters.universityCountry !== "all" && app.university.country !== filters.universityCountry) {
      return false;
    }
    if (filters.university !== "all" && app.university.name !== filters.university) {
      return false;
    }
    if (filters.course && !app.course.courseName.toLowerCase().includes(filters.course.toLowerCase())) {
      return false;
    }
    if (filters.courseType !== "all" && app.course.studyLevel !== filters.courseType) {
      return false;
    }
    if (filters.intake !== "all" && app.course.activeIntake !== filters.intake) {
      return false;
    }
    if (filters.primaryStatus !== "all" && app.primaryStatus !== filters.primaryStatus) {
      return false;
    }
    if (filters.secondaryStatus !== "all" && app.secondaryStatus !== filters.secondaryStatus) {
      return false;
    }
    if (filters.dateAddedFrom && app.dateAdded < filters.dateAddedFrom) {
      return false;
    }
    if (filters.dateAddedTo && app.dateAdded > filters.dateAddedTo) {
      return false;
    }
    if (filters.dateModifiedFrom && app.dateModified < filters.dateModifiedFrom) {
      return false;
    }
    if (filters.dateModifiedTo && app.dateModified > filters.dateModifiedTo) {
      return false;
    }
    return true;
  });

  // Sort by Date Modified
  const sortedApps = [...filteredApps].sort((a, b) => {
    return sortAsc
      ? a.dateModified.localeCompare(b.dateModified)
      : b.dateModified.localeCompare(a.dateModified);
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const downloadAllData = () => {
    const headers = "CAMS ID,Student Name,Passport No,Student ID,University Name,URM Name,URM Contact,Course Name,Intake,Primary Status,Secondary Status,Date Added,Date Modified\n";
    const rows = sortedApps
      .map(
        (a) =>
          `"${a.camsId}","${a.student.name}","${a.student.passportNumber}","${a.student.studentId}","${a.university.name}","${typeof a.university.urmRepresentative === 'object' ? a.university.urmRepresentative?.name : a.university.urmRepresentative || ''}","${typeof a.university.urmRepresentative === 'object' ? a.university.urmRepresentative?.phone : ''}","${a.course.courseName}","${a.course.activeIntake || (a.course as any).intake || ''}","${a.primaryStatus}","${a.secondaryStatus}","${a.dateAdded}","${a.dateModified}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Application_History_Complete_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  // Active filter chips detection
  const activeChips: { key: keyof ApplicationFilterState; label: string }[] = [];
  if (filters.camsId) activeChips.push({ key: "camsId", label: `CAMS: ${filters.camsId}` });
  if (filters.studentName) activeChips.push({ key: "studentName", label: `Name: ${filters.studentName}` });
  if (filters.passportNumber) activeChips.push({ key: "passportNumber", label: `Passport: ${filters.passportNumber}` });
  if (filters.universityCountry !== "all") activeChips.push({ key: "universityCountry", label: `Country: ${filters.universityCountry}` });
  if (filters.university !== "all") activeChips.push({ key: "university", label: `Univ: ${filters.university}` });
  if (filters.courseType !== "all") activeChips.push({ key: "courseType", label: `Type: ${filters.courseType}` });
  if (filters.intake !== "all") activeChips.push({ key: "intake", label: `Intake: ${filters.intake}` });
  if (filters.primaryStatus !== "all") activeChips.push({ key: "primaryStatus", label: `Status: ${filters.primaryStatus}` });

  const removeChip = (key: keyof ApplicationFilterState) => {
    setFilters({ ...filters, [key]: initialFilterState[key] });
  };

  const getPrimaryStatusBadge = (status: string) => {
    switch (status) {
      case "Offer Issued":
        return "bg-[#FDF5F0] text-[#D56732] border-[#F5D2C1]";
      case "Payment Done":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "CAS Processing":
      case "CAS Issued":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "Visa Processing":
      case "Completed":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Closed":
        return "bg-slate-100 text-slate-700 border-slate-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Page Header */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Application History</span>
            <button
              onClick={handleRefresh}
              className={`p-1 text-slate-400 hover:text-orange-600 transition-colors ${
                isRefreshing ? "animate-spin text-orange-600" : ""
              }`}
              title="Refresh Records"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete database of student application dossiers and status audits.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={downloadAllData}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4 text-orange-600" />
            <span>Download All Student Data</span>
          </button>

          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>ALL FILTERS</span>
            {activeChips.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-white text-orange-600 text-[10px] font-bold flex items-center justify-center">
                {activeChips.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeChips.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-xs bg-orange-50/40 p-3 rounded-xl border border-orange-200/60 animate-fade-in">
          <span className="font-bold text-orange-950 text-[11px] uppercase tracking-wider">
            Active Filters:
          </span>
          {activeChips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-orange-200 text-orange-800 rounded-lg text-xs font-semibold shadow-2xs"
            >
              <span>{chip.label}</span>
              <button
                onClick={() => removeChip(chip.key)}
                className="hover:text-rose-600 font-bold"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button
            onClick={() => setFilters(initialFilterState)}
            className="text-xs text-orange-600 hover:text-orange-700 font-bold underline ml-2"
          >
            CLEAR ALL
          </button>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">CAMS ID</th>
                <th className="py-3 px-3">Student Name</th>
                <th className="py-3 px-3">University Name</th>
                <th className="py-3 px-3">Course Name</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Date Added</th>
                <th className="py-3 px-3">
                  <button
                    onClick={() => setSortAsc(!sortAsc)}
                    className="flex items-center gap-1 font-bold text-slate-700 hover:text-orange-600"
                    title="Sort by Date Modified"
                  >
                    <span>Date Modified</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedApps.length > 0 ? (
                sortedApps.map((app) => (
                  <tr
                    key={app.camsId}
                    className="hover:bg-orange-50/40 transition-colors group"
                  >
                    {/* CAMS ID */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <button
                        onClick={() => onSelectApplication(app)}
                        className="font-mono font-bold text-orange-600 hover:text-orange-700 hover:underline"
                        title="Click to view full record"
                      >
                        {app.camsId}
                      </button>
                    </td>

                    {/* Student Name: Name, Passport No, Student ID */}
                    <td className="py-3 px-3">
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
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

                    {/* University Name: University Name, URM Details */}
                    <td className="py-3 px-3">
                      <div className="space-y-0.5 max-w-[220px]">
                        <p className="font-semibold text-slate-800 line-clamp-1">
                          {app.university.name}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500">
                          <User className="w-3 h-3 text-slate-400" />
                          <span className="truncate">
                            {typeof app.university.urmRepresentative === "object"
                              ? app.university.urmRepresentative?.name
                              : app.university.urmRepresentative || "Marcus Sterling"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>
                            {typeof app.university.urmRepresentative === "object"
                              ? app.university.urmRepresentative?.phone
                              : (app.university as any).urmContactNumber || "+44 20 8331 8000"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Course Name: Course Name, Intake */}
                    <td className="py-3 px-3">
                      <div className="space-y-0.5 max-w-[220px]">
                        <p className="font-semibold text-slate-800 line-clamp-1">
                          {app.course.courseName}
                        </p>
                        <p className="text-[10px] text-orange-600 font-medium">
                          {app.course.activeIntake}
                        </p>
                      </div>
                    </td>

                    {/* Status: Primary Status, Secondary Status */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="space-y-1">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getPrimaryStatusBadge(
                            app.primaryStatus
                          )}`}
                        >
                          {app.primaryStatus}
                        </span>
                        <p className="text-[10px] text-slate-500 pl-1">
                          {app.secondaryStatus}
                        </p>
                      </div>
                    </td>

                    {/* Date Added */}
                    <td className="py-3 px-3 whitespace-nowrap text-slate-600">
                      {app.dateAdded}
                    </td>

                    {/* Date Modified */}
                    <td className="py-3 px-3 whitespace-nowrap text-slate-600 font-medium">
                      {app.dateModified}
                    </td>

                    {/* Actions: View, Manage, Cancel */}
                    <td className="py-3 px-3 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onSelectApplication(app)}
                          className="p-1.5 bg-slate-100 hover:bg-orange-500 hover:text-white text-slate-600 rounded-lg transition-colors"
                          title="View Application Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onSelectApplication(app)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-800 hover:text-white text-slate-600 rounded-lg transition-colors"
                          title="Manage Dossier"
                        >
                          <Settings className="w-3.5 h-3.5" />
                        </button>

                        {app.primaryStatus !== "Closed" && (
                          <button
                            onClick={() => setAppToCancel(app)}
                            className="p-1.5 bg-slate-100 hover:bg-rose-600 hover:text-white text-slate-600 rounded-lg transition-colors"
                            title="Cancel Application"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    <p className="text-sm font-semibold text-slate-600">No applications found</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Try changing or removing some active filters.
                    </p>
                    <button
                      onClick={() => setFilters(initialFilterState)}
                      className="mt-3 px-4 py-1.5 bg-orange-50 text-orange-600 border border-orange-200 rounded-lg font-bold hover:bg-orange-100"
                    >
                      CLEAR FILTERS
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Showing <strong>{sortedApps.length}</strong> of <strong>{applications.length}</strong> applications</span>
          <span>Sort: Date Modified ({sortAsc ? "Oldest First" : "Newest First"})</span>
        </div>
      </div>

      {/* Filter Drawer */}
      <ApplicationFilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        filters={filters}
        onApplyFilters={(f) => setFilters(f)}
        onResetFilters={() => setFilters(initialFilterState)}
      />

      {/* Destructive Cancel Application Confirmation Modal */}
      {appToCancel && (
        <ConfirmDialog
          isOpen={Boolean(appToCancel)}
          title="Cancel Application?"
          message={`Are you sure you want to cancel the application for ${appToCancel.student.name} (${appToCancel.camsId})? This will mark the file as closed in the admissions pipeline.`}
          confirmText="CANCEL APPLICATION"
          cancelText="KEEP APPLICATION"
          onCancel={() => setAppToCancel(null)}
          onConfirm={() => {
            if (onCancelApplication) {
              onCancelApplication(appToCancel.camsId);
            }
            setAppToCancel(null);
          }}
        />
      )}
    </div>
  );
};
