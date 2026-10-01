"use client";

import React, { useState } from "react";
import { usePlatform } from "@/context/PlatformContext";
import {
  GraduationCap,
  Phone,
  Mail,
  User,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  KeyRound,
  RotateCcw,
  AlertCircle,
} from "lucide-react";

export const StudentAuthView: React.FC = () => {
  const { registerStudent, loginStudent, students } = usePlatform();

  const [authMode, setAuthMode] = useState<"signin" | "register">("register");

  // Registration form states
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSentMessage, setOtpSentMessage] = useState(false);

  // Sign In form states
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginMethod, setLoginMethod] = useState<"password" | "otp">("password");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginOtpDigits, setLoginOtpDigits] = useState(["", "", "", "", "", ""]);
  const [isLoginOtpSent, setIsLoginOtpSent] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [forgotPasswordMsg, setForgotPasswordMsg] = useState(false);

  // Handle OTP digit changes
  const handleOtpChange = (index: number, value: string, isLogin: boolean = false) => {
    if (value.length > 1) {
      // Handle paste of whole 6 digits
      const pasted = value.slice(0, 6).split("");
      if (isLogin) {
        const newDigits = [...loginOtpDigits];
        pasted.forEach((d, i) => {
          if (i < 6) newDigits[i] = d;
        });
        setLoginOtpDigits(newDigits);
      } else {
        const newDigits = [...otpDigits];
        pasted.forEach((d, i) => {
          if (i < 6) newDigits[i] = d;
        });
        setOtpDigits(newDigits);
      }
      return;
    }

    const targetDigits = isLogin ? [...loginOtpDigits] : [...otpDigits];
    targetDigits[index] = value;
    if (isLogin) {
      setLoginOtpDigits(targetDigits);
    } else {
      setOtpDigits(targetDigits);
    }

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(
        `${isLogin ? "login-otp" : "reg-otp"}-${index + 1}`
      );
      nextInput?.focus();
    }
  };

  // Step 1: Send OTP
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !mobileNumber.trim() || !emailAddress.trim()) {
      setOtpError("Please fill in Full Name, Mobile Number, and Email Address.");
      return;
    }
    setOtpError(null);
    setIsOtpStep(true);
    setOtpSentMessage(true);
  };

  // Step 2: Verify OTP & Create Account
  const handleVerifyOtpAndCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otpDigits.join("");
    if (enteredOtp !== "123456" && enteredOtp.length !== 6) {
      setOtpError("Invalid OTP. Use the visible development OTP: 123456");
      return;
    }

    registerStudent({
      name: fullName,
      mobile: mobileNumber.startsWith("+") ? mobileNumber : `+91 ${mobileNumber}`,
      email: emailAddress,
    });
  };

  // Quick helper to fill visible dev OTP
  const fillDevOtp = (isLogin: boolean = false) => {
    if (isLogin) {
      setLoginOtpDigits(["1", "2", "3", "4", "5", "6"]);
    } else {
      setOtpDigits(["1", "2", "3", "4", "5", "6"]);
    }
    setOtpError(null);
  };

  // Sign In Handler
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginIdentifier.trim()) {
      setLoginError("Please enter your Mobile Number or Email Address.");
      return;
    }

    if (loginMethod === "otp") {
      if (!isLoginOtpSent) {
        setIsLoginOtpSent(true);
        return;
      }
      const code = loginOtpDigits.join("");
      const success = loginStudent(loginIdentifier, "otp", code);
      if (!success) {
        setLoginError("Invalid OTP code. For demo, use 123456.");
      }
    } else {
      const success = loginStudent(loginIdentifier, "password", loginPassword || "password123");
      if (!success) {
        setLoginError("Credentials not recognized. Try demo student or login via OTP.");
      }
    }
  };

  // Quick fill demo user
  const handleQuickDemo = (email: string) => {
    setLoginIdentifier(email);
    setLoginMethod("password");
    setLoginPassword("password123");
    loginStudent(email, "password", "password123");
  };

  return (
    <div className="min-h-[calc(100vh-45px)] bg-gradient-to-br from-slate-900 via-slate-950 to-orange-950/40 text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-12 relative overflow-hidden">
      {/* Background visual elements */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        {/* Left Side: Brand & Value Proposition */}
        <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold">
            <GraduationCap className="w-4 h-4" />
            <span>Official Student Admission Portal</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Your Direct Pathway to <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400">
              World-Class Universities
            </span>
          </h1>

          <p className="text-slate-300 text-sm leading-relaxed">
            Search 150+ accredited global institutions, evaluate admission requirements in real time, and submit verified applications with one unified profile.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span>Instant SMS OTP verification • No cumbersome paperwork</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span>Frontend eligibility calculator against live entry criteria</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span>End-to-end status tracking from Offer to CAS & Visa</span>
            </div>
          </div>

          {/* Quick Demo Student Selector */}
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Quick Test Demo Accounts:
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleQuickDemo("rohan.sharma@example.com")}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 font-medium transition-colors cursor-pointer"
              >
                Rohan Sharma (B.Tech, 72% done)
              </button>
              <button
                onClick={() => handleQuickDemo("priya.patel@example.com")}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 font-medium transition-colors cursor-pointer"
              >
                Priya Patel (12th CBSE)
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Container */}
        <div className="lg:col-span-7 bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 relative">
          {/* Landing Options Tab Switcher */}
          <div className="flex p-1 bg-slate-100 rounded-2xl mb-6">
            <button
              onClick={() => {
                setAuthMode("signin");
                setOtpError(null);
                setLoginError(null);
              }}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                authMode === "signin"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              STUDENT SIGN IN
            </button>
            <button
              onClick={() => {
                setAuthMode("register");
                setOtpError(null);
                setLoginError(null);
                setIsOtpStep(false);
              }}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                authMode === "register"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              CREATE STUDENT ACCOUNT
            </button>
          </div>

          {/* ======================================================== */}
          {/* TAB 1: CREATE STUDENT ACCOUNT                            */}
          {/* ======================================================== */}
          {authMode === "register" && (
            <div className="space-y-5 animate-fade-in">
              {!isOtpStep ? (
                /* STEP 1 — BASIC REGISTRATION */
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">
                      Step 1 — Basic Registration
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Create your student profile in 30 seconds with mobile OTP verification.
                    </p>
                  </div>

                  {otpError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{otpError}</span>
                    </div>
                  )}

                  {/* Full Name */}
                  <div className="space-y-1">
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
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    />
                  </div>

                  {/* Mobile Number (Important) */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>Mobile Number</span>
                        <span className="text-rose-500">*</span>
                      </span>
                      <span className="text-[10px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                        SMS OTP required
                      </span>
                    </label>
                    <div className="flex gap-2">
                      <span className="inline-flex items-center px-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-700 text-xs font-semibold">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        placeholder="98765 43210"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>Email Address</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="vikram@example.com"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    />
                  </div>

                  {/* SEND OTP BUTTON */}
                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-extrabold text-sm rounded-xl shadow-md shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <span>SEND OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <p className="text-[11px] text-slate-400 text-center">
                    By continuing, you agree to DevGrate admissions terms & privacy compliance.
                  </p>
                </form>
              ) : (
                /* STEP 1.5 — SIMULATE SMS OTP FRONTEND FLOW */
                <form onSubmit={handleVerifyOtpAndCreate} className="space-y-5">
                  <div className="text-center space-y-1">
                    <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-2">
                      <KeyRound className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-extrabold text-slate-900">
                      Verify Your Mobile
                    </h2>
                    <p className="text-xs text-slate-500">
                      Enter the 6-digit verification code sent to:
                    </p>
                    <p className="text-sm font-bold text-slate-800">
                      +91 {mobileNumber || "98765 XXXXX"}
                    </p>
                  </div>

                  {/* Visible Development OTP Notice */}
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold">Development Mode Active:</span>
                      <p className="text-[11px]">Use demo OTP code: <code className="font-extrabold text-amber-900 bg-amber-200/60 px-1.5 py-0.5 rounded">123456</code></p>
                    </div>
                    <button
                      type="button"
                      onClick={() => fillDevOtp(false)}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
                    >
                      Fill 123456
                    </button>
                  </div>

                  {otpError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{otpError}</span>
                    </div>
                  )}

                  {/* 6 Digit Input Boxes */}
                  <div className="flex justify-center gap-2 sm:gap-3">
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        id={`reg-otp-${index}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value, false)}
                        onKeyDown={(e) => {
                          if (e.key === "Backspace" && !digit && index > 0) {
                            document.getElementById(`reg-otp-${index - 1}`)?.focus();
                          }
                        }}
                        className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-extrabold rounded-xl border-2 border-slate-300 text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all bg-slate-50"
                      />
                    ))}
                  </div>

                  {/* Actions: VERIFY OTP & RESEND OTP */}
                  <div className="space-y-3 pt-2">
                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-extrabold text-sm rounded-xl shadow-md shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>VERIFY OTP & CREATE ACCOUNT</span>
                    </button>

                    <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                      <button
                        type="button"
                        onClick={() => {
                          fillDevOtp(false);
                          alert("A new OTP (123456) has been dispatched to your mobile.");
                        }}
                        className="text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>RESEND OTP</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsOtpStep(false)}
                        className="text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
                      >
                        Change Mobile Number
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: STUDENT SIGN IN                                   */}
          {/* ======================================================== */}
          {authMode === "signin" && (
            <form onSubmit={handleSignIn} className="space-y-4 animate-fade-in">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  Welcome Back, Student
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sign in with your registered mobile number or email address.
                </p>
              </div>

              {loginError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Login Identifier */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Mobile Number / Email Address
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. rohan.sharma@example.com or 9876543210"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>

              {/* Method Toggle: Password vs OTP */}
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 py-1">
                <span>Sign In via:</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="loginMethod"
                    checked={loginMethod === "password"}
                    onChange={() => {
                      setLoginMethod("password");
                      setIsLoginOtpSent(false);
                    }}
                    className="text-orange-500 focus:ring-orange-500"
                  />
                  <span>Password</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="loginMethod"
                    checked={loginMethod === "otp"}
                    onChange={() => setLoginMethod("otp")}
                    className="text-orange-500 focus:ring-orange-500"
                  />
                  <span>Mobile OTP</span>
                </label>
              </div>

              {/* Password Input */}
              {loginMethod === "password" && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Password</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setForgotPasswordMsg(true)}
                      className="text-[11px] text-orange-600 hover:underline font-semibold cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </label>
                  <input
                    type="password"
                    placeholder="Enter your account password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                </div>
              )}

              {/* OTP Login Flow */}
              {loginMethod === "otp" && (
                <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  {!isLoginOtpSent ? (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600">
                        A 6-digit OTP will be dispatched to your phone.
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsLoginOtpSent(true)}
                        className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        SEND OTP
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-600">Enter OTP (Demo code: 123456):</span>
                        <button
                          type="button"
                          onClick={() => fillDevOtp(true)}
                          className="text-[11px] text-orange-600 font-bold hover:underline cursor-pointer"
                        >
                          Fill 123456
                        </button>
                      </div>
                      <div className="flex justify-center gap-2">
                        {loginOtpDigits.map((digit, index) => (
                          <input
                            key={index}
                            id={`login-otp-${index}`}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value, true)}
                            className="w-10 h-12 text-center text-lg font-bold rounded-lg border-2 border-slate-300 text-slate-900 bg-white"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {forgotPasswordMsg && (
                <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-xl flex items-center justify-between">
                  <span>A password reset link or SMS OTP was sent to your registered contact.</span>
                  <button
                    type="button"
                    onClick={() => setForgotPasswordMsg(false)}
                    className="font-bold underline"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Remember Me */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="rememberMe" className="text-xs text-slate-600 font-medium cursor-pointer">
                  Remember Me on this device
                </label>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-extrabold text-sm rounded-xl shadow-md shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
