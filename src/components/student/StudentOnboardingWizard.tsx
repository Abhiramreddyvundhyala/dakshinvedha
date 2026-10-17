"use client";

import React, { useState } from "react";
import { usePlatform } from "@/context/PlatformContext";
import {
  StudentProfile,
  EducationQualification,
  StandardizedTestItem,
  EducationLevelType,
} from "@/types";
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  User,
  GraduationCap,
  Languages,
  Compass,
  FileText,
  Sparkles,
  Plus,
  Trash2,
  Upload,
  Calendar,
  MapPin,
  Clock,
  ShieldCheck,
  AlertCircle,
  X,
} from "lucide-react";

interface StudentOnboardingWizardProps {
  onFinish: () => void;
  onSaveForLater: () => void;
}

export const StudentOnboardingWizard: React.FC<StudentOnboardingWizardProps> = ({
  onFinish,
  onSaveForLater,
}) => {
  const {
    activeStudent,
    updateActiveStudentProfile,
    addEducation,
    deleteEducation,
    addOrUpdateTest,
    updatePassport,
    uploadDocument,
    completeOnboarding,
  } = usePlatform();

  const [currentStep, setCurrentStep] = useState<number>(1);

  // STEP 1: Personal Details Local States
  const [dob, setDob] = useState(activeStudent?.personal.dob || "2003-05-14");
  const [gender, setGender] = useState(activeStudent?.personal.gender || "Male");
  const [nationality, setNationality] = useState(activeStudent?.personal.nationality || "Indian");
  const [countryOfResidence, setCountryOfResidence] = useState(
    activeStudent?.personal.countryOfResidence || "India"
  );
  const [streetAddress, setStreetAddress] = useState(
    activeStudent?.personal.address.street || ""
  );
  const [city, setCity] = useState(activeStudent?.personal.address.city || "Mumbai");
  const [stateName, setStateName] = useState(activeStudent?.personal.address.state || "Maharashtra");
  const [postalCode, setPostalCode] = useState(activeStudent?.personal.address.postalCode || "400001");

  // Passport state
  const [hasPassport, setHasPassport] = useState<"YES" | "NO">(
    activeStudent?.passport.hasPassport || "YES"
  );
  const [passportNumber, setPassportNumber] = useState(activeStudent?.passport.passportNumber || "");
  const [passportCountry, setPassportCountry] = useState(
    activeStudent?.passport.passportCountry || "India"
  );
  const [passportExpiry, setPassportExpiry] = useState(
    activeStudent?.passport.expiryDate || "2032-06-15"
  );

  // STEP 2: Education Modal / Add State
  const [showAddEduModal, setShowAddEduModal] = useState(false);
  const [eduLevel, setEduLevel] = useState<EducationLevelType>("Bachelor");
  const [eduInstitution, setEduInstitution] = useState("");
  const [eduBoard, setEduBoard] = useState("");
  const [eduStream, setEduStream] = useState("MPC");
  const [eduDegree, setEduDegree] = useState("");
  const [eduCourse, setEduCourse] = useState("");
  const [eduSpecialization, setEduSpecialization] = useState("");
  const [eduStartYear, setEduStartYear] = useState("2021");
  const [eduPassYear, setEduPassYear] = useState("2025");
  const [eduScore, setEduScore] = useState("8.2");
  const [eduCgpaScale, setEduCgpaScale] = useState("10");
  const [eduEnglishMarks, setEduEnglishMarks] = useState("85");
  const [eduMaxEnglishMarks, setEduMaxEnglishMarks] = useState("100");
  const [eduBacklogs, setEduBacklogs] = useState(0);

  // STEP 3: English Proficiency States
  const [testStatus, setTestStatus] = useState<"YES" | "NO" | "PLANNING TO TAKE">(
    activeStudent?.testsStatus || "YES"
  );
  const [selectedTestType, setSelectedTestType] = useState<"IELTS" | "TOEFL" | "PTE" | "Duolingo" | "GRE" | "GMAT">("IELTS");
  const [overallTestScore, setOverallTestScore] = useState("7.0");
  const [subScoreL, setSubScoreL] = useState("7.5");
  const [subScoreR, setSubScoreR] = useState("7.0");
  const [subScoreW, setSubScoreW] = useState("6.5");
  const [subScoreS, setSubScoreS] = useState("7.0");

  // STEP 4: Study Preferences States
  const [prefLevel, setPrefLevel] = useState<"Undergraduate" | "Postgraduate" | "Doctorate" | "Other">(
    activeStudent?.studyPreferences.preferredStudyLevel || "Postgraduate"
  );
  const [prefCountries, setPrefCountries] = useState<string[]>(
    activeStudent?.studyPreferences.preferredCountries || ["United Kingdom", "Australia"]
  );
  const [prefIntake, setPrefIntake] = useState(
    activeStudent?.studyPreferences.preferredIntake || "September"
  );
  const [prefSubject, setPrefSubject] = useState(
    activeStudent?.studyPreferences.preferredCourseSubject || "Computer Science / Software Engineering"
  );
  const [prefBudget, setPrefBudget] = useState(
    activeStudent?.studyPreferences.budgetRange || "£14,000 - £22,000"
  );
  const [prefScholarship, setPrefScholarship] = useState<"YES" | "NO">(
    activeStudent?.studyPreferences.scholarshipRequired || "YES"
  );

  // Save personal details into active student
  const savePersonalDetails = () => {
    updateActiveStudentProfile({
      personal: {
        dob,
        gender,
        nationality,
        countryOfResidence,
        address: {
          street: streetAddress,
          city,
          state: stateName,
          postalCode,
        },
      },
      passport: {
        hasPassport,
        passportNumber: hasPassport === "YES" ? passportNumber : undefined,
        passportCountry: hasPassport === "YES" ? passportCountry : undefined,
        expiryDate: hasPassport === "YES" ? passportExpiry : undefined,
        status: hasPassport === "YES" ? "Verified" : "Passport Pending",
      },
    });
  };

  // Add education handler
  const handleAddQualification = (e: React.FormEvent) => {
    e.preventDefault();
    addEducation({
      level: eduLevel,
      institutionName: eduInstitution || "Institution Name",
      boardOrUniversity: eduBoard || "State Board / University",
      stream: eduLevel === "12th" ? eduStream : undefined,
      degree: eduDegree || (eduLevel === "Bachelor" ? "B.Tech" : eduLevel),
      course: eduCourse || "Computer Science",
      specialization: eduSpecialization,
      startYear: eduStartYear,
      passOutYear: eduPassYear,
      percentageOrCgpa: eduScore,
      cgpaScale: eduLevel === "Bachelor" ? eduCgpaScale : undefined,
      englishMarks: eduLevel === "12th" || eduLevel === "Diploma" ? eduEnglishMarks : undefined,
      maxEnglishMarks: eduLevel === "12th" || eduLevel === "Diploma" ? eduMaxEnglishMarks : undefined,
      hasBacklogs: eduBacklogs > 0,
      numberOfBacklogs: eduBacklogs,
      activeBacklogs: 0,
    });
    setShowAddEduModal(false);
  };

  // Save tests
  const saveTestProficiency = () => {
    updateActiveStudentProfile({ testsStatus: testStatus });
    if (testStatus === "YES") {
      addOrUpdateTest({
        type: selectedTestType,
        testDate: "2026-05-15",
        overallScore: overallTestScore,
        subScores: {
          listening: subScoreL,
          reading: subScoreR,
          writing: subScoreW,
          speaking: subScoreS,
        },
        reportUrl: `${selectedTestType}_Score_Report.pdf`,
      });
    }
  };

  // Save preferences
  const saveStudyPreferences = () => {
    updateActiveStudentProfile({
      studyPreferences: {
        preferredStudyLevel: prefLevel,
        preferredCountries: prefCountries,
        preferredIntake: prefIntake,
        preferredCourseSubject: prefSubject,
        preferredUniversity: "Open to Recommendations",
        budgetRange: prefBudget,
        scholarshipRequired: prefScholarship,
      },
    });
  };

  const handleStepContinue = () => {
    if (currentStep === 1) {
      savePersonalDetails();
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      saveTestProficiency();
      setCurrentStep(4);
    } else if (currentStep === 4) {
      saveStudyPreferences();
      setCurrentStep(5);
    } else if (currentStep === 5) {
      setCurrentStep(6);
    } else if (currentStep === 6) {
      completeOnboarding();
      onFinish();
    }
  };

  const handleCountryToggle = (country: string) => {
    setPrefCountries((prev) =>
      prev.includes(country) ? prev.filter((c) => c !== country) : [...prev, country]
    );
  };

  const stepsList = [
    { num: 1, label: "Personal Details" },
    { num: 2, label: "Education" },
    { num: 3, label: "English Proficiency" },
    { num: 4, label: "Study Preferences" },
    { num: 5, label: "Documents" },
    { num: 6, label: "Complete" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header / Greeting */}
        <div className="bg-emerald-950 border-b border-emerald-900 text-white p-5 sm:p-6 relative">
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-300 bg-emerald-900/80 border border-emerald-700/60 px-2.5 py-0.5 rounded-full inline-block mb-1">
                Student Onboarding Wizard
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                Welcome, {activeStudent?.firstName || "Student"}!
              </h1>
              <p className="text-xs sm:text-sm text-emerald-200/80 mt-1 max-w-2xl">
                Let&apos;s set up your profile so we can find the right universities and courses for you.
              </p>
            </div>
            <button
              onClick={onSaveForLater}
              className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-colors cursor-pointer"
              title="Save for Later & Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Progress Bar */}
          <div className="mt-5 grid grid-cols-6 gap-2">
            {stepsList.map((s) => (
              <div key={s.num} className="space-y-1">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    currentStep >= s.num ? "bg-white shadow-xs" : "bg-white/30"
                  }`}
                />
                <span
                  className={`text-[10px] hidden sm:block truncate ${
                    currentStep === s.num
                      ? "text-white font-extrabold"
                      : currentStep > s.num
                      ? "text-orange-200 font-medium"
                      : "text-white/50"
                  }`}
                >
                  {s.num}. {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Wizard Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6 text-slate-800">
          {/* STEP 1: PERSONAL DETAILS */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-orange-500" />
                  <span>Step 1 — Personal & Passport Details</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Confirm your personal information and international travel document status.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Nationality</label>
                  <input
                    type="text"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">State</label>
                  <input
                    type="text"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Postal Code</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              </div>

              {/* Passport Section */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Do you have a passport?</h3>
                    <p className="text-[11px] text-slate-500">
                      Required for CAS & Visa; not strictly mandatory to start exploring courses.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setHasPassport("YES")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        hasPassport === "YES"
                          ? "bg-orange-600 text-white"
                          : "bg-white border border-slate-300 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      YES
                    </button>
                    <button
                      type="button"
                      onClick={() => setHasPassport("NO")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        hasPassport === "NO"
                          ? "bg-orange-600 text-white"
                          : "bg-white border border-slate-300 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      NO
                    </button>
                  </div>
                </div>

                {hasPassport === "YES" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600">Passport Number</label>
                      <input
                        type="text"
                        placeholder="e.g. Z6182904"
                        value={passportNumber}
                        onChange={(e) => setPassportNumber(e.target.value)}
                        className="w-full mt-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono uppercase"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600">Issuing Country</label>
                      <input
                        type="text"
                        value={passportCountry}
                        onChange={(e) => setPassportCountry(e.target.value)}
                        className="w-full mt-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600">Expiry Date</label>
                      <input
                        type="date"
                        value={passportExpiry}
                        onChange={(e) => setPassportExpiry(e.target.value)}
                        className="w-full mt-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>
                      <strong>Passport can be added later</strong> if permitted for this application. Marked as <em>Passport Pending</em>.
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: EDUCATION QUALIFICATIONS */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-orange-500" />
                    <span>Step 2 — Education Qualifications</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Add your academic history (Secondary, Intermediate/12th, Diploma, Bachelor&apos;s, Master&apos;s).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddEduModal(true)}
                  className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs self-start"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ADD QUALIFICATION</span>
                </button>
              </div>

              {/* Added Education Cards */}
              <div className="space-y-3">
                {(activeStudent?.education || []).length === 0 ? (
                  <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-2">
                    <GraduationCap className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs font-bold text-slate-600">No qualifications added yet</p>
                    <p className="text-[11px] text-slate-400">
                      Click &quot;ADD QUALIFICATION&quot; to enter your 10th, 12th, Diploma, or Bachelor&apos;s scores.
                    </p>
                  </div>
                ) : (
                  (activeStudent?.education || []).map((edu) => (
                    <div
                      key={edu.id}
                      className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-orange-200 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-slate-900">
                            {edu.degree || edu.level}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                            {edu.level}
                          </span>
                          {edu.verificationStatus === "Verified" && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Verified</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600">
                          {edu.institutionName} • {edu.boardOrUniversity}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500">
                          <span>Years: {edu.startYear ? `${edu.startYear}–` : ""}{edu.passOutYear}</span>
                          <span>•</span>
                          <span className="font-semibold text-slate-800">
                            Score: {edu.percentageOrCgpa} {edu.cgpaScale ? `(${edu.cgpaScale} scale)` : ""}
                          </span>
                          {edu.englishMarks && (
                            <>
                              <span>•</span>
                              <span className="text-orange-700 font-semibold bg-orange-50 px-1.5 py-0.5 rounded">
                                English: {edu.englishMarks}/{edu.maxEnglishMarks || "100"}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => deleteEducation(edu.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete qualification"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* STEP 3: ENGLISH PROFICIENCY */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-fade-in">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Languages className="w-4 h-4 text-orange-500" />
                  <span>Step 3 — English Proficiency & Standardized Tests</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Record Academic English marks and standardized test reports (IELTS, TOEFL, PTE, Duolingo, GRE).
                </p>
              </div>

              {/* Section A: Academic English */}
              <div className="p-4 bg-orange-50/70 border border-orange-200/80 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700">
                  A. Academic English Marks
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    High School / 12th English Marks:
                  </span>
                  <span className="text-xs font-black text-orange-900 bg-white px-2.5 py-1 rounded-lg border border-orange-200">
                    82 / 100 (Waiver Eligible)
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Many universities accept 70%+ in standard 12th English for language requirement waiver.
                </p>
              </div>

              {/* Section B: Standardized Exams */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-800">
                  Have you taken an English or standardized test?
                </label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {(["YES", "NO", "PLANNING TO TAKE"] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setTestStatus(opt)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        testStatus === opt
                          ? "bg-slate-900 text-white shadow-xs"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {testStatus === "YES" ? (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 pt-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700">Select Test:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {(["IELTS", "TOEFL", "PTE", "Duolingo", "GRE", "GMAT"] as const).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setSelectedTestType(t)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                              selectedTestType === t
                                ? "bg-orange-600 text-white"
                                : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600">Overall Score / Band</label>
                        <input
                          type="text"
                          value={overallTestScore}
                          onChange={(e) => setOverallTestScore(e.target.value)}
                          className="w-full mt-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600">Listening</label>
                        <input
                          type="text"
                          value={subScoreL}
                          onChange={(e) => setSubScoreL(e.target.value)}
                          className="w-full mt-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600">Reading</label>
                        <input
                          type="text"
                          value={subScoreR}
                          onChange={(e) => setSubScoreR(e.target.value)}
                          className="w-full mt-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600">Writing</label>
                        <input
                          type="text"
                          value={subScoreW}
                          onChange={(e) => setSubScoreW(e.target.value)}
                          className="w-full mt-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600">Speaking</label>
                        <input
                          type="text"
                          value={subScoreS}
                          onChange={(e) => setSubScoreS(e.target.value)}
                          className="w-full mt-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-sky-800 text-xs space-y-1">
                    <p className="font-bold">No test taken yet — That&apos;s totally fine!</p>
                    <p className="text-[11px]">
                      You can explore and shortlist programs without an English test. Many universities offer English waivers or pre-sessional courses.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: STUDY PREFERENCES */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-fade-in">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-orange-500" />
                  <span>Step 4 — Study Preferences</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Define your preferred study level, destination countries, budget, and intake.
                </p>
              </div>

              {/* Study Level */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Preferred Study Level</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(["Undergraduate", "Postgraduate", "Doctorate", "Other"] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setPrefLevel(lvl)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        prefLevel === lvl
                          ? "bg-orange-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferred Countries (Multiple) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Preferred Destination Countries (Select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {["United Kingdom", "Australia", "Canada", "United States", "Ireland", "Germany", "New Zealand"].map((c) => {
                    const selected = prefCountries.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleCountryToggle(c)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selected
                            ? "bg-slate-900 text-white shadow-xs scale-102"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {selected ? "✓ " : "+ "}
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preferred Intake & Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700">Preferred Intake</label>
                  <select
                    value={prefIntake}
                    onChange={(e) => setPrefIntake(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800"
                  >
                    <option>September / October 2026</option>
                    <option>January / February 2027</option>
                    <option>May / June 2027</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Preferred Subject / Area</label>
                  <input
                    type="text"
                    value={prefSubject}
                    onChange={(e) => setPrefSubject(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Budget & Scholarship */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700">Annual Tuition Budget Range</label>
                  <select
                    value={prefBudget}
                    onChange={(e) => setPrefBudget(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800"
                  >
                    <option>Under £12,000 / year</option>
                    <option>£12,000 - £18,000 / year</option>
                    <option>£18,000 - £25,000 / year</option>
                    <option>Above £25,000 / year</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Scholarship Required?</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setPrefScholarship("YES")}
                      className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        prefScholarship === "YES" ? "bg-orange-600 text-white" : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      YES
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrefScholarship("NO")}
                      className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        prefScholarship === "NO" ? "bg-orange-600 text-white" : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      NO
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: DOCUMENTS */}
          {currentStep === 5 && (
            <div className="space-y-5 animate-fade-in">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-orange-500" />
                  <span>Step 5 — Documents & Profile Attachments</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Only relevant categories based on your selected qualifications are required.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { cat: "Passport", title: "Passport Bio-Page", status: hasPassport === "YES" ? "Verified" : "Not Uploaded" },
                  { cat: "Profile Photograph", title: "Passport Size Photograph", status: "Verified" },
                  { cat: "10th Certificate", title: "10th Marks Certificate", status: "Verified" },
                  { cat: "12th Certificate", title: "12th / Intermediate Certificate", status: "Verified" },
                  { cat: "Bachelor Degree", title: "Bachelor Degree / Provisional", status: "Uploaded" },
                  { cat: "CV / Resume", title: "Academic & Professional CV", status: "Uploaded" },
                ].map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{doc.title}</p>
                      <p className="text-[11px] text-slate-500">{doc.cat}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          doc.status === "Verified"
                            ? "bg-emerald-100 text-emerald-700"
                            : doc.status === "Uploaded"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {doc.status}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          uploadDocument({
                            category: doc.cat as any,
                            title: doc.title,
                            fileName: `${doc.cat.replace(/\s+/g, "_")}.pdf`,
                          })
                        }
                        className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-slate-700 font-semibold text-[11px] cursor-pointer"
                      >
                        Upload
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 6: COMPLETE */}
          {currentStep === 6 && (
            <div className="text-center py-6 space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <Sparkles className="w-8 h-8" />
              </div>

              <h2 className="text-2xl font-black text-slate-900">
                You&apos;re All Set, {activeStudent?.firstName}!
              </h2>

              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Your profile has been created and verified in the central admission registry. Your estimated profile completion is now:
              </p>

              <div className="inline-flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl">
                <div className="w-24 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 w-[78%]" />
                </div>
                <span className="text-sm font-extrabold text-slate-900">78% Complete</span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left max-w-lg mx-auto text-xs space-y-1.5">
                <p className="font-bold text-slate-900">Next Recommended Steps:</p>
                <ul className="list-disc list-inside text-slate-700 space-y-1 text-[11px]">
                  <li>Explore top matched universities in UK & Australia</li>
                  <li>Check live admission eligibility badges on programs</li>
                  <li>Directly apply to your chosen course in 8 seamless steps</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onSaveForLater}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            SAVE FOR LATER
          </button>

          <div className="flex items-center gap-2">
            {currentStep > 1 && currentStep < 6 && (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleStepContinue}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
            >
              <span>{currentStep === 6 ? "GO TO DASHBOARD" : "SAVE & CONTINUE"}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Qualification Modal (Step 2) */}
      {showAddEduModal && (
        <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleAddQualification}
            className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-extrabold text-sm text-slate-900">Add Education Qualification</h3>
              <button
                type="button"
                onClick={() => setShowAddEduModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="font-bold text-slate-700">Qualification Type</label>
              <select
                value={eduLevel}
                onChange={(e) => setEduLevel(e.target.value as EducationLevelType)}
                className="w-full mt-1 p-2 border rounded-xl"
              >
                <option value="10th">Secondary / 10th</option>
                <option value="12th">Intermediate / 12th</option>
                <option value="Diploma">Diploma</option>
                <option value="Bachelor">Bachelor&apos;s / Undergraduate</option>
                <option value="Master">Master&apos;s / Postgraduate</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700">School / College / Institution Name</label>
              <input
                type="text"
                required
                placeholder="e.g. VJTI Mumbai / DPS School"
                value={eduInstitution}
                onChange={(e) => setEduInstitution(e.target.value)}
                className="w-full mt-1 p-2 border rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700">Board / University</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CBSE / Mumbai University"
                  value={eduBoard}
                  onChange={(e) => setEduBoard(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">Percentage / CGPA</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 8.3 or 84.5%"
                  value={eduScore}
                  onChange={(e) => setEduScore(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-xl"
                />
              </div>
            </div>

            {eduLevel === "12th" && (
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700">Stream</label>
                  <select
                    value={eduStream}
                    onChange={(e) => setEduStream(e.target.value)}
                    className="w-full mt-1 p-2 border rounded-xl"
                  >
                    <option>MPC</option>
                    <option>BiPC</option>
                    <option>CEC</option>
                    <option>MEC</option>
                    <option>Science</option>
                    <option>Commerce</option>
                    <option>Arts</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700">English Marks</label>
                  <input
                    type="number"
                    value={eduEnglishMarks}
                    onChange={(e) => setEduEnglishMarks(e.target.value)}
                    className="w-full mt-1 p-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Max Marks</label>
                  <input
                    type="number"
                    value={eduMaxEnglishMarks}
                    onChange={(e) => setEduMaxEnglishMarks(e.target.value)}
                    className="w-full mt-1 p-2 border rounded-xl"
                  />
                </div>
              </div>
            )}

            {eduLevel === "Bachelor" && (
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700">CGPA Scale</label>
                  <input
                    type="text"
                    value={eduCgpaScale}
                    onChange={(e) => setEduCgpaScale(e.target.value)}
                    className="w-full mt-1 p-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Backlogs Count</label>
                  <input
                    type="number"
                    value={eduBacklogs}
                    onChange={(e) => setEduBacklogs(parseInt(e.target.value) || 0)}
                    className="w-full mt-1 p-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Pass-out Year</label>
                  <input
                    type="text"
                    value={eduPassYear}
                    onChange={(e) => setEduPassYear(e.target.value)}
                    className="w-full mt-1 p-2 border rounded-xl"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setShowAddEduModal(false)}
                className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold cursor-pointer"
              >
                Add Qualification
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
