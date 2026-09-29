"use client";

import React, { useState } from "react";
import { X, SlidersHorizontal, RotateCcw, Check } from "lucide-react";
import { MOCK_UNIVERSITIES } from "@/data/mockData";

export interface ApplicationFilterState {
  camsId: string;
  studentName: string;
  passportNumber: string;
  studentId: string;
  universityCountry: string;
  university: string;
  course: string;
  courseType: string;
  intake: string;
  primaryStatus: string;
  secondaryStatus: string;
  dateAddedFrom: string;
  dateAddedTo: string;
  dateModifiedFrom: string;
  dateModifiedTo: string;
}

export const initialFilterState: ApplicationFilterState = {
  camsId: "",
  studentName: "",
  passportNumber: "",
  studentId: "",
  universityCountry: "all",
  university: "all",
  course: "",
  courseType: "all",
  intake: "all",
  primaryStatus: "all",
  secondaryStatus: "all",
  dateAddedFrom: "",
  dateAddedTo: "",
  dateModifiedFrom: "",
  dateModifiedTo: "",
};

interface ApplicationFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: ApplicationFilterState;
  onApplyFilters: (newFilters: ApplicationFilterState) => void;
  onResetFilters: () => void;
}

export const ApplicationFilterDrawer: React.FC<ApplicationFilterDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
}) => {
  const [localFilters, setLocalFilters] = useState<ApplicationFilterState>(filters);

  if (!isOpen) return null;

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    setLocalFilters(initialFilterState);
    onResetFilters();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-orange-400" />
            <h3 className="text-sm font-bold">ALL APPLICATION FILTERS</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Inputs Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* CAMS ID */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              CAMS ID
            </label>
            <input
              type="text"
              value={localFilters.camsId}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, camsId: e.target.value })
              }
              placeholder="e.g. CAMS-98421"
              className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono"
            />
          </div>

          {/* Student Name */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Student Name
            </label>
            <input
              type="text"
              value={localFilters.studentName}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, studentName: e.target.value })
              }
              placeholder="Filter by student name..."
              className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          {/* Passport & Student ID */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Passport Number
              </label>
              <input
                type="text"
                value={localFilters.passportNumber}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    passportNumber: e.target.value,
                  })
                }
                placeholder="P9482710"
                className="w-full p-2 border border-slate-200 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Student ID
              </label>
              <input
                type="text"
                value={localFilters.studentId}
                onChange={(e) =>
                  setLocalFilters({ ...localFilters, studentId: e.target.value })
                }
                placeholder="STU-2026-891"
                className="w-full p-2 border border-slate-200 rounded-lg font-mono"
              />
            </div>
          </div>

          {/* University Country & University */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                University Country
              </label>
              <select
                value={localFilters.universityCountry}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    universityCountry: e.target.value,
                  })
                }
                className="w-full p-2 border border-slate-200 rounded-lg"
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
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Course Type
              </label>
              <select
                value={localFilters.courseType}
                onChange={(e) =>
                  setLocalFilters({ ...localFilters, courseType: e.target.value })
                }
                className="w-full p-2 border border-slate-200 rounded-lg"
              >
                <option value="all">All Levels</option>
                <option value="Undergraduate">Undergraduate</option>
                <option value="Postgraduate">Postgraduate</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              University
            </label>
            <select
              value={localFilters.university}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, university: e.target.value })
              }
              className="w-full p-2 border border-slate-200 rounded-lg"
            >
              <option value="all">All Universities</option>
              {MOCK_UNIVERSITIES.map((u) => (
                <option key={u.id} value={u.name}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* Course Name */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Course Name Keyword
            </label>
            <input
              type="text"
              value={localFilters.course}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, course: e.target.value })
              }
              placeholder="e.g. Data Science, MBA, Nursing..."
              className="w-full p-2 border border-slate-200 rounded-lg"
            />
          </div>

          {/* Intake */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Intake
            </label>
            <select
              value={localFilters.intake}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, intake: e.target.value })
              }
              className="w-full p-2 border border-slate-200 rounded-lg"
            >
              <option value="all">All Intakes</option>
              <option value="September/October 2026">September/October 2026</option>
              <option value="November/December 2026">November/December 2026</option>
              <option value="January/February 2027">January/February 2027</option>
              <option value="March/April 2027">March/April 2027</option>
              <option value="May/June 2027">May/June 2027</option>
            </select>
          </div>

          {/* Primary Status & Secondary Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Primary Status
              </label>
              <select
                value={localFilters.primaryStatus}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    primaryStatus: e.target.value,
                  })
                }
                className="w-full p-2 border border-slate-200 rounded-lg"
              >
                <option value="all">All Primary</option>
                <option value="Draft">Draft</option>
                <option value="Application Submitted">Application Submitted</option>
                <option value="Under Review">Under Review</option>
                <option value="Submitted to University">Submitted to University</option>
                <option value="Offer Issued">Offer Issued</option>
                <option value="Payment Done">Payment Done</option>
                <option value="CAS Processing">CAS Processing</option>
                <option value="CAS Issued">CAS Issued</option>
                <option value="Visa Processing">Visa Processing</option>
                <option value="Completed">Completed</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Secondary Status
              </label>
              <select
                value={localFilters.secondaryStatus}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    secondaryStatus: e.target.value,
                  })
                }
                className="w-full p-2 border border-slate-200 rounded-lg"
              >
                <option value="all">All Secondary</option>
                <option value="Documents Pending">Documents Pending</option>
                <option value="Documents Verified">Documents Verified</option>
                <option value="Conditional Offer">Conditional Offer</option>
                <option value="Unconditional Offer">Unconditional Offer</option>
                <option value="Deposit Pending">Deposit Pending</option>
                <option value="Deposit Paid">Deposit Paid</option>
                <option value="Commission Pending">Commission Pending</option>
                <option value="Commission Paid">Commission Paid</option>
              </select>
            </div>
          </div>

          {/* Date Added Range */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Date Added Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={localFilters.dateAddedFrom}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    dateAddedFrom: e.target.value,
                  })
                }
                className="w-full p-2 border border-slate-200 rounded-lg text-[11px]"
              />
              <input
                type="date"
                value={localFilters.dateAddedTo}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    dateAddedTo: e.target.value,
                  })
                }
                className="w-full p-2 border border-slate-200 rounded-lg text-[11px]"
              />
            </div>
          </div>

          {/* Date Modified Range */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Date Modified Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={localFilters.dateModifiedFrom}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    dateModifiedFrom: e.target.value,
                  })
                }
                className="w-full p-2 border border-slate-200 rounded-lg text-[11px]"
              />
              <input
                type="date"
                value={localFilters.dateModifiedTo}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    dateModifiedTo: e.target.value,
                  })
                }
                className="w-full p-2 border border-slate-200 rounded-lg text-[11px]"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET FILTERS</span>
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>APPLY FILTERS</span>
          </button>
        </div>
      </div>
    </div>
  );
};
