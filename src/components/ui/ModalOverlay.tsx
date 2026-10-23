"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ModalOverlayProps {
  children: React.ReactNode;
  onClose?: () => void;
  zIndex?: number;
}

/** Full-viewport overlay, portaled to document.body so it is never clipped by a parent transform or overflow. */
export const ModalOverlay: React.FC<ModalOverlayProps> = ({ children, onClose, zIndex = 60 }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      role="presentation"
      className="fixed inset-0 overflow-y-auto p-3 sm:p-4"
      style={{
        position: "fixed",
        inset: 0,
        zIndex,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        background: "rgba(15, 23, 42, 0.55)",
      }}
      onClick={onClose}
    >
      <div
        className="w-full flex justify-center"
        style={{ marginTop: "auto", marginBottom: "auto" }}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};
