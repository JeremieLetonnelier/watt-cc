import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css"; // Global styles
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "WATT.CC | Women Are Talented",
  description:
    "Leaderboard et résultats des courses pour le WATT.CC (FFC & GFNY).",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${montserrat.variable} dark`}>
      <body
        className="font-sans bg-[#0a0514] text-white min-h-screen flex flex-col"
        suppressHydrationWarning
      >
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
