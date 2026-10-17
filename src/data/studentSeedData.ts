import {
  StudentProfile,
  CourseRequirementsConfig,
  CourseInfo,
  EligibilityResult,
} from "@/types";

export const DEFAULT_REQUIREMENTS: CourseRequirementsConfig = {
  minQualification: "Bachelor's Degree in relevant field",
  acceptedDegrees: ["B.Tech", "B.E.", "BCA", "B.Sc", "B.Com", "BBA", "BA"],
  minPercentage: 60,
  minCgpa: 6.5,
  maxBacklogs: 2,
  acceptedEnglishTests: ["IELTS", "TOEFL", "PTE", "Duolingo"],
  minIelts: 6.5,
  minToefl: 88,
  minPte: 58,
  minDuolingo: 115,
  greRequired: false,
  gmatRequired: false,
  academicEnglishAccepted: true,
  englishWaiverAvailable: true,
  passportRequiredAtApplication: false,
  requiredDocuments: [
    "Passport",
    "Profile Photograph",
    "10th Certificate",
    "12th Certificate",
    "Bachelor Degree",
    "Bachelor Transcripts",
    "IELTS",
    "CV / Resume",
    "Statement of Purpose",
    "Letter of Recommendation",
  ],
};

export const SEED_STUDENTS: StudentProfile[] = [
  {
    id: "stu-101",
    studentId: "STU-2026-101",
    name: "Rohan Sharma",
    firstName: "Rohan",
    middleName: "Kumar",
    lastName: "Sharma",
    email: "rohan.sharma@example.com",
    mobile: "+91 98765 43210",
    alternateMobile: "+91 98765 43211",
    password: "password123",
    accountStatus: "Active",
    registrationDate: "2026-09-15",
    lastLogin: "2026-10-01 19:45",
    onboardingCompleted: true,
    profileCompletion: 72,
    personal: {
      dob: "2003-08-14",
      gender: "Male",
      nationality: "Indian",
      countryOfResidence: "India",
      address: {
        street: "B-402, Green Valley Towers, Andheri West",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400053",
      },
      profilePhotoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    },
    passport: {
      hasPassport: "YES",
      passportNumber: "Z6182904",
      passportCountry: "India",
      dateOfIssue: "2022-04-10",
      expiryDate: "2032-04-09",
      placeOfIssue: "Mumbai",
      passportFile: "Passport_Bio_Rohan_Sharma.pdf",
      status: "Verified",
    },
    education: [
      {
        id: "edu-1",
        level: "10th",
        institutionName: "St. Xavier's High School",
        boardOrUniversity: "CBSE",
        country: "India",
        passOutYear: "2019",
        percentageOrCgpa: "89.2%",
        verificationStatus: "Verified",
      },
      {
        id: "edu-2",
        level: "12th",
        institutionName: "K.J. Somaiya College of Science",
        boardOrUniversity: "Maharashtra State Board",
        stream: "MPC",
        startYear: "2019",
        passOutYear: "2021",
        percentageOrCgpa: "84.6%",
        englishMarks: "82",
        maxEnglishMarks: "100",
        verificationStatus: "Verified",
      },
      {
        id: "edu-3",
        level: "Bachelor",
        institutionName: "University of Mumbai - VJTI",
        boardOrUniversity: "University of Mumbai",
        degree: "Bachelor of Technology",
        course: "Computer Engineering",
        specialization: "Artificial Intelligence & Data Science",
        startYear: "2021",
        passOutYear: "2025",
        percentageOrCgpa: "8.3",
        cgpaScale: "10",
        hasBacklogs: false,
        numberOfBacklogs: 0,
        activeBacklogs: 0,
        verificationStatus: "Verified",
        adminFeedback: "Degree transcripts vetted. High academic standing.",
      },
    ],
    testsStatus: "YES",
    standardizedTests: [
      {
        id: "test-1",
        type: "IELTS",
        testDate: "2026-06-18",
        overallScore: "7.0",
        subScores: {
          listening: "7.5",
          reading: "7.0",
          writing: "6.5",
          speaking: "7.0",
        },
        reportUrl: "IELTS_ScoreReport_Rohan.pdf",
        status: "Verified",
      },
      {
        id: "test-2",
        type: "GRE",
        testDate: "2026-04-12",
        overallScore: "320",
        subScores: {
          verbal: "155",
          quantitative: "165",
          analyticalWriting: "4.0",
        },
        reportUrl: "GRE_ScoreReport_Rohan.pdf",
        status: "Uploaded",
      },
    ],
    studyPreferences: {
      preferredStudyLevel: "Postgraduate",
      preferredCountries: ["United Kingdom", "Australia", "Canada"],
      preferredIntake: "September",
      preferredCourseSubject: "Computer Science & Artificial Intelligence",
      preferredUniversity: "University of Greenwich",
      budgetRange: "£14,000 - £22,000 / year",
      scholarshipRequired: "YES",
    },
    documents: [
      {
        id: "doc-1",
        category: "Passport",
        title: "Passport Bio-Page",
        fileName: "Passport_Bio_Rohan_Sharma.pdf",
        fileSize: "2.1 MB",
        uploadedDate: "2026-09-18",
        status: "Verified",
      },
      {
        id: "doc-2",
        category: "Profile Photograph",
        title: "Recent Passport Size Photo",
        fileName: "Profile_Photo_Rohan.jpg",
        fileSize: "450 KB",
        uploadedDate: "2026-09-18",
        status: "Verified",
      },
      {
        id: "doc-3",
        category: "10th Certificate",
        title: "10th Secondary Certificate & Marks Card",
        fileName: "10th_Certificate_CBSE.pdf",
        fileSize: "1.8 MB",
        uploadedDate: "2026-09-18",
        status: "Verified",
      },
      {
        id: "doc-4",
        category: "12th Certificate",
        title: "12th Intermediate Passing Certificate",
        fileName: "12th_StateBoard_Marks.pdf",
        fileSize: "1.9 MB",
        uploadedDate: "2026-09-18",
        status: "Verified",
      },
      {
        id: "doc-5",
        category: "Bachelor Degree",
        title: "Provisional Bachelor Degree Certificate",
        fileName: "BTech_Provisional_Degree.pdf",
        fileSize: "3.2 MB",
        uploadedDate: "2026-09-19",
        status: "Verified",
      },
      {
        id: "doc-6",
        category: "Bachelor Transcripts",
        title: "Official Sem 1-8 Consolidated Transcripts",
        fileName: "VJTI_Consolidated_Transcripts.pdf",
        fileSize: "4.8 MB",
        uploadedDate: "2026-09-19",
        status: "Verified",
      },
      {
        id: "doc-7",
        category: "IELTS",
        title: "IELTS Official Test Report Form (TRF)",
        fileName: "IELTS_ScoreReport_Rohan.pdf",
        fileSize: "1.2 MB",
        uploadedDate: "2026-09-20",
        status: "Verified",
      },
      {
        id: "doc-8",
        category: "CV / Resume",
        title: "Academic & Project CV",
        fileName: "Rohan_Sharma_CV_2026.pdf",
        fileSize: "680 KB",
        uploadedDate: "2026-09-20",
        status: "Verified",
      },
      {
        id: "doc-9",
        category: "Statement of Purpose",
        title: "Statement of Purpose (SOP)",
        fileName: "SOP_AI_Greenwich.docx",
        fileSize: "850 KB",
        uploadedDate: "2026-09-22",
        status: "Under Review",
      },
      {
        id: "doc-10",
        category: "Letter of Recommendation",
        title: "Academic LOR 1 (Prof. D. Sen)",
        fileName: "LOR_Professor_Sen.pdf",
        fileSize: "920 KB",
        uploadedDate: "2026-09-22",
        status: "Under Review",
      },
    ],
    notes: [
      {
        id: "n-1",
        author: "Super Admin",
        date: "2026-09-25",
        text: "Student has solid academics (8.3 CGPA) and valid IELTS (7.0). Qualified for £2,500 Greenwich scholarship.",
      },
    ],
  },
  {
    id: "stu-102",
    studentId: "STU-2026-102",
    name: "Priya Patel",
    firstName: "Priya",
    lastName: "Patel",
    email: "priya.patel@example.com",
    mobile: "+91 98111 22334",
    password: "password123",
    accountStatus: "Active",
    registrationDate: "2026-09-24",
    lastLogin: "2026-09-30 11:20",
    onboardingCompleted: true,
    profileCompletion: 60,
    personal: {
      dob: "2005-02-18",
      gender: "Female",
      nationality: "Indian",
      countryOfResidence: "India",
      address: {
        street: "12, Navrangpura Park",
        city: "Ahmedabad",
        state: "Gujarat",
        postalCode: "380009",
      },
    },
    passport: {
      hasPassport: "NO",
      status: "Passport Pending",
    },
    education: [
      {
        id: "edu-201",
        level: "10th",
        institutionName: "Delhi Public School",
        boardOrUniversity: "CBSE",
        passOutYear: "2021",
        percentageOrCgpa: "92.0%",
        verificationStatus: "Verified",
      },
      {
        id: "edu-202",
        level: "12th",
        institutionName: "DPS Ahmedabad",
        boardOrUniversity: "CBSE",
        stream: "Commerce",
        startYear: "2021",
        passOutYear: "2023",
        percentageOrCgpa: "88.4%",
        englishMarks: "89",
        maxEnglishMarks: "100",
        verificationStatus: "Verified",
      },
    ],
    testsStatus: "PLANNING TO TAKE",
    standardizedTests: [],
    studyPreferences: {
      preferredStudyLevel: "Undergraduate",
      preferredCountries: ["United Kingdom", "Australia"],
      preferredIntake: "September",
      preferredCourseSubject: "International Business & Management",
      preferredUniversity: "Coventry University",
      budgetRange: "£12,000 - £18,000 / year",
      scholarshipRequired: "YES",
    },
    documents: [
      {
        id: "doc-201",
        category: "10th Certificate",
        title: "10th Marks Sheet",
        fileName: "Priya_10th_CBSE.pdf",
        fileSize: "1.4 MB",
        uploadedDate: "2026-09-25",
        status: "Verified",
      },
      {
        id: "doc-202",
        category: "12th Certificate",
        title: "12th Passing Certificate",
        fileName: "Priya_12th_CBSE.pdf",
        fileSize: "1.6 MB",
        uploadedDate: "2026-09-25",
        status: "Under Review",
      },
    ],
  },
];

// Helper: Frontend eligibility evaluation
export function evaluateFrontendEligibility(
  student: StudentProfile | null | undefined,
  course?: CourseInfo | null
): EligibilityResult {
  const disclaimer =
    "Frontend eligibility estimate only based on your profile inputs. This does NOT guarantee official university admission.";

  if (!student) {
    return {
      status: "Missing Academic Information",
      color: "slate",
      reasons: ["Sign in or complete profile to evaluate eligibility."],
      disclaimer,
    };
  }

  if (!course) {
    return {
      status: "Missing Academic Information",
      color: "slate",
      reasons: ["Select a university course to evaluate eligibility."],
      disclaimer,
    };
  }

  const reasons: string[] = [];
  let isEligible = true;
  let needsReview = false;
  let missingEnglish = false;
  let missingAcademic = false;

  const req = course.requirementsConfig || DEFAULT_REQUIREMENTS;

  // 1. Academic Qualification Level Check
  const isPostgrad = course.studyLevel === "Postgraduate" || course.studyLevel === "Doctorate";
  const bachelorDegree = student.education.find((e) => e.level === "Bachelor");
  const twelfthQualification = student.education.find((e) => e.level === "12th");

  if (isPostgrad) {
    if (bachelorDegree) {
      const cgpaNum = parseFloat(bachelorDegree.percentageOrCgpa);
      const isScale10 = bachelorDegree.cgpaScale === "10" || cgpaNum <= 10;
      const effectiveCgpa = isScale10 ? cgpaNum : (cgpaNum / 100) * 10;

      if (effectiveCgpa >= req.minCgpa) {
        reasons.push(
          `Academic requirement satisfied: ${bachelorDegree.degree || "Bachelor's"} (${bachelorDegree.percentageOrCgpa}${isScale10 ? "/10" : "%"
          }) meets min ${req.minCgpa}/10 requirement.`
        );
      } else {
        reasons.push(
          `CGPA needs review: Current ${bachelorDegree.percentageOrCgpa} is close to required ${req.minCgpa}/10.`
        );
        needsReview = true;
      }

      if ((bachelorDegree.numberOfBacklogs || 0) <= req.maxBacklogs) {
        reasons.push(
          `Backlogs check satisfied (${bachelorDegree.numberOfBacklogs || 0} active backlogs, max allowed: ${req.maxBacklogs}).`
        );
      } else {
        reasons.push(
          `Backlogs alert: Student has ${bachelorDegree.numberOfBacklogs} backlogs; institution accepts max ${req.maxBacklogs}.`
        );
        needsReview = true;
      }
    } else {
      reasons.push("Missing Bachelor's Degree qualification for this Postgraduate course.");
      missingAcademic = true;
    }
  } else {
    // Undergraduate
    if (twelfthQualification) {
      const pct = parseFloat(twelfthQualification.percentageOrCgpa);
      if (pct >= req.minPercentage) {
        reasons.push(
          `High school academic requirement satisfied: 12th score ${twelfthQualification.percentageOrCgpa} meets min ${req.minPercentage}%.`
        );
      } else {
        reasons.push(`12th score ${twelfthQualification.percentageOrCgpa} is under standard ${req.minPercentage}%.`);
        needsReview = true;
      }
    } else {
      reasons.push("Missing 12th/Intermediate high school qualification.");
      missingAcademic = true;
    }
  }

  // 2. English Proficiency Check
  const ieltsTest = student.standardizedTests.find((t) => t.type === "IELTS");
  const toeflTest = student.standardizedTests.find((t) => t.type === "TOEFL");
  const pteTest = student.standardizedTests.find((t) => t.type === "PTE");
  const duolingoTest = student.standardizedTests.find((t) => t.type === "Duolingo");

  const academicEnglishScore = twelfthQualification?.englishMarks
    ? parseFloat(twelfthQualification.englishMarks)
    : null;

  if (ieltsTest) {
    const band = parseFloat(ieltsTest.overallScore);
    if (band >= req.minIelts) {
      reasons.push(`English proficiency satisfied: IELTS overall band ${band} meets min ${req.minIelts}.`);
    } else {
      reasons.push(`IELTS band ${band} is slightly below program cutoff ${req.minIelts}; pre-sessional English may apply.`);
      needsReview = true;
    }
  } else if (toeflTest && parseFloat(toeflTest.overallScore) >= req.minToefl) {
    reasons.push(`English proficiency satisfied: TOEFL iBT score ${toeflTest.overallScore} meets min ${req.minToefl}.`);
  } else if (pteTest && parseFloat(pteTest.overallScore) >= req.minPte) {
    reasons.push(`English proficiency satisfied: PTE score ${pteTest.overallScore} meets min ${req.minPte}.`);
  } else if (duolingoTest && parseFloat(duolingoTest.overallScore) >= req.minDuolingo) {
    reasons.push(`English proficiency satisfied: Duolingo score ${duolingoTest.overallScore} meets min ${req.minDuolingo}.`);
  } else if (req.academicEnglishAccepted && academicEnglishScore && academicEnglishScore >= 75) {
    reasons.push(
      `Eligible for English Waiver: 12th Academic English score (${academicEnglishScore}/100) satisfies language requirement.`
    );
  } else if (student.testsStatus === "PLANNING TO TAKE" || student.testsStatus === "NO") {
    reasons.push(
      `Missing English Test: Required IELTS ${req.minIelts}+ or English waiver assessment needed.`
    );
    missingEnglish = true;
  }

  // 3. Passport Status Check
  if (student.passport.hasPassport === "NO") {
    reasons.push("Passport pending: Can be submitted later prior to visa/CAS stage.");
  } else {
    reasons.push(`Valid passport on file (${student.passport.passportNumber || "Recorded"}).`);
  }

  // Final status decision
  if (missingAcademic) {
    return {
      status: "Missing Academic Information",
      color: "slate",
      reasons,
      disclaimer,
    };
  }

  if (missingEnglish) {
    return {
      status: "Missing English Test",
      color: "sky",
      reasons,
      disclaimer,
    };
  }

  if (needsReview) {
    return {
      status: "Requirements Need Review",
      color: "amber",
      reasons,
      disclaimer,
    };
  }

  return {
    status: "Likely Eligible",
    color: "emerald",
    reasons,
    disclaimer,
  };
}
