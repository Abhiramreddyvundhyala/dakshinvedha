"use client";

import React, { useState } from "react";
import {
  PhoneCall,
  Mail,
  Building,
  Globe,
  Search,
  MessageCircle,
  Copy,
  Check,
  User,
  Smartphone,
} from "lucide-react";
import { usePlatform } from "@/context/PlatformContext";

export const URMContactView: React.FC = () => {
  const { universities } = usePlatform();
  const [filterCountry, setFilterCountry] = useState("all");
  const [filterUniversity, setFilterUniversity] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Derive available countries from mock universities
  const countries = Array.from(new Set(universities.map((u) => u.country)));

  const filteredURMs = universities.filter((u) => {
    if (filterCountry !== "all" && u.country !== filterCountry) {
      return false;
    }
    if (filterUniversity !== "all" && u.name !== filterUniversity) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = u.urmRepresentative.name.toLowerCase().includes(q);
      const matchUniv = u.name.toLowerCase().includes(q);
      return matchName || matchUniv;
    }
    return true;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* 1. Large Top Filter Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
<<<<<<< HEAD
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#ea580c]">
=======
          <div className="w-10 h-10 rounded-xl bg-[#FDF5F0] border border-[#F5D2C1] flex items-center justify-center text-[#D56732]">
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              URM Contact Number
            </h2>
            <p className="text-xs text-slate-500">
              Direct liaison desk contacts for partner university admissions regional managers
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
          {/* University Country Filter */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              University Country
            </label>
            <select
              value={filterCountry}
              onChange={(e) => {
                setFilterCountry(e.target.value);
                setFilterUniversity("all");
              }}
<<<<<<< HEAD
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-[#ea580c]"
=======
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-[#D56732]"
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
            >
              <option value="all">All University Countries</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* University Name Filter */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              University Name
            </label>
            <select
              value={filterUniversity}
              onChange={(e) => setFilterUniversity(e.target.value)}
<<<<<<< HEAD
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-[#ea580c]"
=======
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-[#D56732]"
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
            >
              <option value="all">All Universities</option>
              {universities.filter(
                (u) => filterCountry === "all" || u.country === filterCountry
              ).map((u) => (
                <option key={u.id} value={u.name}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* Representative Search Keyword */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Search by Representative Name
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. Marcus Sterling..."
<<<<<<< HEAD
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#ea580c]"
=======
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#D56732]"
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Three-Column Desktop Grid for University Representative Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredURMs.length > 0 ? (
          filteredURMs.map((u) => (
            <div
              key={u.id}
<<<<<<< HEAD
              className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 hover:border-orange-300"
=======
              className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 hover:border-[#F5D2C1]"
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
            >
              <div className="space-y-3.5">
                {/* University Logo & University Name */}
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-xl flex items-center justify-center shrink-0">
                    {u.logo}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-sm text-slate-900 leading-snug line-clamp-1">
                      {u.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Globe className="w-3 h-3 text-slate-400" />
                      <span>{u.city}, {u.country}</span>
                    </p>
                  </div>
                </div>

                {/* Name: Representative Name */}
                <div className="space-y-1 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Name
                  </span>
                  <div className="flex items-center gap-2">
<<<<<<< HEAD
                    <User className="w-4 h-4 text-[#ea580c] shrink-0" />
=======
                    <User className="w-4 h-4 text-[#D56732] shrink-0" />
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                    <div>
                      <p className="font-bold text-slate-900 text-sm">
                        {u.urmRepresentative.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {u.urmRepresentative.designation}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mobile No. & Phone Number (Clickable visually) */}
                <div className="space-y-1 text-xs pt-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Mobile No. & Telephone
                  </span>
                  <div className="space-y-2">
                    {/* Clickable Mobile */}
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-2">
<<<<<<< HEAD
                        <Smartphone className="w-3.5 h-3.5 text-[#ea580c]" />
=======
                        <Smartphone className="w-3.5 h-3.5 text-[#D56732]" />
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                        <span className="font-mono font-bold text-slate-800 text-xs">
                          {u.urmRepresentative.mobile}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(`${u.id}-mob`, u.urmRepresentative.mobile)}
                        className="p-1 text-slate-400 hover:text-slate-700"
                        title="Copy Mobile Number"
                      >
                        {copiedId === `${u.id}-mob` ? (
<<<<<<< HEAD
                          <Check className="w-3.5 h-3.5 text-orange-600" />
=======
                          <Check className="w-3.5 h-3.5 text-[#D56732]" />
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Clickable Landline */}
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-2">
                        <PhoneCall className="w-3.5 h-3.5 text-slate-500" />
                        <span className="font-mono font-semibold text-slate-700 text-xs">
                          {u.urmRepresentative.phone}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(`${u.id}-phone`, u.urmRepresentative.phone)}
                        className="p-1 text-slate-400 hover:text-slate-700"
                        title="Copy Phone Number"
                      >
                        {copiedId === `${u.id}-phone` ? (
<<<<<<< HEAD
                          <Check className="w-3.5 h-3.5 text-orange-600" />
=======
                          <Check className="w-3.5 h-3.5 text-[#D56732]" />
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                <button
                  type="button"
                  onClick={() => alert(`Dialing simulation: ${u.urmRepresentative.mobile}`)}
<<<<<<< HEAD
                  className="py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
=======
                  className="py-2 bg-[#FDF5F0] hover:bg-[#FBE5D8] text-[#D56732] font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
>>>>>>> 2250a838308e6f938f78268a205c2c38f5e486f2
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => alert(`Email compose opened for ${u.urmRepresentative.email}`)}
                  className="py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email URM</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 py-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            <p className="font-semibold text-slate-600">No university representatives match your filter</p>
            <p className="mt-1">Try clearing or switching your country or university selection.</p>
          </div>
        )}
      </div>
    </div>
  );
};
