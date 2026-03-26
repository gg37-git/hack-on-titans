import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HealthCare Platform | Advanced AI Wellness",
  description: "Your personal AI-powered health companion providing predictive analytics, personalized nutrition, and contextual mental health support.",
  keywords: "healthcare, AI diagnosis, medical analytics, intelligent nutrition, tele-health, fitness sync",
  authors: [{ name: "Hack on Titans Team" }],
  openGraph: {
    title: "HealthCare Platform",
    description: "The next generation of predictive AI health.",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.className} h-full`}>
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          <AuthProvider>{children}</AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
