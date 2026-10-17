"use client";

import React, { useState } from "react";
import { usePlatform } from "@/context/PlatformContext";
import { B2BPartnerProfile } from "@/types";
import {
  Building2,
  User,
  Phone,
  Mail,
  FileText,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Upload,
  AlertCircle,
  Landmark,
} from "lucide-react";

interface B2BProfileWizardProps {
  partner: B2BPartnerProfile;
  onComplete: () => void;
}

const STEPS = [
  { id: 1, label: "Organization", icon: Building2 },
  { id: 2, label: "Personal Docs", icon: User },
  { id: 3, label: "Org Docs", icon: FileText },
  { id: 4, label: "Bank Details", icon: Landmark },
];

export const B2BProfileWizard: React.FC<B2BProfileWizardProps> = ({ partner, onComplete }) => {
  const { updateB2BProfile } = usePlatform();
  const [step, setStep] = useState(1);

  // Step 1: Organization Details
  const [orgName, setOrgName] = useState(partner.organizationName);
  const [orgEmail, setOrgEmail] = useState(partner.organizationEmail);
  const [orgPhone, setOrgPhone] = useState(partner.organizationPhone);
  const [incorporationNum, setIncorporationNum] = useState(partner.incorporationNumber);
  const [registrationNum, setRegistrationNum] = useState(partner.registrationNumber);

  // Step 2: Personal Documents
  const [aadhaarNum, setAadhaarNum] = useState(partner.personalDocuments.aadhaarNumber);
  const [panNum, setPanNum] = useState(partner.personalDocuments.panNumber);

  // Step 3: Organization Documents
  const [orgPanNum, setOrgPanNum] = useState(partner.organizationDocuments.orgPanNumber);
  const [gstNum, setGstNum] = useState(partner.organizationDocuments.gstNumber);

  // Step 4: Bank Details
  const [ifsc, setIfsc] = useState(partner.bankDetails.ifsc);
  const [bankName, setBankName] = useState(partner.bankDetails.bankName);
  const [accountNum, setAccountNum] = useState(partner.bankDetails.accountNumber);
  const [swiftCode, setSwiftCode] = useState(partner.bankDetails.swiftCode);
  const [accountHolder, setAccountHolder] = useState(partner.bankDetails.accountHolderName || partner.organizationName);

  const [error, setError] = useState<string | null>(null);

  const validateStep = (): boolean => {
    setError(null);
    if (step === 1) {
      if (!orgName.trim() || !orgEmail.trim() || !orgPhone.trim() || !incorporationNum.trim()) {
        setError("Please fill in all required organization details.");
        return false;
      }
    }
    if (step === 2) {
      if (!aadhaarNum.trim() || !panNum.trim()) {
        setError("Please enter both Aadhaar Number and PAN Number.");
        return false;
      }
    }
    if (step === 3) {
      if (!orgPanNum.trim() || !gstNum.trim()) {
        setError("Please enter Organization PAN and GST Number.");
        return false;
      }
    }
    if (step === 4) {
      if (!ifsc.trim() || !bankName.trim() || !accountNum.trim()) {
        setError("Please fill in all required bank details.");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;

    // Save progress after each step
    const updates: Partial<B2BPartnerProfile> = {};
    if (step === 1) {
      updates.organizationName = orgName;
      updates.organizationEmail = orgEmail;
      updates.organizationPhone = orgPhone;
      updates.incorporationNumber = incorporationNum;
      updates.registrationNumber = registrationNum;
    }
    if (step === 2) {
      updates.personalDocuments = {
        ...partner.personalDocuments,
        aadhaarNumber: aadhaarNum,
        panNumber: panNum,
        aadhaarStatus: "Under Review",
        panStatus: "Under Review",
      };
    }
    if (step === 3) {
      updates.organizationDocuments = {
        ...partner.organizationDocuments,
        orgPanNumber: orgPanNum,
        gstNumber: gstNum,
        orgPanStatus: "Under Review",
        orgCertificateStatus: "Under Review",
        gstCertificateStatus: "Under Review",
      };
    }
    if (step === 4) {
      updates.bankDetails = {
        ifsc,
        bankName,
        accountNumber: accountNum,
        swiftCode,
        accountHolderName: accountHolder || orgName,
        status: "Pending",
      };
    }

    updateB2BProfile(partner.id, updates);

    if (step < 4) {
      setStep((s) => s + 1);
    } else {
      // Final submit
      updateB2BProfile(partner.id, {
        organizationName: orgName,
        organizationEmail: orgEmail,
        organizationPhone: orgPhone,
        incorporationNumber: incorporationNum,
        registrationNumber: registrationNum,
        personalDocuments: {
          aadhaarNumber: aadhaarNum,
          panNumber: panNum,
          aadhaarStatus: "Under Review",
          panStatus: "Under Review",
        },
        organizationDocuments: {
          orgPanNumber: orgPanNum,
          gstNumber: gstNum,
          orgPanStatus: "Under Review",
          orgCertificateStatus: "Under Review",
          gstCertificateStatus: "Under Review",
        },
        bankDetails: {
          ifsc,
          bankName,
          accountNumber: accountNum,
          swiftCode,
          accountHolderName: accountHolder || orgName,
          status: "Pending",
        },
      });
      onComplete();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950/40 flex items-center justify-center p-4 sm:p-8">
      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-4">
            <Building2 className="w-4 h-4" />
            <span>B2B Partner Profile Setup</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Complete Your Profile
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Welcome, <strong className="text-white">{partner.name}</strong>! Your account has been created by Admin.
            <br />Complete your profile to get started — it will be verified before activation.
          </p>
        </div>

        {/* Step Progress */}
        <div className="flex items-center justify-between mb-8 px-2">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const isCompleted = step > s.id;
            const isCurrent = step === s.id;
            return (
              <React.Fragment key={s.id}>
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isCompleted
                      ? "bg-[#D56732] text-white shadow-lg shadow-[#D56732]/30"
                      : isCurrent
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-110"
                      : "bg-slate-800 text-slate-500"
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    isCurrent ? "text-blue-400" : isCompleted ? "text-[#E58D5F]" : "text-slate-600"
                  }`}>{s.label}</span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 rounded ${
                    step > s.id ? "bg-[#D56732]" : "bg-slate-800"
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80">
          {error && (
            <div className="mb-5 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ===== STEP 1: Organization Details ===== */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Organization Details</h2>
                <p className="text-xs text-slate-500 mt-0.5">Enter your organization's basic information.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    Organization Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. GlobalEdu Solutions Pvt. Ltd."
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    Organization Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="info@yourorg.com"
                    value={orgEmail}
                    onChange={(e) => setOrgEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    Organization Phone <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 40-2345 6789"
                    value={orgPhone}
                    onChange={(e) => setOrgPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Incorporation Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. U74999TS2020PTC123456"
                    value={incorporationNum}
                    onChange={(e) => setIncorporationNum(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Registration / Proprietorship Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PROP-2020-HYD-4567"
                    value={registrationNum}
                    onChange={(e) => setRegistrationNum(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ===== STEP 2: Personal Documents ===== */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Personal Documents</h2>
                <p className="text-xs text-slate-500 mt-0.5">Provide your personal KYC details for verification.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Aadhaar Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="XXXX XXXX XXXX"
                    value={aadhaarNum}
                    onChange={(e) => setAadhaarNum(e.target.value)}
                    maxLength={14}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    PAN Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="ABCDE1234F"
                    value={panNum}
                    onChange={(e) => setPanNum(e.target.value.toUpperCase())}
                    maxLength={10}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all uppercase"
                  />
                </div>
              </div>

              {/* Document Upload Placeholders */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Upload Documents</p>
                {[
                  { label: "Aadhaar Card (Front & Back)", required: true },
                  { label: "PAN Card", required: true },
                ].map((doc) => (
                  <div
                    key={doc.label}
                    className="flex items-center gap-3 p-4 border-2 border-dashed border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/40 transition-all cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-700">{doc.label}</p>
                      <p className="text-[11px] text-slate-400">PDF, JPG or PNG — Max 5MB</p>
                    </div>
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-lg">Upload</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== STEP 3: Organization Documents ===== */}
          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Organization Documents</h2>
                <p className="text-xs text-slate-500 mt-0.5">Upload your organization's KYC and compliance documents.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Organization PAN Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="AABCG1234F"
                    value={orgPanNum}
                    onChange={(e) => setOrgPanNum(e.target.value.toUpperCase())}
                    maxLength={10}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all uppercase"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    GST Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="36AABCG1234F1ZH"
                    value={gstNum}
                    onChange={(e) => setGstNum(e.target.value.toUpperCase())}
                    maxLength={15}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all uppercase"
                  />
                </div>
              </div>

              {/* Document Upload Placeholders */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Upload Organization Documents</p>
                {[
                  { label: "Organization PAN Card", required: true },
                  { label: "Certificate of Incorporation / Registration", required: true },
                  { label: "GST Certificate", required: true },
                ].map((doc) => (
                  <div
                    key={doc.label}
                    className="flex items-center gap-3 p-4 border-2 border-dashed border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/40 transition-all cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-700">{doc.label}</p>
                      <p className="text-[11px] text-slate-400">PDF — Max 10MB</p>
                    </div>
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-lg">Upload</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== STEP 4: Bank Details ===== */}
          {step === 4 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Bank Account Details</h2>
                <p className="text-xs text-slate-500 mt-0.5">This account will be used to receive commission payments.</p>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800">
                <strong>Note:</strong> Only organization bank accounts are accepted. Personal bank accounts will not be approved.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Landmark className="w-3.5 h-3.5 text-slate-400" />
                    Account Holder Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Organization's registered name"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    IFSC Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC0001234"
                    value={ifsc}
                    onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                    maxLength={11}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all uppercase"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Bank Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC Bank"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Account Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 50100123456789"
                    value={accountNum}
                    onChange={(e) => setAccountNum(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">SWIFT Code</label>
                  <input
                    type="text"
                    placeholder="e.g. HDFCINBB"
                    value={swiftCode}
                    onChange={(e) => setSwiftCode(e.target.value.toUpperCase())}
                    maxLength={11}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all uppercase"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                onClick={() => { setStep((s) => s - 1); setError(null); }}
                className="flex items-center gap-2 px-5 py-3 border border-slate-300 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/25 transition-all cursor-pointer"
            >
              {step === 4 ? (
                <><CheckCircle2 className="w-4 h-4" /> Submit Profile for Verification</>
              ) : (
                <>Save & Continue <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>

        {/* Partner ID badge */}
        <div className="text-center mt-4">
          <span className="text-xs text-slate-500">Partner ID: </span>
          <span className="text-xs font-mono font-bold text-blue-400">{partner.partnerId}</span>
          <span className="text-slate-600 mx-2">•</span>
          <span className="text-xs text-slate-500">Step {step} of 4</span>
        </div>
      </div>
    </div>
  );
};
