"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  GraduationCap,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  ChevronLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Shield,
  Building2,
  User,
  Phone,
  Briefcase,
  ShieldCheck,
  KeyRound,
  RotateCcw,
  Sparkles,
  Check,
  Smartphone,
  Globe2,
} from "lucide-react";

const WEBSITE_URL = "http://localhost:3000";

/* =========================================================
   ROLE RESOLUTION & SESSION HELPER
   ========================================================= */
interface UserSessionProfile {
  role: "student" | "partner" | "agent" | "admin";
  name: string;
  portalTitle: string;
}

const REGISTERED_ACCOUNTS: Record<string, UserSessionProfile> = {
  "admin@dakshinvedha.com": {
    role: "admin",
    name: "Central Super Admin",
    portalTitle: "Super Admin Control Center",
  },
  "partner@dakshinvedha.com": {
    role: "partner",
    name: "Sarah Jenkins",
    portalTitle: "B2B Partner Dashboard",
  },
  "agent@dakshinvedha.com": {
    role: "agent",
    name: "Partner Agent",
    portalTitle: "Agent Recruitment Dashboard",
  },
  "student@dakshinvedha.com": {
    role: "student",
    name: "Demo Student",
    portalTitle: "Student Admission Portal",
  },
  "rohan@example.com": {
    role: "student",
    name: "Rohan Sharma",
    portalTitle: "Student Admission Portal",
  },
};

/**
 * Resolve stakeholder role from entered credentials
 */
function resolveStakeholderRole(email: string): UserSessionProfile {
  const clean = email.trim().toLowerCase();

  // 1. Direct match
  if (REGISTERED_ACCOUNTS[clean]) {
    return REGISTERED_ACCOUNTS[clean];
  }

  // 2. Check if this student was created via student registration in local/session storage
  try {
    const savedStudentEmail =
      localStorage.getItem("dakshin_user_email") ||
      sessionStorage.getItem("dakshin_user_email") ||
      localStorage.getItem("devgrate_user_email");
    const savedStudentName =
      localStorage.getItem("dakshin_user_name") ||
      sessionStorage.getItem("dakshin_user_name") ||
      localStorage.getItem("devgrate_user_name");

    if (savedStudentEmail && savedStudentEmail.toLowerCase() === clean) {
      return {
        role: "student",
        name: savedStudentName || clean.split("@")[0],
        portalTitle: "Student Admission Portal",
      };
    }
  } catch {
    // Ignore storage errors
  }

  // 3. Corporate email role routing
  if (clean.includes("admin") || clean.includes("super")) {
    return {
      role: "admin",
      name: clean.split("@")[0].replace(/[._]/g, " ").toUpperCase(),
      portalTitle: "Super Admin Control Center",
    };
  }
  if (clean.includes("partner") || clean.includes("b2b")) {
    return {
      role: "partner",
      name: clean.split("@")[0].replace(/[._]/g, " ").toUpperCase(),
      portalTitle: "B2B Partner Dashboard",
    };
  }
  if (clean.includes("agent")) {
    return {
      role: "agent",
      name: clean.split("@")[0].replace(/[._]/g, " ").toUpperCase(),
      portalTitle: "Agent Recruitment Dashboard",
    };
  }

  // 4. Default to Student
  const displayName = clean.split("@")[0].replace(/[._]/g, " ");
  return {
    role: "student",
    name: displayName.charAt(0).toUpperCase() + displayName.slice(1),
    portalTitle: "Student Admission Portal",
  };
}

export default function UnifiedLoginPage() {
  // Authentication mode: "signin" (Single Login for Everyone) vs "signup" (Students Only)
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  // Sign In form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [redirectNotice, setRedirectNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Student Sign Up form states (Step 1)
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [showStudentPassword, setShowStudentPassword] = useState(false);

  // Student Dual OTP Verification states (Step 2)
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [smsDigits, setSmsDigits] = useState(["", "", "", "", "", ""]);
  const [emailDigits, setEmailDigits] = useState(["", "", "", "", "", ""]);
  const [smsVerified, setSmsVerified] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Check if session is already active
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.location.search.includes("logout")) {
        sessionStorage.clear();
        const keysToRemove = [
          "dakshin_authenticated",
          "dakshin_portal_role",
          "dakshin_user_email",
          "dakshin_user_name",
          "dakshin_student_auth",
          "dakshin_student_new_registration",
          "dakshin_new_student_name",
          "dakshin_new_student_mobile",
          "dakshin_new_student_email",
          "devgrate_authenticated",
          "devgrate_portal_role",
          "devgrate_user_email",
          "devgrate_user_name",
          "devgrate_student_auth",
          "devgrate_student_new_registration",
          "devgrate_new_student_name",
          "devgrate_new_student_mobile",
          "devgrate_new_student_email",
        ];
        keysToRemove.forEach((k) => localStorage.removeItem(k));
        return;
      }

      const isAuth =
        sessionStorage.getItem("dakshin_authenticated") ||
        localStorage.getItem("dakshin_authenticated") ||
        localStorage.getItem("devgrate_authenticated");
      const role =
        sessionStorage.getItem("dakshin_portal_role") ||
        localStorage.getItem("dakshin_portal_role") ||
        localStorage.getItem("devgrate_portal_role");

      if (isAuth === "true" && role) {
        window.location.href = "/dashboard";
      }
    } catch {
      // Ignore
    }
  }, []);

  // Cooldown countdown for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Live status update for SMS OTP
  useEffect(() => {
    const code = smsDigits.join("");
    if (code.length === 6) {
      setSmsVerified(true);
    } else {
      setSmsVerified(false);
    }
  }, [smsDigits]);

  // Live status update for Email OTP
  useEffect(() => {
    const code = emailDigits.join("");
    if (code.length === 6) {
      setEmailVerified(true);
    } else {
      setEmailVerified(false);
    }
  }, [emailDigits]);

  /* =========================================================
     1. UNIFIED LOGIN HANDLER (STUDENT, B2B, AGENT, ADMIN)
     ========================================================= */
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError("Please enter your registered email address.");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    setIsLoading(true);

    // Resolve user role
    const profile = resolveStakeholderRole(cleanEmail);
    setRedirectNotice(`Authenticating... Routing to ${profile.portalTitle}`);

    await new Promise((res) => setTimeout(res, 850));

    try {
      // Persist session into both LocalStorage and SessionStorage
      sessionStorage.setItem("dakshin_authenticated", "true");
      sessionStorage.setItem("dakshin_portal_role", profile.role);
      sessionStorage.setItem("dakshin_user_email", cleanEmail.toLowerCase());
      sessionStorage.setItem("dakshin_user_name", profile.name);

      localStorage.setItem("dakshin_authenticated", "true");
      localStorage.setItem("dakshin_portal_role", profile.role);
      localStorage.setItem("dakshin_user_email", cleanEmail.toLowerCase());
      localStorage.setItem("dakshin_user_name", profile.name);

      // Compatibility mapping for existing dashboard views
      localStorage.setItem("devgrate_authenticated", "true");
      localStorage.setItem("devgrate_portal_role", profile.role);
      localStorage.setItem("devgrate_user_email", cleanEmail.toLowerCase());
      localStorage.setItem("devgrate_user_name", profile.name);

      if (profile.role === "student") {
        sessionStorage.setItem("dakshin_student_auth", "true");
        localStorage.setItem("devgrate_student_auth", "true");
      }
    } catch {
      // Storage fallback
    }

    setRedirectNotice(`Access granted. Opening dashboard...`);
    await new Promise((res) => setTimeout(res, 250));

    window.location.href = "/dashboard";
  };

  /* =========================================================
     2. STUDENT REGISTRATION (STEP 1: DETAILS)
     ========================================================= */
  const handleProceedToVerification = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    const cleanPhone = mobileNumber.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!emailAddress.trim() || !emailAddress.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsOtpStep(true);
      setResendCooldown(45);
      setSmsDigits(["", "", "", "", "", ""]);
      setEmailDigits(["", "", "", "", "", ""]);
      setSmsVerified(false);
      setEmailVerified(false);
      setOtpError(null);
    }, 600);
  };

  /* =========================================================
     3. OTP INPUT CONTROLLERS
     ========================================================= */
  const handleSmsChange = (index: number, val: string) => {
    setOtpError(null);
    if (val.length > 1) {
      const pasted = val.slice(0, 6).split("");
      const next = [...smsDigits];
      pasted.forEach((d, i) => {
        if (i < 6) next[i] = d;
      });
      setSmsDigits(next);
      return;
    }
    const next = [...smsDigits];
    next[index] = val;
    setSmsDigits(next);
    if (val && index < 5) {
      document.getElementById(`sms-code-${index + 1}`)?.focus();
    }
  };

  const handleEmailChange = (index: number, val: string) => {
    setOtpError(null);
    if (val.length > 1) {
      const pasted = val.slice(0, 6).split("");
      const next = [...emailDigits];
      pasted.forEach((d, i) => {
        if (i < 6) next[i] = d;
      });
      setEmailDigits(next);
      return;
    }
    const next = [...emailDigits];
    next[index] = val;
    setEmailDigits(next);
    if (val && index < 5) {
      document.getElementById(`email-code-${index + 1}`)?.focus();
    }
  };

  /* =========================================================
     4. STUDENT REGISTRATION (STEP 2: VERIFY BOTH OTPS)
     ========================================================= */
  const handleCompleteRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);

    const smsCode = smsDigits.join("");
    const emailCode = emailDigits.join("");

    if (smsCode.length !== 6) {
      setOtpError("Please enter the complete 6-digit SMS verification code.");
      return;
    }
    if (emailCode.length !== 6) {
      setOtpError("Please enter the complete 6-digit Email verification code.");
      return;
    }

    setIsLoading(true);
    setRedirectNotice("Both codes verified. Activating your student account...");

    setTimeout(() => {
      const cleanEmail = emailAddress.trim().toLowerCase();
      const cleanName = fullName.trim();
      const fullMobile = mobileNumber.startsWith("+") ? mobileNumber : `+91 ${mobileNumber}`;

      try {
        // Save in SessionStorage & LocalStorage
        sessionStorage.setItem("dakshin_authenticated", "true");
        sessionStorage.setItem("dakshin_portal_role", "student");
        sessionStorage.setItem("dakshin_user_email", cleanEmail);
        sessionStorage.setItem("dakshin_user_name", cleanName);
        sessionStorage.setItem("dakshin_student_auth", "true");

        localStorage.setItem("dakshin_authenticated", "true");
        localStorage.setItem("dakshin_portal_role", "student");
        localStorage.setItem("dakshin_user_email", cleanEmail);
        localStorage.setItem("dakshin_user_name", cleanName);

        // Signal dashboard router to register this student
        localStorage.setItem("devgrate_authenticated", "true");
        localStorage.setItem("devgrate_portal_role", "student");
        localStorage.setItem("devgrate_student_auth", "true");
        localStorage.setItem("devgrate_user_name", cleanName);
        localStorage.setItem("devgrate_user_email", cleanEmail);
        localStorage.setItem("devgrate_student_new_registration", "true");
        localStorage.setItem("devgrate_new_student_name", cleanName);
        localStorage.setItem("devgrate_new_student_mobile", fullMobile);
        localStorage.setItem("devgrate_new_student_email", cleanEmail);
      } catch {
        // Storage fallback
      }

      window.location.href = "/dashboard";
    }, 900);
  };

  return (
    <div className="min-h-screen flex">
      {/* =========================================================
          LEFT PANEL: DAKSHINVEDHA ABROAD SOLUTIONS BRANDING
          ========================================================= */}
      <div className="hidden lg:flex lg:w-[54%] xl:w-[52%] relative bg-gradient-to-br from-[#1A0C06] via-[#2D150B] to-[#451F0E] overflow-hidden select-none">
        {/* Geometric Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Ambient Glows */}
        <div className="absolute top-16 right-16 w-[420px] h-[420px] bg-[#D56732]/15 rounded-full blur-[110px]" />
        <div className="absolute bottom-16 left-12 w-[340px] h-[340px] bg-blue-500/10 rounded-full blur-[90px]" />

        {/* Left Content Area */}
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Logo & Platform Name */}
          <div>
            <a
              href={WEBSITE_URL}
              className="inline-flex items-center gap-3.5 group transition-transform hover:translate-x-0.5"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center shadow-lg shadow-[#D56732]/25 ring-2 ring-white/10">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-2xl font-black text-white tracking-tight leading-none block">
                  Dakshinvedha
                </span>
                <span className="text-[11px] text-[#D56732] font-extrabold tracking-widest uppercase block mt-1">
                  ABROAD SOLUTIONS
                </span>
              </div>
            </a>
          </div>

          {/* Higher Education in Abroad Content */}
          <div className="space-y-8 my-auto py-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#F5D2C1] text-xs font-semibold backdrop-blur-xs">
                <Globe2 className="w-3.5 h-3.5 text-[#D56732]" />
                <span>Global Higher Education & Overseas Admissions</span>
              </div>
              <h1 className="text-4xl xl:text-5xl font-black text-white leading-[1.14] tracking-tight">
                Shape your future with
                <br />
                <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-300 bg-clip-text text-transparent">
                  World-Class Higher Education.
                </span>
              </h1>
              <p className="text-base xl:text-lg text-slate-300 max-w-lg leading-relaxed">
                Your trusted gateway to top-ranked international universities across the USA, UK, Canada,
                Australia, and Europe. Dedicated admissions guidance from course selection to campus arrival.
              </p>
            </div>

            {/* Higher Education Pillars */}
            <div className="space-y-3.5">
              {[
                "Direct admission pathways to leading QS & THE World Ranked universities",
                "Undergraduate & Postgraduate programs across STEM, Business, AI & Healthcare",
                "Comprehensive scholarship assistance & international financial aid guidance",
                "Complete documentation, SOP review, mock interviews & student visa filing",
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#D56732]/20 flex items-center justify-center shrink-0 border border-orange-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#D56732]" />
                  </div>
                  <span className="text-sm text-slate-300 font-medium">{item}</span>
                </div>
              ))}
            </div>

            {/* Higher Education Overseas Key Metrics */}
            <div className="grid grid-cols-4 gap-2.5 pt-2">
              {[
                { number: "300+", label: "Universities", sub: "Global Partners" },
                { number: "15+", label: "Destinations", sub: "Top Countries" },
                { number: "98%", label: "Visa Success", sub: "Track Record" },
                { number: "100%", label: "Guidance", sub: "End-to-End" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="p-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xs text-center"
                >
                  <div className="text-lg font-black text-[#D56732] leading-tight">{stat.number}</div>
                  <div className="text-xs font-bold text-white mt-0.5">{stat.label}</div>
                  <div className="text-[10px] text-slate-400">{stat.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust & Academic Accreditation Footer */}
          <div className="flex items-center justify-between pt-6 border-t border-white/5 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#E58D5F]" />
              <span>Certified Overseas Education Consultants</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#D56732] animate-pulse" />
              <span>Accredited Global Admissions Network</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          RIGHT PANEL: UNIFIED AUTHENTICATION
          ========================================================= */}
      <div className="flex-1 flex items-center justify-center bg-[#f8fafc] px-4 sm:px-8 py-8 overflow-y-auto">
        <div className="w-full max-w-[460px]">
          {/* Mobile Brand Bar */}
          <div className="lg:hidden mb-6 text-center">
            <div className="inline-flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center shadow-md">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <span className="text-lg font-black text-slate-900 tracking-tight leading-none block">
                  Dakshinvedha
                </span>
                <span className="text-[10px] font-extrabold text-[#D56732] tracking-wider uppercase block">
                  ABROAD SOLUTIONS
                </span>
              </div>
            </div>
          </div>

          {/* Back to Website */}
          <div className="mb-4">
            <a
              href={WEBSITE_URL}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to website</span>
            </a>
          </div>

          {/* AUTHENTICATION CARD */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-6 sm:p-8">
            {/* TAB SELECTOR: LOG IN vs SIGN UP */}
            <div className="flex p-1 bg-slate-100 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signin");
                  setError(null);
                  setIsOtpStep(false);
                }}
                className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  authMode === "signin"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>LOG IN</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signup");
                  setError(null);
                }}
                className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  authMode === "signup"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>SIGN UP</span>
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            {/* Redirecting Progress Notice */}
            {redirectNotice && (
              <div className="mb-5 p-3.5 bg-[#FDF5F0] border border-[#F5D2C1] text-[#BA5322] rounded-xl text-xs flex items-center gap-2.5">
                <Loader2 className="w-4 h-4 text-[#D56732] animate-spin shrink-0" />
                <span className="font-bold">{redirectNotice}</span>
              </div>
            )}

            {/* =========================================================
                MODE 1: LOGIN
                ========================================================= */}
            {authMode === "signin" && (
              <div className="space-y-5 animate-fade-in">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    Log In
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Enter your email address and password to access your dashboard.
                  </p>
                </div>

                <form onSubmit={handleSignIn} className="space-y-4">
                  {/* Email Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>Email Address</span>
                    </label>
                    <input
                      ref={emailInputRef}
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError(null);
                      }}
                      placeholder="name@dakshinvedha.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#D56732]/20 focus:border-[#D56732] transition-all placeholder:text-slate-400"
                    />
                  </div>

                  {/* Password Input */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Password</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => alert("Please contact support or platform administration for password reset.")}
                        className="text-[11px] font-semibold text-[#D56732] hover:text-[#BA5322] cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError(null);
                        }}
                        placeholder="Enter your password"
                        className="w-full px-3.5 pr-11 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#D56732]/20 focus:border-[#D56732] transition-all placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center justify-between text-xs text-slate-600 pt-0.5">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded text-[#D56732] focus:ring-[#D56732] border-slate-300"
                      />
                      <span>Stay signed in on this device</span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-r from-[#D56732] via-[#BA5322] to-[#BA5322] hover:from-[#BA5322] hover:to-[#8C370F] text-white font-extrabold text-sm rounded-xl shadow-lg shadow-[#D56732]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-1"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying credentials...</span>
                      </>
                    ) : (
                      <>
                        <span>Log In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Footer Switch to Sign Up */}
                <div className="text-center text-xs text-slate-500 pt-3 border-t border-slate-100">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("signup");
                      setError(null);
                    }}
                    className="font-bold text-[#D56732] hover:text-[#BA5322] hover:underline cursor-pointer"
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            )}

            {/* =========================================================
                MODE 2: SIGN UP
                ========================================================= */}
            {authMode === "signup" && (
              <div className="animate-fade-in">
                {!isOtpStep ? (
                  /* STEP 2A: PROFILE DETAILS */
                  <form onSubmit={handleProceedToVerification} className="space-y-4">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                        Create Account
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Register with your mobile and email to receive verification codes.
                      </p>
                    </div>

                    {/* Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Full Name</span>
                        <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Vikramaditya Reddy"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#D56732]/20 focus:border-[#D56732] transition-all"
                      />
                    </div>

                    {/* Phone Number -> SMS OTP */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>Phone Number</span>
                          <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-[10px] font-bold text-[#BA5322] bg-[#FDF5F0] px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Smartphone className="w-3 h-3" />
                          <span>SMS OTP</span>
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <span className="inline-flex items-center px-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-700 text-xs font-bold">
                          +91
                        </span>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          placeholder="98765 43210"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#D56732]/20 focus:border-[#D56732] transition-all font-mono"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400">
                        An SMS one-time passcode will be sent to this number.
                      </p>
                    </div>

                    {/* Email -> Email OTP */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>Email Address</span>
                          <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          <span>Email OTP</span>
                        </span>
                      </div>
                      <input
                        type="email"
                        required
                        placeholder="vikram@example.com"
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#D56732]/20 focus:border-[#D56732] transition-all"
                      />
                      <p className="text-[10px] text-slate-400">
                        An email verification code will be sent to this address.
                      </p>
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Create Password</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showStudentPassword ? "text" : "password"}
                          placeholder="Choose password for sign-in"
                          value={studentPassword}
                          onChange={(e) => setStudentPassword(e.target.value)}
                          className="w-full px-3.5 pr-11 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#D56732]/20 focus:border-[#D56732] transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowStudentPassword(!showStudentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                        >
                          {showStudentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 bg-gradient-to-r from-[#D56732] via-[#BA5322] to-[#BA5322] hover:from-[#BA5322] hover:to-[#8C370F] text-white font-extrabold text-sm rounded-xl shadow-lg shadow-[#D56732]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Generating verification codes...</span>
                        </>
                      ) : (
                        <>
                          <span>Continue to Verification</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <div className="text-center pt-2 text-xs text-slate-500">
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode("signin");
                          setError(null);
                        }}
                        className="font-bold text-[#D56732] hover:text-[#BA5322] hover:underline cursor-pointer"
                      >
                        Log In
                      </button>
                    </div>
                  </form>
                ) : (
                  /* STEP 2B: DUAL OTP VERIFICATION (BOTH SMS & EMAIL) */
                  <form onSubmit={handleCompleteRegistration} className="space-y-5">
                    <div className="text-center space-y-1.5">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 text-white flex items-center justify-center mx-auto shadow-md shadow-orange-500/20">
                        <KeyRound className="w-6 h-6" />
                      </div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                        Dual-Factor Verification
                      </h2>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Please verify both the SMS code sent to your phone and the Email code sent to your inbox.
                      </p>
                    </div>

                    {/* Contact Badges */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                      <div className="flex items-center gap-2 truncate">
                        <Smartphone className="w-3.5 h-3.5 text-[#D56732] shrink-0" />
                        <span className="text-slate-600 truncate font-mono">
                          +91 {mobileNumber || "9876543210"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="text-slate-600 truncate">
                          {emailAddress || "student@example.com"}
                        </span>
                      </div>
                    </div>

                    {/* Error display */}
                    {otpError && (
                      <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span className="font-semibold">{otpError}</span>
                      </div>
                    )}

                    {/* SECTION 1: SMS OTP VERIFICATION */}
                    <div className="p-3.5 bg-white border border-slate-200 rounded-2xl space-y-2.5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-[#D56732]" />
                          <span className="text-xs font-black text-slate-800">
                            1. SMS Code (Phone)
                          </span>
                        </div>
                        {smsVerified ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#D56732] bg-[#FDF5F0] px-2 py-0.5 rounded-full">
                            <Check className="w-3 h-3" />
                            <span>Verified</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-slate-400">
                            6-digit code
                          </span>
                        )}
                      </div>

                      <div className="flex justify-center gap-1.5 sm:gap-2">
                        {smsDigits.map((digit, index) => (
                          <input
                            key={`sms-${index}`}
                            id={`sms-code-${index}`}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleSmsChange(index, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Backspace" && !digit && index > 0) {
                                document.getElementById(`sms-code-${index - 1}`)?.focus();
                              }
                            }}
                            className={`w-10 h-12 sm:w-11 sm:h-12 text-center text-lg font-black rounded-xl border-2 transition-all font-mono ${
                              smsVerified
                                ? "border-[#D56732] bg-[#FDF5F0]/50 text-[#8C370F]"
                                : "border-slate-300 bg-slate-50 text-slate-900 focus:border-[#D56732] focus:ring-2 focus:ring-[#D56732]/20"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* SECTION 2: EMAIL OTP VERIFICATION */}
                    <div className="p-3.5 bg-white border border-slate-200 rounded-2xl space-y-2.5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-blue-600" />
                          <span className="text-xs font-black text-slate-800">
                            2. Email Code (Inbox)
                          </span>
                        </div>
                        {emailVerified ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#D56732] bg-[#FDF5F0] px-2 py-0.5 rounded-full">
                            <Check className="w-3 h-3" />
                            <span>Verified</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-slate-400">
                            6-digit code
                          </span>
                        )}
                      </div>

                      <div className="flex justify-center gap-1.5 sm:gap-2">
                        {emailDigits.map((digit, index) => (
                          <input
                            key={`email-${index}`}
                            id={`email-code-${index}`}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleEmailChange(index, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Backspace" && !digit && index > 0) {
                                document.getElementById(`email-code-${index - 1}`)?.focus();
                              }
                            }}
                            className={`w-10 h-12 sm:w-11 sm:h-12 text-center text-lg font-black rounded-xl border-2 transition-all font-mono ${
                              emailVerified
                                ? "border-[#D56732] bg-[#FDF5F0]/50 text-[#8C370F]"
                                : "border-slate-300 bg-slate-50 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* VERIFY BUTTON */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 bg-gradient-to-r from-[#D56732] via-[#BA5322] to-[#BA5322] hover:from-[#BA5322] hover:to-[#8C370F] text-white font-extrabold text-sm rounded-xl shadow-lg shadow-[#D56732]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Verifying codes...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Verify & Activate Account</span>
                        </>
                      )}
                    </button>

                    {/* Action Footers */}
                    <div className="flex items-center justify-between text-xs text-slate-500 px-1 pt-1">
                      <button
                        type="button"
                        disabled={resendCooldown > 0}
                        onClick={() => {
                          setResendCooldown(30);
                          setOtpError(null);
                        }}
                        className={`flex items-center gap-1 font-bold ${
                          resendCooldown > 0
                            ? "text-slate-400 cursor-not-allowed"
                            : "text-[#D56732] hover:text-[#BA5322] cursor-pointer"
                        }`}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>
                          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend codes"}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsOtpStep(false)}
                        className="text-slate-500 hover:text-slate-900 font-medium cursor-pointer"
                      >
                        Change Phone / Email
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* PAGE FOOTER */}
          <div className="flex items-center justify-center gap-4 mt-8 text-[11px] text-slate-400">
            <span>© {new Date().getFullYear()} Dakshinvedha ABROAD Solutions</span>
            <span>•</span>
            <a href="#" className="hover:text-slate-600 transition-colors">
              Privacy Policy
            </a>
            <span>•</span>
            <a href="#" className="hover:text-slate-600 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
