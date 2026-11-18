import type { Metadata } from "next";
import { Libre_Baskerville } from "next/font/google";
import "./globals.css";

const libre = Libre_Baskerville({
  variable: "--font-libre",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dakshinvedha ABROAD Solutions — Unified Portal",
  description: "Sign in to Dakshinvedha ABROAD Solutions. Access your student dashboard, B2B partner portal, agent panel, or admin control center.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${libre.variable} ${libre.className} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-[#FAFAF8] text-slate-800"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
