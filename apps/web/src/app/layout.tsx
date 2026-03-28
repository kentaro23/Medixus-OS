import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { RoleProvider } from "@/lib/role-context";
import DemoBanner from "@/components/shared/DemoBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MedixusOS - AI×オンライン診療×予防医療プラットフォーム",
  description:
    "「具合が悪くなってから受診する」を終わらせる。AI問診・オンライン診療・遠隔モニタリングを一気通貫で提供。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <DemoBanner />
        <RoleProvider>{children}</RoleProvider>
      </body>
    </html>
  );
}
