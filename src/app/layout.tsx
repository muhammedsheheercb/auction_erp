import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CSL Draft 2026 | Cheloor Super League",
  description: "Official Player Auction & Draft System for Cheloor Super League Season 7",
  icons: {
    icon: "/images/logo.webp",
    apple: "/images/logo.webp",
  },
};

import { isAdmin as checkAdmin } from "@/lib/auth";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isAdmin = await checkAdmin();

  return (
    <html lang="en" className="dark">
      <body
        className={`${jakarta.variable} ${outfit.variable} ${jetbrainsMono.variable} antialiased min-h-screen bg-[#020617] text-white selection:bg-amber-500/20`}
      >
        <Navbar isAdmin={isAdmin} />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
