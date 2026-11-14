import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { AppShell } from "@/components/shared/AppShell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LunarEdge — Lunar Landing Site Navigator",
  description:
    "Compare lunar south-pole landing site and date scenarios using JPL Horizons and LOLA products. NASA Space Apps Challenge 2026.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full text-slate-100">
        <Suspense
          fallback={
            <div className="min-h-full p-5">
              <div className="mx-auto h-[calc(100vh-2.5rem)] max-w-[1680px] animate-pulse rounded-[28px] border border-white/8 bg-[#0d1528]" />
            </div>
          }
        >
          <AppShell>{children}</AppShell>
        </Suspense>
      </body>
    </html>
  );
}
