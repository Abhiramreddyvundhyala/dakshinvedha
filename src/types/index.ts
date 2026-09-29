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
}

export interface UniversityInfo {
  id: string;
  name: string;
  country: string;
  city: string;
  logo: string;
  image: string;
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
  state: "completed" | "current" | "pending";
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
  type: "urgent" | "offer" | "cas" | "finance" | "deadline";
  isRead: boolean;
  camsId?: string;
}
