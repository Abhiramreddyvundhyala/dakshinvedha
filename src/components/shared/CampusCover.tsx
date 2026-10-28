"use client";

import React, { useEffect, useMemo, useState } from "react";
import { campusPhotoUrl } from "@/lib/mediaUrl";

interface CampusCoverProps {
  sources: Array<string | null | undefined>;
  label: string;
  className?: string;
}

/** Campus photo that never paints a missing URL or the course name as broken-image text. */
export function CampusCover({ sources, label, className }: CampusCoverProps) {
  const listKey = sources.map((source) => source || "").join("\n");
  const urls = useMemo(() => {
    const seen = new Set<string>();
    const next: string[] = [];
    for (const source of listKey.split("\n")) {
      const url = campusPhotoUrl(source);
      if (!url || seen.has(url)) continue;
      seen.add(url);
      next.push(url);
    }
    return next;
  }, [listKey]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [listKey]);

  const src = urls[index];
  const initial = (label.trim().charAt(0) || "U").toUpperCase();

  if (!src) {
    return (
      <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-100 to-orange-50 ${className || ""}`}>
        <span className="text-3xl font-black text-sky-800">{initial}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt=""
      className={className || "h-full w-full object-cover"}
      onError={() => setIndex((current) => current + 1)}
    />
  );
}
