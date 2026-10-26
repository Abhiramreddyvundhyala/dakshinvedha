"use client";

import React, { useState } from "react";
import { hasStoredFile, openStoredFile } from "@/lib/storage";

export const StoredFileButton: React.FC<{
  bucket: string;
  path?: string;
  label?: string;
}> = ({ bucket, path, label = "View" }) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!hasStoredFile(path)) {
    return <span className="text-[10px] font-semibold text-slate-400">No file stored</span>;
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          setBusy(true);
          setError(null);
          void openStoredFile(bucket, path || "").then((result) => {
            setBusy(false);
            if (!result.ok) setError(result.error);
          });
        }}
        className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
      >
        {busy ? "Opening..." : label}
      </button>
      {error && <span className="max-w-[180px] text-right text-[10px] text-rose-600">{error}</span>}
    </span>
  );
};
