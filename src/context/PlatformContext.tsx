"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef, ReactNode } from "react";
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
  B2BPartnerProfile,
  B2BTeamMember,
  B2BAccessRequest,
} from "@/types";
import {
  loadCatalog,
  removeCourse,
  removeInstitution,
  saveCourse,
  saveInstitution,
  withCourseCounts,
  type CatalogStatus,
  type CatalogWriteResult,
} from "@/lib/catalog";
import { performLogout } from "@/utils/auth";
import { generatePassword, readSessionValue } from "@/utils/accounts";
import {
  flushPortalChanges,
  loadPortalBundle,
  portalSnapshot,
  provisionAccount,
  removeAccount,
  updateAccountStatus,
} from "@/lib/portalDb";
import { isUuid } from "@/lib/records";
import { buildTimeline, createTrackingId } from "@/utils/tracking";

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
  registerStudent: (basic: { name: string; mobile: string; email: string; password?: string }) => StudentProfile;
  logoutStudent: () => void;
  logout: () => void;
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
  }) => ApplicationRecord | null;
  updateApplicationStatus: (
    camsId: string,
    primaryStatus: PrimaryStatusType,
    secondaryStatus: SecondaryStatusType,
    timelineStatus?: string,
    notApplicableStages?: string[],
    agentAssignment?: { trackingId: string; name: string } | null
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
  catalogStatus: CatalogStatus;
  catalogError: string | null;
  updateCourseRequirements: (courseId: string, req: CourseRequirementsConfig) => Promise<CatalogWriteResult>;
  addUniversity: (univ: UniversityInfo) => Promise<CatalogWriteResult>;
  updateUniversity: (univ: UniversityInfo) => Promise<CatalogWriteResult>;
  deleteUniversity: (id: string) => Promise<CatalogWriteResult>;
  addCourse: (course: CourseInfo) => Promise<CatalogWriteResult>;
  updateCourse: (course: CourseInfo) => Promise<CatalogWriteResult>;
  deleteCourse: (id: string) => Promise<CatalogWriteResult>;

  // B2B / Partner Management
  b2bPartners: B2BPartnerProfile[];
  activeB2BPartner: B2BPartnerProfile | null;
  createB2BAccount: (basic: {
    name: string;
    phone: string;
    email: string;
    password?: string;
    organizationName?: string;
  }) => Promise<B2BPartnerProfile | { error: string }>;
  updateB2BProfile: (partnerId: string, updates: Partial<B2BPartnerProfile>) => void;
  verifyB2BPartner: (partnerId: string) => void;
  loginB2B: (email: string, password: string) => B2BPartnerProfile | null;
  accessRequests: B2BAccessRequest[];
  rejectB2BRequest: (requestId: string) => void;

  // B2B Team Management
  addB2BTeamMember: (partnerId: string, member: { name: string; email: string; password: string }) => Promise<B2BTeamMember | { error: string }>;
  removeB2BTeamMember: (partnerId: string, memberId: string) => Promise<void>;
  updateB2BTeamMember: (partnerId: string, memberId: string, updates: Partial<B2BTeamMember>) => void;
  recordApplication: (application: ApplicationRecord) => void;
  claimCommission: (camsId: string) => void;
  syncError: string | null;

  // Notices & Notifications
  notices: NoticeItem[];
  publishNotice: (notice: Omit<NoticeItem, "id" | "dateAdded">) => void;
  notifications: NotificationItem[];
  studentNotifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

const SAMPLE_CLEARED_KEY = "dakshin_sample_data_cleared_v1";
let sampleClearAttempted = false;

function clearStoredSampleData() {
  if (sampleClearAttempted || typeof window === "undefined") return;
  sampleClearAttempted = true;
  try {
    if (localStorage.getItem(SAMPLE_CLEARED_KEY) === "1") return;
    [
      "devgrate_courses_data",
      "devgrate_portal_applications",
      "devgrate_students_data",
      "devgrate_active_student_id",
      "dakshin_admin_team_v1",
    ].forEach((key) => localStorage.removeItem(key));
    localStorage.setItem(SAMPLE_CLEARED_KEY, "1");
  } catch {
    // Storage can be blocked in private browsing.
  }
}

function buildStudentRecord(basic: {
  name: string;
  mobile: string;
  email: string;
  password?: string;
}): StudentProfile {
  const parts = basic.name.trim().split(" ");
  const firstName = parts[0] || "Student";
  const lastName = parts.slice(1).join(" ") || "User";
  return {
    id: `stu-${Date.now()}`,
    studentId: createTrackingId("STU"),
    name: basic.name,
    firstName,
    lastName,
    email: basic.email.trim().toLowerCase(),
    mobile: basic.mobile,
    password: basic.password || "password123",
    accountStatus: "Active",
    registrationDate: new Date().toISOString().slice(0, 10),
    lastLogin: new Date().toISOString().slice(0, 16).replace("T", " "),
    onboardingCompleted: false,
    profileCompletion: 25,
    personal: {
      dob: "",
      gender: "",
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
      preferredCourseSubject: "",
      preferredUniversity: "",
      budgetRange: "",
      scholarshipRequired: "YES",
    },
    documents: [],
  };
}

export const PlatformProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  clearStoredSampleData();

  // 1. Portal Role: "student" | "partner" | "admin"
  const [portalRole, setPortalRoleState] = useState<PortalRole>("student");

  // 2. Student Auth State
  const [isStudentAuthenticated, setIsStudentAuthenticated] = useState<boolean>(false);
  const [activeStudentId, setActiveStudentId] = useState<string>("");

  // 3. Shared Entities
<<<<<<< HEAD
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [universities, setUniversities] = useState<UniversityInfo[]>([]);
  const [courses, setCourses] = useState<CourseInfo[]>([]);
  const [catalogStatus, setCatalogStatus] = useState<CatalogStatus>("loading");
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const coursesRef = useRef<CourseInfo[]>([]);
  coursesRef.current = courses;
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [b2bPartners, setB2bPartners] = useState<B2BPartnerProfile[]>([]);
  const [accessRequests, setAccessRequests] = useState<B2BAccessRequest[]>([]);
  const [sessionEmail, setSessionEmail] = useState("");
  const [sessionPartnerId, setSessionPartnerId] = useState("");
=======
  const [students, setStudents] = useState<StudentProfile[]>(SEED_STUDENTS);
  const [applications, setApplications] = useState<ApplicationRecord[]>(MOCK_APPLICATIONS);
  const [universities, setUniversities] = useState<UniversityInfo[]>([]);
  const [courses, setCourses] = useState<CourseInfo[]>([]);
  const [notices, setNotices] = useState<NoticeItem[]>(MOCK_NOTICES);
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const [b2bPartners, setB2bPartners] = useState<B2BPartnerProfile[]>(SEED_B2B_PARTNERS);
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
  const [isHydrated, setIsHydrated] = useState<boolean>(false);
  const [dbReady, setDbReady] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const snapshotRef = useRef("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await loadPortalBundle();
      if (cancelled) return;
      if (!result.ok) {
        if (result.reason === "error") setSyncError(result.error);
        setIsHydrated(true);
        return;
      }
      const bundle = result.data;
      setPortalRoleState(bundle.profile.role);
      setSessionEmail(bundle.profile.email);
      setSessionPartnerId(bundle.profile.partnerId);
      setStudents(bundle.students);
      setApplications(bundle.applications);
      setNotices(bundle.notices);
      setNotifications(bundle.notifications);
      setB2bPartners(bundle.partners);
      setAccessRequests(bundle.requests);
      if (bundle.profile.role === "student") {
        setIsStudentAuthenticated(true);
        setActiveStudentId(bundle.profile.id);
      }
<<<<<<< HEAD
      snapshotRef.current = portalSnapshot(bundle);
      setDbReady(true);
      setIsHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
=======
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

      // One-time migration: Clear cached dummy universities and courses
      const isCleared = localStorage.getItem("devgrate_univ_courses_cleared_v1");
      if (!isCleared) {
        localStorage.removeItem("devgrate_courses_data");
        localStorage.removeItem("devgrate_universities_data");
        localStorage.setItem("devgrate_univ_courses_cleared_v1", "true");
        setUniversities([]);
        setCourses([]);
      } else {
        const savedUniversities = localStorage.getItem("devgrate_universities_data");
        if (savedUniversities) {
          const parsedUnivs = JSON.parse(savedUniversities);
          if (Array.isArray(parsedUnivs)) {
            setUniversities(parsedUnivs);
          }
        }
        const savedCourses = localStorage.getItem("devgrate_courses_data");
        if (savedCourses) {
          const parsedCourses = JSON.parse(savedCourses);
          if (Array.isArray(parsedCourses)) {
            setCourses(parsedCourses);
          }
        }
      }
    } catch {
      // LocalStorage error fallback
    }
    setIsHydrated(true);
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
<<<<<<< HEAD
    let cancelled = false;
    (async () => {
      setCatalogStatus("loading");
      const result = await loadCatalog();
      if (cancelled) return;
      if (!result.ok) {
        setUniversities([]);
        setCourses([]);
        setCatalogError(result.error);
        setCatalogStatus(result.reason === "unconfigured" ? "unconfigured" : "error");
        return;
      }
      setUniversities(result.universities);
      setCourses(result.courses);
      setCatalogError(null);
      setCatalogStatus("ready");
    })();
    return () => {
      cancelled = true;
    };
  }, [isHydrated]);

  useEffect(() => {
    if (!dbReady) return;
    const handle = window.setTimeout(() => {
      void flushPortalChanges(
        { students, applications, partners: b2bPartners, notices, notifications, requests: accessRequests },
        snapshotRef.current
      ).then((result) => {
        snapshotRef.current = result.snapshot;
        if (result.error) setSyncError(result.error);
      });
    }, 450);
    return () => window.clearTimeout(handle);
  }, [dbReady, students, applications, b2bPartners, notices, notifications, accessRequests]);
=======
    try {
      localStorage.setItem("devgrate_portal_role", portalRole);
      localStorage.setItem("devgrate_student_auth", String(isStudentAuthenticated));
      localStorage.setItem("devgrate_active_student_id", activeStudentId);
      localStorage.setItem("devgrate_students_data", JSON.stringify(students));
      localStorage.setItem("devgrate_portal_applications", JSON.stringify(applications));
      localStorage.setItem("devgrate_courses_data", JSON.stringify(courses));
      localStorage.setItem("devgrate_universities_data", JSON.stringify(universities));
    } catch {
      // Ignore storage quota
    }
  }, [portalRole, isStudentAuthenticated, activeStudentId, students, applications, courses, universities, isHydrated]);
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2

  const setPortalRole = useCallback((role: PortalRole) => {
    setPortalRoleState(role);
  }, []);

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

    if (!found) return false;

    if (method === "otp") {
      if (codeOrPass !== "123456") return false;
    } else if (!found.password || codeOrPass !== found.password) {
      return false;
    }

    setActiveStudentId(found.id);
    setIsStudentAuthenticated(true);
    return true;
  };

  // Student Registration (Step 1 Basic)
  const registerStudent = (basic: { name: string; mobile: string; email: string; password?: string }): StudentProfile => {
    const email = basic.email.trim().toLowerCase();
    const existing = students.find((student) => student.email.toLowerCase() === email);
    if (existing) {
      const updated = { ...existing, name: basic.name, mobile: basic.mobile };
      delete updated.password;
      setStudents((prev) => prev.map((student) => (student.id === existing.id ? updated : student)));
      setActiveStudentId(existing.id);
      setIsStudentAuthenticated(true);
      return updated;
    }
    const sessionId = readSessionValue("dakshin_account_id") || "";
    const newStudent = buildStudentRecord(basic);
    if (isUuid(sessionId)) newStudent.id = sessionId;
    const trackingId = readSessionValue("dakshin_tracking_id");
    if (trackingId) newStudent.studentId = trackingId;
    delete newStudent.password;

    setStudents((prev) => [newStudent, ...prev.filter((student) => student.email.toLowerCase() !== newStudent.email.toLowerCase())]);
    setActiveStudentId(newStudent.id);
    setIsStudentAuthenticated(true);

    // Add alert notification to Super Admin
    const adminNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: "New Student Registered",
      message: `${basic.name} registered via Student Auth (${basic.mobile}). Record added to Super Admin directory.`,
      timeAgo: "Just now",
      type: "system",
      isRead: false,
      studentId: newStudent.id,
    };
    setNotifications((prev) => [adminNotif, ...prev]);

    return newStudent;
  };

  const logoutStudent = () => {
    setIsStudentAuthenticated(false);
    performLogout();
  };

  const logout = () => {
    setIsStudentAuthenticated(false);
    performLogout();
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
            id: existingIndex >= 0 ? s.documents[existingIndex].id : createTrackingId("DOC"),
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
<<<<<<< HEAD
  }): ApplicationRecord | null => {
    const student = activeStudent;
    const univ = universities.find((u) => u.id === data.universityId);
    const course = courses.find((c) => c.id === data.courseId);
    if (!student || !univ || !course) return null;
=======
  }): ApplicationRecord => {
    const student = activeStudent || SEED_STUDENTS[0];
    const univ = universities.find((u) => u.id === data.universityId) || universities[0] || {
      id: data.universityId || "univ-temp",
      name: "Selected University",
      country: "International",
      city: "Campus",
      logo: "🎓",
      image: "",
      availableCoursesCount: 0,
      availableIntakes: [],
    };
    const course = courses.find((c) => c.id === data.courseId) || courses[0] || {
      id: data.courseId || "course-temp",
      universityId: univ.id,
      universityName: univ.name,
      campus: "Main Campus",
      city: univ.city,
      country: univ.country,
      courseName: "Degree Program",
      studyLevel: "Postgraduate" as const,
      courseType: "Full-Time" as const,
      duration: "1 Year",
      tuitionFee: "£0",
      applicationFee: "£0",
      activeIntake: data.intake || "Upcoming",
      availableIntakes: [],
      applicationDeadline: "TBD",
      badges: { scholarship: false, freeToApply: true, noAppFee: true, interviewRequired: false },
    };
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2

    const newCamsId = createTrackingId("APP");
    const today = new Date().toISOString().slice(0, 10);
    const timeline = buildTimeline("Application Submitted", today);

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
      counselorName: "Dakshinvedha Student Self-Apply",
      studentProfileId: isUuid(student.id) ? student.id : undefined,
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
    notApplicableStages: string[] = [],
    agentAssignment?: { trackingId: string; name: string } | null
  ) => {
    const today = new Date().toISOString().slice(0, 10);
    setApplications((prev) =>
      prev.map((app) => {
        if (app.camsId === camsId) {
          const updatedTimeline = buildTimeline(primaryStatus, today, app.timeline).map((stage) => {
            if (notApplicableStages.includes(stage.status)) {
              return { ...stage, state: "not_applicable" as const, date: "Not applicable" };
            }
            if (timelineStatus && stage.status === timelineStatus) {
              return { ...stage, state: "completed" as const, date: today };
            }
            return stage;
          });

          return {
            ...app,
            primaryStatus,
            secondaryStatus,
            dateModified: today,
            timeline: updatedTimeline,
            agentTrackingId:
              agentAssignment === undefined ? app.agentTrackingId : agentAssignment?.trackingId || undefined,
            counselorName: agentAssignment ? agentAssignment.name : app.counselorName,
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

  const rememberCourses = (nextCourses: CourseInfo[]) => {
    setCourses(nextCourses);
    setUniversities((prev) => withCourseCounts(prev, nextCourses));
  };

  const updateCourseRequirements = async (courseId: string, req: CourseRequirementsConfig): Promise<CatalogWriteResult> => {
    const existing = coursesRef.current.find((course) => course.id === courseId);
    if (!existing) return { ok: false, error: "Course not found." };
    return updateCourse({ ...existing, requirementsConfig: req });
  };

  const addUniversity = async (univ: UniversityInfo): Promise<CatalogWriteResult> => {
    const next = { ...univ, availableCoursesCount: 0 };
    const saved = await saveInstitution(next);
    if (!saved.ok) return saved;
    setUniversities((prev) => [next, ...prev.filter((item) => item.id !== next.id)]);
    return { ok: true };
  };

  const updateUniversity = async (univ: UniversityInfo): Promise<CatalogWriteResult> => {
    const linked = coursesRef.current
      .filter((course) => course.universityId === univ.id)
      .map((course) => ({
        ...course,
        universityName: univ.name,
        country: univ.country,
        city: univ.city,
        aboutUniversity: univ.about || course.aboutUniversity,
      }));
    const next = { ...univ, availableCoursesCount: linked.length };
    const saved = await saveInstitution(next);
    if (!saved.ok) return saved;
    for (const course of linked) {
      const courseSaved = await saveCourse(course);
      if (!courseSaved.ok) return courseSaved;
    }
    setUniversities((prev) => prev.map((item) => (item.id === next.id ? next : item)));
    if (linked.length > 0) {
      setCourses((prev) => prev.map((course) => linked.find((item) => item.id === course.id) || course));
    }
    return { ok: true };
  };

  const deleteUniversity = async (id: string): Promise<CatalogWriteResult> => {
    const removed = await removeInstitution(id);
    if (!removed.ok) return removed;
    setUniversities((prev) => prev.filter((item) => item.id !== id));
    setCourses((prev) => prev.filter((course) => course.universityId !== id));
    return { ok: true };
  };

  const addCourse = async (course: CourseInfo): Promise<CatalogWriteResult> => {
    const saved = await saveCourse(course);
    if (!saved.ok) return saved;
    rememberCourses([course, ...coursesRef.current.filter((item) => item.id !== course.id)]);
    return { ok: true };
  };

  const updateCourse = async (course: CourseInfo): Promise<CatalogWriteResult> => {
    const saved = await saveCourse(course);
    if (!saved.ok) return saved;
    rememberCourses(coursesRef.current.map((item) => (item.id === course.id ? course : item)));
    return { ok: true };
  };

  const deleteCourse = async (id: string): Promise<CatalogWriteResult> => {
    const removed = await removeCourse(id);
    if (!removed.ok) return removed;
    rememberCourses(coursesRef.current.filter((course) => course.id !== id));
    return { ok: true };
  };

  // Notices
  const publishNotice = (noticeData: Omit<NoticeItem, "id" | "dateAdded">) => {
    const newNotice: NoticeItem = {
      ...noticeData,
      id: createTrackingId("NTC"),
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

  // ==========================================
  // B2B / PARTNER MANAGEMENT
  // ==========================================
  const activeB2BPartner = useMemo(() => {
    if (portalRole !== "partner" && portalRole !== "team") return null;
    if (sessionPartnerId) {
      const byId = b2bPartners.find(
        (partner) => partner.id === sessionPartnerId || partner.partnerId === sessionPartnerId
      );
      if (byId) return byId;
    }
    if (sessionEmail) {
      const owner = b2bPartners.find((partner) => partner.email.toLowerCase() === sessionEmail.toLowerCase());
      if (owner) return owner;
      const viaTeam = b2bPartners.find((partner) =>
        (partner.teamMembers || []).some((member) => member.email.toLowerCase() === sessionEmail.toLowerCase())
      );
      if (viaTeam) return viaTeam;
    }
    return null;
  }, [b2bPartners, portalRole, sessionEmail, sessionPartnerId]);

  const rejectB2BRequest = (requestId: string) => {
    setAccessRequests((prev) => prev.map((request) => (request.id === requestId ? { ...request, status: "Rejected" } : request)));
  };

  const createB2BAccount = async (basic: {
    name: string;
    phone: string;
    email: string;
    password?: string;
    organizationName?: string;
  }): Promise<B2BPartnerProfile | { error: string }> => {
    const email = basic.email.trim().toLowerCase();
    if (b2bPartners.some((partner) => partner.email.toLowerCase() === email)) {
      return { error: "An account with this email already exists." };
    }
    const password = basic.password?.trim() || generatePassword();
    const result = await provisionAccount({
      role: "partner",
      email,
      password,
      fullName: basic.name.trim(),
      phone: basic.phone,
      organizationName: basic.organizationName,
    });
    if (!result.ok) return { error: result.error };
    if (!result.partner) return { error: "The organization record was not created." };
    const partner = { ...result.partner, password };
    setB2bPartners((prev) => [partner, ...prev.filter((item) => item.id !== partner.id)]);
    setAccessRequests((prev) =>
      prev.map((request) =>
        request.email.toLowerCase() === email && request.status === "Pending"
          ? { ...request, status: "Approved", partnerId: partner.id }
          : request
      )
    );
    return partner;
  };

  // B2B partner updates their profile
  const updateB2BProfile = (partnerId: string, updates: Partial<B2BPartnerProfile>) => {
    setB2bPartners((prev) =>
      prev.map((p) => {
        if (p.id === partnerId || p.partnerId === partnerId) {
          const merged = { ...p, ...updates };
          // Check if all critical fields are filled to mark profile as complete
          const isComplete = !!(
            merged.organizationName &&
            merged.organizationEmail &&
            merged.incorporationNumber &&
            merged.personalDocuments.aadhaarNumber &&
            merged.personalDocuments.panNumber &&
            merged.organizationDocuments.orgPanNumber &&
            merged.organizationDocuments.gstNumber &&
            merged.bankDetails.accountNumber
          );
          merged.profileCompleted = isComplete;
          if (isComplete && merged.accountStatus === "Pending Profile") {
            merged.accountStatus = "Under Verification";
          }
          return merged;
        }
        return p;
      })
    );
  };

  // Admin verifies a B2B partner
  const verifyB2BPartner = (partnerId: string) => {
    setB2bPartners((prev) =>
      prev.map((p) => {
        if (p.id === partnerId || p.partnerId === partnerId) {
          return {
            ...p,
            verificationStatus: "Verified" as const,
            accountStatus: "Active" as const,
            personalDocuments: {
              ...p.personalDocuments,
              aadhaarStatus: "Verified" as const,
              panStatus: "Verified" as const,
            },
            organizationDocuments: {
              ...p.organizationDocuments,
              orgPanStatus: "Verified" as const,
              orgCertificateStatus: "Verified" as const,
              gstCertificateStatus: "Verified" as const,
            },
            bankDetails: {
              ...p.bankDetails,
              status: "Verified" as const,
            },
          };
        }
        return p;
      })
    );
  };

  // B2B Login
  const loginB2B = (email: string, password: string): B2BPartnerProfile | null => {
    const found = b2bPartners.find((partner) => partner.email.toLowerCase() === email.trim().toLowerCase());
    if (!found || found.accountStatus === "Suspended") return null;
    if (!found.password || password !== found.password) return null;
    return found;
  };

  // ==========================================
  // B2B TEAM MANAGEMENT
  // ==========================================
  const addB2BTeamMember = async (
    partnerId: string,
    member: { name: string; email: string; password: string }
  ): Promise<B2BTeamMember | { error: string }> => {
    const partner = b2bPartners.find((p) => p.id === partnerId || p.partnerId === partnerId);
    if (!partner) return { error: "Partner not found" };
    const currentMembers = partner.teamMembers || [];
    if (currentMembers.length >= 5) {
      return { error: "Maximum of 5 team members allowed" };
    }
    const email = member.email.trim().toLowerCase();
    if (email === partner.email.toLowerCase()) {
      return { error: "Use a different email from the organization owner." };
    }
    if (currentMembers.some((item) => item.email.toLowerCase() === email)) {
      return { error: "This email is already used by another team member." };
    }
    const result = await provisionAccount({
      role: "team",
      email,
      password: member.password,
      fullName: member.name.trim(),
      partnerId: partner.id,
    });
    if (!result.ok) return { error: result.error };
    if (!result.account) return { error: "The team login was not created." };
    const newMember: B2BTeamMember = {
      id: result.account.id,
      name: member.name.trim(),
      email,
      password: member.password,
      role: "Team Member",
      status: "Active",
      createdAt: new Date().toISOString().slice(0, 10),
      trackingId: result.account.trackingId,
    };
    setB2bPartners((prev) =>
      prev.map((p) => {
        if (p.id === partnerId || p.partnerId === partnerId) {
          return { ...p, teamMembers: [...(p.teamMembers || []).filter((item) => item.email.toLowerCase() !== email), newMember] };
        }
        return p;
      })
    );
    return newMember;
  };

  const removeB2BTeamMember = async (partnerId: string, memberId: string) => {
    const removed = await removeAccount(memberId);
    if (!removed.ok) {
      setSyncError(removed.error);
      return;
    }
    setB2bPartners((prev) =>
      prev.map((p) => {
        if (p.id === partnerId || p.partnerId === partnerId) {
          return { ...p, teamMembers: (p.teamMembers || []).filter((m) => m.id !== memberId) };
        }
        return p;
      })
    );
  };

  const updateB2BTeamMember = (partnerId: string, memberId: string, updates: Partial<B2BTeamMember>) => {
    if (updates.status && isUuid(memberId)) {
      void updateAccountStatus(memberId, updates.status === "Suspended" ? "Suspended" : "Active").then((error) => {
        if (error) setSyncError(error);
      });
    }
    setB2bPartners((prev) =>
      prev.map((p) => {
        if (p.id === partnerId || p.partnerId === partnerId) {
          return {
            ...p,
            teamMembers: (p.teamMembers || []).map((m) => (m.id === memberId ? { ...m, ...updates } : m)),
          };
        }
        return p;
      })
    );
  };

  const recordApplication = (application: ApplicationRecord) => {
    setApplications((prev) => [application, ...prev.filter((item) => item.camsId !== application.camsId)]);
  };

  const claimCommission = (camsId: string) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.camsId === camsId
          ? {
              ...app,
              commission: { ...app.commission, status: "Claimed" },
              secondaryStatus: app.secondaryStatus === "Commission Paid" ? app.secondaryStatus : "Commission Pending",
            }
          : app
      )
    );
  };

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
        logout,
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
        catalogStatus,
        catalogError,
        updateCourseRequirements,
        addUniversity,
        updateUniversity,
        deleteUniversity,
        addCourse,
        updateCourse,
        deleteCourse,
        b2bPartners,
        activeB2BPartner,
        createB2BAccount,
        updateB2BProfile,
        verifyB2BPartner,
        loginB2B,
        accessRequests,
        rejectB2BRequest,
        addB2BTeamMember,
        removeB2BTeamMember,
        updateB2BTeamMember,
        recordApplication,
        claimCommission,
        syncError,
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
