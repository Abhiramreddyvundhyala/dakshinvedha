"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Shield,
  User,
  Phone,
  Smartphone,
  Globe2,
} from "lucide-react";
import { writeSession } from "@/utils/accounts";
import { BrandLogo } from "@/components/brand/BrandMark";
import { getSupabase } from "@/lib/supabase";
import { fetchMyProfile } from "@/lib/portalDb";
import { sessionAccount } from "@/lib/records";
import { PortalAccount } from "@/types";

const PORTAL_TITLES: Record<PortalAccount["role"], string> = {
  admin: "Super Admin Control Center",
  partner: "B2B Owner Dashboard",
  team: "B2B Team Dashboard",
  agent: "Agent Dashboard",
  student: "Student Admission Portal",
};

export default function UnifiedLoginPage() {
  // Authentication mode: "signin" (Single Login for Everyone) vs "signup" (Students Only)
  const [authMode, setAuthMode] = useState<"signin" | "signup" | "request">("signin");

  // Sign In form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [redirectNotice, setRedirectNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [requestOrg, setRequestOrg] = useState("");
  const [requestName, setRequestName] = useState("");
  const [requestPhone, setRequestPhone] = useState("");
  const [requestEmail, setRequestEmail] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [requestSent, setRequestSent] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Student Sign Up form states (Step 1)
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [showStudentPassword, setShowStudentPassword] = useState(false);
  const [channels, setChannels] = useState({ emailOtp: false, smsOtp: false });
  const [loginStep, setLoginStep] = useState<"password" | "otp">("password");
  const [loginChallengeId, setLoginChallengeId] = useState("");
  const [loginCode, setLoginCode] = useState("");
  const [signupStep, setSignupStep] = useState<"details" | "otp">("details");
  const [signupChallengeId, setSignupChallengeId] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [emailCode, setEmailCode] = useState("");

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
          "dakshin_new_student_password",
          "dakshin_account_id",
          "dakshin_partner_id",
          "dakshin_member_kind",
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

  useEffect(() => {
    let ignore = false;
    fetch("/api/auth/otp/status")
      .then((response) => response.json())
      .then((payload: { emailOtp?: boolean; smsOtp?: boolean }) => {
        if (!ignore) setChannels({ emailOtp: Boolean(payload.emailOtp), smsOtp: Boolean(payload.smsOtp) });
      })
      .catch(() => undefined);
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    setLoginStep("password");
    setSignupStep("details");
    setLoginCode("");
    setSmsCode("");
    setEmailCode("");
  }, [authMode]);

  /* =========================================================
     1. UNIFIED LOGIN HANDLER (STUDENT, B2B, AGENT, ADMIN)
     ========================================================= */
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError("Please enter your registered email address.");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    const supabase = getSupabase();
    if (!supabase) {
      setError("Database is not configured. Add the Supabase keys in .env.local and restart the app.");
      return;
    }

    setIsLoading(true);
    if (channels.emailOtp && loginStep === "password") {
      const response = await fetch("/api/auth/otp/login/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password }),
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string; challengeId?: string };
      setIsLoading(false);
      if (!response.ok || !payload.challengeId) {
        setError(payload.error || "Could not send the login code.");
        return;
      }
      setLoginChallengeId(payload.challengeId);
      setLoginCode("");
      setLoginStep("otp");
      setInfo(`A 6-digit code was sent to ${cleanEmail}.`);
      return;
    }

    if (channels.emailOtp && loginStep === "otp") {
      const code = loginCode.replace(/\D/g, "");
      if (code.length !== 6) {
        setIsLoading(false);
        setError("Enter the 6-digit code from your email.");
        return;
      }
      const response = await fetch("/api/auth/otp/login/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId: loginChallengeId, email: cleanEmail, password, emailCode: code }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        accessToken?: string;
        refreshToken?: string;
      };
      if (!response.ok || !payload.accessToken || !payload.refreshToken) {
        setIsLoading(false);
        setError(payload.error || "Could not verify the login code.");
        return;
      }
      const session = await supabase.auth.setSession({
        access_token: payload.accessToken,
        refresh_token: payload.refreshToken,
      });
      if (session.error) {
        setIsLoading(false);
        setError(session.error.message);
        return;
      }
    } else {
      const signedIn = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
      if (signedIn.error) {
        setIsLoading(false);
        setError("Those credentials were not accepted. Use the email and password issued for this portal.");
        setRedirectNotice(null);
        return;
      }
    }

    const profile = await fetchMyProfile();
    if (!profile.ok || profile.data.status !== "Active") {
      await supabase.auth.signOut();
      setIsLoading(false);
      setError(!profile.ok ? profile.error : "This login is suspended.");
      setRedirectNotice(null);
      return;
    }

    setRedirectNotice(`Access granted. Opening ${PORTAL_TITLES[profile.data.role]}...`);
    writeSession(sessionAccount(profile.data), rememberMe);
    window.location.href = "/dashboard";
  };

  const handleAccessRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    const supabase = getSupabase();
    if (!supabase) {
      setError("Database is not configured. Add the Supabase keys in .env.local and restart the app.");
      return;
    }
    const email = requestEmail.trim().toLowerCase();
    if (!requestOrg.trim() || !requestName.trim() || !email.includes("@")) {
      setError("Organization, contact name, and a valid email are required.");
      return;
    }
    const { error: insertError } = await supabase.from("b2b_access_requests").insert({
      organization_name: requestOrg.trim(),
      contact_name: requestName.trim(),
      phone: requestPhone.startsWith("+") ? requestPhone : `+91 ${requestPhone}`,
      email,
      message: requestMessage.trim(),
      status: "Pending",
    });
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setRequestSent(true);
    setInfo("Request sent. Dakshinvedha admin will issue your B2B login after review.");
  };

  /* =========================================================
     2. STUDENT REGISTRATION (STEP 1: DETAILS)
     ========================================================= */
  const handleStudentSignup = async (e: React.FormEvent) => {
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
    if (studentPassword.trim().length < 6) {
      setError("Create a password with at least 6 characters.");
      return;
    }

    const supabase = getSupabase();
    if (!supabase) {
      setError("Database is not configured. Add the Supabase keys in .env.local and restart the app.");
      return;
    }

    setIsLoading(true);
    const cleanEmail = emailAddress.trim().toLowerCase();
    const cleanName = fullName.trim();
    const fullMobile = mobileNumber.startsWith("+") ? mobileNumber : `+91 ${mobileNumber}`;
    const otpRequired = channels.emailOtp && channels.smsOtp;

    if (otpRequired && signupStep === "details") {
      const response = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, phone: fullMobile, fullName: cleanName }),
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string; challengeId?: string };
      setIsLoading(false);
      if (!response.ok || !payload.challengeId) {
        setError(payload.error || "Could not send the verification codes.");
        return;
      }
      setSignupChallengeId(payload.challengeId);
      setSmsCode("");
      setEmailCode("");
      setSignupStep("otp");
      setInfo("Enter the SMS code and the email code. Each code expires in 10 minutes.");
      return;
    }

    let otpTicket = "";
    if (otpRequired && signupStep === "otp") {
      const response = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId: signupChallengeId,
          email: cleanEmail,
          phone: fullMobile,
          smsCode: smsCode.replace(/\D/g, ""),
          emailCode: emailCode.replace(/\D/g, ""),
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string; otpTicket?: string };
      if (!response.ok || !payload.otpTicket) {
        setIsLoading(false);
        setError(payload.error || "Could not verify the codes.");
        return;
      }
      otpTicket = payload.otpTicket;
    }

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: "student",
        email: cleanEmail,
        password: studentPassword.trim(),
        fullName: cleanName,
        phone: fullMobile,
        otpTicket,
      }),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      setIsLoading(false);
      setError(payload.error || "Could not create the student account.");
      return;
    }

    const signedIn = await supabase.auth.signInWithPassword({ email: cleanEmail, password: studentPassword.trim() });
    if (signedIn.error) {
      setIsLoading(false);
      setError(signedIn.error.message);
      return;
    }
    const profile = await fetchMyProfile();
    if (!profile.ok) {
      setIsLoading(false);
      setError(profile.error);
      return;
    }
    writeSession(sessionAccount(profile.data), true);
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen flex">
      {/* =========================================================
          LEFT PANEL: DAKSHINVEDHA ABROAD SOLUTIONS BRANDING
          ========================================================= */}
      <div className="hidden lg:flex lg:w-[54%] xl:w-[52%] relative bg-gradient-to-br from-[#060e24] via-[#0b1a3e] to-[#14234d] overflow-hidden select-none">
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
        <div className="absolute top-16 right-16 w-[420px] h-[420px] bg-orange-500/10 rounded-full blur-[110px]" />
        <div className="absolute bottom-16 left-12 w-[340px] h-[340px] bg-blue-500/10 rounded-full blur-[90px]" />

        {/* Left Content Area */}
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Logo & Platform Name */}
          <div>
            <div className="inline-flex rounded-2xl bg-white p-3 shadow-lg">
              <BrandLogo className="h-24 w-auto" />
            </div>
          </div>

          {/* Higher Education in Abroad Content */}
          <div className="space-y-8 my-auto py-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-orange-300 text-xs font-semibold backdrop-blur-xs">
                <Globe2 className="w-3.5 h-3.5 text-orange-400" />
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
                  <div className="w-6 h-6 rounded-full bg-orange-500/15 flex items-center justify-center shrink-0 border border-orange-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5 text-orange-400" />
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
                  <div className="text-lg font-black text-orange-400 leading-tight">{stat.number}</div>
                  <div className="text-xs font-bold text-white mt-0.5">{stat.label}</div>
                  <div className="text-[10px] text-slate-400">{stat.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust & Academic Accreditation Footer */}
          <div className="flex items-center justify-between pt-6 border-t border-white/5 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-orange-400" />
              <span>Certified Overseas Education Consultants</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
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
          <div className="lg:hidden mb-6 flex justify-center">
            <BrandLogo className="h-20 w-auto" />
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
            {info && !error && (
              <div className="mb-5 p-3.5 bg-sky-50 border border-sky-200 text-sky-800 rounded-xl text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-semibold">{info}</span>
              </div>
            )}

            {/* Redirecting Progress Notice */}
            {redirectNotice && (
              <div className="mb-5 p-3.5 bg-orange-50 border border-orange-200 text-orange-800 rounded-xl text-xs flex items-center gap-2.5">
                <Loader2 className="w-4 h-4 text-orange-600 animate-spin shrink-0" />
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
                    {loginStep === "otp"
                      ? `Enter the 6-digit code sent to ${email.trim().toLowerCase()}.`
                      : channels.emailOtp
                        ? "Enter your email and password. We will email a login code before opening the dashboard."
                        : "Enter your email address and password to access your dashboard."}
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
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-slate-400"
                    />
                  </div>

                  {loginStep === "otp" && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Email code</label>
                      <input
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        required
                        value={loginCode}
                        onChange={(e) => {
                          setLoginCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                          setError(null);
                        }}
                        placeholder="6-digit code"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-mono tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>
                  )}

                  {/* Password Input */}
                  {loginStep === "password" && <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Password</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setInfo("Password resets are issued by Dakshinvedha admin or, for team logins, by your B2B owner.")}
                        className="text-[11px] font-semibold text-orange-600 hover:text-orange-700 cursor-pointer"
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
                        className="w-full px-3.5 pr-11 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-slate-400"
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
                  </div>}

                  {/* Remember Me */}
                  {loginStep === "password" && <div className="flex items-center justify-between text-xs text-slate-600 pt-0.5">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-slate-300"
                      />
                      <span>Stay signed in on this device</span>
                    </label>
                  </div>}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 hover:from-orange-600 hover:to-orange-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-1"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{loginStep === "otp" ? "Checking the code..." : "Verifying credentials..."}</span>
                      </>
                    ) : (
                      <>
                        <span>{loginStep === "otp" ? "Verify and log in" : channels.emailOtp ? "Send login code" : "Log In"}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  {loginStep === "otp" && (
                    <div className="flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setLoginStep("password");
                          setLoginCode("");
                          setInfo(null);
                          setError(null);
                        }}
                        className="font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={async () => {
                          setError(null);
                          setIsLoading(true);
                          const response = await fetch("/api/auth/otp/login/send", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
                          });
                          const payload = (await response.json().catch(() => ({}))) as { error?: string; challengeId?: string };
                          setIsLoading(false);
                          if (!response.ok || !payload.challengeId) {
                            setError(payload.error || "Could not send a new login code.");
                            return;
                          }
                          setLoginChallengeId(payload.challengeId);
                          setLoginCode("");
                          setInfo(`A new code was sent to ${email.trim().toLowerCase()}.`);
                        }}
                        className="font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
                      >
                        Resend code
                      </button>
                    </div>
                  )}
                </form>

                <div className="text-center text-xs text-slate-500 pt-3 border-t border-slate-100 space-y-2">
                  <p>
                    Student without an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("signup");
                        setError(null);
                        setInfo(null);
                      }}
                      className="font-bold text-orange-600 hover:text-orange-700 hover:underline cursor-pointer"
                    >
                      Sign Up
                    </button>
                  </p>
                  <p>
                    B2B organization?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("request");
                        setError(null);
                        setInfo(null);
                        setRequestSent(false);
                      }}
                      className="font-bold text-orange-600 hover:text-orange-700 hover:underline cursor-pointer"
                    >
                      Request portal access
                    </button>
                  </p>
                  <details className="text-left bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <summary className="cursor-pointer font-bold text-slate-600">How accounts are created</summary>
                    <ul className="mt-2 space-y-1 text-[11px] text-slate-600">
                      <li>Students create an account with Sign Up. That login opens the student dashboard.</li>
                      <li>B2B owners request access. Admin issues their login from B2B Partners.</li>
                      <li>A B2B owner can create up to 5 team logins. Agents and admin staff are created by admin.</li>
                      <li>The first admin is created in Supabase Authentication, then promoted with the SQL note in supabase/schema.sql.</li>
                    </ul>
                  </details>
                </div>
              </div>
            )}

            {authMode === "request" && (
              <div className="space-y-5 animate-fade-in">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Request B2B access</h2>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Tell Dakshinvedha admin about your organization. After review, admin will create your owner login.
                  </p>
                </div>
                {requestSent ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl text-sm text-orange-800">
                      Your request is with the admin team. Sign in only after they share your email and password.
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("signin");
                        setInfo(null);
                      }}
                      className="w-full py-3 bg-slate-900 text-white font-bold text-sm rounded-xl cursor-pointer"
                    >
                      Back to log in
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleAccessRequest} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Organization name</label>
                      <input required value={requestOrg} onChange={(e) => setRequestOrg(e.target.value)} placeholder="e.g. GlobalEdu Solutions" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Your name</label>
                      <input required value={requestName} onChange={(e) => setRequestName(e.target.value)} placeholder="Contact person" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Phone</label>
                        <input required value={requestPhone} onChange={(e) => setRequestPhone(e.target.value)} placeholder="98765 43210" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Work email</label>
                        <input required type="email" value={requestEmail} onChange={(e) => setRequestEmail(e.target.value)} placeholder="owner@company.com" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Message</label>
                      <textarea required value={requestMessage} onChange={(e) => setRequestMessage(e.target.value)} rows={3} placeholder="Countries you recruit for, expected student volume, and how to reach you." className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-y" />
                    </div>
                    <button type="submit" className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-sm rounded-xl cursor-pointer">
                      Send request to admin
                    </button>
                    <button type="button" onClick={() => { setAuthMode("signin"); setError(null); }} className="w-full text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer">
                      Back to log in
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* =========================================================
                MODE 2: SIGN UP
                ========================================================= */}
            {authMode === "signup" && (
              <div className="animate-fade-in">
                  <form onSubmit={handleStudentSignup} className="space-y-4">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                        Create Account
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        {signupStep === "otp"
                          ? "Enter the SMS code and the email code to create the account."
                          : channels.emailOtp && channels.smsOtp
                            ? "We will text a code to your mobile and email a code before creating the account."
                            : "Register with your name, mobile, email, and a password."}
                      </p>
                    </div>

                    {signupStep === "otp" && (
                      <div className="space-y-3">
                        <p className="text-xs text-slate-600">Codes sent to +91 {mobileNumber.replace(/\D/g, "").slice(-10)} and {emailAddress.trim().toLowerCase()}.</p>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">SMS code</label>
                          <input
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            required
                            value={smsCode}
                            onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            placeholder="6-digit SMS code"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">Email code</label>
                          <input
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            required
                            value={emailCode}
                            onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            placeholder="6-digit email code"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                          />
                        </div>
                      </div>
                    )}

                    {signupStep === "details" && <>
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
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
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
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Smartphone className="w-3 h-3" />
                          <span>Saved on profile</span>
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
                          className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-mono"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400">
                        {channels.smsOtp ? "A 6-digit SMS code is sent to this number." : "Stored on your student profile."}
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
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          <span>Login email</span>
                        </span>
                      </div>
                      <input
                        type="email"
                        required
                        placeholder="vikram@example.com"
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                      />
                      <p className="text-[10px] text-slate-400">
                        {channels.emailOtp ? "A 6-digit email code is sent to this address." : "Used to log in."}
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
                          placeholder="At least 6 characters"
                          required
                          minLength={6}
                          value={studentPassword}
                          onChange={(e) => setStudentPassword(e.target.value)}
                          className="w-full px-3.5 pr-11 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
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
                    </>}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 hover:from-orange-600 hover:to-orange-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{signupStep === "otp" ? "Checking the codes..." : channels.emailOtp && channels.smsOtp ? "Sending codes..." : "Creating your account..."}</span>
                        </>
                      ) : (
                        <>
                          <span>{signupStep === "otp" ? "Verify and create account" : channels.emailOtp && channels.smsOtp ? "Send verification codes" : "Create Student Account"}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                    {signupStep === "otp" && (
                      <button
                        type="button"
                        onClick={() => {
                          setSignupStep("details");
                          setSmsCode("");
                          setEmailCode("");
                          setInfo(null);
                          setError(null);
                        }}
                        className="w-full text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                      >
                        Back to details
                      </button>
                    )}

                    <div className="text-center pt-2 text-xs text-slate-500">
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode("signin");
                          setError(null);
                        }}
                        className="font-bold text-orange-600 hover:text-orange-700 hover:underline cursor-pointer"
                      >
                        Log In
                      </button>
                    </div>
                  </form>
              </div>
            )}
          </div>

          {/* PAGE FOOTER */}
          <div className="flex items-center justify-center gap-4 mt-8 text-[11px] text-slate-400">
            <span>┬⌐ {new Date().getFullYear()} Dakshinvedha ABROAD Solutions</span>
            <span>ΓÇó</span>
            <a href="#" className="hover:text-slate-600 transition-colors">
              Privacy Policy
            </a>
            <span>ΓÇó</span>
            <a href="#" className="hover:text-slate-600 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
