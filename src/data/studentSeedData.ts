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

// Helper: Frontend eligibility evaluation
export function evaluateFrontendEligibility(
<<<<<<< HEAD
  student: StudentProfile | null,
  course: CourseInfo | null | undefined
=======
  student: StudentProfile | null | undefined,
  course?: CourseInfo | null
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
): EligibilityResult {
  const disclaimer =
    "Frontend eligibility estimate only based on your profile inputs. This does NOT guarantee official university admission.";

  if (!course) {
    return {
      status: "Missing Academic Information",
      color: "slate",
      reasons: ["Select a course to evaluate eligibility."],
      disclaimer,
    };
  }

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
    color: "orange",
    reasons,
    disclaimer,
  };
}
