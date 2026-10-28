"use client";

import React from "react";

/** Symbol only. The white plane stays white on a light surface. */
export function BrandMark({ className = "h-9 w-9" }: { className?: string }) {
  return <img src="/brand/dakshinvedha-mark.png" alt="" className={`object-contain ${className}`} />;
}

/** Full wordmark. Place it on white; the navy type does not read on the blue sidebar. */
export function BrandLogo({ className = "h-20 w-auto" }: { className?: string }) {
  return (
    <img
      src="/brand/dakshinvedha-logo.png"
      alt="Dakshin Vedha Abroad Solutions"
      className={`object-contain ${className}`}
    />
  );
}
