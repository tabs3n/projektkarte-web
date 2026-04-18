import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Projektkarte",
  description: "Unsere Projekte weltweit",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${inter.variable} h-full antialiased`} style={{ colorScheme: "light" }}>
      <body
        className="min-h-full flex flex-col"
        style={{ background: "#f5f2ea", color: "#1a1a1a", fontFamily: "var(--font-inter), system-ui, sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
