"use client";

import React from "react";
import type { CatalogStatus } from "@/lib/catalog";

export const CatalogStatusNote: React.FC<{ status: CatalogStatus; error: string | null }> = ({ status, error }) => {
  if (status === "ready") return null;
  const isError = status === "error";
  const text =
    status === "loading"
      ? "Loading institutions and courses from Supabase."
      : status === "unconfigured"
        ? "Supabase is not connected yet. Put the project URL and the anon key in .env.local at the project root, run supabase/schema.sql in the Supabase SQL editor, then restart the app. Institutions and courses stay empty until that connection works."
        : error || "The catalog could not be loaded from Supabase.";

  return (
    <div
      style={{
        padding: "10px 14px",
        borderRadius: 8,
        fontSize: 13,
        lineHeight: 1.45,
        background: isError ? "#fef2f2" : "#fff7ed",
        border: isError ? "1px solid #fecaca" : "1px solid #fed7aa",
        color: isError ? "#b91c1c" : "#9a3412",
      }}
    >
      {text}
    </div>
  );
};
