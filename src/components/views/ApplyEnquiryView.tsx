"use client";

import React, { useState } from "react";
import {
  FileQuestion,
  Globe,
  GraduationCap,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Building2,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export const ApplyEnquiryView: React.FC = () => {
  const [enquiryCountry, setEnquiryCountry] = useState("United Arab Emirates (UAE)");
  const [courseType, setCourseType] = useState("");
  const [intake, setIntake] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const isFormValid = Boolean(enquiryCountry) && Boolean(courseType) && Boolean(intake);

  const enquiryCountries = [
    "United Arab Emirates (UAE)",
    "Saudi Arabia (KSA)",
    "Qatar",
    "Oman",
    "Kuwait",
    "India",
    "Pakistan",
    "Nigeria",
    "Ghana",
    "Other International",
  ];

  const handleApplyNow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setSubmitted(true);
    setTimeout(() => {
      alert(`Pre-assessment enquiry dispatched for ${enquiryCountry} (${courseType} - ${intake}). Official liaison will respond shortly.`);
      setSubmitted(false);
      setCourseType("");
      setIntake("");
    }, 1200);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileQuestion className="w-5 h-5 text-orange-500" />
            Fast Admissions & Visa Pre-Assessment Enquiry
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit student eligibility pre-checks for rapid university board evaluation.
          </p>
        </div>
      </div>

      {/* Dual Cards Layout: Left Card (Illustration/UAE Focus) & Right Card (Fields + Button) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        {/* LEFT CARD: Illustration / UAE Focus */}
        <div className="md:col-span-5 bg-gradient-to-br from-slate-900 via-slate-800 to-[#101218] text-white rounded-2xl p-6 sm:p-7 shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <Globe className="w-6 h-6" />
            </div>

            <div className="inline-block px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-bold uppercase tracking-wider">
              Priority Regional Channel
            </div>

            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              UAE Enquiry
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              Fast-track pre-evaluations for GCC & UAE high school curricula, IB diplomas, and British A-Levels. Immediate conditional eligibility confirmation from top Russell Group and Australian Go8 partners.
            </p>
          </div>

          <div className="pt-6 relative z-10 border-t border-slate-700/60 mt-6 space-y-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Direct regional officer document vetting</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Average response time &lt; 24 business hours</span>
            </div>
          </div>
        </div>

        {/* RIGHT CARD: Select Enquiry Country, Course Type, Intake, Button */}
        <div className="md:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
          <form onSubmit={handleApplyNow} className="space-y-5 text-xs flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-800 text-sm">
                  Admissions Enquiry Parameters
                </span>
                <span className="text-[11px] text-slate-400">
                  Select all required criteria to enable application
                </span>
              </div>

              {/* 1. Select Enquiry Country */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Select Enquiry Country *
                </label>
                <select
                  value={enquiryCountry}
                  onChange={(e) => setEnquiryCountry(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                >
                  {enquiryCountries.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Course Type */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Course Type *
                </label>
                <select
                  value={courseType}
                  onChange={(e) => setCourseType(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                >
                  <option value="">Select Target Course Type...</option>
                  <option value="Undergraduate">Undergraduate (Bachelor&apos;s)</option>
                  <option value="Postgraduate">Postgraduate (Master&apos;s)</option>
                  <option value="Doctorate">Doctorate (PhD / Research)</option>
                  <option value="Diploma">International Foundation / Diploma</option>
                </select>
              </div>

              {/* 3. Intake */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Intake *
                </label>
                <select
                  value={intake}
                  onChange={(e) => setIntake(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                >
                  <option value="">Select Target Intake...</option>
                  <option value="September/October 2026">September/October 2026 Intake</option>
                  <option value="November/December 2026">November/December 2026 Intake</option>
                  <option value="January/February 2027">January/February 2027 Intake</option>
                  <option value="March/April 2027">March/April 2027 Intake</option>
                  <option value="May/June 2027">May/June 2027 Intake</option>
                  <option value="September 2027">September 2027 Intake</option>
                </select>
              </div>
            </div>

            {/* Bottom Button: APPLY NOW */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {!isFormValid ? "Please fill all fields above to proceed" : "All fields verified"}
              </span>

              <button
                type="submit"
                disabled={!isFormValid || submitted}
                className={`px-8 py-3 rounded-xl text-xs font-bold tracking-wide uppercase transition-all flex items-center gap-2 ${
                  isFormValid
                    ? "bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/25 active:scale-98 cursor-pointer"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                <span>{submitted ? "Submitting..." : "APPLY NOW"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
