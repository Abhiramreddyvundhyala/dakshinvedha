import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
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
      className={`${inter.variable} ${fraunces.variable} font-sans h-full antialiased`}
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
