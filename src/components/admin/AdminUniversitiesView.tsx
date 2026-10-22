"use client";

import React, { useState } from "react";
import { usePlatform } from "@/context/PlatformContext";
import { CatalogStatusNote } from "@/components/admin/CatalogStatusNote";
import { UniversityInfo } from "@/types";
import { Building, Plus, Search, MapPin, BookOpen, Calendar, User, Phone, Mail, X, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Pencil, Trash2 } from "lucide-react";

const CARD = { background: "#ffffff", border: "1px solid #dde1e7", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" };
const INPUT_STYLE = { width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #dde1e7", background: "#ffffff", color: "#1e293b", fontSize: 13, outline: "none" };
const COUNTRIES = ["United Kingdom", "United States", "Canada", "Australia", "New Zealand", "Ireland", "Germany", "France", "Netherlands", "Sweden", "Singapore", "UAE"];

const emptyRep = (): UniversityInfo["urmRepresentative"] => ({
  id: "",
  name: "",
  mobile: "",
  phone: "",
  email: "",
  designation: "",
  whatsapp: "",
  officeHours: "Mon–Fri, 9am–6pm",
  region: "",
});

const emptyForm = (): UniversityInfo => ({
  id: "",
  name: "",
  country: "",
  city: "",
  logo: "",
  image: "",
  website: "",
  about: "",
  availableCoursesCount: 0,
  availableIntakes: [],
  urmRepresentative: emptyRep(),
});

export const AdminUniversitiesView: React.FC = () => {
  const { universities, courses, addUniversity, updateUniversity, deleteUniversity, catalogStatus, catalogError } = usePlatform();
  const [searchQ, setSearchQ] = useState("");
  const [filterCountry, setFilterCountry] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<UniversityInfo>(emptyForm());
  const [intakeInput, setIntakeInput] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<UniversityInfo | null>(null);

  const courseCount = (id: string) => courses.filter((course) => course.universityId === id).length;
  const allCountries = ["All", ...Array.from(new Set(universities.map((u) => u.country))).sort()];
  const filtered = universities.filter((u) => {
    const q = searchQ.toLowerCase();
    return (!q || u.name.toLowerCase().includes(q) || u.country.toLowerCase().includes(q) || u.city.toLowerCase().includes(q))
      && (filterCountry === "All" || u.country === filterCountry);
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setIntakeInput("");
    setFormError(null);
    setShowModal(true);
  };

  const openEdit = (university: UniversityInfo) => {
    setEditingId(university.id);
    setForm({
      ...university,
      website: university.website || "",
      about: university.about || "",
      availableIntakes: [...university.availableIntakes],
      urmRepresentative: { ...emptyRep(), ...university.urmRepresentative },
    });
    setIntakeInput("");
    setFormError(null);
    setShowModal(true);
  };

  const handleRepChange = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, urmRepresentative: { ...prev.urmRepresentative, [field]: value } }));

  const addIntake = () => {
    const value = intakeInput.trim();
    if (!value) return;
    setForm((prev) => ({ ...prev, availableIntakes: [...prev.availableIntakes, value] }));
    setIntakeInput("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!form.name.trim() || !form.country.trim() || !form.city.trim()) {
      setFormError("Name, country and city are required.");
      return;
    }
    if (!form.urmRepresentative.name.trim() || !form.urmRepresentative.email.trim()) {
      setFormError("Representative name and email are required.");
      return;
    }
    const record: UniversityInfo = {
      ...form,
      id: editingId || `uni-${Date.now()}`,
      name: form.name.trim(),
      country: form.country.trim(),
      city: form.city.trim(),
      website: form.website?.trim() || "",
      about: form.about?.trim() || "",
      logo: form.logo.trim(),
      image: form.image.trim(),
      availableCoursesCount: editingId ? courseCount(editingId) : 0,
      urmRepresentative: {
        ...form.urmRepresentative,
        id: form.urmRepresentative.id || `rep-${Date.now()}`,
        name: form.urmRepresentative.name.trim(),
        email: form.urmRepresentative.email.trim(),
        designation: form.urmRepresentative.designation.trim() || "University Representative",
      },
    };
    setSaving(true);
    const result = editingId ? await updateUniversity(record) : await addUniversity(record);
    setSaving(false);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    setSuccessMsg(editingId ? `"${record.name}" updated.` : `"${record.name}" added.`);
    setShowModal(false);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setSaving(true);
    const result = await deleteUniversity(pendingDelete.id);
    setSaving(false);
    if (!result.ok) {
      setFormError(result.error);
      setPendingDelete(null);
      return;
    }
    setSuccessMsg(`"${pendingDelete.name}" and its courses were removed.`);
    setPendingDelete(null);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const stats = [
    { label: "Total Universities", value: universities.length, color: "#2563eb" },
    { label: "Countries", value: new Set(universities.map((u) => u.country)).size, color: "#f97316" },
    { label: "Total Courses", value: courses.length, color: "#0284c7" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#1e293b", margin: 0 }}>University Management</h1>
          <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{universities.length} universities across {new Set(universities.map((u) => u.country)).size} countries</p>
        </div>
        <button onClick={openCreate} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 8, background: "#f97316", color: "#ffffff", fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer" }}>
          <Plus style={{ width: 15, height: 15 }} /> Add University
        </button>
      </div>

      <CatalogStatusNote status={catalogStatus} error={catalogError} />
      {formError && !showModal && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 8, background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", fontSize: 13 }}>
          <AlertCircle style={{ width: 15, height: 15 }} /> {formError}
        </div>
      )}
      {successMsg && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 8, background: "#f0f9ff", border: "1px solid #bae6fd", color: "#0369a1", fontSize: 13 }}>
          <CheckCircle2 style={{ width: 15, height: 15 }} /> {successMsg}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ ...CARD, padding: 16 }}>
            <p style={{ fontSize: 26, fontWeight: 900, color: s.color, margin: 0 }}>{s.value}</p>
            <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 200, padding: "8px 12px", background: "#ffffff", border: "1px solid #dde1e7", borderRadius: 8 }}>
          <Search style={{ width: 14, height: 14, color: "#94a3b8", flexShrink: 0 }} />
          <input value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder="Search universities..." style={{ background: "transparent", border: "none", outline: "none", fontSize: 13, color: "#1e293b", width: "100%" }} />
        </div>
        <select value={filterCountry} onChange={(e) => setFilterCountry(e.target.value)} style={{ padding: "8px 12px", background: "#ffffff", border: "1px solid #dde1e7", borderRadius: 8, fontSize: 13, color: "#1e293b", cursor: "pointer", outline: "none" }}>
          {allCountries.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
            <Building style={{ width: 40, height: 40, margin: "0 auto 8px", opacity: 0.3 }} />
            <p style={{ fontSize: 13, fontWeight: 600 }}>No universities yet</p>
            <p style={{ fontSize: 12, marginTop: 4 }}>Add an institution here. Its courses are added from the Courses tab.</p>
          </div>
        )}
        {filtered.map((univ) => {
          const isExpanded = expandedId === univ.id;
          const offered = courseCount(univ.id);
          return (
            <div key={univ.id} style={{ ...CARD }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 14 }}>
                <button type="button" onClick={() => setExpandedId(isExpanded ? null : univ.id)} style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0, background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left" }}>
                  <div style={{ width: 42, height: 42, borderRadius: 8, background: "#fff4ed", border: "1px solid #fed7aa", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#ea580c", fontWeight: 800 }}>
                    {univ.logo ? (
                      <img src={univ.logo} alt="" style={{ width: 34, height: 34, objectFit: "contain", borderRadius: 6 }} />
                    ) : univ.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{univ.name}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 2, flexWrap: "wrap" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#64748b" }}>
                        <MapPin style={{ width: 11, height: 11 }} /> {univ.city}, {univ.country}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#64748b" }}>
                        <BookOpen style={{ width: 11, height: 11 }} /> {offered} courses
                      </span>
                    </div>
                  </div>
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  {univ.availableIntakes.slice(0, 2).map((intake) => (
                    <span key={intake} style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 12, background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe" }}>{intake}</span>
                  ))}
                  <button type="button" onClick={() => openEdit(univ)} title="Edit university" style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 8, padding: 6, cursor: "pointer", color: "#ea580c" }}>
                    <Pencil style={{ width: 14, height: 14 }} />
                  </button>
                  <button type="button" onClick={() => setPendingDelete(univ)} title="Delete university" style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: 6, cursor: "pointer", color: "#dc2626" }}>
                    <Trash2 style={{ width: 14, height: 14 }} />
                  </button>
                  <button type="button" onClick={() => setExpandedId(isExpanded ? null : univ.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                    {isExpanded ? <ChevronUp style={{ width: 15, height: 15 }} /> : <ChevronDown style={{ width: 15, height: 15 }} />}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div style={{ borderTop: "1px solid #f0f2f5", padding: "14px 16px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 8px" }}>Available Intakes</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {univ.availableIntakes.length === 0 && <span style={{ fontSize: 12, color: "#94a3b8" }}>No intakes added</span>}
                      {univ.availableIntakes.map((intake) => (
                        <span key={intake} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20, background: "#f0f9ff", color: "#0284c7", border: "1px solid #bae6fd" }}>
                          <Calendar style={{ width: 10, height: 10 }} /> {intake}
                        </span>
                      ))}
                    </div>
                    {univ.website && <p style={{ fontSize: 12, color: "#64748b", marginTop: 10 }}>{univ.website}</p>}
                    {univ.about && <p style={{ fontSize: 12, color: "#475569", marginTop: 8, lineHeight: 1.45 }}>{univ.about}</p>}
                  </div>
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 8px" }}>URM Representative</p>
                    <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
                        <User style={{ width: 13, height: 13, color: "#f97316" }} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#1e293b" }}>{univ.urmRepresentative.name}</span>
                        {univ.urmRepresentative.designation && <span style={{ fontSize: 11, color: "#94a3b8" }}>{univ.urmRepresentative.designation}</span>}
                      </div>
                      {univ.urmRepresentative.email && (
                        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#64748b", marginBottom: 2 }}>
                          <Mail style={{ width: 11, height: 11 }} /> {univ.urmRepresentative.email}
                        </div>
                      )}
                      {univ.urmRepresentative.mobile && (
                        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#64748b" }}>
                          <Phone style={{ width: 11, height: 11 }} /> {univ.urmRepresentative.mobile}
                        </div>
                      )}
                    </div>
                    <p style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>{offered} course{offered === 1 ? "" : "s"} linked to this institution.</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 50, padding: 16, background: "rgba(0,0,0,0.4)" }}>
          <div style={{ width: "100%", maxWidth: 640, background: "#ffffff", border: "1px solid #dde1e7", borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column", maxHeight: "92vh" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #f0f2f5" }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 800, color: "#1e293b", margin: 0 }}>{editingId ? "Edit University" : "Add University"}</p>
                <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>Institution, intakes, and university representative</p>
              </div>
              <button onClick={() => { setShowModal(false); setFormError(null); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4 }}>
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ overflowY: "auto" }}>
              <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
                {formError && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 12, color: "#dc2626" }}>
                    <AlertCircle style={{ width: 14, height: 14, flexShrink: 0 }} /> {formError}
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>University Name *</label>
                    <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. University of Manchester" style={INPUT_STYLE} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>Country *</label>
                    <select value={form.country} onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))} style={{ ...INPUT_STYLE, cursor: "pointer" }}>
                      <option value="">Select country...</option>
                      {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      {form.country && !COUNTRIES.includes(form.country) && <option value={form.country}>{form.country}</option>}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>City *</label>
                    <input value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} placeholder="e.g. Manchester" style={INPUT_STYLE} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>Website</label>
                    <input value={form.website || ""} onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))} placeholder="https://" style={INPUT_STYLE} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>Logo URL</label>
                    <input value={form.logo} onChange={(e) => setForm((p) => ({ ...p, logo: e.target.value }))} placeholder="Optional image URL" style={INPUT_STYLE} />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>About the institution</label>
                    <textarea value={form.about || ""} onChange={(e) => setForm((p) => ({ ...p, about: e.target.value }))} rows={3} placeholder="Campus, ranking notes, or partnership details" style={{ ...INPUT_STYLE, resize: "vertical" }} />
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Intakes</p>
                  <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <input value={intakeInput} onChange={(e) => setIntakeInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addIntake(); } }}
                      placeholder="e.g. September 2026" style={{ ...INPUT_STYLE, flex: 1 }} />
                    <button type="button" onClick={addIntake} style={{ padding: "9px 14px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, fontSize: 12, fontWeight: 700, color: "#2563eb", cursor: "pointer" }}>Add</button>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {form.availableIntakes.map((intake, idx) => (
                      <span key={`${intake}-${idx}`} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, padding: "4px 10px", borderRadius: 20, background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe" }}>
                        {intake}
                        <button type="button" onClick={() => setForm((p) => ({ ...p, availableIntakes: p.availableIntakes.filter((_, i) => i !== idx) }))} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 0, display: "flex" }}>
                          <X style={{ width: 12, height: 12 }} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>URM Representative</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
                    {([
                      ["name", "Full Name *", "Jane Smith"],
                      ["designation", "Designation", "University Representative"],
                      ["email", "Email *", "rep@university.ac.uk"],
                      ["mobile", "Mobile", "+44 7000 000000"],
                      ["phone", "Office phone", "+44 20 0000 0000"],
                      ["region", "Region", "UK & Europe"],
                      ["officeHours", "Office hours", "Mon–Fri, 9am–6pm"],
                    ] as const).map(([field, label, placeholder]) => (
                      <div key={field}>
                        <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>{label}</label>
                        <input value={form.urmRepresentative[field] || ""} onChange={(e) => handleRepChange(field, e.target.value)} placeholder={placeholder} style={INPUT_STYLE} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: "14px 20px", borderTop: "1px solid #f0f2f5" }}>
                <button type="button" onClick={() => { setShowModal(false); setFormError(null); }} style={{ padding: "9px 16px", background: "#f8fafc", border: "1px solid #dde1e7", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#64748b", cursor: "pointer" }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding: "9px 20px", background: "#f97316", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, color: "#ffffff", cursor: "pointer", opacity: saving ? 0.7 : 1 }}>{saving ? "Saving..." : editingId ? "Save University" : "Add University"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {pendingDelete && (
        <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 60, padding: 16, background: "rgba(0,0,0,0.4)" }}>
          <div style={{ width: "100%", maxWidth: 420, background: "#fff", borderRadius: 14, padding: 20 }}>
            <p style={{ fontSize: 15, fontWeight: 800, color: "#1e293b", margin: 0 }}>Delete {pendingDelete.name}?</p>
            <p style={{ fontSize: 13, color: "#64748b", marginTop: 8 }}>This also removes every course offered by this institution.</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
              <button type="button" onClick={() => setPendingDelete(null)} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #dde1e7", background: "#fff", cursor: "pointer" }}>Cancel</button>
              <button type="button" onClick={confirmDelete} disabled={saving} style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: "#dc2626", color: "#fff", fontWeight: 700, cursor: "pointer" }}>{saving ? "Deleting..." : "Delete"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
