"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import {
  PortalRole,
  StudentProfile,
  ApplicationRecord,
  UniversityInfo,
  CourseInfo,
  NoticeItem,
  NotificationItem,
  EducationQualification,
  StandardizedTestItem,
  DocumentCategoryType,
  CourseRequirementsConfig,
  PrimaryStatusType,
  SecondaryStatusType,
} from "@/types";
import {
  MOCK_UNIVERSITIES,
  MOCK_COURSES,
  MOCK_APPLICATIONS,
  MOCK_NOTICES,
  MOCK_NOTIFICATIONS,
} from "@/data/mockData";
import { SEED_STUDENTS, DEFAULT_REQUIREMENTS } from "@/data/studentSeedData";

interface PlatformContextType {
  // Navigation & Role
  portalRole: PortalRole;
  setPortalRole: (role: PortalRole) => void;

  // Student Authentication & Profile
  isStudentAuthenticated: boolean;
  activeStudent: StudentProfile | null;
  activeStudentId: string | null;
  students: StudentProfile[];
  loginStudent: (identifier: string, method: "password" | "otp", codeOrPass: string) => boolean;
  registerStudent: (basic: { name: string; mobile: string; email: string }) => StudentProfile;
  logoutStudent: () => void;
  switchActiveStudent: (studentId: string) => void;
  updateActiveStudentProfile: (updates: Partial<StudentProfile>) => void;
  completeOnboarding: () => void;

  // Student Education & Tests
  addEducation: (qualification: Omit<EducationQualification, "id" | "verificationStatus">) => void;
  updateEducation: (id: string, updates: Partial<EducationQualification>) => void;
  deleteEducation: (id: string) => void;
  addOrUpdateTest: (test: Omit<StandardizedTestItem, "id" | "status">) => void;
  updatePassport: (passportData: StudentProfile["passport"]) => void;

  // Student Documents
  uploadDocument: (doc: { category: DocumentCategoryType; title: string; fileName: string; fileSize?: string }) => void;
  deleteDocument: (docId: string) => void;

  // Applications (Shared)
  applications: ApplicationRecord[];
  studentApplications: ApplicationRecord[];
  submitStudentApplication: (data: {
    universityId: string;
    courseId: string;
    intake: string;
    notes?: string;
  }) => ApplicationRecord;
  updateApplicationStatus: (
    camsId: string,
    primaryStatus: PrimaryStatusType,
    secondaryStatus: SecondaryStatusType,
    timelineStatus?: string,
    notApplicableStages?: string[]
  ) => void;
  cancelApplication: (camsId: string) => void;

  // Super Admin Document Verifications
  verifyStudentDocument: (studentId: string, docId: string) => void;
  rejectStudentDocument: (studentId: string, docId: string, reason: string) => void;
  requestDocumentReupload: (studentId: string, docId: string, reason: string) => void;

  // Super Admin Education Review
  reviewStudentEducation: (
    studentId: string,
    eduId: string,
    status: "Verified" | "Flagged",
    feedback?: string
  ) => void;

  // Universities, Courses & Requirements
  universities: UniversityInfo[];
  courses: CourseInfo[];
  updateCourseRequirements: (courseId: string, req: CourseRequirementsConfig) => void;
  addUniversity: (univ: UniversityInfo) => void;

  // Notices & Notifications
  notices: NoticeItem[];
  publishNotice: (notice: Omit<NoticeItem, "id" | "dateAdded">) => void;
  notifications: NotificationItem[];
  studentNotifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

const APP_TIMELINE_STAGES = [
  "Application Submitted",
  "Initial Review",
  "Documents Verified",
  "Submitted to University",
  "University Review",
  "Offer Received",
  "Offer Accepted",
  "Deposit / Payment",
  "Admission / CAS Processing",
  "Visa Stage",
  "Completed",
];

export const PlatformProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Portal Role: "student" | "partner" | "admin"
  const [portalRole, setPortalRoleState] = useState<PortalRole>("student");

  // 2. Student Auth State
  const [isStudentAuthenticated, setIsStudentAuthenticated] = useState<boolean>(true);
  const [activeStudentId, setActiveStudentId] = useState<string>("stu-101");

  // 3. Shared Entities
  const [students, setStudents] = useState<StudentProfile[]>(SEED_STUDENTS);
  const [applications, setApplications] = useState<ApplicationRecord[]>(MOCK_APPLICATIONS);
  const [universities, setUniversities] = useState<UniversityInfo[]>(MOCK_UNIVERSITIES);
  const [courses, setCourses] = useState<CourseInfo[]>(() => {
    return MOCK_COURSES.map((c) => ({
      ...c,
      requirementsConfig: c.requirementsConfig || DEFAULT_REQUIREMENTS,
    }));
  });
  const [notices, setNotices] = useState<NoticeItem[]>(MOCK_NOTICES);
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const savedRole = localStorage.getItem("devgrate_portal_role");
      if (savedRole === "student" || savedRole === "partner" || savedRole === "admin") {
        setPortalRoleState(savedRole);
      }
      const savedAuth = localStorage.getItem("devgrate_student_auth");
      if (savedAuth !== null) {
        setIsStudentAuthenticated(savedAuth === "true");
      }
      const savedActiveStudent = localStorage.getItem("devgrate_active_student_id");
      if (savedActiveStudent) {
        setActiveStudentId(savedActiveStudent);
      }
      const savedStudents = localStorage.getItem("devgrate_students_data");
      if (savedStudents) {
        const parsed = JSON.parse(savedStudents);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setStudents(parsed);
        }
      }
      const savedApps = localStorage.getItem("devgrate_portal_applications");
      if (savedApps) {
        const parsed = JSON.parse(savedApps);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setApplications(parsed);
        }
      }
      const savedCourses = localStorage.getItem("devgrate_courses_data");
      if (savedCourses) {
        const parsed = JSON.parse(savedCourses);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCourses(parsed);
        }
      }
    } catch {
      // LocalStorage error fallback
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem("devgrate_portal_role", portalRole);
      localStorage.setItem("devgrate_student_auth", String(isStudentAuthenticated));
      localStorage.setItem("devgrate_active_student_id", activeStudentId);
      localStorage.setItem("devgrate_students_data", JSON.stringify(students));
      localStorage.setItem("devgrate_portal_applications", JSON.stringify(applications));
      localStorage.setItem("devgrate_courses_data", JSON.stringify(courses));
    } catch {
      // Ignore storage quota
    }
  }, [portalRole, isStudentAuthenticated, activeStudentId, students, applications, courses, isHydrated]);

  const setPortalRole = (role: PortalRole) => {
    setPortalRoleState(role);
  };

  const activeStudent = useMemo(() => {
    return students.find((s) => s.id === activeStudentId) || students[0] || null;
  }, [students, activeStudentId]);

  // Recalculate Profile Completion Percentage helper
  const computeProfileCompletion = (student: Partial<StudentProfile>): number => {
    let score = 20; // Base registration
    if (student.personal?.dob && student.personal?.address?.city) score += 15;
    if (student.passport?.hasPassport === "YES" || student.passport?.hasPassport === "NO") score += 15;
    if (student.education && student.education.length > 0) score += 20;
    if (student.testsStatus) score += 10;
    if (student.studyPreferences?.preferredCountries?.length) score += 10;
    if (student.documents && student.documents.filter((d) => d.status === "Uploaded" || d.status === "Verified").length >= 2) score += 10;
    return Math.min(score, 100);
  };

  // Student Login
  const loginStudent = (identifier: string, method: "password" | "otp", codeOrPass: string): boolean => {
    const cleanId = identifier.trim().toLowerCase();
    const found = students.find(
      (s) =>
        s.email.toLowerCase() === cleanId ||
        s.mobile.replace(/\s+/g, "").includes(cleanId.replace(/\s+/g, ""))
    );

    if (!found) {
      // Create quick student if not found for seamless testability
      const newStu: StudentProfile = {
        id: `stu-${Date.now()}`,
        studentId: `STU-2026-${Math.floor(100 + Math.random() * 900)}`,
        name: identifier.includes("@") ? identifier.split("@")[0] : "New Student",
        firstName: identifier.includes("@") ? identifier.split("@")[0] : "New",
        lastName: "Student",
        email: identifier.includes("@") ? identifier : `student${Date.now()}@example.com`,
        mobile: identifier.includes("@") ? "+91 98765 00000" : identifier,
        password: "password123",
        accountStatus: "Active",
        registrationDate: new Date().toISOString().slice(0, 10),
        lastLogin: new Date().toISOString().slice(0, 16).replace("T", " "),
        onboardingCompleted: false,
        profileCompletion: 30,
        personal: {
          dob: "2004-01-01",
          gender: "Male",
          nationality: "Indian",
          countryOfResidence: "India",
          address: { street: "", city: "", state: "", postalCode: "" },
        },
        passport: { hasPassport: "NO", status: "Passport Pending" },
        education: [],
        testsStatus: "PLANNING TO TAKE",
        standardizedTests: [],
        studyPreferences: {
          preferredStudyLevel: "Postgraduate",
          preferredCountries: ["United Kingdom"],
          preferredIntake: "September",
          preferredCourseSubject: "Computer Science",
          preferredUniversity: "University of Greenwich",
          budgetRange: "£15,000 - £20,000",
          scholarshipRequired: "YES",
        },
        documents: [],
      };
      setStudents((prev) => [newStu, ...prev]);
      setActiveStudentId(newStu.id);
      setIsStudentAuthenticated(true);
      return true;
    }

    if (method === "otp") {
      // Visible demo OTP is 123456
      if (codeOrPass === "123456" || codeOrPass.length === 6) {
        setActiveStudentId(found.id);
        setIsStudentAuthenticated(true);
        return true;
      }
      return false;
    } else {
      // Password match or demo accept
      setActiveStudentId(found.id);
      setIsStudentAuthenticated(true);
      return true;
    }
  };

  // Student Registration (Step 1 Basic)
  const registerStudent = (basic: { name: string; mobile: string; email: string }): StudentProfile => {
    const parts = basic.name.trim().split(" ");
    const firstName = parts[0] || "Student";
    const lastName = parts.slice(1).join(" ") || "User";
    const newId = `stu-${Date.now()}`;
    const studentCode = `STU-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newStudent: StudentProfile = {
      id: newId,
      studentId: studentCode,
      name: basic.name,
      firstName,
      lastName,
      email: basic.email,
      mobile: basic.mobile,
      password: "password123",
      accountStatus: "Active",
      registrationDate: new Date().toISOString().slice(0, 10),
      lastLogin: new Date().toISOString().slice(0, 16).replace("T", " "),
      onboardingCompleted: false,
      profileCompletion: 25,
      personal: {
        dob: "",
        gender: "Male",
        nationality: "Indian",
        countryOfResidence: "India",
        address: {
          street: "",
          city: "",
          state: "",
          postalCode: "",
        },
      },
      passport: {
        hasPassport: "NO",
        status: "Passport Pending",
      },
      education: [],
      testsStatus: "PLANNING TO TAKE",
      standardizedTests: [],
      studyPreferences: {
        preferredStudyLevel: "Postgraduate",
        preferredCountries: ["United Kingdom"],
        preferredIntake: "September",
        preferredCourseSubject: "Computer Science",
        preferredUniversity: "University of Greenwich",
        budgetRange: "£14,000 - £22,000",
        scholarshipRequired: "YES",
      },
      documents: [],
    };

    setStudents((prev) => [newStudent, ...prev]);
    setActiveStudentId(newId);
    setIsStudentAuthenticated(true);

    // Add alert notification to Super Admin
    const adminNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: "New Student Registered",
      message: `${basic.name} registered via Student Auth (${basic.mobile}). Record added to Super Admin directory.`,
      timeAgo: "Just now",
      type: "system",
      isRead: false,
      studentId: newId,
    };
    setNotifications((prev) => [adminNotif, ...prev]);

    return newStudent;
  };

  const logoutStudent = () => {
    setIsStudentAuthenticated(false);
  };

  const switchActiveStudent = (id: string) => {
    setActiveStudentId(id);
    setIsStudentAuthenticated(true);
  };

  const completeOnboarding = () => {
    if (!activeStudentId) return;
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === activeStudentId) {
          return {
            ...s,
            onboardingCompleted: true,
            profileCompletion: Math.max(s.profileCompletion, 70),
          };
        }
        return s;
      })
    );
  };

  const updateActiveStudentProfile = (updates: Partial<StudentProfile>) => {
    if (!activeStudentId) return;
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === activeStudentId) {
          const merged = { ...s, ...updates };
          merged.profileCompletion = computeProfileCompletion(merged);
          return merged;
        }
        return s;
      })
    );
  };

  // Education CRUD
  const addEducation = (qualification: Omit<EducationQualification, "id" | "verificationStatus">) => {
    if (!activeStudentId) return;
    const newEdu: EducationQualification = {
      ...qualification,
      id: `edu-${Date.now()}`,
      verificationStatus: "Pending",
    };
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === activeStudentId) {
          const updatedEdu = [...s.education, newEdu];
          const updatedStudent = { ...s, education: updatedEdu };
          updatedStudent.profileCompletion = computeProfileCompletion(updatedStudent);
          return updatedStudent;
        }
        return s;
      })
    );

    // Notify Super Admin of new education pending review
    const adminNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: "Education Added For Review",
      message: `${activeStudent?.name || "Student"} added ${qualification.level} qualification for Admin verification.`,
      timeAgo: "Just now",
      type: "document",
      isRead: false,
      studentId: activeStudentId,
    };
    setNotifications((prev) => [adminNotif, ...prev]);
  };

  const updateEducation = (id: string, updates: Partial<EducationQualification>) => {
    if (!activeStudentId) return;
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === activeStudentId) {
          const updatedEdu = s.education.map((e) => (e.id === id ? { ...e, ...updates } : e));
          return { ...s, education: updatedEdu };
        }
        return s;
      })
    );
  };

  const deleteEducation = (id: string) => {
    if (!activeStudentId) return;
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === activeStudentId) {
          const updatedEdu = s.education.filter((e) => e.id !== id);
          return { ...s, education: updatedEdu };
        }
        return s;
      })
    );
  };

  // Test Scores
  const addOrUpdateTest = (testData: Omit<StandardizedTestItem, "id" | "status">) => {
    if (!activeStudentId) return;
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === activeStudentId) {
          const existingIdx = s.standardizedTests.findIndex((t) => t.type === testData.type);
          let newTests = [...s.standardizedTests];
          if (existingIdx >= 0) {
            newTests[existingIdx] = {
              ...newTests[existingIdx],
              ...testData,
              status: "Uploaded",
            };
          } else {
            newTests.push({
              ...testData,
              id: `test-${Date.now()}`,
              status: "Uploaded",
            });
          }
          const updated = { ...s, standardizedTests: newTests, testsStatus: "YES" as const };
          updated.profileCompletion = computeProfileCompletion(updated);
          return updated;
        }
        return s;
      })
    );
  };

  // Passport
  const updatePassport = (passportData: StudentProfile["passport"]) => {
    if (!activeStudentId) return;
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === activeStudentId) {
          const updated = { ...s, passport: passportData };
          updated.profileCompletion = computeProfileCompletion(updated);
          return updated;
        }
        return s;
      })
    );
  };

  // Documents
  const uploadDocument = (doc: {
    category: DocumentCategoryType;
    title: string;
    fileName: string;
    fileSize?: string;
  }) => {
    if (!activeStudentId) return;
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === activeStudentId) {
          const existingIndex = s.documents.findIndex((d) => d.category === doc.category);
          const newDoc = {
            id: existingIndex >= 0 ? s.documents[existingIndex].id : `doc-${Date.now()}`,
            category: doc.category,
            title: doc.title,
            fileName: doc.fileName,
            fileSize: doc.fileSize || "1.8 MB",
            uploadedDate: new Date().toISOString().slice(0, 10),
            status: "Uploaded" as const,
          };
          let updatedDocs = [...s.documents];
          if (existingIndex >= 0) {
            updatedDocs[existingIndex] = newDoc;
          } else {
            updatedDocs.push(newDoc);
          }
          const updatedStudent = { ...s, documents: updatedDocs };
          updatedStudent.profileCompletion = computeProfileCompletion(updatedStudent);
          return updatedStudent;
        }
        return s;
      })
    );

    // Notify Super Admin of document awaiting verification
    const adminNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: "Document Awaiting Verification",
      message: `${activeStudent?.name || "Student"} uploaded ${doc.title} (${doc.category}).`,
      timeAgo: "Just now",
      type: "document",
      isRead: false,
      studentId: activeStudentId,
    };
    setNotifications((prev) => [adminNotif, ...prev]);
  };

  const deleteDocument = (docId: string) => {
    if (!activeStudentId) return;
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === activeStudentId) {
          return {
            ...s,
            documents: s.documents.filter((d) => d.id !== docId),
          };
        }
        return s;
      })
    );
  };

  // Submit Student Application
  const submitStudentApplication = (data: {
    universityId: string;
    courseId: string;
    intake: string;
    notes?: string;
  }): ApplicationRecord => {
    const student = activeStudent || SEED_STUDENTS[0];
    const univ = universities.find((u) => u.id === data.universityId) || universities[0];
    const course = courses.find((c) => c.id === data.courseId) || courses[0];

    const newCamsId = `APP-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const today = new Date().toISOString().slice(0, 10);

    const timeline = APP_TIMELINE_STAGES.map((stage, idx) => ({
      status: stage,
      date: idx === 0 ? today : "Pending",
      description:
        idx === 0
          ? "Application submitted online by student"
          : idx === 1
          ? "Admissions compliance vetting in progress"
          : "Stage pending previous step completion",
      state: idx === 0 ? ("completed" as const) : idx === 1 ? ("current" as const) : ("pending" as const),
    }));

    const newApp: ApplicationRecord = {
      camsId: newCamsId,
      student: {
        firstName: student.firstName,
        middleName: student.middleName,
        lastName: student.lastName,
        name: student.name,
        dob: student.personal.dob || "2003-01-01",
        gender: student.personal.gender || "Male",
        nationality: student.personal.nationality || "Indian",
        passportNumber: student.passport.passportNumber || "Passport Pending",
        passportExpiry: student.passport.expiryDate || "2032-01-01",
        email: student.email,
        phone: student.mobile,
        studentId: student.studentId,
        address: {
          country: student.personal.countryOfResidence || "India",
          state: student.personal.address.state || "Maharashtra",
          city: student.personal.address.city || "Mumbai",
          postalCode: student.personal.address.postalCode || "400001",
          streetAddress: student.personal.address.street || "Main Street",
        },
      },
      university: univ,
      course: course,
      primaryStatus: "Application Submitted",
      secondaryStatus: "Documents Pending",
      dateAdded: today,
      dateModified: today,
      counselorName: "DevGrate Student Self-Apply",
      qualifications: student.education.map((e) => ({
        id: e.id,
        highestQualification: e.degree || e.level,
        institution: e.institutionName,
        course: e.course || e.stream || e.level,
        yearCompleted: e.passOutYear,
        gradePercentage: e.percentageOrCgpa,
      })),
      englishProficiency: {
        testType: (student.standardizedTests[0]?.type as any) || "English waiver",
        overallScore: student.standardizedTests[0]?.overallScore || "N/A",
        readingScore: student.standardizedTests[0]?.subScores?.reading || "N/A",
        writingScore: student.standardizedTests[0]?.subScores?.writing || "N/A",
        listeningScore: student.standardizedTests[0]?.subScores?.listening || "N/A",
        speakingScore: student.standardizedTests[0]?.subScores?.speaking || "N/A",
      },
      documents: student.documents.map((d) => ({
        id: d.id,
        category: d.category as any,
        fileName: d.fileName || `${d.category}.pdf`,
        fileSize: d.fileSize || "1.5 MB",
        progress: 100,
        status: (d.status === "Verified" ? "Verified" : "Uploaded") as any,
      })),
      timeline: timeline,
      payment: {
        grossTuition: course.tuitionFee,
        scholarship: "Under Review",
        depositPaid: "£0",
        netBalanceDue: course.tuitionFee,
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
          id: `note-${Date.now()}`,
          author: student.name,
          date: today,
          text: data.notes || "Submitted directly from Student Portal.",
        },
      ],
    };

    setApplications((prev) => [newApp, ...prev]);

    // Admin Notification
    const adminNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: "New Application Submitted",
      message: `${student.name} submitted application ${newCamsId} for ${course.courseName} at ${univ.name}.`,
      timeAgo: "Just now",
      type: "urgent",
      isRead: false,
      camsId: newCamsId,
      studentId: student.id,
    };
    setNotifications((prev) => [adminNotif, ...prev]);

    return newApp;
  };

  // Super Admin: Update Application Status & Timeline
  const updateApplicationStatus = (
    camsId: string,
    primaryStatus: PrimaryStatusType,
    secondaryStatus: SecondaryStatusType,
    timelineStatus?: string,
    notApplicableStages: string[] = []
  ) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.camsId === camsId) {
          const updatedTimeline = app.timeline.map((t) => {
            if (notApplicableStages.includes(t.status)) {
              return { ...t, state: "not_applicable" as const };
            }
            if (t.status === timelineStatus || t.status === primaryStatus) {
              return { ...t, state: "completed" as const, date: new Date().toISOString().slice(0, 10) };
            }
            return t;
          });

          return {
            ...app,
            primaryStatus,
            secondaryStatus,
            dateModified: new Date().toISOString().slice(0, 10),
            timeline: updatedTimeline,
          };
        }
        return app;
      })
    );

    // Notify Student of status change
    const targetApp = applications.find((a) => a.camsId === camsId);
    if (targetApp) {
      const studentNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: "Application Status Updated",
        message: `Your application (${camsId}) for ${targetApp.course.courseName} is now: ${primaryStatus} (${secondaryStatus}).`,
        timeAgo: "Just now",
        type: primaryStatus.includes("Offer") ? "offer" : "urgent",
        isRead: false,
        camsId,
        studentId: targetApp.student.studentId,
      };
      setNotifications((prev) => [studentNotif, ...prev]);
    }
  };

  const cancelApplication = (camsId: string) => {
    updateApplicationStatus(camsId, "Closed", "Documents Pending");
  };

  // Super Admin Document Actions
  const verifyStudentDocument = (studentId: string, docId: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId || s.studentId === studentId) {
          const updatedDocs = s.documents.map((d) => (d.id === docId ? { ...d, status: "Verified" as const, rejectionReason: undefined } : d));
          return { ...s, documents: updatedDocs };
        }
        return s;
      })
    );

    // Also update in applications if present
    setApplications((prev) =>
      prev.map((app) => {
        if (app.student.studentId === studentId) {
          return {
            ...app,
            documents: app.documents.map((d) => (d.id === docId ? { ...d, status: "Verified" as const } : d)),
          };
        }
        return app;
      })
    );

    // Student notification
    const studentNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: "Document Verified",
      message: `Your document has been verified by the Admissions Team.`,
      timeAgo: "Just now",
      type: "document",
      isRead: false,
      studentId,
    };
    setNotifications((prev) => [studentNotif, ...prev]);
  };

  const rejectStudentDocument = (studentId: string, docId: string, reason: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId || s.studentId === studentId) {
          const updatedDocs = s.documents.map((d) =>
            d.id === docId ? { ...d, status: "Rejected" as const, rejectionReason: reason } : d
          );
          return { ...s, documents: updatedDocs };
        }
        return s;
      })
    );

    // Student notification with reason
    const studentNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: "Document Rejected",
      message: `Document verification declined. Reason: "${reason}". Please review requirement.`,
      timeAgo: "Just now",
      type: "urgent",
      isRead: false,
      studentId,
    };
    setNotifications((prev) => [studentNotif, ...prev]);
  };

  const requestDocumentReupload = (studentId: string, docId: string, reason: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId || s.studentId === studentId) {
          const updatedDocs = s.documents.map((d) =>
            d.id === docId
              ? { ...d, status: "Re-upload Required" as const, rejectionReason: reason }
              : d
          );
          return { ...s, documents: updatedDocs };
        }
        return s;
      })
    );

    // Student notification
    const studentNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: "Re-Upload Required",
      message: `Action Required on document: "${reason}". Please upload updated file.`,
      timeAgo: "Just now",
      type: "urgent",
      isRead: false,
      studentId,
    };
    setNotifications((prev) => [studentNotif, ...prev]);
  };

  // Super Admin Education Review
  const reviewStudentEducation = (
    studentId: string,
    eduId: string,
    status: "Verified" | "Flagged",
    feedback?: string
  ) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId || s.studentId === studentId) {
          const updatedEdu = s.education.map((e) =>
            e.id === eduId ? { ...e, verificationStatus: status, adminFeedback: feedback } : e
          );
          return { ...s, education: updatedEdu };
        }
        return s;
      })
    );
  };

  // Course Requirements update
  const updateCourseRequirements = (courseId: string, req: CourseRequirementsConfig) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, requirementsConfig: req } : c))
    );
  };

  const addUniversity = (univ: UniversityInfo) => {
    setUniversities((prev) => [univ, ...prev]);
  };

  // Notices
  const publishNotice = (noticeData: Omit<NoticeItem, "id" | "dateAdded">) => {
    const newNotice: NoticeItem = {
      ...noticeData,
      id: `notice-${Date.now()}`,
      dateAdded: new Date().toISOString().slice(0, 10),
    };
    setNotices((prev) => [newNotice, ...prev]);
  };

  // Notifications
  const studentNotifications = useMemo(() => {
    if (!activeStudent) return [];
    return notifications.filter(
      (n) =>
        !n.studentId ||
        n.studentId === activeStudent.id ||
        n.studentId === activeStudent.studentId
    );
  }, [notifications, activeStudent]);

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const clearNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // Student specific applications
  const studentApplications = useMemo(() => {
    if (!activeStudent) return [];
    return applications.filter(
      (a) =>
        a.student.studentId === activeStudent.studentId ||
        a.student.email.toLowerCase() === activeStudent.email.toLowerCase()
    );
  }, [applications, activeStudent]);

  return (
    <PlatformContext.Provider
      value={{
        portalRole,
        setPortalRole,
        isStudentAuthenticated,
        activeStudent,
        activeStudentId,
        students,
        loginStudent,
        registerStudent,
        logoutStudent,
        switchActiveStudent,
        updateActiveStudentProfile,
        completeOnboarding,
        addEducation,
        updateEducation,
        deleteEducation,
        addOrUpdateTest,
        updatePassport,
        uploadDocument,
        deleteDocument,
        applications,
        studentApplications,
        submitStudentApplication,
        updateApplicationStatus,
        cancelApplication,
        verifyStudentDocument,
        rejectStudentDocument,
        requestDocumentReupload,
        reviewStudentEducation,
        universities,
        courses,
        updateCourseRequirements,
        addUniversity,
        notices,
        publishNotice,
        notifications,
        studentNotifications,
        markNotificationAsRead,
        clearNotifications,
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
};

export const usePlatform = () => {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error("usePlatform must be used within a PlatformProvider");
  }
  return context;
};
