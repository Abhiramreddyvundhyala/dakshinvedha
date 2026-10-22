"use client";

import React, { useState } from "react";
import {
  X,
  User,
  MapPin,
  GraduationCap,
  Languages,
  BookOpen,
  FileText,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  UploadCloud,
  Save,
  Check,
  Building,
} from "lucide-react";
import {
  ApplicationRecord,
  CourseInfo,
  QualificationItem,
  DocumentUploadItem,
} from "@/types";
import { usePlatform } from "@/context/PlatformContext";
import { buildTimeline, createTrackingId } from "@/utils/tracking";

interface ApplicationWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCourseSelection?: {
    countryToApply: string;
    studentPassportCountry: string;
    intake: string;
    courseType: string;
    university: string;
    course: CourseInfo;
  } | null;
  onApplicationSubmitted: (app: ApplicationRecord) => void;
  onSaveDraft: (draft: Partial<ApplicationRecord>) => void;
}

export const ApplicationWizardModal: React.FC<ApplicationWizardModalProps> = ({
  isOpen,
  onClose,
  initialCourseSelection,
  onApplicationSubmitted,
  onSaveDraft,
}) => {
  const { universities } = usePlatform();
  const [step, setStep] = useState(1);
  const [isSuccessScreen, setIsSuccessScreen] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<ApplicationRecord | null>(null);

  // STEP 1: Personal Details
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [nationality, setNationality] = useState(
    initialCourseSelection?.studentPassportCountry || ""
  );
  const [passportNumber, setPassportNumber] = useState("");
  const [passportExpiry, setPassportExpiry] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // STEP 2: Address
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [address, setAddress] = useState("");

  // STEP 3: Academic Details (Multiple qualifications)
  const [qualifications, setQualifications] = useState<QualificationItem[]>([]);

  const addQualification = () => {
    setQualifications([
      ...qualifications,
      {
        id: `q-${Date.now()}`,
        highestQualification: "",
        institution: "",
        course: "",
        yearCompleted: "",
        gradePercentage: "",
      },
    ]);
  };

  const removeQualification = (id: string) => {
    if (qualifications.length > 1) {
      setQualifications(qualifications.filter((q) => q.id !== id));
    }
  };

  // STEP 4: English Proficiency
  const [testType, setTestType] = useState<"IELTS" | "TOEFL" | "PTE" | "Duolingo" | "English waiver" | "Other">("IELTS");
  const [overallScore, setOverallScore] = useState("");
  const [readingScore, setReadingScore] = useState("");
  const [writingScore, setWritingScore] = useState("");
  const [listeningScore, setListeningScore] = useState("");
  const [speakingScore, setSpeakingScore] = useState("");

  // STEP 5: Course Selection
  const [courseSelection, setCourseSelection] = useState({
    country: initialCourseSelection?.countryToApply || "",
    university: initialCourseSelection?.university || "",
    courseName: initialCourseSelection?.course.courseName || "",
    intake: initialCourseSelection?.intake || "",
    courseType: initialCourseSelection?.courseType || "",
    tuitionFee: initialCourseSelection?.course.tuitionFee || "",
  });

  // STEP 6: Documents
  const [documents, setDocuments] = useState<DocumentUploadItem[]>([]);

  const handleSimulateUpload = (category: DocumentUploadItem["category"]) => {
    const newDoc: DocumentUploadItem = {
      id: createTrackingId("DOC"),
      category,
      fileName: `${category.replace(/\s+/g, "_")}_Document.pdf`,
      fileSize: "1.8 MB",
      progress: 100,
      status: "Uploaded",
    };
    setDocuments([...documents, newDoc]);
  };

  const removeDocument = (id: string) => {
    setDocuments(documents.filter((d) => d.id !== id));
  };

  // STEP 7: Review & Submission
  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newCamsId = createTrackingId("APP");
    const today = new Date().toISOString().slice(0, 10);
    const targetUniv = universities.find((u) => u.name === courseSelection.university);
    const selectedCourse = initialCourseSelection?.course;
    if (!targetUniv || !selectedCourse) {
      window.alert("Select an institution and course from the catalog before submitting.");
      return;
    }

    const newRecord: ApplicationRecord = {
      camsId: newCamsId,
      student: {
        firstName,
        middleName,
        lastName,
        name: `${firstName} ${lastName}`.trim(),
        dob,
        gender,
        nationality,
        passportNumber,
        passportExpiry,
        email,
        phone,
        studentId: createTrackingId("STU"),
        address: {
          country,
          state,
          city,
          postalCode,
          streetAddress: address,
        },
      },
      university: targetUniv,
      course: selectedCourse,
      primaryStatus: "Application Submitted",
      secondaryStatus: "Documents Pending",
      dateAdded: today,
      dateModified: today,
      counselorName: "Dakshinvedha Admissions",
      qualifications,
      englishProficiency: {
        testType,
        overallScore,
        readingScore,
        writingScore,
        listeningScore,
        speakingScore,
      },
      documents,
      timeline: buildTimeline("Application Submitted", today),
      payment: {
        grossTuition: courseSelection.tuitionFee || selectedCourse.tuitionFee,
        scholarship: "Under Review",
        depositPaid: "£0",
        netBalanceDue: courseSelection.tuitionFee || selectedCourse.tuitionFee,
        paymentStatus: "Pending",
      },
      commission: {
        amount: "£0",
        eligibleAmount: "£0",
        expectedCommission: "£0",
        status: "Pending",
      },
      notes: [
        {
          id: `n-${Date.now()}`,
          author: `${firstName} ${lastName}`.trim() || "Applicant",
          date: today,
          text: "Application submitted from the portal.",
        },
      ],
    };

    setSubmittedApp(newRecord);
    setIsSuccessScreen(true);
    onApplicationSubmitted(newRecord);
  };

  const handleSaveDraftClick = () => {
    onSaveDraft({
      student: {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim(),
        dob,
        gender,
        nationality,
        passportNumber,
        passportExpiry,
        email,
        phone,
        studentId: createTrackingId("STU"),
      },
    });
    alert("Draft Application saved locally in your active cache.");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Wizard Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
<<<<<<< HEAD
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
=======
            <div className="w-10 h-10 rounded-xl bg-[#D56732]/20 border border-[#D56732]/30 flex items-center justify-center text-[#E58D5F]">
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                Student Admission Application
              </h3>
              <p className="text-xs text-slate-400">
                {courseSelection.university} • {courseSelection.courseName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps Bar */}
        {!isSuccessScreen && (
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 overflow-x-auto flex items-center gap-4 text-xs font-semibold">
            {[
              { num: 1, label: "Personal", icon: User },
              { num: 2, label: "Address", icon: MapPin },
              { num: 3, label: "Academics", icon: GraduationCap },
              { num: 4, label: "English", icon: Languages },
              { num: 5, label: "Course", icon: BookOpen },
              { num: 6, label: "Documents", icon: FileText },
              { num: 7, label: "Review", icon: CheckCircle2 },
            ].map((s) => (
              <button
                key={s.num}
                type="button"
                onClick={() => setStep(s.num)}
                className={`flex items-center gap-2 pb-1 border-b-2 whitespace-nowrap transition-colors ${
                  step === s.num
<<<<<<< HEAD
                    ? "border-[#ea580c] text-[#ea580c] font-bold"
                    : step > s.num
                    ? "border-orange-500 text-orange-700"
=======
                    ? "border-[#D56732] text-[#D56732] font-bold"
                    : step > s.num
                    ? "border-[#D56732] text-[#D56732]"
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    step === s.num
<<<<<<< HEAD
                      ? "bg-[#ea580c] text-white"
                      : step > s.num
                      ? "bg-orange-500 text-white"
=======
                      ? "bg-[#D56732] text-white"
                      : step > s.num
                      ? "bg-[#D56732] text-white"
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {step > s.num ? "✓" : s.num}
                </div>
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 text-xs">
          {/* SUCCESS SCREEN */}
          {isSuccessScreen && submittedApp ? (
            <div className="py-10 text-center space-y-4 max-w-lg mx-auto animate-fade-in">
<<<<<<< HEAD
              <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto shadow-md">
=======
              <div className="w-16 h-16 rounded-full bg-[#FDF5F0] text-[#D56732] flex items-center justify-center mx-auto shadow-md">
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Application Submitted Successfully!
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Candidate dossier has been registered into the admissions pipeline with ID:
                </p>
<<<<<<< HEAD
                <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-xl inline-block font-mono text-base font-extrabold text-[#ea580c]">
=======
                <div className="mt-3 p-3 bg-[#FDF5F0] border border-[#F5D2C1] rounded-xl inline-block font-mono text-base font-extrabold text-[#D56732]">
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                  {submittedApp.camsId}
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-1.5 text-slate-700">
                <p><strong>Candidate:</strong> {submittedApp.student.name}</p>
                <p><strong>Passport:</strong> {submittedApp.student.passportNumber}</p>
                <p><strong>University:</strong> {submittedApp.university.name}</p>
                <p><strong>Course:</strong> {submittedApp.course.courseName}</p>
                <p><strong>Intake:</strong> {submittedApp.course.activeIntake}</p>
              </div>
              <button
                onClick={onClose}
<<<<<<< HEAD
                className="px-6 py-2.5 bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
=======
                className="px-6 py-2.5 bg-[#D56732] hover:bg-[#BA5322] text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
              >
                Return to Dashboard
              </button>
            </div>
          ) : (
            <>
              {/* STEP 1: Personal Details */}
              {step === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <h4 className="font-bold uppercase tracking-wider text-slate-400">
                    Step 1: Student Personal Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
<<<<<<< HEAD
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ea580c]"
=======
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D56732]"
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Middle Name
                      </label>
                      <input
                        type="text"
                        value={middleName}
                        onChange={(e) => setMiddleName(e.target.value)}
<<<<<<< HEAD
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ea580c]"
=======
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D56732]"
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
<<<<<<< HEAD
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ea580c]"
=======
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D56732]"
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
<<<<<<< HEAD
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ea580c]"
=======
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D56732]"
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Gender *
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
<<<<<<< HEAD
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ea580c]"
=======
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D56732]"
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Nationality *
                      </label>
                      <input
                        type="text"
                        value={nationality}
                        onChange={(e) => setNationality(e.target.value)}
<<<<<<< HEAD
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ea580c]"
=======
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D56732]"
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Passport Number *
                      </label>
                      <input
                        type="text"
                        value={passportNumber}
                        onChange={(e) => setPassportNumber(e.target.value)}
<<<<<<< HEAD
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ea580c] font-mono"
=======
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D56732] font-mono"
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Passport Expiry *
                      </label>
                      <input
                        type="date"
                        value={passportExpiry}
                        onChange={(e) => setPassportExpiry(e.target.value)}
<<<<<<< HEAD
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ea580c]"
=======
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D56732]"
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
<<<<<<< HEAD
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ea580c]"
=======
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D56732]"
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
<<<<<<< HEAD
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ea580c]"
=======
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D56732]"
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Address */}
              {step === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <h4 className="font-bold uppercase tracking-wider text-slate-400">
                    Step 2: Permanent Address
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Country *
                      </label>
                      <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        State / Province *
                      </label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-slate-700 font-semibold mb-1">
                        Street Address *
                      </label>
                      <textarea
                        rows={3}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Academic Details (Multiple) */}
              {step === 3 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold uppercase tracking-wider text-slate-400">
                      Step 3: Academic Qualifications
                    </h4>
                    <button
                      type="button"
                      onClick={addQualification}
<<<<<<< HEAD
                      className="px-3 py-1.5 bg-orange-50 text-orange-800 border border-orange-200 rounded-lg font-semibold hover:bg-orange-100 flex items-center gap-1 cursor-pointer"
=======
                      className="px-3 py-1.5 bg-[#FDF5F0] text-[#BA5322] border border-[#F5D2C1] rounded-lg font-semibold hover:bg-[#FBE5D8] flex items-center gap-1 cursor-pointer"
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Another Qualification</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {qualifications.map((q, idx) => (
                      <div
                        key={q.id}
                        className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 relative group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">
                            Qualification #{idx + 1}
                          </span>
                          {qualifications.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeQualification(q.id)}
                              className="text-slate-400 hover:text-rose-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-slate-600 mb-1">
                              Highest Qualification
                            </label>
                            <input
                              type="text"
                              value={q.highestQualification}
                              onChange={(e) => {
                                const updated = [...qualifications];
                                updated[idx].highestQualification = e.target.value;
                                setQualifications(updated);
                              }}
                              className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-600 mb-1">
                              Institution
                            </label>
                            <input
                              type="text"
                              value={q.institution}
                              onChange={(e) => {
                                const updated = [...qualifications];
                                updated[idx].institution = e.target.value;
                                setQualifications(updated);
                              }}
                              className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-600 mb-1">
                              Course / Stream
                            </label>
                            <input
                              type="text"
                              value={q.course}
                              onChange={(e) => {
                                const updated = [...qualifications];
                                updated[idx].course = e.target.value;
                                setQualifications(updated);
                              }}
                              className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-600 mb-1">
                              Year Completed
                            </label>
                            <input
                              type="text"
                              value={q.yearCompleted}
                              onChange={(e) => {
                                const updated = [...qualifications];
                                updated[idx].yearCompleted = e.target.value;
                                setQualifications(updated);
                              }}
                              className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-600 mb-1">
                              Grade / Percentage
                            </label>
                            <input
                              type="text"
                              value={q.gradePercentage}
                              onChange={(e) => {
                                const updated = [...qualifications];
                                updated[idx].gradePercentage = e.target.value;
                                setQualifications(updated);
                              }}
                              className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 4: English Proficiency */}
              {step === 4 && (
                <div className="space-y-4 animate-fade-in">
                  <h4 className="font-bold uppercase tracking-wider text-slate-400">
                    Step 4: English Proficiency Examination
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Test Type *
                      </label>
                      <select
                        value={testType}
                        onChange={(e) => setTestType(e.target.value as any)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg"
                      >
                        <option value="IELTS">IELTS Academic</option>
                        <option value="TOEFL">TOEFL iBT</option>
                        <option value="PTE">PTE Academic</option>
                        <option value="Duolingo">Duolingo English Test (DET)</option>
                        <option value="English waiver">English Waiver (Grade 12 / MOI)</option>
                        <option value="Other">Other Accepted Test</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Overall Score *
                      </label>
                      <input
                        type="text"
                        value={overallScore}
                        onChange={(e) => setOverallScore(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <p className="font-bold text-slate-800">Individual Sub-Band Breakdown:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-slate-500 mb-1">Reading</label>
                        <input
                          type="text"
                          value={readingScore}
                          onChange={(e) => setReadingScore(e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1">Writing</label>
                        <input
                          type="text"
                          value={writingScore}
                          onChange={(e) => setWritingScore(e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1">Listening</label>
                        <input
                          type="text"
                          value={listeningScore}
                          onChange={(e) => setListeningScore(e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1">Speaking</label>
                        <input
                          type="text"
                          value={speakingScore}
                          onChange={(e) => setSpeakingScore(e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: Course Selection */}
              {step === 5 && (
                <div className="space-y-4 animate-fade-in">
                  <h4 className="font-bold uppercase tracking-wider text-slate-400">
                    Step 5: Confirmed Course Selection
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        value={courseSelection.country}
                        onChange={(e) =>
                          setCourseSelection({ ...courseSelection, country: e.target.value })
                        }
                        className="w-full p-2.5 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        University
                      </label>
                      <input
                        type="text"
                        value={courseSelection.university}
                        onChange={(e) =>
                          setCourseSelection({ ...courseSelection, university: e.target.value })
                        }
                        className="w-full p-2.5 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Course
                      </label>
                      <input
                        type="text"
                        value={courseSelection.courseName}
                        onChange={(e) =>
                          setCourseSelection({ ...courseSelection, courseName: e.target.value })
                        }
                        className="w-full p-2.5 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Intake
                      </label>
                      <input
                        type="text"
                        value={courseSelection.intake}
                        onChange={(e) =>
                          setCourseSelection({ ...courseSelection, intake: e.target.value })
                        }
                        className="w-full p-2.5 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Course Type
                      </label>
                      <input
                        type="text"
                        value={courseSelection.courseType}
                        onChange={(e) =>
                          setCourseSelection({ ...courseSelection, courseType: e.target.value })
                        }
                        className="w-full p-2.5 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Tuition Fee
                      </label>
                      <input
                        type="text"
                        value={courseSelection.tuitionFee}
                        onChange={(e) =>
                          setCourseSelection({ ...courseSelection, tuitionFee: e.target.value })
                        }
<<<<<<< HEAD
                        className="w-full p-2.5 border border-slate-200 rounded-lg font-mono font-bold text-[#ea580c]"
=======
                        className="w-full p-2.5 border border-slate-200 rounded-lg font-mono font-bold text-[#D56732]"
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: Documents Upload Simulation */}
              {step === 6 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold uppercase tracking-wider text-slate-400">
                      Step 6: Document Checklist & Uploads
                    </h4>
                    <span className="text-slate-500">
                      {documents.length} Files Attached
                    </span>
                  </div>

                  {/* Upload action triggers */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between flex-wrap gap-2">
                    <span className="text-slate-600 font-medium">Add Missing Document:</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {(["Passport", "Academic Documents", "English Test", "CV", "SOP", "Recommendation Letters", "Other Documents"] as const).map(
                        (cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => handleSimulateUpload(cat)}
<<<<<<< HEAD
                            className="px-2.5 py-1 bg-white border border-slate-200 hover:border-orange-400 text-slate-700 rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <UploadCloud className="w-3 h-3 text-[#ea580c]" />
=======
                            className="px-2.5 py-1 bg-white border border-slate-200 hover:border-[#E58D5F] text-slate-700 rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <UploadCloud className="w-3 h-3 text-[#D56732]" />
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                            <span>+ {cat}</span>
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Document items list */}
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3 bg-white flex items-center justify-between hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
<<<<<<< HEAD
                          <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#ea580c] flex items-center justify-center font-bold text-[10px]">
=======
                          <div className="w-8 h-8 rounded-lg bg-[#FDF5F0] text-[#D56732] flex items-center justify-center font-bold text-[10px]">
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                            PDF
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{doc.fileName}</p>
                            <p className="text-[11px] text-slate-400">
                              {doc.category} • {doc.fileSize}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
<<<<<<< HEAD
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 flex items-center gap-1">
=======
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FDF5F0] text-[#BA5322] flex items-center gap-1">
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                            <Check className="w-3 h-3" /> {doc.status}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeDocument(doc.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                            title="Remove Document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 7: Review & Final Actions */}
              {step === 7 && (
                <div className="space-y-4 animate-fade-in">
                  <h4 className="font-bold uppercase tracking-wider text-slate-400">
                    Step 7: Final Dossier Verification
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Student Box */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                        <span className="font-bold text-slate-900">Student Profile</span>
                        <button
                          type="button"
                          onClick={() => setStep(1)}
<<<<<<< HEAD
                          className="text-[#ea580c] font-bold hover:underline"
=======
                          className="text-[#D56732] font-bold hover:underline"
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                        >
                          EDIT
                        </button>
                      </div>
                      <p>Name: <strong>{firstName} {lastName}</strong></p>
                      <p>Passport: <strong>{passportNumber}</strong> (Exp: {passportExpiry})</p>
                      <p>DOB: <strong>{dob}</strong> ({gender})</p>
                      <p>Nationality: <strong>{nationality}</strong></p>
                      <p>Email: <strong>{email}</strong></p>
                      <p>Phone: <strong>{phone}</strong></p>
                    </div>

                    {/* Academics & English Box */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                        <span className="font-bold text-slate-900">Academic & English</span>
                        <button
                          type="button"
                          onClick={() => setStep(3)}
<<<<<<< HEAD
                          className="text-[#ea580c] font-bold hover:underline"
=======
                          className="text-[#D56732] font-bold hover:underline"
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                        >
                          EDIT
                        </button>
                      </div>
                      <p>Degree: <strong>{qualifications[0]?.highestQualification}</strong></p>
                      <p>Institution: <strong>{qualifications[0]?.institution}</strong></p>
                      <p>Grade: <strong>{qualifications[0]?.gradePercentage}</strong></p>
                      <p>English Test: <strong>{testType}</strong></p>
                      <p>Overall Band: <strong>{overallScore}</strong></p>
                    </div>

                    {/* Course Box */}
<<<<<<< HEAD
                    <div className="p-4 bg-orange-50/60 border border-orange-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between pb-1 border-b border-orange-200">
                        <span className="font-bold text-orange-950">Target Destination</span>
                        <button
                          type="button"
                          onClick={() => setStep(5)}
                          className="text-[#ea580c] font-bold hover:underline"
=======
                    <div className="p-4 bg-[#FDF5F0]/60 border border-[#F5D2C1] rounded-xl space-y-2">
                      <div className="flex items-center justify-between pb-1 border-b border-[#F5D2C1]">
                        <span className="font-bold text-[#3C1609]">Target Destination</span>
                        <button
                          type="button"
                          onClick={() => setStep(5)}
                          className="text-[#D56732] font-bold hover:underline"
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                        >
                          EDIT
                        </button>
                      </div>
                      <p>University: <strong>{courseSelection.university}</strong></p>
                      <p>Course: <strong>{courseSelection.courseName}</strong></p>
                      <p>Intake: <strong>{courseSelection.intake}</strong></p>
                      <p>Tuition: <strong>{courseSelection.tuitionFee}</strong></p>
                      <p>Documents: <strong>{documents.length} verified</strong></p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Wizard Footer Controls */}
        {!isSuccessScreen && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <div>
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-slate-500 hover:text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveDraftClick}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>SAVE DRAFT</span>
              </button>

              {step < 7 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
<<<<<<< HEAD
                  className="px-5 py-2 bg-[#ea580c] hover:bg-[#c2410c] text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
=======
                  className="px-5 py-2 bg-[#D56732] hover:bg-[#BA5322] text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinalSubmit}
<<<<<<< HEAD
                  className="px-6 py-2 bg-[#ea580c] hover:bg-[#c2410c] text-white rounded-xl text-xs font-bold shadow-md shadow-orange-900/20 flex items-center gap-1.5 transition-all cursor-pointer"
=======
                  className="px-6 py-2 bg-[#D56732] hover:bg-[#BA5322] text-white rounded-xl text-xs font-bold shadow-md shadow-[#D56732]/20 flex items-center gap-1.5 transition-all cursor-pointer"
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>SUBMIT APPLICATION</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
