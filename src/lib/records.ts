import { computeProfileCompletion } from "@/lib/profileCompletion";
import type {
  ApplicationRecord,
  B2BAccessRequest,
  B2BPartnerProfile,
  B2BTeamMember,
  CommissionLedgerItem,
  MailItem,
  NoticeItem,
  NotificationItem,
  PortalAccount,
  PortalRole,
  StudentProfile,
  VoucherItem,
} from "@/types";

export interface SessionProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: PortalRole;
  status: "Active" | "Suspended";
  trackingId: string;
  partnerId: string;
  memberKind: "owner" | "team" | "";
  staffTitle: string;
  department: string;
  allowedFeatures: string[];
}

export interface DirectoryAccount {
  id: string;
  email: string;
  name: string;
  role: PortalRole;
  phone: string;
  status: "Active" | "Suspended";
  partnerId: string;
  memberKind: "owner" | "team" | "";
  trackingId: string;
  staffTitle: string;
  department: string;
  allowedFeatures: string[];
}

type Row = Record<string, unknown>;

const PORTAL_ROLES = new Set<PortalRole>(["student", "partner", "team", "agent", "admin"]);
const PRIMARY = new Set([
  "Draft",
  "Application Submitted",
  "Under Review",
  "Submitted to University",
  "Offer Issued",
  "Payment Pending",
  "Payment Done",
  "CAS Processing",
  "CAS Issued",
  "Visa Processing",
  "Completed",
  "Closed",
]);
const SECONDARY = new Set([
  "Documents Pending",
  "Documents Verified",
  "Conditional Offer",
  "Unconditional Offer",
  "Deposit Pending",
  "Deposit Paid",
  "Commission Pending",
  "Commission Processing",
  "Commission Paid",
]);
const ENGLISH = new Set(["IELTS", "TOEFL", "PTE", "Duolingo", "English waiver", "Other"]);
const COMMISSION = new Set(["Pending", "Claimed", "Approved", "Paid"]);

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function text(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

export function asDate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(value);
  return match ? match[1] : null;
}

export function timeAgo(value: unknown): string {
  if (typeof value !== "string") return "";
  const then = new Date(value).getTime();
  if (!Number.isFinite(then)) return "";
  const minutes = Math.max(0, Math.round((Date.now() - then) / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function objectPayload<T>(value: unknown): T | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as T;
}

export function sessionAccount(profile: SessionProfile): PortalAccount {
  return {
    id: profile.id,
    email: profile.email,
    password: "",
    name: profile.fullName || profile.email,
    role: profile.role,
    phone: profile.phone,
    status: profile.status,
    partnerId: profile.partnerId || undefined,
    memberKind: profile.memberKind || undefined,
    trackingId: profile.trackingId || undefined,
  };
}

export function profileFromRow(row: Row): SessionProfile | null {
  const role = text(row.role);
  if (!PORTAL_ROLES.has(role as PortalRole)) return null;
  const memberKind = text(row.member_kind);
  return {
    id: text(row.id),
    email: text(row.email).toLowerCase(),
    fullName: text(row.full_name),
    phone: text(row.phone),
    role: role as PortalRole,
    status: text(row.status) === "Suspended" ? "Suspended" : "Active",
    trackingId: text(row.tracking_id),
    partnerId: text(row.partner_id),
    memberKind: memberKind === "owner" || memberKind === "team" ? memberKind : "",
    staffTitle: text(row.staff_title),
    department: text(row.department),
    allowedFeatures: Array.isArray(row.allowed_features)
      ? (row.allowed_features as unknown[]).filter((item): item is string => typeof item === "string")
      : [],
  };
}

export function directoryFromProfile(profile: SessionProfile): DirectoryAccount {
  return {
    id: profile.id,
    email: profile.email,
    name: profile.fullName || profile.email,
    role: profile.role,
    phone: profile.phone,
    status: profile.status,
    partnerId: profile.partnerId,
    memberKind: profile.memberKind,
    trackingId: profile.trackingId,
    staffTitle: profile.staffTitle,
    department: profile.department,
    allowedFeatures: profile.allowedFeatures,
  };
}

export function blankStudent(input: {
  id: string;
  studentId: string;
  name: string;
  email: string;
  mobile: string;
}): StudentProfile {
  const parts = input.name.trim().split(/\s+/).filter(Boolean);
  const firstName = parts[0] || "Student";
  const lastName = parts.slice(1).join(" ");
  const student: StudentProfile = {
    id: input.id,
    studentId: input.studentId,
    name: input.name.trim() || firstName,
    firstName,
    lastName,
    email: input.email.trim().toLowerCase(),
    mobile: input.mobile,
    accountStatus: "Active",
    registrationDate: new Date().toISOString().slice(0, 10),
    lastLogin: "",
    onboardingCompleted: false,
    profileCompletion: 0,
    personal: {
      dob: "",
      gender: "",
      nationality: "",
      countryOfResidence: "",
      address: { street: "", city: "", state: "", postalCode: "" },
    },
    passport: { hasPassport: "NO", status: "Passport Pending" },
    education: [],
    testsStatus: "PLANNING TO TAKE",
    standardizedTests: [],
    studyPreferences: {
      preferredStudyLevel: "Postgraduate",
      preferredCountries: [],
      preferredIntake: "",
      preferredCourseSubject: "",
      preferredUniversity: "",
      budgetRange: "",
      scholarshipRequired: "NO",
    },
    documents: [],
  };
  student.profileCompletion = computeProfileCompletion(student);
  return student;
}

export function stripStudent(student: StudentProfile): StudentProfile {
  const next = { ...student };
  delete next.password;
  return next;
}

export function studentFromRow(row: Row): StudentProfile {
  const payload = objectPayload<StudentProfile>(row.payload);
  const base = payload
    ? { ...payload }
    : blankStudent({
        id: text(row.profile_id),
        studentId: text(row.tracking_id),
        name: `${text(row.first_name)} ${text(row.last_name)}`.trim(),
        email: "",
        mobile: "",
      });
  return stripStudent({
    ...base,
    id: text(row.profile_id) || base.id,
    studentId: text(row.tracking_id) || base.studentId,
    firstName: text(row.first_name) || base.firstName,
    lastName: text(row.last_name) || base.lastName,
    email: base.email,
    accountStatus: (text(row.account_status) as StudentProfile["accountStatus"]) || base.accountStatus,
    onboardingCompleted: typeof row.onboarding_completed === "boolean" ? row.onboarding_completed : base.onboardingCompleted,
    profileCompletion: typeof row.profile_completion === "number" ? row.profile_completion : base.profileCompletion,
  });
}

export function studentToRow(student: StudentProfile): Row {
  const clean = stripStudent(student);
  const prefs = clean.studyPreferences;
  return {
    profile_id: clean.id,
    tracking_id: clean.studentId,
    first_name: clean.firstName || "",
    middle_name: clean.middleName || "",
    last_name: clean.lastName || "",
    alternate_mobile: clean.alternateMobile || "",
    account_status: clean.accountStatus || "Active",
    onboarding_completed: Boolean(clean.onboardingCompleted),
    profile_completion: clean.profileCompletion || 0,
    dob: asDate(clean.personal?.dob),
    gender: clean.personal?.gender || "",
    nationality: clean.personal?.nationality || "",
    country_of_residence: clean.personal?.countryOfResidence || "",
    address_street: clean.personal?.address?.street || "",
    address_city: clean.personal?.address?.city || "",
    address_state: clean.personal?.address?.state || "",
    address_postal_code: clean.personal?.address?.postalCode || "",
    profile_photo_path: clean.personal?.profilePhotoUrl || "",
    has_passport: clean.passport?.hasPassport === "YES" ? "YES" : "NO",
    passport_number: clean.passport?.passportNumber || "",
    passport_country: clean.passport?.passportCountry || "",
    passport_date_of_issue: asDate(clean.passport?.dateOfIssue),
    passport_expiry: asDate(clean.passport?.expiryDate),
    passport_place_of_issue: clean.passport?.placeOfIssue || "",
    passport_file: clean.passport?.passportFile || "",
    passport_status: clean.passport?.status || "Passport Pending",
    tests_status: clean.testsStatus || "PLANNING TO TAKE",
    preferred_study_level: prefs?.preferredStudyLevel || "Postgraduate",
    preferred_countries: prefs?.preferredCountries || [],
    preferred_intake: prefs?.preferredIntake || "",
    preferred_course_subject: prefs?.preferredCourseSubject || "",
    preferred_university: prefs?.preferredUniversity || "",
    budget_range: prefs?.budgetRange || "",
    scholarship_required: prefs?.scholarshipRequired === "YES" ? "YES" : "NO",
    payload: clean,
  };
}

export function blankPartner(input: {
  id: string;
  partnerId: string;
  ownerProfileId: string;
  name: string;
  phone: string;
  email: string;
  organizationName?: string;
}): B2BPartnerProfile {
  return {
    id: input.id,
    partnerId: input.partnerId,
    ownerProfileId: input.ownerProfileId,
    name: input.name.trim(),
    phone: input.phone,
    email: input.email.trim().toLowerCase(),
    accountStatus: "Pending Profile",
    profileCompleted: false,
    verificationStatus: "Pending",
    createdByAdmin: "Admin",
    createdDate: new Date().toISOString().slice(0, 10),
    lastLogin: "",
    organizationName: input.organizationName?.trim() || "",
    organizationEmail: "",
    organizationPhone: "",
    incorporationNumber: "",
    registrationNumber: "",
    personalDocuments: {
      aadhaarNumber: "",
      aadhaarStatus: "Pending",
      panNumber: "",
      panStatus: "Pending",
    },
    organizationDocuments: {
      orgPanNumber: "",
      orgPanStatus: "Pending",
      orgCertificateStatus: "Pending",
      gstNumber: "",
      gstCertificateStatus: "Pending",
    },
    bankDetails: {
      ifsc: "",
      bankName: "",
      accountNumber: "",
      swiftCode: "",
      accountHolderName: "",
      status: "Pending",
    },
    metrics: {
      totalApplications: 0,
      processingApplications: 0,
      completedApplications: 0,
      rejectedApplications: 0,
      intakeStudents: { january: 0, may: 0, september: 0, december: 0 },
      commissionAmount: "₹0",
      commissionPending: "₹0",
      commissionPaid: "₹0",
    },
    teamMembers: [],
  };
}

export function stripPartner(partner: B2BPartnerProfile): B2BPartnerProfile {
  const next: B2BPartnerProfile = { ...partner, password: undefined };
  next.teamMembers = (partner.teamMembers || []).map((member) => ({ ...member, password: "" }));
  return next;
}

export function partnerFromRow(row: Row): B2BPartnerProfile {
  const payload = objectPayload<B2BPartnerProfile>(row.payload);
  const base = payload
    ? { ...payload }
    : blankPartner({
        id: text(row.id),
        partnerId: text(row.tracking_id),
        ownerProfileId: text(row.owner_profile_id),
        name: text(row.contact_name),
        phone: text(row.phone),
        email: text(row.email),
        organizationName: text(row.organization_name),
      });
  return stripPartner({
    ...base,
    id: text(row.id) || base.id,
    partnerId: text(row.tracking_id) || base.partnerId,
    ownerProfileId: text(row.owner_profile_id) || base.ownerProfileId,
    email: text(row.email) || base.email,
    organizationName: text(row.organization_name) || base.organizationName,
  });
}

export function partnerToRow(partner: B2BPartnerProfile): Row {
  const clean = stripPartner(partner);
  const personal = clean.personalDocuments;
  const org = clean.organizationDocuments;
  const bank = clean.bankDetails;
  return {
    id: clean.id,
    tracking_id: clean.partnerId,
    owner_profile_id: clean.ownerProfileId,
    contact_name: clean.name || "",
    phone: clean.phone || "",
    email: clean.email || "",
    account_status: clean.accountStatus || "Pending Profile",
    profile_completed: Boolean(clean.profileCompleted),
    verification_status: clean.verificationStatus || "Pending",
    organization_name: clean.organizationName || "",
    organization_email: clean.organizationEmail || "",
    organization_phone: clean.organizationPhone || "",
    incorporation_number: clean.incorporationNumber || "",
    registration_number: clean.registrationNumber || "",
    aadhaar_number: personal?.aadhaarNumber || "",
    aadhaar_file: personal?.aadhaarFile || "",
    aadhaar_status: personal?.aadhaarStatus || "Pending",
    pan_number: personal?.panNumber || "",
    pan_file: personal?.panFile || "",
    pan_status: personal?.panStatus || "Pending",
    org_pan_number: org?.orgPanNumber || "",
    org_pan_file: org?.orgPanFile || "",
    org_pan_status: org?.orgPanStatus || "Pending",
    org_certificate_file: org?.orgCertificateFile || "",
    org_certificate_status: org?.orgCertificateStatus || "Pending",
    gst_number: org?.gstNumber || "",
    gst_certificate_file: org?.gstCertificateFile || "",
    gst_certificate_status: org?.gstCertificateStatus || "Pending",
    bank_ifsc: bank?.ifsc || "",
    bank_name: bank?.bankName || "",
    bank_account_number: bank?.accountNumber || "",
    bank_swift: bank?.swiftCode || "",
    bank_account_holder: bank?.accountHolderName || "",
    bank_status: bank?.status || "Pending",
    payload: clean,
  };
}

export function applicationFromRow(row: Row): ApplicationRecord | null {
  const payload = objectPayload<ApplicationRecord>(row.payload);
  if (!payload || !payload.student || !payload.university || !payload.course) return null;
  const primary = text(row.primary_status);
  const secondary = text(row.secondary_status);
  const columnStatus = text(row.commission_status);
  const payloadCommission = payload.commission;
  const status = (
    payloadCommission?.status && COMMISSION.has(payloadCommission.status)
      ? payloadCommission.status
      : COMMISSION.has(columnStatus)
        ? columnStatus
        : "Pending"
  ) as ApplicationRecord["commission"]["status"];
  return {
    ...payload,
    camsId: text(row.cams_id) || payload.camsId,
    studentProfileId: text(row.student_id) || payload.studentProfileId,
    agentProfileId: text(row.agent_profile_id) || payload.agentProfileId,
    partnerRecordId: text(row.partner_id) || payload.partnerRecordId,
    primaryStatus: (PRIMARY.has(primary) ? primary : payload.primaryStatus) as ApplicationRecord["primaryStatus"],
    secondaryStatus: (SECONDARY.has(secondary) ? secondary : payload.secondaryStatus) as ApplicationRecord["secondaryStatus"],
    counselorName: text(row.counselor_name) || payload.counselorName,
    commission: {
      amount: text(row.commission_amount) || payloadCommission?.amount || "",
      eligibleAmount: text(row.commission_eligible_amount) || payloadCommission?.eligibleAmount || "",
      expectedCommission: text(row.commission_expected) || payloadCommission?.expectedCommission || "",
      status,
      invoiceNumber: text(row.commission_invoice_number) || payloadCommission?.invoiceNumber,
      claimedOn: payloadCommission?.claimedOn,
      paidDate: asDate(row.commission_paid_date) || payloadCommission?.paidDate,
      referenceNumber: text(row.commission_reference) || payloadCommission?.referenceNumber,
    },
  };
}

export function applicationToRow(app: ApplicationRecord, links: { partnerId: string | null; agentId: string | null }): Row {
  const english = app.englishProficiency?.testType;
  const commission = app.commission?.status;
  return {
    cams_id: app.camsId,
    student_id: isUuid(app.studentProfileId) ? app.studentProfileId : null,
    institution_id: app.university?.id || null,
    course_id: app.course?.id || null,
    primary_status: PRIMARY.has(app.primaryStatus) ? app.primaryStatus : "Application Submitted",
    secondary_status: SECONDARY.has(app.secondaryStatus) ? app.secondaryStatus : "Documents Pending",
    counselor_name: app.counselorName || "",
    agent_profile_id: links.agentId,
    partner_id: links.partnerId,
    intake: app.course?.activeIntake || "",
    gross_tuition: app.payment?.grossTuition || "",
    scholarship: app.payment?.scholarship || "",
    deposit_paid: app.payment?.depositPaid || "",
    net_balance_due: app.payment?.netBalanceDue || "",
    payment_status: app.payment?.paymentStatus || "Pending",
    commission_amount: app.commission?.amount || "",
    commission_eligible_amount: app.commission?.eligibleAmount || "",
    commission_expected: app.commission?.expectedCommission || "",
    commission_status: COMMISSION.has(commission) ? commission : "Pending",
    commission_invoice_number: app.commission?.invoiceNumber || "",
    commission_paid_date: asDate(app.commission?.paidDate),
    commission_reference: app.commission?.referenceNumber || "",
    english_test_type: ENGLISH.has(english) ? english : "Other",
    english_overall: app.englishProficiency?.overallScore || "",
    english_reading: app.englishProficiency?.readingScore || "",
    english_writing: app.englishProficiency?.writingScore || "",
    english_listening: app.englishProficiency?.listeningScore || "",
    english_speaking: app.englishProficiency?.speakingScore || "",
    payload: app,
  };
}

export function noticeFromRow(row: Row): NoticeItem {
  const category = text(row.category);
  const allowed = ["Admissions", "Scholarship", "Deadline", "Requirements", "Campus Update"];
  return {
    id: text(row.id),
    title: text(row.title),
    university: text(row.university_name),
    country: text(row.country),
    dateAdded: asDate(row.created_at) || "",
    category: (allowed.includes(category) ? category : "Admissions") as NoticeItem["category"],
    description: text(row.description),
    fullContent: text(row.full_content),
    attachmentName: text(row.attachment_name) || undefined,
    attachmentSize: text(row.attachment_size) || undefined,
    isUrgent: Boolean(row.is_urgent),
    audience: (["all", "students", "partners", "agents"].includes(text(row.audience))
      ? text(row.audience)
      : "all") as NoticeItem["audience"],
  };
}

export function noticeToRow(notice: NoticeItem): Row {
  return {
    id: notice.id,
    title: notice.title,
    university_name: notice.university || "",
    country: notice.country || "",
    category: notice.category,
    description: notice.description || "",
    full_content: notice.fullContent || "",
    attachment_name: notice.attachmentName || "",
    attachment_size: notice.attachmentSize || "",
    is_urgent: Boolean(notice.isUrgent),
    audience: notice.audience || "all",
  };
}

export function requestFromRow(row: Row): B2BAccessRequest {
  const status = text(row.status);
  return {
    id: text(row.id),
    organizationName: text(row.organization_name),
    contactName: text(row.contact_name),
    phone: text(row.phone),
    email: text(row.email),
    message: text(row.message),
    status: status === "Approved" || status === "Rejected" ? status : "Pending",
    createdAt: text(row.created_at),
    partnerId: text(row.partner_id) || undefined,
  };
}

export function notificationFromRow(row: Row): NotificationItem {
  const kind = text(row.kind);
  const allowed = ["urgent", "offer", "cas", "finance", "deadline", "document", "system"];
  return {
    id: text(row.id),
    title: text(row.title),
    message: text(row.message),
    timeAgo: timeAgo(row.created_at),
    type: (allowed.includes(kind) ? kind : "system") as NotificationItem["type"],
    isRead: Boolean(row.is_read),
    camsId: text(row.cams_id) || undefined,
  };
}

export function mailFromRow(row: Row): MailItem {
  const folder = text(row.folder);
  const folders = ["inbox", "sent", "draft", "important", "archived"];
  const attachmentName = text(row.attachment_name);
  return {
    id: text(row.id),
    sender: text(row.sender_name),
    email: text(row.sender_email),
    subject: text(row.subject),
    snippet: text(row.snippet),
    body: text(row.body),
    date: timeAgo(row.created_at) || asDate(row.created_at) || "",
    folder: (folders.includes(folder) ? folder : "inbox") as MailItem["folder"],
    isRead: Boolean(row.is_read),
    isStarred: Boolean(row.is_starred),
    attachment: attachmentName ? { name: attachmentName, size: text(row.attachment_size) } : undefined,
  };
}

export function voucherFromRow(row: Row): VoucherItem {
  const status = text(row.status);
  return {
    id: text(row.id),
    code: text(row.code),
    type: text(row.voucher_type),
    purchasedDate: asDate(row.purchased_at) || "",
    amount: text(row.amount),
    status: status === "Redeemed" || status === "Expired" ? status : "Available",
    usedBy: text(row.used_by),
  };
}

export function ledgerFromRow(row: Row): CommissionLedgerItem {
  return {
    id: text(row.id),
    transactionId: text(row.tracking_id),
    date: asDate(row.created_at) || "",
    description: text(row.description),
    credit: String(row.credit ?? "0"),
    debit: String(row.debit ?? "0"),
    balance: String(row.balance ?? "0"),
  };
}

export function teamMemberPublic(member: B2BTeamMember): B2BTeamMember {
  return { ...member, password: "" };
}
