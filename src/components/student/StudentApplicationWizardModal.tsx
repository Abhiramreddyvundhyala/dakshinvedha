"use client";

import React, { useState, useEffect, useMemo } from "react";
import { usePlatform } from "@/context/PlatformContext";
import {
  CourseInfo,
  UniversityInfo,
  EducationQualification,
  StandardizedTestItem,
  EducationLevelType,
  DocumentCategoryType,
  ApplicationRecord,
} from "@/types";
import { evaluateFrontendEligibility } from "@/data/studentSeedData";
import {
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  User,
  ShieldCheck,
  GraduationCap,
  Languages,
  Compass,
  FileText,
  Upload,
  Sparkles,
  Trash2,
  Edit2,
  Calendar,
  Building2,
  MapPin,
  ExternalLink,
  Plus,
} from "lucide-react";

interface StudentApplicationWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCourse?: CourseInfo | null;
  onApplicationCompleted: (app: ApplicationRecord) => void;
  onGoToDashboard: () => void;
}

export const StudentApplicationWizardModal: React.FC<StudentApplicationWizardModalProps> = ({
  isOpen,
  onClose,
  initialCourse,
  onApplicationCompleted,
  onGoToDashboard,
}) => {
  const {
    activeStudent,
    universities,
    courses,
    submitStudentApplication,
    addEducation,
    deleteEducation,
    uploadDocument,
  } = usePlatform();

  // Wizard Step: 1 to 8
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Selected University & Course
  const [selectedUnivId, setSelectedUnivId] = useState<string>(
    initialCourse?.universityId || universities[0]?.id || ""
  );
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    initialCourse?.id || courses[0]?.id || ""
  );
  const [selectedIntake, setSelectedIntake] = useState<string>(
    initialCourse?.activeIntake || "September / October 2026"
  );

  // STEP 1: Personal Details (pre-filled from registration/profile)
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("Male");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [altMobile, setAltMobile] = useState("");
  const [nationality, setNationality] = useState("Indian");
  const [countryOfResidence, setCountryOfResidence] = useState("India");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("Mumbai");
  const [stateName, setStateName] = useState("Maharashtra");
  const [postalCode, setPostalCode] = useState("400001");

  // STEP 2: Passport
  const [hasPassport, setHasPassport] = useState<"YES" | "NO">("YES");
  const [passportNumber, setPassportNumber] = useState("");
  const [passportCountry, setPassportCountry] = useState("India");
  const [dateOfIssue, setDateOfIssue] = useState("2022-04-10");
  const [expiryDate, setExpiryDate] = useState("2032-04-09");
  const [placeOfIssue, setPlaceOfIssue] = useState("Mumbai");

  // STEP 3: Education Qualifications (local state + ability to add)
  const [qualificationsList, setQualificationsList] = useState<EducationQualification[]>([]);
  const [showAddEduModal, setShowAddEduModal] = useState(false);
  const [eduLevel, setEduLevel] = useState<EducationLevelType>("Bachelor");
  const [eduInstitution, setEduInstitution] = useState("");
  const [eduBoard, setEduBoard] = useState("");
  const [eduStream, setEduStream] = useState("MPC");
  const [eduDegree, setEduDegree] = useState("Bachelor of Technology");
  const [eduCourse, setEduCourse] = useState("Computer Science Engineering");
  const [eduSpecialization, setEduSpecialization] = useState("Artificial Intelligence");
  const [eduStartYear, setEduStartYear] = useState("2021");
  const [eduPassYear, setEduPassYear] = useState("2025");
  const [eduScore, setEduScore] = useState("8.3");
  const [eduCgpaScale, setEduCgpaScale] = useState("10");
  const [eduBacklogs, setEduBacklogs] = useState(0);
  const [eduActiveBacklogs, setEduActiveBacklogs] = useState(0);
  const [eduEnglishMarks, setEduEnglishMarks] = useState("82");
  const [eduMaxEnglishMarks, setEduMaxEnglishMarks] = useState("100");

  // STEP 4: English Proficiency & Standardized Tests
  const [testsStatus, setTestsStatus] = useState<"YES" | "NO" | "PLANNING TO TAKE">("YES");
  const [selectedTestType, setSelectedTestType] = useState<
    "IELTS" | "TOEFL" | "PTE" | "Duolingo" | "GRE" | "GMAT"
  >("IELTS");
  const [testScoreOverall, setTestScoreOverall] = useState("7.0");
  const [testSubL, setTestSubL] = useState("7.5");
  const [testSubR, setTestSubR] = useState("7.0");
  const [testSubW, setTestSubW] = useState("6.5");
  const [testSubS, setTestSubS] = useState("7.0");
  const [greVerbal, setGreVerbal] = useState("155");
  const [greQuant, setGreQuant] = useState("165");
  const [greAwa, setGreAwa] = useState("4.0");

  // STEP 5: Study Details & Preferences
  const [prefStudyLevel, setPrefStudyLevel] = useState("Postgraduate");
  const [prefCountries, setPrefCountries] = useState(["United Kingdom", "Australia"]);
  const [budgetRange, setBudgetRange] = useState("£14,000 - £22,000");
  const [scholarshipRequired, setScholarshipRequired] = useState<"YES" | "NO">("YES");
  const [applicationNotes, setApplicationNotes] = useState("");

  // STEP 6: Documents
  const [uploadedDocs, setUploadedDocs] = useState<
    { category: DocumentCategoryType; title: string; fileName: string; status: string }[]
  >([]);

  // STEP 7: Review & Declaration
  const [declarationAccepted, setDeclarationAccepted] = useState(false);

  // STEP 8: Submitted Result
  const [submittedApp, setSubmittedApp] = useState<ApplicationRecord | null>(null);

  // Pre-fill fields from activeStudent when wizard opens
  useEffect(() => {
    if (activeStudent) {
      setFirstName(activeStudent.firstName || activeStudent.name.split(" ")[0] || "Student");
      setMiddleName(activeStudent.middleName || "");
      setLastName(activeStudent.lastName || activeStudent.name.split(" ").slice(1).join(" ") || "");
      setDob(activeStudent.personal.dob || "2003-05-14");
      setGender(activeStudent.personal.gender || "Male");
      setEmail(activeStudent.email || "");
      setMobile(activeStudent.mobile || "");
      setAltMobile(activeStudent.alternateMobile || "");
      setNationality(activeStudent.personal.nationality || "Indian");
      setCountryOfResidence(activeStudent.personal.countryOfResidence || "India");
      setStreetAddress(activeStudent.personal.address.street || "");
      setCity(activeStudent.personal.address.city || "Mumbai");
      setStateName(activeStudent.personal.address.state || "Maharashtra");
      setPostalCode(activeStudent.personal.address.postalCode || "400001");

      setHasPassport(activeStudent.passport.hasPassport || "YES");
      setPassportNumber(activeStudent.passport.passportNumber || "Z6182904");
      setPassportCountry(activeStudent.passport.passportCountry || "India");
      setDateOfIssue(activeStudent.passport.dateOfIssue || "2022-04-10");
      setExpiryDate(activeStudent.passport.expiryDate || "2032-04-09");
      setPlaceOfIssue(activeStudent.passport.placeOfIssue || "Mumbai");

      setQualificationsList(activeStudent.education || []);

      setTestsStatus(activeStudent.testsStatus || "YES");
      if (activeStudent.standardizedTests && activeStudent.standardizedTests.length > 0) {
        const firstTest = activeStudent.standardizedTests[0];
        setSelectedTestType(firstTest.type as any);
        setTestScoreOverall(firstTest.overallScore || "7.0");
        setTestSubL(firstTest.subScores?.listening || "7.5");
        setTestSubR(firstTest.subScores?.reading || "7.0");
        setTestSubW(firstTest.subScores?.writing || "6.5");
        setTestSubS(firstTest.subScores?.speaking || "7.0");
      }

      setPrefStudyLevel(activeStudent.studyPreferences.preferredStudyLevel || "Postgraduate");
      setPrefCountries(activeStudent.studyPreferences.preferredCountries || ["United Kingdom"]);

      // Initial docs
      setUploadedDocs(
        (activeStudent.documents || []).map((d) => ({
          category: d.category,
          title: d.title,
          fileName: d.fileName || `${d.category}.pdf`,
          status: d.status || "Uploaded",
        }))
      );
    }
  }, [activeStudent, isOpen]);

  // Sync initialCourse if passed
  useEffect(() => {
    if (initialCourse) {
      setSelectedUnivId(initialCourse.universityId);
      setSelectedCourseId(initialCourse.id);
      setSelectedIntake(initialCourse.activeIntake);
    }
  }, [initialCourse]);

  // Selected University & Course objects
  const currentUniv = useMemo(() => {
    return universities.find((u) => u.id === selectedUnivId) || universities[0];
  }, [universities, selectedUnivId]);

  const currentCourse = useMemo(() => {
    return courses.find((c) => c.id === selectedCourseId) || courses[0];
  }, [courses, selectedCourseId]);

  // Derived Academic English marks
  const academicEnglishMarks = useMemo(() => {
    const twelth = qualificationsList.find((q) => q.level === "12th");
    if (twelth?.englishMarks) {
      return `${twelth.englishMarks} / ${twelth.maxEnglishMarks || 100}`;
    }
    const diploma = qualificationsList.find((q) => q.level === "Diploma");
    if (diploma?.englishMarks) {
      return `${diploma.englishMarks} / ${diploma.maxEnglishMarks || 100}`;
    }
    return "82 / 100 (Standard 12th Intermediate)";
  }, [qualificationsList]);

  // Frontend Eligibility
  const eligibility = useMemo(() => {
    return evaluateFrontendEligibility(activeStudent, currentCourse);
  }, [activeStudent, currentCourse]);

  // Add Qualification in Step 3
  const handleAddQualification = (e: React.FormEvent) => {
    e.preventDefault();
    const newQ: EducationQualification = {
      id: `edu-${Date.now()}`,
      level: eduLevel,
      institutionName: eduInstitution || "Example University",
      boardOrUniversity: eduBoard || "Awarding Body",
      stream: eduLevel === "12th" ? eduStream : undefined,
      degree: eduLevel === "Bachelor" ? eduDegree : eduLevel === "12th" ? "Intermediate" : eduLevel,
      course: eduCourse,
      specialization: eduSpecialization,
      startYear: eduStartYear,
      passOutYear: eduPassYear,
      percentageOrCgpa: eduScore,
      cgpaScale: eduLevel === "Bachelor" ? eduCgpaScale : undefined,
      englishMarks: eduLevel === "12th" || eduLevel === "Diploma" ? eduEnglishMarks : undefined,
      maxEnglishMarks: eduLevel === "12th" || eduLevel === "Diploma" ? eduMaxEnglishMarks : undefined,
      hasBacklogs: eduBacklogs > 0,
      numberOfBacklogs: eduBacklogs,
      activeBacklogs: eduActiveBacklogs,
      verificationStatus: "Pending",
    };
    setQualificationsList((prev) => [...prev, newQ]);
    addEducation(newQ);
    setShowAddEduModal(false);
  };

  // Submit Application handler (Step 8)
  const handleSubmitApplication = () => {
    const newApp = submitStudentApplication({
      universityId: currentUniv.id,
      courseId: currentCourse.id,
      intake: selectedIntake,
      notes: applicationNotes || "Direct student submission via 8-step wizard.",
    });

    setSubmittedApp(newApp);
    setCurrentStep(8);
    onApplicationCompleted(newApp);
  };

  if (!isOpen) return null;

  const stepTitles = [
    "Personal Details",
    "Passport",
    "Education Qualifications",
    "English Proficiency",
    "Study Details",
    "Documents",
    "Review Application",
    "Submit",
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Wizard Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-orange-950 text-white p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-400 bg-orange-500/20 px-2 py-0.5 rounded-full inline-block mb-1">
                Student Application Wizard
              </span>
              <h1 className="text-lg sm:text-xl font-black text-white">
                Apply to {currentCourse?.courseName || "Course"}
              </h1>
              <p className="text-xs text-slate-300">
                {currentUniv?.name} • {currentUniv?.country} • {selectedIntake}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 8-Step Progress Indicator */}
          <div className="mt-5 grid grid-cols-8 gap-1.5">
            {stepTitles.map((title, idx) => {
              const stepNum = idx + 1;
              const isDone = currentStep > stepNum;
              const isCurrent = currentStep === stepNum;
              return (
                <div key={idx} className="space-y-1">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      isDone
                        ? "bg-emerald-400"
                        : isCurrent
                        ? "bg-orange-500"
                        : "bg-slate-700"
                    }`}
                  />
                  <span
                    className={`text-[9px] hidden sm:block truncate ${
                      isCurrent
                        ? "text-orange-400 font-extrabold"
                        : isDone
                        ? "text-emerald-300 font-medium"
                        : "text-slate-500"
                    }`}
                  >
                    {stepNum}. {title.split(" ")[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Wizard Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6 text-slate-800 text-xs">
          {/* ======================================================== */}
          {/* STEP 1 — PERSONAL DETAILS                                */}
          {/* ======================================================== */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="border-b pb-2">
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-orange-500" />
                  <span>Step 1 — Personal Details</span>
                </h2>
                <p className="text-slate-500 text-[11px]">
                  Name, phone, and email pre-filled from registration. Confirm or update below.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700">First Name *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Middle Name</label>
                  <input
                    type="text"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Gender *</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-300 text-xs"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700">Nationality *</label>
                  <input
                    type="text"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Alternate Mobile</label>
                  <input
                    type="tel"
                    value={altMobile}
                    onChange={(e) => setAltMobile(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700">Street Address</label>
                  <input
                    type="text"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Postal Code *</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 2 — PASSPORT                                        */}
          {/* ======================================================== */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="border-b pb-2">
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-orange-500" />
                  <span>Step 2 — Passport Details</span>
                </h2>
                <p className="text-slate-500 text-[11px]">
                  International travel identity document status.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900">Do you have a passport?</h3>
                    <p className="text-[11px] text-slate-500">
                      Select YES if you currently hold a valid international passport.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setHasPassport("YES")}
                      className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                        hasPassport === "YES"
                          ? "bg-orange-600 text-white shadow-xs"
                          : "bg-white border text-slate-700"
                      }`}
                    >
                      YES
                    </button>
                    <button
                      type="button"
                      onClick={() => setHasPassport("NO")}
                      className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                        hasPassport === "NO"
                          ? "bg-orange-600 text-white shadow-xs"
                          : "bg-white border text-slate-700"
                      }`}
                    >
                      NO
                    </button>
                  </div>
                </div>

                {hasPassport === "YES" ? (
                  <div className="space-y-3 pt-3 border-t">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="font-bold text-slate-700">Passport Number *</label>
                        <input
                          type="text"
                          required
                          value={passportNumber}
                          onChange={(e) => setPassportNumber(e.target.value)}
                          className="w-full mt-1 p-2 rounded-xl border border-slate-300 text-xs font-mono uppercase"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700">Passport Country</label>
                        <input
                          type="text"
                          value={passportCountry}
                          onChange={(e) => setPassportCountry(e.target.value)}
                          className="w-full mt-1 p-2 rounded-xl border border-slate-300 text-xs"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700">Place of Issue</label>
                        <input
                          type="text"
                          value={placeOfIssue}
                          onChange={(e) => setPlaceOfIssue(e.target.value)}
                          className="w-full mt-1 p-2 rounded-xl border border-slate-300 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-slate-700">Date of Issue</label>
                        <input
                          type="date"
                          value={dateOfIssue}
                          onChange={(e) => setDateOfIssue(e.target.value)}
                          className="w-full mt-1 p-2 rounded-xl border border-slate-300 text-xs"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700">Expiry Date</label>
                        <input
                          type="date"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          className="w-full mt-1 p-2 rounded-xl border border-slate-300 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-amber-900">
                    <p className="font-bold">
                      &quot;Passport can be added later if permitted for this application.&quot;
                    </p>
                    <p className="text-[11px]">
                      Your application will not be blocked. It will be marked as{" "}
                      <strong className="underline">Passport Pending</strong> and can be submitted prior to CAS / Visa issuance.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 3 — EDUCATION QUALIFICATIONS                        */}
          {/* ======================================================== */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-orange-500" />
                    <span>Step 3 — Education Qualifications</span>
                  </h2>
                  <p className="text-slate-500 text-[11px]">
                    Enter multiple qualifications (10th, 12th, Diploma, Bachelor&apos;s, Master&apos;s).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddEduModal(true)}
                  className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ADD QUALIFICATION</span>
                </button>
              </div>

              {/* Education Cards */}
              <div className="space-y-3">
                {qualificationsList.length === 0 ? (
                  <div className="p-8 border-2 border-dashed rounded-2xl text-center space-y-2">
                    <GraduationCap className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="font-bold text-slate-700">No qualifications recorded</p>
                    <p className="text-slate-400">Click &quot;ADD QUALIFICATION&quot; to enter your degree or high school details.</p>
                  </div>
                ) : (
                  qualificationsList.map((q) => (
                    <div
                      key={q.id}
                      className="p-4 bg-slate-50 border rounded-2xl flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-xs">
                            {q.degree || q.level}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-200 font-bold text-[10px] text-slate-700">
                            {q.level}
                          </span>
                        </div>
                        <p className="text-slate-600 text-xs">
                          {q.institutionName} • {q.boardOrUniversity}
                        </p>
                        <p className="text-slate-500 text-[11px]">
                          Years: {q.startYear ? `${q.startYear}–` : ""}{q.passOutYear} • Score:{" "}
                          <strong>
                            {q.percentageOrCgpa} {q.cgpaScale ? `(${q.cgpaScale} scale)` : ""}
                          </strong>
                          {q.englishMarks && ` • English: ${q.englishMarks}/${q.maxEnglishMarks || 100}`}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setQualificationsList((prev) => prev.filter((item) => item.id !== q.id));
                            deleteEducation(q.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
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

          {/* ======================================================== */}
          {/* STEP 4 — ENGLISH PROFICIENCY                             */}
          {/* ======================================================== */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div className="border-b pb-2">
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <Languages className="w-4 h-4 text-orange-500" />
                  <span>Step 4 — English Proficiency</span>
                </h2>
                <p className="text-slate-500 text-[11px]">
                  Academic English scores and standardized language / entrance tests.
                </p>
              </div>

              {/* Section A: Academic English */}
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-800">
                  A. Academic English
                </span>
                <p className="font-extrabold text-slate-900 text-xs">
                  Intermediate / 12th English Marks: <span className="text-orange-700">{academicEnglishMarks}</span>
                </p>
                <p className="text-slate-600 text-[11px]">
                  Automatically extracted from your high school qualifications. Eligible for university English waiver.
                </p>
              </div>

              {/* Section B: Standardized Exams */}
              <div className="p-4 bg-slate-50 border rounded-2xl space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  B. English / Standardized Exams
                </span>
                <p className="font-bold text-slate-900">
                  Have you taken an English or standardized test?
                </p>

                <div className="flex gap-2">
                  {(["YES", "NO", "PLANNING TO TAKE"] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setTestsStatus(opt)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                        testsStatus === opt
                          ? "bg-slate-900 text-white"
                          : "bg-white border text-slate-700"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {testsStatus === "YES" ? (
                  <div className="space-y-3 pt-3 border-t">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700">Test Type:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {(["IELTS", "TOEFL", "PTE", "Duolingo", "GRE", "GMAT"] as const).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setSelectedTestType(t)}
                            className={`px-3 py-1 rounded-lg font-bold ${
                              selectedTestType === t
                                ? "bg-orange-600 text-white"
                                : "bg-white border text-slate-700"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    {selectedTestType !== "GRE" && selectedTestType !== "GMAT" ? (
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        <div>
                          <label className="font-bold text-slate-600">Overall Score</label>
                          <input
                            type="text"
                            value={testScoreOverall}
                            onChange={(e) => setTestScoreOverall(e.target.value)}
                            className="w-full mt-1 p-2 rounded-xl border border-slate-300 font-bold"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-600">Listening</label>
                          <input
                            type="text"
                            value={testSubL}
                            onChange={(e) => setTestSubL(e.target.value)}
                            className="w-full mt-1 p-2 rounded-xl border border-slate-300"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-600">Reading</label>
                          <input
                            type="text"
                            value={testSubR}
                            onChange={(e) => setTestSubR(e.target.value)}
                            className="w-full mt-1 p-2 rounded-xl border border-slate-300"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-600">Writing</label>
                          <input
                            type="text"
                            value={testSubW}
                            onChange={(e) => setTestSubW(e.target.value)}
                            className="w-full mt-1 p-2 rounded-xl border border-slate-300"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-600">Speaking</label>
                          <input
                            type="text"
                            value={testSubS}
                            onChange={(e) => setTestSubS(e.target.value)}
                            className="w-full mt-1 p-2 rounded-xl border border-slate-300"
                          />
                        </div>
                      </div>
                    ) : (
                      /* Standardized Tests Section (GRE / GMAT) */
                      <div className="grid grid-cols-3 gap-3 p-3 bg-white border rounded-xl">
                        <div>
                          <label className="font-bold text-slate-600">Verbal Reasoning</label>
                          <input
                            type="text"
                            value={greVerbal}
                            onChange={(e) => setGreVerbal(e.target.value)}
                            className="w-full mt-1 p-2 rounded-xl border border-slate-300"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-600">Quantitative Reasoning</label>
                          <input
                            type="text"
                            value={greQuant}
                            onChange={(e) => setGreQuant(e.target.value)}
                            className="w-full mt-1 p-2 rounded-xl border border-slate-300"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-600">Analytical Writing</label>
                          <input
                            type="text"
                            value={greAwa}
                            onChange={(e) => setGreAwa(e.target.value)}
                            className="w-full mt-1 p-2 rounded-xl border border-slate-300"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-sky-800 space-y-1">
                    <p className="font-bold">No test taken?</p>
                    <p className="text-[11px]">
                      • English test may be required.
                      <br />
                      • English waiver may be available.
                      <br />• Check university requirements.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 5 — STUDY DETAILS & ELIGIBILITY                     */}
          {/* ======================================================== */}
          {currentStep === 5 && (
            <div className="space-y-4 animate-fade-in">
              <div className="border-b pb-2">
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-orange-500" />
                  <span>Step 5 — Study Details & Eligibility Match</span>
                </h2>
                <p className="text-slate-500 text-[11px]">
                  Confirm targeted program, intake, budget, and check frontend eligibility.
                </p>
              </div>

              {/* Selected University & Course Card */}
              <div className="p-4 bg-slate-50 border rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                    Selected Course
                  </span>
                  <h3 className="font-black text-slate-900 text-sm mt-1">
                    {currentCourse.courseName}
                  </h3>
                  <p className="text-slate-600 text-xs">
                    {currentUniv.name} • {currentCourse.campus} • {currentCourse.studyLevel}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-black text-slate-900 text-sm block">
                    {currentCourse.tuitionFee}
                  </span>
                  <span className="text-slate-500 text-[11px] block">{selectedIntake}</span>
                </div>
              </div>

              {/* FRONTEND ELIGIBILITY INDICATOR (CRITICAL REQUIREMENT) */}
              <div
                className={`p-4 rounded-2xl border space-y-2 ${
                  eligibility.status === "Likely Eligible"
                    ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                    : eligibility.status === "Requirements Need Review"
                    ? "bg-amber-50 border-amber-300 text-amber-900"
                    : "bg-sky-50 border-sky-300 text-sky-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Eligibility Indicator: {eligibility.status}</span>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white/70 px-2 py-0.5 rounded">
                    Frontend Check
                  </span>
                </div>

                <div className="space-y-0.5 text-[11px]">
                  {eligibility.reasons.map((r, idx) => (
                    <p key={idx}>• {r}</p>
                  ))}
                </div>

                <p className="text-[10px] italic opacity-80 pt-1 border-t border-current/20">
                  {eligibility.disclaimer}
                </p>
              </div>

              {/* Additional Study Preferences */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="font-bold text-slate-700">Preferred Intake</label>
                  <select
                    value={selectedIntake}
                    onChange={(e) => setSelectedIntake(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-300 text-xs"
                  >
                    <option>September / October 2026</option>
                    <option>January / February 2027</option>
                    <option>May / June 2027</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700">Scholarship Consideration</label>
                  <select
                    value={scholarshipRequired}
                    onChange={(e) => setScholarshipRequired(e.target.value as any)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-300 text-xs"
                  >
                    <option value="YES">Yes, consider me for institutional merit grants</option>
                    <option value="NO">No scholarship required</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700">Application Notes / Statement</label>
                <textarea
                  rows={2}
                  placeholder="Optional brief notes or career objective..."
                  value={applicationNotes}
                  onChange={(e) => setApplicationNotes(e.target.value)}
                  className="w-full mt-1 p-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 6 — DOCUMENTS                                       */}
          {/* ======================================================== */}
          {currentStep === 6 && (
            <div className="space-y-4 animate-fade-in">
              <div className="border-b pb-2">
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-orange-500" />
                  <span>Step 6 — Supporting Documents</span>
                </h2>
                <p className="text-slate-500 text-[11px]">
                  Upload required documents. Only relevant categories based on your qualifications are shown.
                </p>
              </div>

              {/* Dynamic list based on profile */}
              <div className="space-y-2.5">
                {[
                  { cat: "Passport", name: "Passport Bio-Page", required: hasPassport === "YES" },
                  { cat: "Profile Photograph", name: "Passport Size Photograph", required: true },
                  { cat: "10th Certificate", name: "10th / Secondary Certificate", required: true },
                  { cat: "12th Certificate", name: "12th / Intermediate Certificate", required: true },
                  { cat: "Bachelor Degree", name: "Bachelor Degree Certificate", required: qualificationsList.some((q) => q.level === "Bachelor") },
                  { cat: "Bachelor Transcripts", name: "Consolidated Sem 1-8 Transcripts", required: qualificationsList.some((q) => q.level === "Bachelor") },
                  { cat: "IELTS", name: "IELTS Test Report Form (TRF)", required: testsStatus === "YES" && selectedTestType === "IELTS" },
                  { cat: "CV / Resume", name: "Academic & Project CV", required: true },
                  { cat: "Statement of Purpose", name: "Statement of Purpose (SOP)", required: true },
                ]
                  .filter((item) => item.required)
                  .map((item, idx) => {
                    const existing = uploadedDocs.find((d) => d.category === item.cat);
                    return (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50 border rounded-2xl flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <p className="font-extrabold text-slate-900">{item.name}</p>
                          <p className="text-[11px] text-slate-400">
                            {item.cat} • {existing ? existing.fileName : "Not Uploaded"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              existing?.status === "Verified"
                                ? "bg-emerald-100 text-emerald-700"
                                : existing
                                ? "bg-blue-100 text-blue-700"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {existing?.status || "Not Uploaded"}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const newDoc = {
                                category: item.cat as any,
                                title: item.name,
                                fileName: `${item.cat.replace(/\s+/g, "_")}.pdf`,
                                status: "Uploaded",
                              };
                              setUploadedDocs((prev) => [
                                ...prev.filter((d) => d.category !== item.cat),
                                newDoc,
                              ]);
                              uploadDocument({
                                category: item.cat as any,
                                title: item.name,
                                fileName: newDoc.fileName,
                              });
                            }}
                            className="px-3 py-1 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg font-bold text-slate-700 text-[11px] cursor-pointer"
                          >
                            {existing ? "Replace" : "Upload"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 7 — REVIEW APPLICATION                              */}
          {/* ======================================================== */}
          {currentStep === 7 && (
            <div className="space-y-5 animate-fade-in">
              <div className="border-b pb-2">
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-orange-500" />
                  <span>Step 7 — Review Application Dossier</span>
                </h2>
                <p className="text-slate-500 text-[11px]">
                  Carefully inspect each section before final submission. Click [ EDIT ] on any section to revise.
                </p>
              </div>

              {/* Review Sections */}
              <div className="space-y-3">
                {/* 1. Personal */}
                <div className="p-3.5 bg-slate-50 border rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      Personal Information
                    </span>
                    <p className="font-extrabold text-slate-900 text-xs">
                      {firstName} {middleName} {lastName} ({gender}, DOB: {dob})
                    </p>
                    <p className="text-slate-500 text-[11px]">
                      {email} • {mobile} • {city}, {nationality}
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-2.5 py-1 text-orange-600 font-bold hover:bg-orange-50 rounded-lg text-xs"
                  >
                    [ EDIT ]
                  </button>
                </div>

                {/* 2. Passport */}
                <div className="p-3.5 bg-slate-50 border rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">Passport</span>
                    <p className="font-extrabold text-slate-900 text-xs">
                      {hasPassport === "YES"
                        ? `Passport: ${passportNumber} (${passportCountry}, Exp: ${expiryDate})`
                        : "Passport Pending (To be provided prior to visa processing)"}
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-2.5 py-1 text-orange-600 font-bold hover:bg-orange-50 rounded-lg text-xs"
                  >
                    [ EDIT ]
                  </button>
                </div>

                {/* 3. Education */}
                <div className="p-3.5 bg-slate-50 border rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">Education</span>
                    <p className="font-extrabold text-slate-900 text-xs">
                      {qualificationsList.length} qualification(s) recorded:{" "}
                      {qualificationsList.map((q) => `${q.degree || q.level} (${q.percentageOrCgpa})`).join(", ")}
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="px-2.5 py-1 text-orange-600 font-bold hover:bg-orange-50 rounded-lg text-xs"
                  >
                    [ EDIT ]
                  </button>
                </div>

                {/* 4. English & Tests */}
                <div className="p-3.5 bg-slate-50 border rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      English & Standardized Tests
                    </span>
                    <p className="font-extrabold text-slate-900 text-xs">
                      Academic English: {academicEnglishMarks}
                      {testsStatus === "YES" && ` • ${selectedTestType}: Overall ${testScoreOverall}`}
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="px-2.5 py-1 text-orange-600 font-bold hover:bg-orange-50 rounded-lg text-xs"
                  >
                    [ EDIT ]
                  </button>
                </div>

                {/* 5. Program & Intake */}
                <div className="p-3.5 bg-slate-50 border rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      Selected Institution & Intake
                    </span>
                    <p className="font-extrabold text-slate-900 text-xs">
                      {currentCourse.courseName} — {currentUniv.name}
                    </p>
                    <p className="text-slate-500 text-[11px]">
                      Intake: {selectedIntake} • Tuition: {currentCourse.tuitionFee}
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentStep(5)}
                    className="px-2.5 py-1 text-orange-600 font-bold hover:bg-orange-50 rounded-lg text-xs"
                  >
                    [ EDIT ]
                  </button>
                </div>
              </div>

              {/* DECLARATION CHECKBOX (CRITICAL REQUIREMENT) */}
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={declarationAccepted}
                    onChange={(e) => setDeclarationAccepted(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-orange-600 focus:ring-orange-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-orange-950">
                    &quot;I confirm that the information provided in this application is accurate.&quot;
                  </span>
                </label>
                <p className="text-[11px] text-slate-500 pl-6">
                  Submission transmits your dossier to the central Super Admin engine for immediate verification.
                </p>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 8 — SUBMIT & SUCCESS SCREEN                         */}
          {/* ======================================================== */}
          {currentStep === 8 && (
            <div className="py-6 text-center space-y-5 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Dossier Successfully Transmitted
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-2">
                  Application Submitted Successfully
                </h2>
                <p className="text-xs text-slate-500">
                  Your application record has been registered in the DevGrate admissions pipeline.
                </p>
              </div>

              {/* Application Details Summary Box */}
              <div className="p-5 bg-slate-50 border rounded-2xl max-w-lg mx-auto text-left space-y-2.5 text-xs">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-slate-500 font-medium">Application ID:</span>
                  <span className="font-mono font-extrabold text-orange-600 text-sm">
                    {submittedApp?.camsId || "APP-2026-89410"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">University:</span>
                  <strong className="text-slate-900">{currentUniv.name}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Course:</span>
                  <strong className="text-slate-900">{currentCourse.courseName}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Intake:</span>
                  <strong className="text-slate-900">{selectedIntake}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Submission Date:</span>
                  <strong className="text-slate-900">
                    {new Date().toISOString().slice(0, 10)}
                  </strong>
                </div>
              </div>

              {/* Success Action Buttons: VIEW APPLICATION & GO TO DASHBOARD */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onGoToDashboard();
                  }}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all cursor-pointer"
                >
                  GO TO DASHBOARD
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (submittedApp) onApplicationCompleted(submittedApp);
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-extrabold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  VIEW APPLICATION IN TRACKER
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls (Steps 1 to 7) */}
        {currentStep < 8 && (
          <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-2 cursor-pointer"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              )}

              {currentStep < 7 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-extrabold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-98"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}

              {currentStep === 7 && (
                <button
                  type="button"
                  disabled={!declarationAccepted}
                  onClick={handleSubmitApplication}
                  className={`px-6 py-2.5 font-black text-white rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                    declarationAccepted
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 active:scale-98"
                      : "bg-slate-300 cursor-not-allowed opacity-60"
                  }`}
                >
                  <span>SUBMIT APPLICATION</span>
                  <Sparkles className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Qualification Submodal for Step 3 */}
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
              <label className="font-bold text-slate-700">Level</label>
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
              <label className="font-bold text-slate-700">Institution Name</label>
              <input
                type="text"
                required
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

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setShowAddEduModal(false)}
                className="px-4 py-2 border rounded-xl font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold"
              >
                Save Qualification
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
