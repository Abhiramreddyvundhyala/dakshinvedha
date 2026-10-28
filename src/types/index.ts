export interface StudentInfo {
  firstName: string;
  middleName?: string;
  lastName: string;
  name: string;
  dob: string;
  gender: string;
  nationality: string;
  passportNumber: string;
  passportExpiry: string;
  email: string;
  phone: string;
  studentId: string;
  address?: {
    country: string;
    state: string;
    city: string;
    postalCode: string;
    streetAddress: string;
  };
}

export interface QualificationItem {
  id: string;
  highestQualification: string;
  institution: string;
  course: string;
  yearCompleted: string;
  gradePercentage: string;
}

export interface EnglishProficiency {
  testType: "IELTS" | "TOEFL" | "PTE" | "Duolingo" | "English waiver" | "Other";
  overallScore: string;
  readingScore: string;
  writingScore: string;
  listeningScore: string;
  speakingScore: string;
}

export interface DocumentUploadItem {
  id: string;
  category: "Passport" | "Academic Documents" | "English Test" | "CV" | "SOP" | "Recommendation Letters" | "Other Documents";
  fileName: string;
  fileSize: string;
  progress: number;
  status: "Uploading" | "Uploaded" | "Verified" | "Action Required";
  storagePath?: string;
  storageBucket?: string;
}

export interface UniversityInfo {
  id: string;
  name: string;
  country: string;
  city: string;
  logo: string;
  image: string;
  website?: string;
  about?: string;
  availableCoursesCount: number;
  availableIntakes: string[];
  urmRepresentative: {
    id: string;
    name: string;
    mobile: string;
    phone: string;
    email: string;
    designation: string;
    whatsapp?: string;
    officeHours?: string;
    region?: string;
  };
}

export interface CourseInfo {
  id: string;
  universityId: string;
  universityName: string;
  campus: string;
  city: string;
  country: string;
  courseName: string;
  studyLevel: "Undergraduate" | "Postgraduate" | "Doctorate";
  courseType: "Full-Time" | "Part-Time" | "Distance Learning";
  department: string;
  subject: string;
  duration: string;
  tuitionFee: string;
  tuitionFeeNum: number;
  applicationFee: string;
  activeIntake: string;
  availableIntakes: string[];
  applicationDeadline: string;
  images: string[];
  badges: {
    scholarship: boolean;
    freeToApply: boolean;
    noAppFee: boolean;
    interviewRequired: boolean;
  };
  entryRequirements: {
    academic: string;
    english: string;
    workExperience?: string;
  };
  scholarshipsInfo?: string;
  additionalNotes?: string;
  commissionRate: string;
  requirementsConfig?: CourseRequirementsConfig;
  campusesList?: string[];
  aboutUniversity?: string;
}

export type PrimaryStatusType =
  | "Draft"
  | "Application Submitted"
  | "Under Review"
  | "Submitted to University"
  | "Offer Issued"
  | "Payment Pending"
  | "Payment Done"
  | "CAS Processing"
  | "CAS Issued"
  | "Visa Processing"
  | "Completed"
  | "Closed";

export type SecondaryStatusType =
  | "Documents Pending"
  | "Documents Verified"
  | "Conditional Offer"
  | "Unconditional Offer"
  | "Deposit Pending"
  | "Deposit Paid"
  | "Commission Pending"
  | "Commission Processing"
  | "Commission Paid";

export interface TimelineEntry {
  status: string;
  date: string;
  description: string;
  state: "completed" | "current" | "pending" | "not_applicable";
}

export interface ApplicationRecord {
  camsId: string;
  student: StudentInfo;
  university: UniversityInfo;
  course: CourseInfo;
  primaryStatus: PrimaryStatusType;
  secondaryStatus: SecondaryStatusType;
  dateAdded: string;
  dateModified: string;
  counselorName: string;
  qualifications: QualificationItem[];
  englishProficiency: EnglishProficiency;
  documents: DocumentUploadItem[];
  timeline: TimelineEntry[];
  /** Auth user id of the student, when this application belongs to a student login. */
  studentProfileId?: string;
  /** Dakshinvedha counselor assigned to this application. Agents are not B2B team members. */
  agentTrackingId?: string;
  /** Auth user id of the assigned agent. */
  agentProfileId?: string;
  /** B2B organization that owns this application. */
  partnerTrackingId?: string;
  /** partners.id for the owning B2B organization. */
  partnerRecordId?: string;
  payment: {
    grossTuition: string;
    scholarship: string;
    depositPaid: string;
    netBalanceDue: string;
    paymentStatus: string;
  };
  commission: {
    amount: string;
    eligibleAmount: string;
    expectedCommission: string;
    status: "Pending" | "Claimed" | "Approved" | "Paid";
    invoiceNumber?: string;
    /** Date the partner or agent sent the claim request to admin. */
    claimedOn?: string;
    paidDate?: string;
    referenceNumber?: string;
  };
  notes: {
    id: string;
    author: string;
    date: string;
    text: string;
  }[];
}

export interface BankAccountDetails {
  businessAccountName: string;
  accountNumber: string;
  bankName: string;
  branch: string;
  swift: string;
  ifscSortCode: string;
  ibanBic: string;
  vatNumber: string;
  status: "Approved" | "Pending Verification" | "Action Required";
}

export interface NoticeItem {
  id: string;
  title: string;
  university: string;
  country: string;
  dateAdded: string;
  category: "Admissions" | "Scholarship" | "Deadline" | "Requirements" | "Campus Update";
  description: string;
  fullContent: string;
  attachmentName?: string;
  attachmentSize?: string;
  isUrgent?: boolean;
  /** all, students, partners, or agents. Missing notices are treated as all. */
  audience?: "all" | "students" | "partners" | "agents";
}

export interface UniversityDeadlineItem {
  id: string;
  university: string;
  country: string;
  courseType: "Undergraduate" | "Postgraduate";
  applicationDeadline: string;
  intake: string;
  daysRemaining: number;
  isUrgent?: boolean;
}

export interface VoucherItem {
  id: string;
  code: string;
  type: string;
  purchasedDate: string;
  amount: string;
  status: "Available" | "Redeemed" | "Expired";
  usedBy: string;
}

export interface MailItem {
  id: string;
  sender: string;
  email: string;
  subject: string;
  snippet: string;
  body: string;
  date: string;
  folder: "inbox" | "sent" | "draft" | "important" | "archived";
  isRead: boolean;
  isStarred: boolean;
  attachment?: {
    name: string;
    size: string;
  };
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  role: "agent" | "university" | "support";
  text: string;
  timestamp: string;
  attachment?: string;
}

export interface ChatConversation {
  id: string;
  participantName: string;
  participantRole: string;
  organization: string;
  avatar: string;
  unreadCount: number;
  isOnline: boolean;
  lastMessage: string;
  lastMessageTime: string;
  messages: ChatMessage[];
}

export interface CommissionLedgerItem {
  id: string;
  transactionId: string;
  date: string;
  description: string;
  credit: string;
  debit: string;
  balance: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timeAgo: string;
  type: "urgent" | "offer" | "cas" | "finance" | "deadline" | "document" | "system";
  isRead: boolean;
  camsId?: string;
  studentId?: string;
}

// ==========================================
// COURSE REQUIREMENTS CONFIGURATION
// ==========================================
export interface CourseRequirementsConfig {
  minQualification: string;
  acceptedDegrees: string[];
  minPercentage: number;
  minCgpa: number;
  maxBacklogs: number;
  acceptedEnglishTests: string[];
  minIelts: number;
  minToefl: number;
  minPte: number;
  minDuolingo: number;
  greRequired: boolean;
  gmatRequired: boolean;
  academicEnglishAccepted: boolean;
  englishWaiverAvailable: boolean;
  passportRequiredAtApplication: boolean;
  requiredDocuments: string[];
}

// ==========================================
// STUDENT QUALIFICATIONS & TESTS
// ==========================================
export type EducationLevelType =
  | "10th"
  | "12th"
  | "Diploma"
  | "Bachelor"
  | "Master"
  | "Other";

export interface EducationQualification {
  id: string;
  level: EducationLevelType;
  institutionName: string;
  boardOrUniversity: string;
  country?: string;
  stream?: string; // For 12th: MPC, BiPC, CEC, MEC, Arts, Commerce, Science, Other
  degree?: string;
  course?: string;
  specialization?: string;
  startYear?: string;
  passOutYear: string;
  percentageOrCgpa: string;
  cgpaScale?: string; // e.g. 10 or 4
  englishMarks?: string;
  maxEnglishMarks?: string;
  hasBacklogs?: boolean;
  numberOfBacklogs?: number;
  activeBacklogs?: number;
  verificationStatus: "Pending" | "Verified" | "Flagged";
  adminFeedback?: string;
}

export interface StandardizedTestItem {
  id: string;
  type: "IELTS" | "TOEFL" | "PTE" | "Duolingo" | "GRE" | "GMAT" | "Other";
  testDate: string;
  overallScore: string;
  subScores: Record<string, string>;
  reportUrl?: string;
  status: "Uploaded" | "Verified" | "Pending";
}

export type DocumentCategoryType =
  | "Passport"
  | "Profile Photograph"
  | "10th Certificate"
  | "12th Certificate"
  | "Diploma Certificate"
  | "Bachelor Degree"
  | "Bachelor Transcripts"
  | "Master Degree"
  | "Master Transcripts"
  | "IELTS"
  | "TOEFL"
  | "PTE"
  | "Duolingo"
  | "GRE"
  | "GMAT"
  | "CV / Resume"
  | "Statement of Purpose"
  | "Letter of Recommendation"
  | "Experience Letter"
  | "Financial Documents"
  | "Other Documents";

export type DocumentStatusType =
  | "Not Uploaded"
  | "Uploaded"
  | "Under Review"
  | "Verified"
  | "Rejected"
  | "Re-upload Required";

export interface StudentDocumentItem {
  id: string;
  category: DocumentCategoryType;
  title: string;
  fileName?: string;
  fileSize?: string;
  storagePath?: string;
  storageBucket?: string;
  uploadedDate?: string;
  status: DocumentStatusType;
  rejectionReason?: string;
  actionRequired?: string;
}

// ==========================================
// STUDENT COMPLETE PROFILE
// ==========================================
export interface StudentProfile {
  id: string;
  studentId: string;
  name: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  mobile: string;
  alternateMobile?: string;
  password?: string;
  accountStatus: "Active" | "Pending Verification" | "Suspended";
  registrationDate: string;
  lastLogin: string;
  onboardingCompleted: boolean;
  profileCompletion: number;
  personal: {
    dob: string;
    gender: string;
    nationality: string;
    countryOfResidence: string;
    address: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
    };
    profilePhotoUrl?: string;
  };
  passport: {
    hasPassport: "YES" | "NO";
    passportNumber?: string;
    passportCountry?: string;
    dateOfIssue?: string;
    expiryDate?: string;
    placeOfIssue?: string;
    passportFile?: string;
    status: "Verified" | "Under Review" | "Passport Pending" | "Not Uploaded";
  };
  education: EducationQualification[];
  testsStatus: "YES" | "NO" | "PLANNING TO TAKE";
  standardizedTests: StandardizedTestItem[];
  studyPreferences: {
    preferredStudyLevel: "Undergraduate" | "Postgraduate" | "Doctorate" | "Other";
    preferredCountries: string[];
    preferredIntake: string;
    preferredCourseSubject: string;
    preferredUniversity: string;
    budgetRange: string;
    scholarshipRequired: "YES" | "NO";
  };
  documents: StudentDocumentItem[];
  notes?: { id: string; author: string; date: string; text: string }[];
}

// ==========================================
// FRONTEND ELIGIBILITY RESULT
// ==========================================
export interface EligibilityResult {
  status:
    | "Likely Eligible"
    | "Requirements Need Review"
    | "Missing English Test"
    | "Missing Academic Information";
  color: "orange" | "amber" | "sky" | "slate";
  reasons: string[];
  disclaimer: string;
}

export type PortalRole = "student" | "partner" | "team" | "agent" | "admin";

export type AccountMemberKind = "owner" | "team";

export interface PortalAccount {
  id: string;
  email: string;
  password: string;
  name: string;
  role: PortalRole;
  phone?: string;
  status: "Active" | "Suspended";
  partnerId?: string;
  memberKind?: AccountMemberKind;
  trackingId?: string;
}

export interface B2BAccessRequest {
  id: string;
  organizationName: string;
  contactName: string;
  phone: string;
  email: string;
  message: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
  partnerId?: string;
}

// ==========================================
// B2B / PARTNER PROFILE
// ==========================================
export type B2BVerificationStatus = "Pending" | "Under Review" | "Verified" | "Rejected";

export interface B2BTeamMember {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "Team Member";
  status: "Active" | "Suspended";
  createdAt: string;
  lastLogin?: string;
  trackingId?: string;
  /** Screens the B2B owner allows. Missing means the older full menu, except Team. */
  features?: string[];
}

export interface B2BPartnerProfile {
  id: string;
  partnerId: string;
  /** auth user id of the B2B owner. */
  ownerProfileId?: string;
  /** Bank form used by the finance screen. The main fields also live on bankDetails. */
  financeAccount?: BankAccountDetails;
  // Basic Details
  name: string;
  phone: string;
  email: string;
  password?: string;
  accountStatus: "Active" | "Pending Profile" | "Under Verification" | "Suspended";
  profileCompleted: boolean;
  verificationStatus: B2BVerificationStatus;
  createdByAdmin: string; // admin who created this account
  createdDate: string;
  lastLogin: string;

  // Organization Details
  organizationName: string;
  organizationEmail: string;
  organizationPhone: string;
  incorporationNumber: string;
  registrationNumber: string; // Registration / Proprietorship Number

  // Personal Documents
  personalDocuments: {
    aadhaarNumber: string;
    aadhaarFile?: string;
    aadhaarStatus: B2BVerificationStatus;
    panNumber: string;
    panFile?: string;
    panStatus: B2BVerificationStatus;
  };

  // Organization Documents
  organizationDocuments: {
    orgPanNumber: string;
    orgPanFile?: string;
    orgPanStatus: B2BVerificationStatus;
    orgCertificateFile?: string;
    orgCertificateStatus: B2BVerificationStatus;
    gstNumber: string;
    gstCertificateFile?: string;
    gstCertificateStatus: B2BVerificationStatus;
  };

  // Bank Details
  bankDetails: {
    ifsc: string;
    bankName: string;
    accountNumber: string;
    swiftCode: string;
    accountHolderName: string;
    status: "Pending" | "Verified" | "Action Required";
  };

  // Dashboard Metrics (computed/assigned by admin)
  metrics: {
    totalApplications: number;
    processingApplications: number;
    completedApplications: number;
    rejectedApplications: number;
    intakeStudents: {
      january: number;
      may: number;
      september: number;
      december: number;
    };
    commissionAmount: string;
    commissionPending: string;
    commissionPaid: string;
  };

  // Team Members (up to 5)
  teamMembers?: B2BTeamMember[];
}

