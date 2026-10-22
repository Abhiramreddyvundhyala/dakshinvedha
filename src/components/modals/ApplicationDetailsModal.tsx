"use client";

import React, { useState } from "react";
import {
  X,
  User,
  GraduationCap,
  Calendar,
  FileText,
  DollarSign,
  Download,
  Building,
  CheckCircle2,
  Send,
  MessageSquare,
  ShieldCheck,
  Globe,
  Mail,
  Phone,
  CreditCard,
  Languages,
  Check,
  AlertCircle,
  FileCheck2,
} from "lucide-react";
import { ApplicationRecord } from "@/types";
import { ApplicationTracker } from "@/components/shared/ApplicationTracker";

interface ApplicationDetailsModalProps {
  application: ApplicationRecord | null;
  onClose: () => void;
}

export const ApplicationDetailsModal: React.FC<ApplicationDetailsModalProps> = ({
  application,
  onClose,
}) => {
  const [newNote, setNewNote] = useState("");
  const [notes, setNotes] = useState(application?.notes || []);

  if (!application) return null;

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    const newN = {
      id: `note-${Date.now()}`,
      author: "Sarah Jenkins",
      date: "29 Sep 2026",
      text: newNote.trim(),
    };
    setNotes([newN, ...notes]);
    setNewNote("");
  };

  const getPrimaryStatusStyle = (status: string) => {
    switch (status) {
      case "Offer Issued":
<<<<<<< HEAD
        return "bg-orange-100 text-orange-800 border-orange-300";
=======
        return "bg-[#FDF5F0] text-[#BA5322] border-[#F5D2C1]";
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
      case "Payment Done":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "CAS Processing":
      case "CAS Issued":
        return "bg-[#FDF5F0] text-[#D56732] border-[#F5D2C1]";
      case "Visa Processing":
      case "Completed":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "Closed":
        return "bg-slate-200 text-slate-700 border-slate-300";
      default:
        return "bg-amber-100 text-amber-800 border-amber-300";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-start justify-between border-b border-slate-800">
          <div className="flex items-center gap-3 sm:gap-4">
<<<<<<< HEAD
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-mono font-bold text-lg">
=======
            <div className="w-12 h-12 rounded-xl bg-[#D56732]/20 border border-[#D56732]/30 flex items-center justify-center text-[#E58D5F] font-mono font-bold text-lg">
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
              {application.camsId.slice(-3)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
<<<<<<< HEAD
                <span className="font-mono text-base font-extrabold text-orange-400">
=======
                <span className="font-mono text-base font-extrabold text-[#E58D5F]">
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                  {application.camsId}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getPrimaryStatusStyle(
                    application.primaryStatus
                  )}`}
                >
                  {application.primaryStatus}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  {application.secondaryStatus}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
                {application.student.name}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {application.university.name} • {application.course.courseName} ({application.course.activeIntake})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body - 11 Clean Structured Sections */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
<<<<<<< HEAD
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <ApplicationTracker application={application} />
=======
          {/* TIMELINE SECTION */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#D56732]" />
                9-Stage Status Timeline
              </span>
              <span className="text-slate-400 text-[11px]">
                Stage {currentTimelineIndex + 1} of 9
              </span>
            </div>

            {/* Horizontal Timeline Bar */}
            <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5 pt-2">
              {fullTimelineStages.map((stage, idx) => {
                const isCompleted = idx < currentTimelineIndex;
                const isCurrent = idx === currentTimelineIndex;
                return (
                  <div
                    key={stage.title}
                    className={`p-2 rounded-lg text-center flex flex-col items-center justify-between border ${
                      isCurrent
                        ? "bg-[#FDF5F0] border-[#D56732] text-[#D56732] font-bold shadow-2xs"
                        : isCompleted
                        ? "bg-[#FDF5F0] border-[#F5D2C1] text-[#BA5322]"
                        : "bg-white border-slate-200 text-slate-400 opacity-60"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold mb-1 ${
                        isCurrent
                          ? "bg-[#D56732] text-white animate-pulse"
                          : isCompleted
                          ? "bg-[#D56732] text-white"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {isCompleted ? "✓" : idx + 1}
                    </div>
                    <span className="text-[10px] line-clamp-1 leading-tight">{stage.title}</span>
                  </div>
                );
              })}
            </div>
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
          </div>

          {/* 1. Student Info & 2. Passport Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Student Information */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-100 pb-2">
<<<<<<< HEAD
                <User className="w-4 h-4 text-[#ea580c]" />
=======
                <User className="w-4 h-4 text-[#D56732]" />
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                <span>1. Student Information</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <p>Full Name: <strong className="text-slate-900">{application.student.name}</strong></p>
                <p>Gender: <strong className="text-slate-900">{application.student.gender}</strong></p>
                <p>DOB: <strong className="text-slate-900">{application.student.dob}</strong></p>
                <p>Nationality: <strong className="text-slate-900">{application.student.nationality}</strong></p>
                <p>Email: <strong className="text-slate-900 truncate block">{application.student.email}</strong></p>
                <p>Phone: <strong className="text-slate-900">{application.student.phone}</strong></p>
              </div>
            </div>

            {/* Passport Information */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-100 pb-2">
<<<<<<< HEAD
                <FileCheck2 className="w-4 h-4 text-[#ea580c]" />
=======
                <FileCheck2 className="w-4 h-4 text-[#D56732]" />
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                <span>2. Passport & Identification</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <p>Passport Number: <strong className="font-mono text-slate-900">{application.student.passportNumber}</strong></p>
                <p>Passport Expiry: <strong className="text-slate-900">{application.student.passportExpiry}</strong></p>
                <p>Student ID: <strong className="font-mono text-slate-900">{application.student.studentId}</strong></p>
                <p>Issuing Country: <strong className="text-slate-900">{application.student.nationality}</strong></p>
              </div>
            </div>
          </div>

          {/* 3. University & 4. Course Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* University Information */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-100 pb-2">
<<<<<<< HEAD
                <Building className="w-4 h-4 text-[#ea580c]" />
=======
                <Building className="w-4 h-4 text-[#D56732]" />
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                <span>3. University & URM Contact</span>
              </div>
              <p>University: <strong className="text-slate-900">{application.university.name}</strong></p>
              <p>Campus & City: <strong className="text-slate-900">{application.course.campus}, {application.university.city} ({application.university.country})</strong></p>
              <div className="pt-2 border-t border-slate-100 space-y-1">
                <p className="text-slate-500">Representative: <strong className="text-slate-800">{application.university.urmRepresentative.name}</strong></p>
                <p className="text-slate-500">Mobile: <strong className="font-mono text-slate-800">{application.university.urmRepresentative.mobile}</strong></p>
                <p className="text-slate-500">Email: <strong className="text-slate-800">{application.university.urmRepresentative.email}</strong></p>
              </div>
            </div>

            {/* Course Information */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-100 pb-2">
<<<<<<< HEAD
                <GraduationCap className="w-4 h-4 text-[#ea580c]" />
=======
                <GraduationCap className="w-4 h-4 text-[#D56732]" />
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                <span>4. Course Selection</span>
              </div>
              <p>Course: <strong className="text-slate-900">{application.course.courseName}</strong></p>
              <p>Level: <strong className="text-slate-900">{application.course.studyLevel}</strong> • Duration: <strong className="text-slate-900">{application.course.duration}</strong></p>
<<<<<<< HEAD
              <p>Intake: <strong className="text-[#ea580c]">{application.course.activeIntake}</strong></p>
=======
              <p>Intake: <strong className="text-[#D56732]">{application.course.activeIntake}</strong></p>
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
              <p>Tuition Fee: <strong className="font-mono text-slate-900">{application.course.tuitionFee}</strong></p>
            </div>
          </div>

          {/* 5. Academic Details & 6. English Test */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-100 pb-2">
<<<<<<< HEAD
                <GraduationCap className="w-4 h-4 text-[#ea580c]" />
=======
                <GraduationCap className="w-4 h-4 text-[#D56732]" />
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                <span>5. Academic History</span>
              </div>
              {application.qualifications.length > 0 ? (
                application.qualifications.map((q) => (
                  <div key={q.id} className="p-2 bg-slate-50 rounded-lg space-y-0.5 text-[11px]">
                    <p className="font-bold text-slate-800">{q.highestQualification}</p>
                    <p className="text-slate-600">{q.institution} ({q.yearCompleted})</p>
<<<<<<< HEAD
                    <p className="text-orange-700 font-semibold">Grade: {q.gradePercentage}</p>
=======
                    <p className="text-[#D56732] font-semibold">Grade: {q.gradePercentage}</p>
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                  </div>
                ))
              ) : (
                <p className="text-slate-400">Standard qualification details on file.</p>
              )}
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-100 pb-2">
<<<<<<< HEAD
                <Languages className="w-4 h-4 text-[#ea580c]" />
=======
                <Languages className="w-4 h-4 text-[#D56732]" />
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                <span>6. English Language Proficiency</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Test:</span>
                  <span className="font-bold text-slate-900">{application.englishProficiency.testType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Overall Score:</span>
<<<<<<< HEAD
                  <span className="font-bold text-[#ea580c]">{application.englishProficiency.overallScore}</span>
=======
                  <span className="font-bold text-[#D56732]">{application.englishProficiency.overallScore}</span>
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                </div>
                <div className="grid grid-cols-4 gap-1 text-[10px] text-center pt-1 border-t border-slate-200">
                  <div className="p-1 bg-white rounded">R: {application.englishProficiency.readingScore}</div>
                  <div className="p-1 bg-white rounded">W: {application.englishProficiency.writingScore}</div>
                  <div className="p-1 bg-white rounded">L: {application.englishProficiency.listeningScore}</div>
                  <div className="p-1 bg-white rounded">S: {application.englishProficiency.speakingScore}</div>
                </div>
              </div>
            </div>
          </div>

          {/* 7. Documents Checklist */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-bold text-slate-900 flex items-center gap-2">
<<<<<<< HEAD
                <FileText className="w-4 h-4 text-[#ea580c]" />
=======
                <FileText className="w-4 h-4 text-[#D56732]" />
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                7. Verification Documents ({application.documents.length})
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {application.documents.map((doc) => (
                <div key={doc.id} className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between border border-slate-200">
                  <div className="flex items-center gap-2">
<<<<<<< HEAD
                    <FileText className="w-4 h-4 text-[#ea580c]" />
=======
                    <FileText className="w-4 h-4 text-[#D56732]" />
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                    <div>
                      <p className="font-semibold text-slate-800 truncate max-w-[200px]">{doc.fileName}</p>
                      <p className="text-[10px] text-slate-400">{doc.category} • {doc.fileSize}</p>
                    </div>
                  </div>
<<<<<<< HEAD
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-800">
=======
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FDF5F0] text-[#BA5322]">
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 8. Application Status & 9. Payment & 10. Commission */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <span className="text-slate-400 uppercase font-bold text-[10px]">8. Application Status</span>
              <p className="font-bold text-slate-900 text-sm">{application.primaryStatus}</p>
              <p className="text-slate-500">{application.secondaryStatus}</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <span className="text-slate-400 uppercase font-bold text-[10px]">9. Tuition & Payment</span>
              <p className="font-bold text-slate-900 text-sm">Gross: {application.payment.grossTuition}</p>
<<<<<<< HEAD
              <p className="text-orange-700">Scholarship: -{application.payment.scholarship}</p>
              <p className="text-slate-600">Net Due: {application.payment.netBalanceDue}</p>
            </div>

            <div className="p-4 bg-orange-50/60 border border-orange-200 rounded-xl space-y-1.5">
              <span className="text-orange-700 uppercase font-bold text-[10px]">10. Commission Status</span>
              <p className="font-bold text-orange-950 text-sm">{application.commission.amount}</p>
=======
              <p className="text-[#D56732]">Scholarship: -{application.payment.scholarship}</p>
              <p className="text-slate-600">Net Due: {application.payment.netBalanceDue}</p>
            </div>

            <div className="p-4 bg-[#FDF5F0]/60 border border-[#F5D2C1] rounded-xl space-y-1.5">
              <span className="text-[#D56732] uppercase font-bold text-[10px]">10. Commission Status</span>
              <p className="font-bold text-[#3C1609] text-sm">{application.commission.amount}</p>
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
              <p className="text-slate-600">Status: <strong className="text-slate-800">{application.commission.status}</strong></p>
            </div>
          </div>

          {/* 11. Notes Section */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <span className="font-bold text-slate-900 flex items-center gap-2">
<<<<<<< HEAD
              <MessageSquare className="w-4 h-4 text-[#ea580c]" />
=======
              <MessageSquare className="w-4 h-4 text-[#D56732]" />
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
              11. Internal Counselor & Case Notes
            </span>

            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add case observation..."
<<<<<<< HEAD
                className="flex-1 p-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#ea580c]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#ea580c] hover:bg-[#c2410c] text-white rounded-lg font-bold cursor-pointer"
=======
                className="flex-1 p-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#D56732]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#D56732] hover:bg-[#BA5322] text-white rounded-lg font-bold cursor-pointer"
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
              >
                Add Note
              </button>
            </form>

            <div className="space-y-1.5">
              {notes.map((n) => (
                <div key={n.id} className="p-2.5 bg-white border border-slate-200 rounded-lg">
                  <p className="text-slate-800">{n.text}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{n.author} • {n.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => alert(`Downloaded application summary PDF for ${application.camsId}`)}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5"
          >
<<<<<<< HEAD
            <Download className="w-3.5 h-3.5 text-[#ea580c]" />
=======
            <Download className="w-3.5 h-3.5 text-[#D56732]" />
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
            <span>Export Application Dossier PDF</span>
          </button>

          <button
            onClick={onClose}
<<<<<<< HEAD
            className="px-6 py-2 bg-[#ea580c] hover:bg-[#c2410c] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
=======
            className="px-6 py-2 bg-[#D56732] hover:bg-[#BA5322] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
