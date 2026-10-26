"use client";

import React, { useState, useEffect, useMemo } from "react";
import { usePlatform } from "@/context/PlatformContext";
import { acceptFor, uploadForCurrentUser, uploadStudentFile } from "@/lib/storage";
import { courseIntakes, currencyMark, money } from "@/lib/catalogOffers";
import { freshCommission } from "@/lib/commission";
import { buildTimeline, createTrackingId } from "@/utils/tracking";
import {
  CourseInfo,
  EducationQualification,
  EducationLevelType,
  DocumentCategoryType,
  DocumentUploadItem,
  ApplicationRecord,
  StudentProfile,
} from "@/types";
import { evaluateFrontendEligibility } from "@/data/studentSeedData";
import {
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  User,
  ShieldCheck,
  GraduationCap,
  Languages,
  Compass,
  FileText,
  Upload,
  Sparkles,
  Trash2,
  Pencil,
  Calendar,
  Building2,
  MapPin,
  Plus,
  ArrowRight,
  School,
  Check,
} from "lucide-react";

function documentCategory(category: string): DocumentUploadItem["category"] {
  if (category === "Passport") return "Passport";
  if (category === "IELTS") return "English Test";
  if (category === "CV / Resume") return "CV";
  if (category === "Statement of Purpose") return "SOP";
  if (category === "Letter of Recommendation") return "Recommendation Letters";
  return "Academic Documents";
}

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
    updateEducation,
    deleteEducation,
    uploadDocument,
  } = usePlatform();

  // Wizard Step: 1 to 8
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectionError, setSelectionError] = useState<string | null>(null);

  // Selected University & Course state. A course card can preselect; Start Application does not.
  const [selectedUnivId, setSelectedUnivId] = useState<string>(initialCourse?.universityId || "");
  const [selectedCourseId, setSelectedCourseId] = useState<string>(initialCourse?.id || "");
  const [selectedIntake, setSelectedIntake] = useState<string>(initialCourse?.activeIntake || "");

  // STEP 1: Personal Details
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
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [postalCode, setPostalCode] = useState("");

  // STEP 2: Passport
  const [hasPassport, setHasPassport] = useState<"YES" | "NO">("YES");
  const [passportNumber, setPassportNumber] = useState("");
  const [passportCountry, setPassportCountry] = useState("India");
  const [dateOfIssue, setDateOfIssue] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [placeOfIssue, setPlaceOfIssue] = useState("");

  // STEP 3: Education Qualifications
  const [qualificationsList, setQualificationsList] = useState<EducationQualification[]>([]);
  const [showAddEduModal, setShowAddEduModal] = useState(false);
  const [editingEduId, setEditingEduId] = useState<string | null>(null);
  const [eduLevel, setEduLevel] = useState<EducationLevelType>("Bachelor");
  const [eduInstitution, setEduInstitution] = useState("");
  const [eduBoard, setEduBoard] = useState("");
  const [eduStream, setEduStream] = useState("MPC");
  const [eduDegree, setEduDegree] = useState("");
  const [eduCourse, setEduCourse] = useState("");
  const [eduSpecialization, setEduSpecialization] = useState("");
  const [eduStartYear, setEduStartYear] = useState("");
  const [eduPassYear, setEduPassYear] = useState("");
  const [eduScore, setEduScore] = useState("");
  const [eduCgpaScale, setEduCgpaScale] = useState("10");
  const [eduBacklogs, setEduBacklogs] = useState(0);
  const [eduActiveBacklogs, setEduActiveBacklogs] = useState(0);
  const [eduEnglishMarks, setEduEnglishMarks] = useState("");
  const [eduMaxEnglishMarks, setEduMaxEnglishMarks] = useState("100");

  // STEP 4: English Proficiency & Tests
  const [testsStatus, setTestsStatus] = useState<"YES" | "NO" | "PLANNING TO TAKE">("YES");
  const [selectedTestType, setSelectedTestType] = useState<
    "IELTS" | "TOEFL" | "PTE" | "Duolingo" | "GRE" | "GMAT"
  >("IELTS");
  const [testScoreOverall, setTestScoreOverall] = useState("");
  const [testSubL, setTestSubL] = useState("");
  const [testSubR, setTestSubR] = useState("");
  const [testSubW, setTestSubW] = useState("");
  const [testSubS, setTestSubS] = useState("");
  const [greVerbal, setGreVerbal] = useState("");
  const [greQuant, setGreQuant] = useState("");
  const [greAwa, setGreAwa] = useState("");

  // STEP 5: Study Details & Preferences
  const [prefStudyLevel, setPrefStudyLevel] = useState("Postgraduate");
  const [scholarshipRequired, setScholarshipRequired] = useState<"YES" | "NO">("YES");
  const [applicationNotes, setApplicationNotes] = useState("");

  // STEP 6: Documents
  const [uploadedDocs, setUploadedDocs] = useState<
    {
      category: DocumentCategoryType;
      title: string;
      fileName: string;
      status: string;
      storagePath?: string;
      storageBucket?: string;
      fileSize?: string;
    }[]
  >([]);
  const [uploadingCat, setUploadingCat] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // STEP 7: Review & Declaration
  const [declarationAccepted, setDeclarationAccepted] = useState(false);

  // STEP 8: Submitted Result
  const [submittedApp, setSubmittedApp] = useState<ApplicationRecord | null>(null);

  // Reset or initialize on open
  useEffect(() => {
    if (!isOpen) return;
    setCurrentStep(1);
    setSubmittedApp(null);
    setDeclarationAccepted(false);
    setSelectionError(null);
    if (initialCourse) {
      setSelectedUnivId(initialCourse.universityId);
      setSelectedCourseId(initialCourse.id);
      setSelectedIntake(initialCourse.activeIntake || "");
    } else {
      setSelectedUnivId("");
      setSelectedCourseId("");
      setSelectedIntake("");
    }
  }, [isOpen, initialCourse]);

  // Pre-fill profile fields from activeStudent
  useEffect(() => {
    if (activeStudent && isOpen) {
      setFirstName(activeStudent.firstName || activeStudent.name.split(" ")[0] || "Student");
      setMiddleName(activeStudent.middleName || "");
      setLastName(activeStudent.lastName || activeStudent.name.split(" ").slice(1).join(" ") || "");
      setDob(activeStudent.personal.dob || "");
      setGender(activeStudent.personal.gender || "");
      setEmail(activeStudent.email || "");
      setMobile(activeStudent.mobile || "");
      setAltMobile(activeStudent.alternateMobile || "");
      setNationality(activeStudent.personal.nationality || "Indian");
      setCountryOfResidence(activeStudent.personal.countryOfResidence || "India");
      setStreetAddress(activeStudent.personal.address.street || "");
      setCity(activeStudent.personal.address.city || "");
      setStateName(activeStudent.personal.address.state || "");
      setPostalCode(activeStudent.personal.address.postalCode || "");

      setHasPassport(activeStudent.passport.hasPassport || "NO");
      setPassportNumber(activeStudent.passport.passportNumber || "");
      setPassportCountry(activeStudent.passport.passportCountry || "");
      setDateOfIssue(activeStudent.passport.dateOfIssue || "");
      setExpiryDate(activeStudent.passport.expiryDate || "");
      setPlaceOfIssue(activeStudent.passport.placeOfIssue || "");

      setQualificationsList(activeStudent.education || []);

      setTestsStatus(activeStudent.testsStatus || "YES");
      if (activeStudent.standardizedTests && activeStudent.standardizedTests.length > 0) {
        const firstTest = activeStudent.standardizedTests[0];
        setSelectedTestType(firstTest.type as any);
        setTestScoreOverall(firstTest.overallScore || "");
        setTestSubL(firstTest.subScores?.listening || "");
        setTestSubR(firstTest.subScores?.reading || "");
        setTestSubW(firstTest.subScores?.writing || "");
        setTestSubS(firstTest.subScores?.speaking || "");
      }

      setPrefStudyLevel(activeStudent.studyPreferences.preferredStudyLevel || "Postgraduate");

      setUploadedDocs(
        (activeStudent.documents || []).map((d) => ({
          category: d.category,
          title: d.title,
          fileName: d.fileName || `${d.category}.pdf`,
          status: d.status || "Uploaded",
          storagePath: d.storagePath,
          storageBucket: d.storageBucket,
          fileSize: d.fileSize,
        }))
      );
    }
  }, [activeStudent, isOpen]);

  // Derived current University and Course objects
  const currentUniv = useMemo(() => {
    return universities.find((u) => u.id === selectedUnivId) || null;
  }, [universities, selectedUnivId]);

  const currentCourse = useMemo(() => {
    return courses.find((c) => c.id === selectedCourseId) || null;
  }, [courses, selectedCourseId]);

  const availableCoursesForUniv = useMemo(() => {
    if (!selectedUnivId) return [];
    return courses.filter((c) => c.universityId === selectedUnivId);
  }, [courses, selectedUnivId]);

  const intakeChoices = useMemo(() => (currentCourse ? courseIntakes(currentCourse) : []), [currentCourse]);

  const requiredDocumentCategories = useMemo(() => {
    const categories = ["Profile Photograph", "10th Certificate", "12th Certificate", "CV / Resume", "Statement of Purpose"];
    if (hasPassport === "YES") categories.unshift("Passport");
    if (qualificationsList.some((item) => item.level === "Bachelor")) {
      categories.push("Bachelor Degree", "Bachelor Transcripts");
    }
    if (testsStatus === "YES") categories.push("IELTS");
    return categories;
  }, [hasPassport, qualificationsList, testsStatus]);

  const stepFilled = (step: number) => {
    if (step === 1) {
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
      return Boolean(
        firstName.trim() &&
          lastName.trim() &&
          dob.trim() &&
          gender.trim() &&
          nationality.trim() &&
          emailOk &&
          mobile.trim() &&
          city.trim() &&
          postalCode.trim()
      );
    }
    if (step === 2) return hasPassport === "NO" || Boolean(passportNumber.trim());
    if (step === 3) return qualificationsList.length > 0;
    if (step === 4) return testsStatus !== "YES" || Boolean(testScoreOverall.trim());
    if (step === 5) return Boolean(currentUniv && currentCourse && selectedIntake.trim());
    if (step === 6) {
      return requiredDocumentCategories.every((category) =>
        uploadedDocs.some((doc) => doc.category === category && (doc.storagePath || doc.fileName))
      );
    }
    if (step === 7) return declarationAccepted;
    return Boolean(submittedApp);
  };

  const stepGap = (step: number) => {
    if (step === 1) return "Fill the required personal and contact fields before this section is complete.";
    if (step === 2) return "Enter the passport number, or choose NO if you do not hold one yet.";
    if (step === 3) return "Add at least one qualification before this section is complete.";
    if (step === 4) return "Enter the test score, or choose that you do not have a test yet.";
    if (step === 5) return "Select a university, a course, and an intake.";
    if (step === 6) return "Upload each required document before this section is complete.";
    if (step === 7) return "Accept the declaration before this section is complete.";
    return "";
  };

  const filledCount = [1, 2, 3, 4, 5, 6, 7, 8].filter((step) => stepFilled(step)).length;

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
    return "Not added";
  }, [qualificationsList]);

  // Frontend Eligibility check
  const eligibilityProfile = useMemo((): StudentProfile | null => {
    if (activeStudent) return activeStudent;
    const tests =
      testsStatus === "YES"
        ? [
            {
              id: "draft-test",
              type: selectedTestType,
              overallScore: testScoreOverall,
              subScores: {
                listening: testSubL,
                reading: testSubR,
                writing: testSubW,
                speaking: testSubS,
              },
            },
          ]
        : [];
    return {
      education: qualificationsList,
      standardizedTests: tests,
      testsStatus,
      passport: { hasPassport, passportNumber },
    } as unknown as StudentProfile;
  }, [
    activeStudent,
    qualificationsList,
    testsStatus,
    selectedTestType,
    testScoreOverall,
    testSubL,
    testSubR,
    testSubW,
    testSubS,
    hasPassport,
    passportNumber,
  ]);

  const eligibility = useMemo(() => {
    return evaluateFrontendEligibility(eligibilityProfile, currentCourse);
  }, [eligibilityProfile, currentCourse]);

  // Handle adding qualification
  const resetEduForm = () => {
    setEditingEduId(null);
    setEduLevel("Bachelor");
    setEduInstitution("");
    setEduBoard("");
    setEduStream("MPC");
    setEduDegree("");
    setEduCourse("");
    setEduSpecialization("");
    setEduStartYear("");
    setEduPassYear("");
    setEduScore("");
    setEduEnglishMarks("");
    setEduMaxEnglishMarks("100");
    setEduBacklogs(0);
    setEduActiveBacklogs(0);
  };

  const openAddQualification = () => {
    resetEduForm();
    setShowAddEduModal(true);
  };

  const openEditQualification = (item: EducationQualification) => {
    setEditingEduId(item.id);
    setEduLevel(item.level);
    setEduInstitution(item.institutionName || "");
    setEduBoard(item.boardOrUniversity || "");
    setEduStream(item.stream || "MPC");
    setEduDegree(item.degree || "");
    setEduCourse(item.course || "");
    setEduSpecialization(item.specialization || "");
    setEduStartYear(item.startYear || "");
    setEduPassYear(item.passOutYear || "");
    setEduScore(item.percentageOrCgpa || "");
    setEduCgpaScale(item.cgpaScale || "10");
    setEduEnglishMarks(item.englishMarks || "");
    setEduMaxEnglishMarks(item.maxEnglishMarks || "100");
    setEduBacklogs(item.numberOfBacklogs || 0);
    setEduActiveBacklogs(item.activeBacklogs || 0);
    setShowAddEduModal(true);
  };

  const handleAddQualification = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      level: eduLevel,
      institutionName: eduInstitution.trim(),
      boardOrUniversity: eduBoard.trim(),
      stream: eduLevel === "12th" ? eduStream : undefined,
      degree: eduDegree.trim(),
      course: eduCourse.trim(),
      specialization: eduSpecialization.trim(),
      startYear: eduStartYear.trim(),
      passOutYear: eduPassYear.trim(),
      percentageOrCgpa: eduScore.trim(),
      cgpaScale: eduLevel === "Bachelor" || eduLevel === "Master" ? eduCgpaScale : undefined,
      englishMarks: eduLevel === "12th" || eduLevel === "Diploma" ? eduEnglishMarks.trim() : undefined,
      maxEnglishMarks: eduLevel === "12th" || eduLevel === "Diploma" ? eduMaxEnglishMarks.trim() : undefined,
      hasBacklogs: eduBacklogs > 0,
      numberOfBacklogs: eduBacklogs,
      activeBacklogs: eduActiveBacklogs,
    };
    if (editingEduId) {
      updateEducation(editingEduId, payload);
      setQualificationsList((prev) =>
        prev.map((item) => (item.id === editingEduId ? { ...item, ...payload } : item))
      );
    } else {
      const created: EducationQualification = {
        ...payload,
        id: `edu-${Date.now()}`,
        verificationStatus: "Pending",
      };
      setQualificationsList((prev) => [...prev, created]);
      addEducation(payload);
    }
    setShowAddEduModal(false);
    resetEduForm();
  };

  // Submit Application
  const handleSubmitApplication = () => {
    if (!currentUniv || !currentCourse || !selectedIntake) {
      setSelectionError("Select a university, a course, and an intake before submitting.");
      setCurrentStep(5);
      return;
    }
    const notes = applicationNotes || `Application for ${currentCourse.courseName} at ${currentUniv.name}.`;
    if (activeStudent) {
      const newApp = submitStudentApplication({
        universityId: currentUniv.id,
        courseId: currentCourse.id,
        intake: selectedIntake,
        notes,
      });
      if (!newApp) return;
      setSubmittedApp(newApp);
      setCurrentStep(8);
      onApplicationCompleted(newApp);
      return;
    }

    const studentName = [firstName, middleName, lastName].map((part) => part.trim()).filter(Boolean).join(" ");
    if (!studentName || !email.trim()) {
      setSelectionError("Enter the student's name and email before submitting.");
      setCurrentStep(1);
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    const spokenTest = selectedTestType === "GRE" || selectedTestType === "GMAT" ? "Other" : selectedTestType;
    const mark = currencyMark([currentCourse]);
    const filed: ApplicationRecord = {
      camsId: createTrackingId("APP"),
      student: {
        firstName: firstName.trim(),
        middleName: middleName.trim() || undefined,
        lastName: lastName.trim(),
        name: studentName,
        dob: dob.trim(),
        gender,
        nationality: nationality.trim(),
        passportNumber: hasPassport === "YES" ? passportNumber.trim() : "",
        passportExpiry: expiryDate.trim(),
        email: email.trim(),
        phone: mobile.trim(),
        studentId: createTrackingId("STU"),
        address: {
          country: countryOfResidence.trim(),
          state: stateName.trim(),
          city: city.trim(),
          postalCode: postalCode.trim(),
          streetAddress: streetAddress.trim(),
        },
      },
      university: currentUniv,
      course: { ...currentCourse, activeIntake: selectedIntake },
      primaryStatus: "Application Submitted",
      secondaryStatus: "Documents Pending",
      dateAdded: today,
      dateModified: today,
      counselorName: "B2B partner",
      qualifications: qualificationsList.map((item) => ({
        id: item.id,
        highestQualification: item.degree || item.level,
        institution: item.institutionName,
        course: item.course || item.stream || item.level,
        yearCompleted: item.passOutYear,
        gradePercentage: item.percentageOrCgpa,
      })),
      englishProficiency: {
        testType: testsStatus === "YES" ? spokenTest : "English waiver",
        overallScore: testsStatus === "YES" ? testScoreOverall || "N/A" : "N/A",
        readingScore: testSubR || "N/A",
        writingScore: testSubW || "N/A",
        listeningScore: testSubL || "N/A",
        speakingScore: testSubS || "N/A",
      },
      documents: uploadedDocs.map((doc) => ({
        id: createTrackingId("DOC"),
        category: documentCategory(doc.category),
        fileName: doc.fileName,
        fileSize: doc.fileSize || "Uploaded",
        storagePath: doc.storagePath,
        storageBucket: doc.storageBucket,
        progress: 100,
        status: "Uploaded" as const,
      })),
      timeline: buildTimeline("Application Submitted", today),
      payment: {
        grossTuition: currentCourse.tuitionFee,
        scholarship: scholarshipRequired === "YES" ? "Requested" : "Not requested",
        depositPaid: money(0, mark),
        netBalanceDue: currentCourse.tuitionFee,
        paymentStatus: "Pending",
      },
      commission: freshCommission(currentCourse),
      notes: [{ id: `note-${Date.now()}`, author: studentName, date: today, text: notes }],
    };
    setSubmittedApp(filed);
    setCurrentStep(8);
    onApplicationCompleted(filed);
  };

  if (!isOpen) return null;
  if (universities.length === 0 || courses.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-6 max-w-md text-sm text-slate-700 space-y-3">
          <p className="font-bold text-slate-900">No courses are available yet.</p>
          <p>An admin needs to add an institution and at least one course before a student can apply.</p>
          <button type="button" onClick={onClose} className="px-4 py-2 bg-orange-500 text-white rounded-xl font-bold">Close</button>
        </div>
      </div>
    );
  }

  const stepTitles = [
    "Personal Details",
    "Passport",
    "Education",
    "English Tests",
    "Target Course",
    "Documents",
    "Review",
    "Submit",
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-[#E7E5E0] overflow-hidden flex flex-col my-auto h-[90vh] max-h-[820px]">
        {/* SOLID BRAND COLOR TOP BAR — FLAT #ea580c (ZERO GRADIENT) */}
        <div className="bg-[#ea580c] text-white px-6 sm:px-8 py-3.5 border-b border-[#c2410c] flex items-center justify-between gap-4 shrink-0 shadow-xs">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white shrink-0">
              <GraduationCap className="w-5 h-5 text-[#A3E5C3]" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/15 text-white text-[10px] font-bold uppercase tracking-wider border border-white/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
                  Application
                </span>
                <span className="text-white/80 text-xs font-medium truncate hidden sm:inline">
                  Step {currentStep} of 8 — {stepTitles[currentStep - 1]}
                </span>
              </div>
              <h1 className="font-heading text-base sm:text-lg font-bold text-white truncate leading-tight mt-0.5">
                {currentCourse ? `Apply to ${currentCourse.courseName}` : "Start application"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right hidden md:block">
              <p className="text-xs font-semibold text-white/95 leading-tight">
                {currentUniv?.name || "University not selected"}
              </p>
              <p className="text-[11px] text-[#A3E5C3] font-medium">
                {selectedIntake ? `${selectedIntake} Intake` : "Intake not selected"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 border border-white/15"
              title="Close Wizard"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Lower Split Layout: Left Rail + Right Form Canvas */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* ======================================================== */}
          {/* LEFT RAIL: DOSSIER CONTEXT & 8-STEP VERTICAL CHECKLIST   */}
          {/* ======================================================== */}
          <aside className="w-full md:w-80 bg-[#FAFAF8] border-b md:border-b-0 md:border-r border-[#E7E5E0] flex flex-col justify-between p-6 shrink-0 overflow-y-auto">
            <div className="space-y-6">
              {/* Target Program Context Card */}
              <div className="p-3.5 bg-white border border-[#E7E5E0] rounded-xl space-y-1.5 shadow-2xs">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
                  Target Program
                </span>
                <p className="font-bold text-slate-900 text-xs leading-snug">
                  {currentCourse?.courseName || "No course selected"}
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  {currentUniv?.name || "No university selected"}
                  {selectedIntake ? ` • ${selectedIntake}` : ""}
                </p>
                {currentStep !== 5 && currentStep !== 8 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(5)}
                    className="text-[11px] font-semibold text-[#ea580c] hover:text-[#c2410c] hover:underline pt-1 inline-block cursor-pointer"
                  >
                    {currentCourse ? "Change Course →" : "Select Course →"}
                  </button>
                )}
              </div>

              {/* Vertical Step Checklist */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 px-1">
                  Application Checklist
                </span>
                {stepTitles.map((title, idx) => {
                  const stepNum = idx + 1;
                  const isCurrent = currentStep === stepNum;
                  const isDone = stepFilled(stepNum) && !isCurrent;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (stepNum <= currentStep || stepFilled(stepNum)) {
                          setSelectionError(null);
                          setCurrentStep(stepNum);
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all text-xs ${
                        isCurrent
                          ? "bg-white text-[#ea580c] font-semibold shadow-xs border border-[#E7E5E0]"
                          : isDone
                          ? "text-slate-700 hover:bg-white/60 cursor-pointer font-medium"
                          : "text-slate-400 cursor-default"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                            isCurrent
                              ? "bg-[#ea580c] text-white"
                              : isDone
                              ? "bg-[#fff7ed] text-[#ea580c]"
                              : "bg-slate-100 text-slate-400 border border-[#E7E5E0]"
                          }`}
                        >
                          {isDone ? "✓" : stepNum}
                        </span>
                        <span className="truncate">{title}</span>
                      </div>
                      {isCurrent && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Overall Progress */}
            <div className="pt-4 border-t border-[#E7E5E0] mt-4 space-y-1.5">
              <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                <span>Overall Progress</span>
                <strong className="text-slate-800">Step {currentStep} of 8</strong>
              </div>
              <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#ea580c] transition-all duration-300 rounded-full"
                  style={{ width: `${(currentStep / 8) * 100}%` }}
                />
              </div>
            </div>
          </aside>

          {/* ======================================================== */}
          {/* RIGHT MAIN CANVAS: ACTIVE STEP FORM & CONTROLS           */}
          {/* ======================================================== */}
          <div className="flex-1 flex flex-col bg-white min-w-0 overflow-hidden">
            {/* Step Subheader Strip */}
            <div className="px-6 sm:px-8 py-3 border-b border-[#E7E5E0] bg-[#FAFAF8]/70 flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-medium">Section {currentStep} of 8:</span>
                <span className="font-semibold text-slate-800">{stepTitles[currentStep - 1]}</span>
              </div>
              <span className="text-[11px] font-medium text-[#ea580c] bg-[#fff7ed] px-2.5 py-0.5 rounded-full border border-[#ea580c]/15">
                {Math.round((filledCount / 8) * 100)}% Complete
              </span>
            </div>

          {/* Scrollable Step Form Body */}
          <div className="p-6 sm:p-8 pb-12 overflow-y-auto flex-1 space-y-6 text-slate-800 text-xs bg-white">
          {/* ======================================================== */}
          {/* STEP 1 — PERSONAL DETAILS                                */}
          {/* ======================================================== */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div className="border-b border-[#E7E5E0] pb-3">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#ea580c]" />
                  <span>Step 1 — Personal & Contact Details</span>
                </h2>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Confirm your legal identity and contact channels as they will appear on your application.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-medium text-sm text-slate-700 block mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full mt-1 h-11 px-3.5 rounded-[10px] border border-[#E7E5E0] text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c] transition-all"
                  />
                </div>
                <div>
                  <label className="font-medium text-sm text-slate-700 block mb-1">Middle Name</label>
                  <input
                    type="text"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                    className="w-full mt-1 h-11 px-3.5 rounded-[10px] border border-[#E7E5E0] text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c] transition-all"
                  />
                </div>
                <div>
                  <label className="font-medium text-sm text-slate-700 block mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full mt-1 h-11 px-3.5 rounded-[10px] border border-[#E7E5E0] text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-medium text-sm text-slate-700 block mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full mt-1 h-11 px-3.5 rounded-[10px] border border-[#E7E5E0] text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c] transition-all"
                  />
                </div>
                <div>
                  <label className="font-medium text-sm text-slate-700 block mb-1">Gender *</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full mt-1 h-11 px-3.5 rounded-[10px] border border-[#E7E5E0] text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c] bg-white transition-all"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium text-sm text-slate-700 block mb-1">Nationality *</label>
                  <input
                    type="text"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    className="w-full mt-1 h-11 px-3.5 rounded-[10px] border border-[#E7E5E0] text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-medium text-sm text-slate-700 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full mt-1 h-11 px-3.5 rounded-[10px] border border-[#E7E5E0] text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c] transition-all"
                  />
                </div>
                <div>
                  <label className="font-medium text-sm text-slate-700 block mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full mt-1 h-11 px-3.5 rounded-[10px] border border-[#E7E5E0] text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c] transition-all"
                  />
                </div>
                <div>
                  <label className="font-medium text-sm text-slate-700 block mb-1">Alternate Contact</label>
                  <input
                    type="tel"
                    value={altMobile}
                    onChange={(e) => setAltMobile(e.target.value)}
                    className="w-full mt-1 h-11 px-3.5 rounded-[10px] border border-[#E7E5E0] text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-2">
                  <label className="font-medium text-sm text-slate-700 block mb-1">Street Address</label>
                  <input
                    type="text"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    className="w-full mt-1 h-11 px-3.5 rounded-[10px] border border-[#E7E5E0] text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c] transition-all"
                  />
                </div>
                <div>
                  <label className="font-medium text-sm text-slate-700 block mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full mt-1 h-11 px-3.5 rounded-[10px] border border-[#E7E5E0] text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c] transition-all"
                  />
                </div>
                <div>
                  <label className="font-medium text-sm text-slate-700 block mb-1">Postal / PIN Code *</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full mt-1 h-11 px-3.5 rounded-[10px] border border-[#E7E5E0] text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c] transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 2 — PASSPORT DETAILS                                */}
          {/* ======================================================== */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#ea580c]" />
                  <span>Step 2 — Passport Details</span>
                </h2>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  International travel identity document status for student visa & CAS eligibility.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900">Do you hold a valid passport?</h3>
                    <p className="text-[11px] text-slate-500">
                      Select YES if you currently possess a passport, or NO if currently in renewal/process.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setHasPassport("YES")}
                      className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                        hasPassport === "YES"
                          ? "bg-[#ea580c] text-white shadow-xs"
                          : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      YES
                    </button>
                    <button
                      type="button"
                      onClick={() => setHasPassport("NO")}
                      className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                        hasPassport === "NO"
                          ? "bg-slate-800 text-white shadow-xs"
                          : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      NO
                    </button>
                  </div>
                </div>

                {hasPassport === "YES" ? (
                  <div className="space-y-4 pt-3 border-t border-[#E7E5E0]">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[13px] font-medium text-slate-700">Passport Number *</label>
                        <input
                          type="text"
                          required
                          value={passportNumber}
                          onChange={(e) => setPassportNumber(e.target.value)}
                          className="w-full mt-1 h-11 px-3.5 rounded-[10px] border border-[#E7E5E0] text-sm font-mono uppercase text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c] transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[13px] font-medium text-slate-700">Issuing Country</label>
                        <input
                          type="text"
                          value={passportCountry}
                          onChange={(e) => setPassportCountry(e.target.value)}
                          className="w-full mt-1 h-11 px-3.5 rounded-[10px] border border-[#E7E5E0] text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c] transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[13px] font-medium text-slate-700">Place of Issue</label>
                        <input
                          type="text"
                          value={placeOfIssue}
                          onChange={(e) => setPlaceOfIssue(e.target.value)}
                          className="w-full mt-1 h-11 px-3.5 rounded-[10px] border border-[#E7E5E0] text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c] transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[13px] font-medium text-slate-700">Date of Issue</label>
                        <input
                          type="date"
                          value={dateOfIssue}
                          onChange={(e) => setDateOfIssue(e.target.value)}
                          className="w-full mt-1 h-11 px-3.5 rounded-[10px] border border-[#E7E5E0] text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c] transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[13px] font-medium text-slate-700">Expiry Date</label>
                        <input
                          type="date"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          className="w-full mt-1 h-11 px-3.5 rounded-[10px] border border-[#E7E5E0] text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c] transition-all"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-1 text-amber-900">
                    <p className="font-semibold text-xs">Passport details can be uploaded later</p>
                    <p className="text-[11px] text-amber-800">
                      Your application will proceed seamlessly as <strong>Passport Pending</strong>. Passport copy must be submitted prior to CAS / visa issuance.
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
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-[#ea580c]" />
                    <span>Step 3 — Academic Background & Qualifications</span>
                  </h2>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Add all completed degrees and school boards (10th, 12th, Bachelor&apos;s, Master&apos;s).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openAddQualification}
                  className="px-3.5 py-2 bg-[#ea580c] hover:bg-[#c2410c] text-white font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98] transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>ADD QUALIFICATION</span>
                </button>
              </div>

              {/* Qualifications List */}
              <div className="space-y-3">
                {qualificationsList.length === 0 ? (
                  <div className="p-8 border-2 border-dashed border-[#E7E5E0] rounded-xl text-center space-y-2">
                    <GraduationCap className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="font-bold text-slate-700">No qualifications recorded yet</p>
                    <p className="text-slate-400">Click &quot;ADD QUALIFICATION&quot; to specify your undergraduate or school education.</p>
                  </div>
                ) : (
                  qualificationsList.map((q) => (
                    <div
                      key={q.id}
                      className="p-4 bg-white border border-[#E7E5E0] rounded-xl flex items-center justify-between gap-3 shadow-xs hover:border-[#fed7aa] transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">
                            {q.degree || q.level}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 font-semibold text-[10px] text-slate-700 border border-slate-200">
                            {q.level}
                          </span>
                          {q.specialization && (
                            <span className="text-[11px] text-slate-500">
                              ({q.specialization})
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 text-xs">
                          {q.institutionName} • {q.boardOrUniversity}
                        </p>
                        <p className="text-slate-500 text-[11px]">
                          Years: <strong className="text-slate-700">{q.startYear ? `${q.startYear} – ` : ""}{q.passOutYear}</strong> • Score:{" "}
                          <strong className="text-slate-700">
                            {q.percentageOrCgpa} {q.cgpaScale ? `(${q.cgpaScale} scale)` : ""}
                          </strong>
                          {q.englishMarks && ` • English Marks: ${q.englishMarks}/${q.maxEnglishMarks || 100}`}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditQualification(q)}
                          className="p-2 text-slate-400 hover:text-orange-700 rounded-lg hover:bg-orange-50 transition-colors cursor-pointer"
                          title="Edit qualification"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setQualificationsList((prev) => prev.filter((item) => item.id !== q.id));
                            deleteEducation(q.id);
                          }}
                          className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
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

          {/* ======================================================== */}
          {/* STEP 4 — ENGLISH PROFICIENCY                             */}
          {/* ======================================================== */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-fade-in">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Languages className="w-4 h-4 text-[#ea580c]" />
                  <span>Step 4 — English Proficiency & Standardized Tests</span>
                </h2>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Academic English scores and standardized language or entrance tests.
                </p>
              </div>

              {/* Section A: Academic English */}
              <div className="p-4 bg-[#fff7ed] border border-[#fed7aa] rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#ea580c]">
                  A. Academic English Score
                </span>
                <p className="font-bold text-slate-900 text-xs">
                  Intermediate / 12th English Marks: <span className="text-[#ea580c]">{academicEnglishMarks}</span>
                </p>
                <p className="text-slate-600 text-[11px]">
                  Automatically evaluated from your senior secondary qualifications for university MOI / English waivers.
                </p>
              </div>

              {/* Section B: Standardized Exams */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  B. Standardized Tests (IELTS / TOEFL / PTE / GRE)
                </span>
                <p className="font-bold text-slate-900">
                  Have you attempted an English language proficiency or entrance exam?
                </p>

                <div className="flex flex-wrap gap-2">
                  {(["YES", "NO", "PLANNING TO TAKE"] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setTestsStatus(opt)}
                      className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                        testsStatus === opt
                          ? "bg-slate-900 text-white shadow-xs"
                          : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {testsStatus === "YES" ? (
                  <div className="space-y-4 pt-3 border-t border-[#E7E5E0]">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="text-[13px] font-medium text-slate-700">Test Type</label>
                        <select
                          value={selectedTestType}
                          onChange={(e) => setSelectedTestType(e.target.value as any)}
                          className="w-full mt-1 h-11 px-3.5 rounded-[10px] border border-[#E7E5E0] bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c] transition-all"
                        >
                          <option>IELTS</option>
                          <option>TOEFL</option>
                          <option>PTE</option>
                          <option>Duolingo</option>
                          <option>GRE</option>
                          <option>GMAT</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[13px] font-medium text-slate-700">Overall Score</label>
                        <input
                          type="text"
                          value={testScoreOverall}
                          onChange={(e) => setTestScoreOverall(e.target.value)}
                          className="w-full mt-1 h-11 px-3.5 rounded-[10px] border border-[#E7E5E0] text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c] transition-all"
                        />
                      </div>
                    </div>

                    {selectedTestType !== "GRE" && selectedTestType !== "GMAT" ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-white border border-[#E7E5E0] rounded-xl">
                        <div>
                          <label className="text-xs font-medium text-slate-600">Listening</label>
                          <input
                            type="text"
                            value={testSubL}
                            onChange={(e) => setTestSubL(e.target.value)}
                            className="w-full mt-1 h-10 px-3 rounded-[8px] border border-[#E7E5E0] text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c] transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-600">Reading</label>
                          <input
                            type="text"
                            value={testSubR}
                            onChange={(e) => setTestSubR(e.target.value)}
                            className="w-full mt-1 h-10 px-3 rounded-[8px] border border-[#E7E5E0] text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c] transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-600">Writing</label>
                          <input
                            type="text"
                            value={testSubW}
                            onChange={(e) => setTestSubW(e.target.value)}
                            className="w-full mt-1 h-10 px-3 rounded-[8px] border border-[#E7E5E0] text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c] transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-600">Speaking</label>
                          <input
                            type="text"
                            value={testSubS}
                            onChange={(e) => setTestSubS(e.target.value)}
                            className="w-full mt-1 h-10 px-3 rounded-[8px] border border-[#E7E5E0] text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c] transition-all"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-3 p-3.5 bg-white border border-[#E7E5E0] rounded-xl">
                        <div>
                          <label className="text-xs font-medium text-slate-600">Verbal</label>
                          <input
                            type="text"
                            value={greVerbal}
                            onChange={(e) => setGreVerbal(e.target.value)}
                            className="w-full mt-1 h-10 px-3 rounded-[8px] border border-[#E7E5E0] text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c] transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-600">Quantitative</label>
                          <input
                            type="text"
                            value={greQuant}
                            onChange={(e) => setGreQuant(e.target.value)}
                            className="w-full mt-1 h-10 px-3 rounded-[8px] border border-[#E7E5E0] text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c] transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-600">AWA Score</label>
                          <input
                            type="text"
                            value={greAwa}
                            onChange={(e) => setGreAwa(e.target.value)}
                            className="w-full mt-1 h-10 px-3 rounded-[8px] border border-[#E7E5E0] text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c] transition-all"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3.5 bg-[#FAFAF8] border border-[#E7E5E0] rounded-xl text-slate-700 space-y-1">
                    <p className="font-semibold text-xs text-slate-900">No test taken?</p>
                    <p className="text-[11px] text-slate-600">
                      • University English waiver may be granted based on 12th standard English score.
                      <br />
                      • Pre-sessional English course option available if required.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 5 — TARGET PROGRAM & COURSE SELECTION (REDESIGNED)  */}
          {/* ======================================================== */}
          {currentStep === 5 && (
            <div className="space-y-5 animate-fade-in">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#ea580c]" />
                  <span>Step 5 — Target University & Course Selection</span>
                </h2>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Select the university, course, and intake for this application.
                </p>
              </div>

              {/* Interactive Course & University Selectors */}
              <div className="p-5 bg-white border border-[#E7E5E0] rounded-xl shadow-xs space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* University Selector */}
                  <div>
                    <label className="text-[13px] font-medium text-slate-700 block mb-1">
                      Target University *
                    </label>
                    <select
                      value={selectedUnivId}
                      onChange={(e) => {
                        setSelectedUnivId(e.target.value);
                        setSelectedCourseId("");
                        setSelectedIntake("");
                        setSelectionError(null);
                      }}
                      className="w-full h-11 px-3.5 rounded-[10px] border border-[#E7E5E0] bg-white font-medium text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c] transition-all"
                    >
                      <option value="">Select a university</option>
                      {universities.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} — {u.country}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Course Selector */}
                  <div>
                    <label className="text-[13px] font-medium text-slate-700 block mb-1">
                      Degree Program / Course *
                    </label>
                    <select
                      value={selectedCourseId}
                      onChange={(e) => {
                        const newCourseId = e.target.value;
                        setSelectedCourseId(newCourseId);
                        const foundCourse = courses.find((c) => c.id === newCourseId);
                        const offered = foundCourse ? courseIntakes(foundCourse) : [];
                        setSelectedIntake(offered.length === 1 ? offered[0] : "");
                        setSelectionError(null);
                      }}
                      className="w-full h-11 px-3.5 rounded-[10px] border border-[#E7E5E0] bg-white font-medium text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c] transition-all"
                    >
                      <option value="">Select a course</option>
                      {availableCoursesForUniv.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.courseName} ({c.studyLevel})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#E7E5E0]">
                  {/* Intake Selector */}
                  <div>
                    <label className="text-[13px] font-medium text-slate-700 block mb-1">
                      Commencement Intake *
                    </label>
                    <select
                      value={selectedIntake}
                      onChange={(e) => {
                        setSelectedIntake(e.target.value);
                        setSelectionError(null);
                      }}
                      className="w-full h-11 px-3.5 rounded-[10px] border border-[#E7E5E0] bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c] transition-all"
                    >
                      <option value="">{intakeChoices.length === 0 ? "Intake not set" : "Select an intake"}</option>
                      {intakeChoices.map((intake) => (
                        <option key={intake} value={intake}>
                          {intake}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Scholarship Request */}
                  <div>
                    <label className="text-[13px] font-medium text-slate-700 block mb-1">
                      Merit Scholarship Consideration
                    </label>
                    <select
                      value={scholarshipRequired}
                      onChange={(e) => setScholarshipRequired(e.target.value as any)}
                      className="w-full h-11 px-3.5 rounded-[10px] border border-[#E7E5E0] bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c] transition-all"
                    >
                      <option value="YES">Yes — Consider for institutional merit grant</option>
                      <option value="NO">No — Self-funded / private sponsorship</option>
                    </select>
                  </div>
                </div>
                {selectionError && <p className="text-xs font-semibold text-rose-700">{selectionError}</p>}
              </div>

              {/* Program Overview & Financials Card */}
              {currentCourse && currentUniv ? (
              <div className="p-4 bg-[#FAFAF8] border border-[#E7E5E0] rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-[#ea580c] bg-[#fff7ed] px-2.5 py-0.5 rounded-full">
                      {currentCourse.studyLevel}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Duration: {currentCourse.duration}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {currentCourse.courseName}
                  </h3>
                  <p className="text-slate-600 text-xs flex items-center gap-2">
                    <span>{currentUniv.name}</span>
                    <span>•</span>
                    <span>{currentCourse.campus} Campus</span>
                  </p>
                </div>
                <div className="text-left sm:text-right shrink-0 bg-white p-3 rounded-lg border border-[#E7E5E0]">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Tuition Fee</span>
                  <span className="font-bold text-slate-900 text-base block text-[#ea580c]">
                    {currentCourse.tuitionFee}
                  </span>
                  <span className="text-slate-500 text-[11px] block mt-0.5">App Fee Waiver: Included</span>
                </div>
              </div>
              ) : (
                <p className="text-xs text-slate-500">Choose a university and a course. Nothing is selected yet.</p>
              )}

              {/* Live Eligibility Check Card */}
              <div
                className={`p-4 rounded-xl border space-y-2 ${
                  eligibility.status === "Likely Eligible"
                    ? "bg-[#fff7ed]/80 border-[#fed7aa] text-[#ea580c]"
                    : eligibility.status === "Requirements Need Review"
                    ? "bg-amber-50/80 border-amber-200 text-amber-900"
                    : "bg-[#FAFAF8] border-[#E7E5E0] text-slate-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Eligibility Assessment: {eligibility.status}</span>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white/80 px-2 py-0.5 rounded border border-current/20">
                    Live Evaluation
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

              {/* Notes */}
              <div>
                <label className="text-[13px] font-medium text-slate-700 block mb-1">
                  Statement of Intent / Application Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional brief notes or career objective for the Dakshinvedha admissions desk..."
                  value={applicationNotes}
                  onChange={(e) => setApplicationNotes(e.target.value)}
                  className="w-full p-3.5 rounded-[10px] border border-[#E7E5E0] text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c] transition-all"
                />
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 6 — SUPPORTING DOCUMENTS                            */}
          {/* ======================================================== */}
          {currentStep === 6 && (
            <div className="space-y-5 animate-fade-in">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#ea580c]" />
                  <span>Step 6 — Supporting Documents</span>
                </h2>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Upload documents required for submission. Files are verified by Dakshinvedha admissions officers.
                </p>
              </div>

              {uploadError && <p className="text-xs font-semibold text-rose-700">{uploadError}</p>}
              <div className="space-y-2.5">
                {[
                  { cat: "Passport", name: "Passport Bio-Page", required: hasPassport === "YES" },
                  { cat: "Profile Photograph", name: "Passport Size Photograph", required: true },
                  { cat: "10th Certificate", name: "10th / Secondary Certificate", required: true },
                  { cat: "12th Certificate", name: "12th / Intermediate Certificate", required: true },
                  {
                    cat: "Bachelor Degree",
                    name: "Bachelor Degree Certificate",
                    required: qualificationsList.some((q) => q.level === "Bachelor"),
                  },
                  {
                    cat: "Bachelor Transcripts",
                    name: "Consolidated Sem 1-8 Transcripts",
                    required: qualificationsList.some((q) => q.level === "Bachelor"),
                  },
                  {
                    cat: "IELTS",
                    name: "IELTS / PTE / Language Test Report",
                    required: testsStatus === "YES",
                  },
                  { cat: "CV / Resume", name: "Academic & Project CV", required: true },
                  { cat: "Statement of Purpose", name: "Statement of Purpose (SOP)", required: true },
                ]
                  .filter((item) => item.required)
                  .map((item, idx) => {
                    const existing = uploadedDocs.find((d) => d.category === item.cat);
                    return (
                      <div
                        key={idx}
                        className="p-3.5 bg-white border border-[#E7E5E0] rounded-xl flex items-center justify-between gap-3 text-xs shadow-xs hover:border-[#fed7aa] transition-colors"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{item.name}</p>
                          <p className="text-[11px] text-slate-500">
                            {item.cat} • {existing ? existing.fileName : "Not Uploaded"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                              existing?.status === "Verified"
                                ? "bg-[#fff7ed] text-[#ea580c] border-[#fed7aa]"
                                : existing
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                existing?.status === "Verified"
                                  ? "bg-[#ea580c]"
                                  : existing
                                  ? "bg-amber-500"
                                  : "bg-slate-400"
                              }`}
                            />
                            {existing?.status || "Not Uploaded"}
                          </span>
                          <label className="h-8 px-3 bg-white border border-[#E7E5E0] hover:bg-slate-50 rounded-lg font-medium text-slate-700 text-xs transition-colors cursor-pointer active:scale-[0.98] inline-flex items-center">
                            {uploadingCat === item.cat ? "Uploading..." : existing ? "Replace" : "Upload"}
                            <input
                              type="file"
                              accept={acceptFor(item.cat)}
                              className="sr-only"
                              disabled={uploadingCat === item.cat}
                              onChange={(event) => {
                                const file = event.target.files?.[0];
                                event.target.value = "";
                                if (!file) return;
                                setUploadError(null);
                                setUploadingCat(item.cat);
                                const upload = activeStudent
                                  ? uploadStudentFile(file, item.cat)
                                  : uploadForCurrentUser(file, item.cat);
                                void upload.then((result) => {
                                  setUploadingCat(null);
                                  if (!result.ok) {
                                    setUploadError(result.error);
                                    return;
                                  }
                                  const newDoc = {
                                    category: item.cat as DocumentCategoryType,
                                    title: item.name,
                                    fileName: result.fileName,
                                    status: "Uploaded",
                                    storagePath: result.path,
                                    storageBucket: result.bucket,
                                    fileSize: result.fileSize,
                                  };
                                  setUploadedDocs((prev) => [
                                    ...prev.filter((d) => d.category !== item.cat),
                                    newDoc,
                                  ]);
                                  uploadDocument({
                                    category: item.cat as DocumentCategoryType,
                                    title: item.name,
                                    fileName: result.fileName,
                                    fileSize: result.fileSize,
                                    storagePath: result.path,
                                    storageBucket: result.bucket,
                                  });
                                });
                              }}
                            />
                          </label>
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
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#ea580c]" />
                  <span>Step 7 — Review application</span>
                </h2>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Verify each section prior to submission. Click [ EDIT ] on any row to return and revise details.
                </p>
              </div>

              {/* Review Rows */}
              <div className="space-y-3">
                {/* 1. Target Course & Institution */}
                <div className="p-3.5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-2xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      Target Institution & Course
                    </span>
                    <p className="font-extrabold text-slate-900 text-xs">
                      {currentCourse && currentUniv
                        ? `${currentCourse.courseName} — ${currentUniv.name}`
                        : "Not selected"}
                    </p>
                    <p className="text-slate-500 text-[11px]">
                      Intake: {selectedIntake || "Not selected"} • Tuition: {currentCourse?.tuitionFee || "—"} • Campus: {currentCourse?.campus || "—"}
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentStep(5)}
                    className="px-2.5 py-1 text-[#ea580c] font-semibold hover:bg-[#fff7ed] rounded-lg text-xs cursor-pointer transition-colors"
                  >
                    [ EDIT ]
                  </button>
                </div>

                {/* 2. Personal */}
                <div className="p-3.5 bg-white border border-[#E7E5E0] rounded-xl flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      Personal Information
                    </span>
                    <p className="font-bold text-slate-900 text-xs">
                      {firstName} {middleName} {lastName} ({gender}, DOB: {dob})
                    </p>
                    <p className="text-slate-500 text-[11px]">
                      {email} • {mobile} • {city}, {nationality}
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-2.5 py-1 text-[#ea580c] font-semibold hover:bg-[#fff7ed] rounded-lg text-xs cursor-pointer transition-colors"
                  >
                    [ EDIT ]
                  </button>
                </div>

                {/* 3. Passport */}
                <div className="p-3.5 bg-white border border-[#E7E5E0] rounded-xl flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">Passport</span>
                    <p className="font-bold text-slate-900 text-xs">
                      {hasPassport === "YES"
                        ? `Passport: ${passportNumber} (${passportCountry}, Exp: ${expiryDate})`
                        : "Passport Pending (To be provided prior to visa processing)"}
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-2.5 py-1 text-[#ea580c] font-semibold hover:bg-[#fff7ed] rounded-lg text-xs cursor-pointer transition-colors"
                  >
                    [ EDIT ]
                  </button>
                </div>

                {/* 4. Education */}
                <div className="p-3.5 bg-white border border-[#E7E5E0] rounded-xl flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">Education</span>
                    <p className="font-bold text-slate-900 text-xs">
                      {qualificationsList.length} qualification(s) recorded:{" "}
                      {qualificationsList.map((q) => `${q.degree || q.level} (${q.startYear || "2021"}–${q.passOutYear || "2025"}, ${q.percentageOrCgpa})`).join(", ")}
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="px-2.5 py-1 text-[#ea580c] font-semibold hover:bg-[#fff7ed] rounded-lg text-xs cursor-pointer transition-colors"
                  >
                    [ EDIT ]
                  </button>
                </div>

                {/* 5. English & Tests */}
                <div className="p-3.5 bg-white border border-[#E7E5E0] rounded-xl flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      English & Standardized Tests
                    </span>
                    <p className="font-bold text-slate-900 text-xs">
                      Academic English: {academicEnglishMarks}
                      {testsStatus === "YES" && ` • ${selectedTestType}: Overall ${testScoreOverall}`}
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="px-2.5 py-1 text-[#ea580c] font-semibold hover:bg-[#fff7ed] rounded-lg text-xs cursor-pointer transition-colors"
                  >
                    [ EDIT ]
                  </button>
                </div>
              </div>

              {/* Declaration Checkbox */}
              <div className="p-4 bg-[#FAFAF8] border border-[#E7E5E0] rounded-xl space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={declarationAccepted}
                    onChange={(e) => setDeclarationAccepted(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-[#ea580c] focus:ring-[#ea580c] cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-900">
                    &quot;I confirm that the information provided in this application is accurate and true to the best of my knowledge.&quot;
                  </span>
                </label>
                <p className="text-[11px] text-slate-500 pl-6">
                  Submission sends your application to the Dakshinvedha Abroad admissions team.
                </p>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 8 — SUBMIT & SUCCESS SCREEN                         */}
          {/* ======================================================== */}
          {currentStep === 8 && (
            <div className="py-6 text-center space-y-5 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-orange-700 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                  Application submitted
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-2">
                  Application Submitted Successfully
                </h2>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Your application record has been registered in the Dakshinvedha admissions portal. You can monitor live tracking, upload pending docs, or apply to additional courses.
                </p>
              </div>

              {/* Application Details Summary Box */}
              <div className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl max-w-lg mx-auto text-left space-y-2.5 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Application ID:</span>
                  <span className="font-mono font-bold text-[#ea580c] text-sm">
                    {submittedApp?.camsId || "Pending"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">University:</span>
                  <strong className="text-slate-900">{currentUniv?.name || "Not selected"}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Course:</span>
                  <strong className="text-slate-900">{currentCourse?.courseName || "Not selected"}</strong>
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

              {/* Action Buttons */}
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
                  className="h-11 px-6 bg-[#ea580c] hover:bg-[#c2410c] text-white font-semibold text-xs rounded-[10px] shadow-sm transition-all cursor-pointer active:scale-[0.98]"
                >
                  VIEW APPLICATION IN TRACKER
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls (Steps 1 to 7) */}
        {currentStep < 8 && (
          <div className="p-4 sm:p-5 bg-[#FAFAF8] border-t border-[#E7E5E0] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-5 border border-[#E7E5E0] bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-[10px] cursor-pointer transition-all active:scale-[0.98]"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2">
              {selectionError && <p className="max-w-xs text-[11px] font-semibold text-rose-700">{selectionError}</p>}
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="h-11 px-4 border border-[#E7E5E0] hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-[10px] flex items-center gap-1.5 cursor-pointer transition-all active:scale-[0.98]"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              )}

              {currentStep < 7 && (
                <button
                  type="button"
                  onClick={() => {
                    if (!stepFilled(currentStep)) {
                      setSelectionError(stepGap(currentStep));
                      return;
                    }
                    setSelectionError(null);
                    setCurrentStep(currentStep + 1);
                  }}
                  className="h-11 px-6 bg-[#ea580c] hover:bg-[#c2410c] text-white font-semibold text-xs rounded-[10px] shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-[0.98] transition-all"
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
                  className={`h-11 px-6 font-semibold text-xs text-white rounded-[10px] shadow-sm transition-all flex items-center gap-2 cursor-pointer ${
                    declarationAccepted
                      ? "bg-[#ea580c] hover:bg-[#c2410c] active:scale-[0.98]"
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
        </div>
      </div>

      {/* Add Qualification Submodal for Step 3 */}
      {showAddEduModal && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddQualification}
            className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 text-xs border border-slate-200"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  {editingEduId ? "Edit Education Qualification" : "Add Education Qualification"}
                </h3>
                <p className="text-slate-500 text-[11px]">Enter your degree, institution, and exact graduation years.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddEduModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-[13px] font-medium text-slate-700">Education Level *</label>
              <select
                value={eduLevel}
                onChange={(e) => {
                  const lvl = e.target.value as EducationLevelType;
                  setEduLevel(lvl);
                  if (lvl === "10th") {
                    setEduDegree("Secondary School Certificate (10th)");
                  } else if (lvl === "12th") {
                    setEduDegree("Higher Secondary / Intermediate (12th)");
                  } else if (lvl === "Bachelor") {
                    setEduDegree("Bachelor of Technology");
                  } else if (lvl === "Master") {
                    setEduDegree("Master of Science");
                  }
                }}
                className="w-full mt-1 h-11 px-3.5 border border-[#E7E5E0] rounded-[10px] bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c] transition-all"
              >
                <option value="10th">Secondary / 10th Standard</option>
                <option value="12th">Intermediate / 12th Standard</option>
                <option value="Diploma">Polytechnic / Diploma</option>
                <option value="Bachelor">Bachelor&apos;s / Undergraduate</option>
                <option value="Master">Master&apos;s / Postgraduate</option>
                <option value="Other">Other Certificate</option>
              </select>
            </div>

            <div>
              <label className="text-[13px] font-medium text-slate-700">Degree / Qualification Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Bachelor of Technology, B.Com, High School"
                value={eduDegree}
                onChange={(e) => setEduDegree(e.target.value)}
                className="w-full mt-1 h-11 px-3.5 border border-[#E7E5E0] rounded-[10px] text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c] transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[13px] font-medium text-slate-700">Institution / College Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SVKM NMIMS, Delhi Public School"
                  value={eduInstitution}
                  onChange={(e) => setEduInstitution(e.target.value)}
                  className="w-full mt-1 h-11 px-3.5 border border-[#E7E5E0] rounded-[10px] text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c] transition-all"
                />
              </div>
              <div>
                <label className="text-[13px] font-medium text-slate-700">Board / Awarding University *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mumbai University, CBSE"
                  value={eduBoard}
                  onChange={(e) => setEduBoard(e.target.value)}
                  className="w-full mt-1 h-11 px-3.5 border border-[#E7E5E0] rounded-[10px] text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c] transition-all"
                />
              </div>
            </div>

            {/* Start Year & Completion Year (USER FIX) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[13px] font-medium text-slate-700">Start Year (Commencement) *</label>
                <input
                  type="number"
                  required
                  min="1990"
                  max="2035"
                  placeholder="e.g. 2021"
                  value={eduStartYear}
                  onChange={(e) => setEduStartYear(e.target.value)}
                  className="w-full mt-1 h-11 px-3.5 border border-[#E7E5E0] rounded-[10px] text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c] transition-all"
                />
              </div>
              <div>
                <label className="text-[13px] font-medium text-slate-700">Completion / Passing Year *</label>
                <input
                  type="number"
                  required
                  min="1990"
                  max="2035"
                  placeholder="e.g. 2025"
                  value={eduPassYear}
                  onChange={(e) => setEduPassYear(e.target.value)}
                  className="w-full mt-1 h-11 px-3.5 border border-[#E7E5E0] rounded-[10px] text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c] transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[13px] font-medium text-slate-700">Percentage / CGPA *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 8.5 or 85%"
                  value={eduScore}
                  onChange={(e) => setEduScore(e.target.value)}
                  className="w-full mt-1 h-11 px-3.5 border border-[#E7E5E0] rounded-[10px] text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c] transition-all"
                />
              </div>
              <div>
                <label className="text-[13px] font-medium text-slate-700">Specialization / Major</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science, Science"
                  value={eduSpecialization}
                  onChange={(e) => setEduSpecialization(e.target.value)}
                  className="w-full mt-1 h-11 px-3.5 border border-[#E7E5E0] rounded-[10px] text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c] transition-all"
                />
              </div>
            </div>

            {eduLevel === "12th" && (
              <div className="grid grid-cols-3 gap-3 p-3.5 bg-[#FAFAF8] rounded-xl border border-[#E7E5E0]">
                <div>
                  <label className="text-xs font-medium text-slate-700">Stream</label>
                  <select
                    value={eduStream}
                    onChange={(e) => setEduStream(e.target.value)}
                    className="w-full mt-1 h-10 px-3 border border-[#E7E5E0] rounded-lg bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c]"
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
                  <label className="text-xs font-medium text-slate-700">English Marks</label>
                  <input
                    type="number"
                    value={eduEnglishMarks}
                    onChange={(e) => setEduEnglishMarks(e.target.value)}
                    className="w-full mt-1 h-10 px-3 border border-[#E7E5E0] rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700">Max Marks</label>
                  <input
                    type="number"
                    value={eduMaxEnglishMarks}
                    onChange={(e) => setEduMaxEnglishMarks(e.target.value)}
                    className="w-full mt-1 h-10 px-3 border border-[#E7E5E0] rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c]"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowAddEduModal(false)}
                className="h-10 px-4 border border-[#E7E5E0] hover:bg-slate-50 rounded-lg font-semibold text-slate-700 text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-10 px-5 bg-[#ea580c] hover:bg-[#c2410c] text-white rounded-lg font-semibold text-xs shadow-xs cursor-pointer active:scale-[0.98] transition-all"
              >
                {editingEduId ? "Save Changes" : "Save Qualification"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
