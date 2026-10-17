"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Building,
  PiggyBank,
  CreditCard,
  HeartPulse,
  Plane,
  Smartphone,
  FileCheck2,
  Car,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  X,
  Info,
} from "lucide-react";

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  commission: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
  details: {
    coverage: string;
    processingTime: string;
    partners: string;
    requirements: string[];
  };
}

export const ValueAddedServicesView: React.FC = () => {
  const [selectedDetails, setSelectedDetails] = useState<ServiceItem | null>(null);
  const [applyingService, setApplyingService] = useState<ServiceItem | null>(null);
  const [selectedStudent, setSelectedStudent] = useState("Aarav Sharma (CAMS-98421)");
  const [notes, setNotes] = useState("");
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Exact 8 services from user requirements
  const services: ServiceItem[] = [
    {
      id: "vas-acc",
      name: "Accommodation",
      description:
        "Guaranteed student rooms, en-suites, and studio apartments located within 15 minutes of partner campuses across the UK, Australia, USA, and Canada.",
      commission: "£150 - £250 per booking",
      icon: Building,
      badge: "High Demand",
      details: {
        coverage: "PBSA (Purpose-Built Student Accommodation) & private student halls.",
        processingTime: "Instant room hold, 24-48h contract issuance.",
        partners: "Unite Students, Student Roost, Scape, Campus Living Villages.",
        requirements: ["Student University Offer Letter", "Passport Copy", "Deposit Payment"],
      },
    },
    {
      id: "vas-loan",
      name: "Education Loan",
      description:
        "Fast-track collateral & non-collateral study loans through 15+ leading banking partners covering 100% of university tuition fees and overseas living expenses.",
      commission: "1.0% - 1.5% of sanctioned loan",
      icon: PiggyBank,
      badge: "Fast Clearance",
      details: {
        coverage: "Covers tuition fees, visa living funds, laptops, and travel tickets.",
        processingTime: "Sanction letter within 5 to 7 business days.",
        partners: "HDFC Credila, Prodigy Finance, MPower, Avanse, ICICI Bank.",
        requirements: ["Academic transcripts", "Co-applicant income proof", "Admissions offer"],
      },
    },
    {
      id: "vas-forex",
      name: "Forex",
      description:
        "Zero-markup international tuition remittance and multi-currency student travel debit cards with competitive live exchange rates and zero ATM transaction fees.",
      commission: "0.4% per transaction",
      icon: CreditCard,
      badge: "Best FX Rates",
      details: {
        coverage: "Direct wire to university bank accounts & smart contactless travel cards.",
        processingTime: "Same-day A2 remittance generation.",
        partners: "Flywire, Convera, ICICI Bank, Nium, Western Union.",
        requirements: ["University Fee Invoice / CAS Statement", "Passport & Visa Copy", "PAN / Tax ID"],
      },
    },
    {
      id: "vas-sim",
      name: "SIM Card",
      description:
        "Free international student SIM card delivered pre-departure with pre-activated local phone number, unlimited domestic calling, and high-speed mobile 5G data bundles.",
      commission: "£15 per active card",
      icon: Smartphone,
      badge: "Free Delivery",
      details: {
        coverage: "UK (Three, VOXI), Australia (Vodafone AU), USA (T-Mobile), Canada (Fido).",
        processingTime: "Dispatched to student's home 7 days prior to flight.",
        partners: "Three UK, VOXI by Vodafone, Lycamobile, Mint Mobile, Rogers.",
        requirements: ["Destination country selection", "Travel date", "Delivery address"],
      },
    },
    {
      id: "vas-travel",
      name: "Travel Assistance",
      description:
        "Exclusive partner airline student fares with major international carriers providing flexible booking dates and an extra 10-20kg complimentary baggage allowance.",
      commission: "£30 - £50 per ticket",
      icon: Plane,
      badge: "Extra Baggage",
      details: {
        coverage: "Flexible student booking, date change waivers, excess luggage vouchers.",
        processingTime: "Real-time PNR confirmation.",
        partners: "Qatar Airways, Emirates, British Airways, Singapore Airlines, Etihad.",
        requirements: ["Valid Student Visa / CAS", "Passport Details", "Travel Itinerary"],
      },
    },
    {
      id: "vas-insurance",
      name: "Insurance",
      description:
        "Comprehensive overseas student medical and travel insurance compliant with Australian OSHC, UK NHS health surcharge, and Schengen / US university visa requirements.",
      commission: "10% of premium",
      icon: HeartPulse,
      badge: "Visa Compliant",
      details: {
        coverage: "Emergency medical, hospitalization, outpatient, COVID-19 & loss of passport.",
        processingTime: "Instant policy generation & digital card download.",
        partners: "Allianz Global Assistance, Bupa, Medibank, AXA, Religare.",
        requirements: ["Student Passport Number", "Course Duration & Start Date", "Destination Country"],
      },
    },
    {
      id: "vas-visa",
      name: "Visa Support",
      description:
        "End-to-end student visa mock interview preparations, financial document vetting, SOP scrutiny, and biometrics appointment priority slot scheduling.",
      commission: "£100 per successful visa",
      icon: FileCheck2,
      badge: "99.4% Success",
      details: {
        coverage: "Complete document compliance review, VFS appointment booking & mock drills.",
        processingTime: "48-hour dossier audit turnaround.",
        partners: "EduPath Certified Senior Immigration & Visa Advisory Council.",
        requirements: ["CAS / COE / I-20", "Financial statement proof", "Academic dossier"],
      },
    },
    {
      id: "vas-pickup",
      name: "Airport Pickup",
      description:
        "Safe, chauffeur-driven airport transfer service meeting incoming international students at arrival terminals and transporting them directly to their campus accommodation.",
      commission: "£20 per transfer",
      icon: Car,
      badge: "24/7 Meet & Greet",
      details: {
        coverage: "Heathrow, Gatwick, Manchester, Melbourne Tullamarine, Sydney, Toronto Pearson.",
        processingTime: "Confirmed driver dispatch 24h before flight landing.",
        partners: "EduPath Student Ground Logistics & Airport Partner Fleet.",
        requirements: ["Flight Number & Arrival Time", "Destination Accommodation Address", "Emergency Phone"],
      },
    },
  ];

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingService) return;
    setSuccessToast(
      `Service application submitted for ${applyingService.name}! Coordinator assigned to ${selectedStudent}.`
    );
    setApplyingService(null);
    setNotes("");
    setTimeout(() => setSuccessToast(null), 4000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast */}
      {successToast && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-fade-in">
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-xs font-semibold">{successToast}</p>
        </div>
      )}

      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#0B5D3B]" />
            Value Added Services (VAS)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Comprehensive student landing solutions: housing, loans, currency transfer, visa guidance, and travel logistics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-[#0B5D3B] rounded-xl text-xs font-bold">
            8 Ancillary Categories
          </span>
        </div>
      </div>

      {/* 8 Service Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {services.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 hover:border-emerald-300 group"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#0B5D3B] group-hover:bg-[#0B5D3B] group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-[#0B5D3B] text-[10px] font-bold rounded-full">
                    {item.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0B5D3B] transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-3">
                    {item.description}
                  </p>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl text-xs flex justify-between items-center border border-slate-100">
                  <span className="text-slate-500 text-[11px]">Commission:</span>
                  <span className="font-bold text-[#0B5D3B] font-mono text-[11px]">
                    {item.commission}
                  </span>
                </div>
              </div>

              {/* VIEW DETAILS and APPLY Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedDetails(item)}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>VIEW DETAILS</span>
                </button>

                <button
                  type="button"
                  onClick={() => setApplyingService(item)}
                  className="w-full py-2 bg-[#0B5D3B] hover:bg-[#08482D] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer active:scale-98"
                >
                  <span>APPLY</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* VIEW DETAILS MODAL */}
      {selectedDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  {React.createElement(selectedDetails.icon, { className: "w-5 h-5" })}
                </div>
                <div>
                  <h3 className="text-base font-bold">{selectedDetails.name}</h3>
                  <span className="text-xs text-emerald-400 font-semibold font-mono">
                    Partner Earning: {selectedDetails.commission}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedDetails(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed text-sm">
                {selectedDetails.description}
              </p>

              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Scope & Coverage:</span>
                  <span className="font-bold text-slate-800 text-right">{selectedDetails.details.coverage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Turnaround Time:</span>
                  <span className="font-bold text-slate-800 text-right">{selectedDetails.details.processingTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Tier-1 Partners:</span>
                  <span className="font-bold text-slate-800 text-right">{selectedDetails.details.partners}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-2">Required Documentation:</h4>
                <ul className="space-y-1.5">
                  {selectedDetails.details.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setSelectedDetails(null)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const s = selectedDetails;
                  setSelectedDetails(null);
                  setApplyingService(s);
                }}
                className="px-5 py-2.5 bg-[#0B5D3B] hover:bg-[#08482D] text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>APPLY NOW</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* APPLY SERVICE MODAL */}
      {applyingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  {React.createElement(applyingService.icon, { className: "w-5 h-5" })}
                </div>
                <div>
                  <h3 className="text-sm font-bold">Apply for {applyingService.name}</h3>
                  <p className="text-[11px] text-slate-400">Direct student dispatch ticket</p>
                </div>
              </div>
              <button
                onClick={() => setApplyingService(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Select Enrolled Student / CAMS File:
                </label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#0B5D3B]/20 focus:border-[#0B5D3B]"
                >
                  <option value="Aarav Sharma (CAMS-98421)">Aarav Sharma (CAMS-98421) - UK</option>
                  <option value="Fatima Al-Zahra (CAMS-98420)">Fatima Al-Zahra (CAMS-98420) - Canada</option>
                  <option value="Samuel Osei (CAMS-98419)">Samuel Osei (CAMS-98419) - Australia</option>
                  <option value="Maria Chen (CAMS-98418)">Maria Chen (CAMS-98418) - Australia</option>
                  <option value="Kavya Patel (CAMS-98412)">Kavya Patel (CAMS-98412) - UK</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Specific Requirements or Instructions:
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={`Details for ${applyingService.name}... e.g. dates, preferred budget, room type, or travel timing.`}
                  className="w-full p-2.5 border border-slate-200 rounded-xl resize-none focus:ring-2 focus:ring-[#0B5D3B]/20 focus:border-[#0B5D3B]"
                  required
                />
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-950 text-[11px]">
                <ShieldCheck className="w-4 h-4 text-[#0B5D3B] shrink-0" />
                <span>
                  Expected commission for this service: <strong>{applyingService.commission}</strong>
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setApplyingService(null)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0B5D3B] hover:bg-[#08482D] text-white rounded-xl font-bold shadow-xs transition-colors cursor-pointer"
                >
                  SUBMIT APPLICATION
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
