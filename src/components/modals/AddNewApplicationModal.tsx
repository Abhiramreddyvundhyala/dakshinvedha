"use client";

import React, { useState } from "react";
import {
  X,
  FilePlus,
  User,
  GraduationCap,
  Building,
  Upload,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  FileText,
} from "lucide-react";
import { ApplicationRecord } from "@/types";

interface AddNewApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplicationCreated: (newApp: ApplicationRecord) => void;
}

export const AddNewApplicationModal: React.FC<AddNewApplicationModalProps> = ({
  isOpen,
  onClose,
  onApplicationCreated,
}) => {
  const [step, setStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    studentName: "",
    passportNumber: "",
    studentId: `STU-2026-${Math.floor(100 + Math.random() * 900)}`,
    email: "",
    phone: "",
    nationality: "Indian",
    dob: "2002-05-15",
    gender: "Male",

    // Academics
    highestDegree: "Bachelor of Technology",
    gpaScore: "78%",
    englishTest: "IELTS",
    testScore: "7.0 (L:7.0, R:7.0, W:6.5, S:7.0)",

    // University
    universityName: "University of Greenwich, London",
    courseName: "MSc Data Science & Artificial Intelligence",
    level: "Postgraduate" as "Postgraduate" | "Undergraduate",
    intake: "Sept 2026 Intake",
    tuitionFee: "£17,500",
    campus: "Greenwich Maritime Campus",

    urmRepresentative: "Marcus Sterling - Regional Director",
    urmEmail: "m.sterling@gre.ac.uk",
    urmContactNumber: "+44 20 8331 8000",
  });

  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: string }[]>([
    { name: "Passport_Bio_Data.pdf", size: "1.8 MB" },
    { name: "Graduation_Transcripts.pdf", size: "3.2 MB" },
  ]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const generatedCamsId = `CAMS-${randomSuffix}`;

    const names = (formData.studentName || "Kavya Patel").split(" ");
    const firstName = names[0] || "Kavya";
    const lastName = names.slice(1).join(" ") || "Patel";

    const newApp: ApplicationRecord = {
      camsId: generatedCamsId,
      student: {
        firstName,
        lastName,
        name: formData.studentName || "Kavya Patel",
        passportNumber: formData.passportNumber || "T8291048",
        passportExpiry: "2032-05-15",
        studentId: formData.studentId,
        email: formData.email || "kavya.patel@example.com",
        phone: formData.phone || "+91 98234 56789",
        nationality: formData.nationality,
        dob: formData.dob,
        gender: formData.gender,
        address: {
          country: "India",
          state: "Maharashtra",
          city: "Mumbai",
          postalCode: "400001",
          streetAddress: "MG Road",
        },
      },
      university: {
        id: "univ-gre",
        name: formData.universityName,
        country: "United Kingdom",
        city: "London",
        availableIntakes: ["Sept 2026 Intake", "Jan 2027 Intake"],
        availableCoursesCount: 24,
        logo: "🏛️",
        image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800",
        urmRepresentative: {
          id: "rep-1",
          name: formData.urmRepresentative,
          designation: "Regional Director",
          email: formData.urmEmail,
          phone: formData.urmContactNumber,
          mobile: formData.urmContactNumber,
          whatsapp: formData.urmContactNumber,
        },
      },
      course: {
        id: `course-${Date.now()}`,
        universityId: "univ-gre",
        universityName: formData.universityName,
        courseName: formData.courseName,
        studyLevel: formData.level as any,
        courseType: "Full-Time",
        department: "Computing",
        subject: "Data Science",
        activeIntake: formData.intake,
        availableIntakes: [formData.intake],
        applicationDeadline: "31 Aug 2026",
        city: "London",
        country: "United Kingdom",
        duration: "1 Year Full-Time",
        tuitionFee: formData.tuitionFee,
        tuitionFeeNum: 17500,
        applicationFee: "£0",
        campus: formData.campus,
        images: [],
        badges: {
          scholarship: true,
          freeToApply: true,
          noAppFee: true,
          interviewRequired: false,
        },
        entryRequirements: {
          academic: "Minimum 60% in Bachelor Degree",
          english: "IELTS 6.5 with no band less than 6.0",
        },
        commissionRate: "15%",
      },
      primaryStatus: "Application Submitted",
      secondaryStatus: "Documents Pending",
      dateAdded: "29 Sep 2026",
      dateModified: "29 Sep 2026",
      counselorName: "Sarah Jenkins",
      timeline: [
        {
          status: "Application Created",
          date: "29 Sep 2026",
          description: "New application dossier created via Partner Portal",
          state: "completed",
        },
        {
          status: "Admissions Verification",
          date: "In Queue",
          description: "Dossier under review by Central Admissions team",
          state: "current",
        },
      ],
      qualifications: [
        {
          id: "q-1",
          highestQualification: formData.highestDegree,
          institution: "Previous College",
          course: formData.highestDegree,
          yearCompleted: "2025",
          gradePercentage: formData.gpaScore,
        },
      ],
      englishProficiency: {
        testType: "IELTS",
        overallScore: "7.0",
        readingScore: "7.0",
        writingScore: "6.5",
        listeningScore: "7.0",
        speakingScore: "7.0",
      },
      documents: [
        { id: "doc-1", category: "Passport", fileName: "Passport_Bio_Page.pdf", fileSize: "1.8 MB", progress: 100, status: "Uploaded" },
        { id: "doc-2", category: "Academic Documents", fileName: "Academic_Transcripts.pdf", fileSize: "3.2 MB", progress: 100, status: "Uploaded" },
      ],
      payment: {
        grossTuition: formData.tuitionFee,
        scholarship: "£1,500 (Early Submission Grant)",
        depositPaid: "£0.00",
        netBalanceDue: formData.tuitionFee,
        paymentStatus: "Pending",
      },
      commission: {
        amount: "£2,625",
        eligibleAmount: "£2,625",
        expectedCommission: "£2,625 (15%)",
        status: "Pending",
      },
      notes: [
        {
          id: `note-${Date.now()}`,
          author: "Sarah Jenkins",
          date: "29 Sep 2026",
          text: "Created application dossier via Partner Portal.",
        },
      ],
    };

    onApplicationCreated(newApp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-orange-600 to-amber-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
              <FilePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                Add New Student Application
              </h3>
              <p className="text-xs text-white/90">
                Enroll student into university admissions pipeline
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-Step Indicator */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          {[
            { num: 1, label: "Student Details" },
            { num: 2, label: "Academic Profile" },
            { num: 3, label: "Program Selection" },
            { num: 4, label: "Review & Submit" },
          ].map((s) => (
            <div
              key={s.num}
              className={`flex items-center gap-2 ${
                step === s.num
                  ? "text-orange-600 font-bold"
                  : step > s.num
                  ? "text-emerald-600 font-semibold"
                  : "text-slate-400"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === s.num
                    ? "bg-orange-500 text-white"
                    : step > s.num
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {step > s.num ? "✓" : s.num}
              </div>
              <span className="hidden sm:inline">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Step Body */}
        <form onSubmit={handleCreateSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* STEP 1: Student Information */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <User className="w-4 h-4 text-orange-500" />
                <span>Personal Information</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.studentName}
                    onChange={(e) =>
                      setFormData({ ...formData, studentName: e.target.value })
                    }
                    placeholder="e.g. Kavya Patel"
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Passport Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.passportNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, passportNumber: e.target.value })
                    }
                    placeholder="e.g. T8291048"
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="student@example.com"
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Mobile Phone (with country code) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+91 98234 56789"
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Nationality
                  </label>
                  <select
                    value={formData.nationality}
                    onChange={(e) =>
                      setFormData({ ...formData, nationality: e.target.value })
                    }
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  >
                    <option value="Indian">Indian</option>
                    <option value="Pakistani">Pakistani</option>
                    <option value="Nigerian">Nigerian</option>
                    <option value="Ghanaian">Ghanaian</option>
                    <option value="Vietnamese">Vietnamese</option>
                    <option value="Chinese">Chinese</option>
                    <option value="Emirati">Emirati</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) =>
                      setFormData({ ...formData, dob: e.target.value })
                    }
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Academic Profile */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <GraduationCap className="w-4 h-4 text-orange-500" />
                <span>Academic & Language Proficiency</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Highest Level of Education
                  </label>
                  <input
                    type="text"
                    value={formData.highestDegree}
                    onChange={(e) =>
                      setFormData({ ...formData, highestDegree: e.target.value })
                    }
                    placeholder="e.g. BTech in Computer Science"
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Overall GPA / Percentage
                  </label>
                  <input
                    type="text"
                    value={formData.gpaScore}
                    onChange={(e) =>
                      setFormData({ ...formData, gpaScore: e.target.value })
                    }
                    placeholder="e.g. 78% or 3.6/4.0"
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    English Proficiency Test
                  </label>
                  <select
                    value={formData.englishTest}
                    onChange={(e) =>
                      setFormData({ ...formData, englishTest: e.target.value })
                    }
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  >
                    <option value="IELTS">IELTS Academic</option>
                    <option value="PTE">PTE Academic</option>
                    <option value="TOEFL">TOEFL iBT</option>
                    <option value="Duolingo">Duolingo English Test (DET)</option>
                    <option value="MOI Waiver">Medium of Instruction (MOI Waiver)</option>
                    <option value="Grade 12 Waiver">Grade 12 English &gt;70% Waiver</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Test Score / Breakdown
                  </label>
                  <input
                    type="text"
                    value={formData.testScore}
                    onChange={(e) =>
                      setFormData({ ...formData, testScore: e.target.value })
                    }
                    placeholder="e.g. 7.0 Overall"
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Program Selection */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <Building className="w-4 h-4 text-orange-500" />
                <span>University & Course Selection</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Target University
                  </label>
                  <select
                    value={formData.universityName}
                    onChange={(e) =>
                      setFormData({ ...formData, universityName: e.target.value })
                    }
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  >
                    <option value="University of Greenwich, London">University of Greenwich, London (UK)</option>
                    <option value="Coventry University">Coventry University (UK)</option>
                    <option value="University of Hertfordshire">University of Hertfordshire (UK)</option>
                    <option value="Deakin University">Deakin University (Australia)</option>
                    <option value="Monash University">Monash University (Australia)</option>
                    <option value="University of Birmingham">University of Birmingham (UK)</option>
                    <option value="Technical University of Munich">Technical University of Munich (Germany)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Course Level
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        level: e.target.value as "Postgraduate" | "Undergraduate",
                      })
                    }
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  >
                    <option value="Postgraduate">Postgraduate (Master&apos;s)</option>
                    <option value="Undergraduate">Undergraduate (Bachelor&apos;s)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Program / Course Name
                  </label>
                  <input
                    type="text"
                    value={formData.courseName}
                    onChange={(e) =>
                      setFormData({ ...formData, courseName: e.target.value })
                    }
                    placeholder="e.g. MSc Data Science & Artificial Intelligence"
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Intake
                  </label>
                  <select
                    value={formData.intake}
                    onChange={(e) =>
                      setFormData({ ...formData, intake: e.target.value })
                    }
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  >
                    <option value="Sept 2026 Intake">Sept 2026 Intake</option>
                    <option value="Nov 2026 Intake">Nov 2026 Intake</option>
                    <option value="Jan 2027 Intake">Jan 2027 Intake</option>
                    <option value="Feb 2027 Intake">Feb 2027 Intake</option>
                    <option value="Sept 2027 Intake">Sept 2027 Intake</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Tuition Fee
                  </label>
                  <input
                    type="text"
                    value={formData.tuitionFee}
                    onChange={(e) =>
                      setFormData({ ...formData, tuitionFee: e.target.value })
                    }
                    placeholder="e.g. £17,500"
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Campus Location
                  </label>
                  <input
                    type="text"
                    value={formData.campus}
                    onChange={(e) =>
                      setFormData({ ...formData, campus: e.target.value })
                    }
                    placeholder="e.g. Greenwich Maritime Campus"
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Review & Upload */}
          {step === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <Upload className="w-4 h-4 text-orange-500" />
                <span>Upload Documents & Final Review</span>
              </div>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-slate-200 hover:border-orange-400 rounded-xl p-5 text-center bg-slate-50/50 hover:bg-orange-50/30 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-800">
                  Drag & drop passport scan and academic transcripts here
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Supports PDF, JPG, PNG up to 10 MB per file
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setUploadedFiles([
                      ...uploadedFiles,
                      { name: `Document_${uploadedFiles.length + 1}.pdf`, size: "2.1 MB" },
                    ])
                  }
                  className="mt-3 px-3 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs hover:bg-slate-50"
                >
                  Browse Files
                </button>
              </div>

              {/* Attached files */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-700">Attached Documents:</p>
                {uploadedFiles.map((f, i) => (
                  <div
                    key={i}
                    className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-orange-500" />
                      <span className="font-medium text-slate-800">{f.name}</span>
                      <span className="text-slate-400 text-[10px]">({f.size})</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                      Ready
                    </span>
                  </div>
                ))}
              </div>

              {/* Review Summary */}
              <div className="p-4 bg-orange-50/60 rounded-xl border border-orange-200 text-xs space-y-1.5">
                <p className="font-bold text-orange-950">Application Summary Check:</p>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <p>Candidate: <strong>{formData.studentName || "Kavya Patel"}</strong></p>
                  <p>Passport: <strong>{formData.passportNumber || "T8291048"}</strong></p>
                  <p>University: <strong>{formData.universityName}</strong></p>
                  <p>Intake: <strong>{formData.intake}</strong></p>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Footer Navigation Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-500 hover:text-slate-700 text-xs font-medium"
            >
              Cancel
            </button>

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCreateSubmit}
                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 flex items-center gap-1.5 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Submit Application to Admissions</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
