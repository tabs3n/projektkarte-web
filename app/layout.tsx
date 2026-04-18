import type { Metadata } from "next";
import { Caveat, Kalam } from "next/font/google";
import "./globals.css";

const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat" });
const kalam = Kalam({ subsets: ["latin"], weight: ["300", "400", "700"], variable: "--font-kalam" });

export const metadata: Metadata = {
  title: "Projektkarte",
  description: "Unsere Projekte weltweit",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${caveat.variable} ${kalam.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#f5f2ea] text-[#1a1a1a]">{children}</body>
    </html>
  );
}
