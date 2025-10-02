import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import SidebarCollapsedOptions from "@/components/SidebarCollapsedOptions";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Sideabar } from "@/components/Sidebar";
import { ExecutionProvider } from "@/contexts/execution-context";
import { Toaster } from "@/components/ui/sonner";

const geistDM = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AurAI",
  description:
    "AurAI is an AI-powered assistant that helps you search and provide information.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
      <body
        className={`${geistDM.variable} antialiased min-h-screen bg-gradient-to-tl from-[#1E293B] to-[#111827] text-foreground`}
      >
        <Toaster position="top-center" />
        {children}
      </body>
    </html>
  );
}
