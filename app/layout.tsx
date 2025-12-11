/**
 * Root Layout
 * 
 * This is the main layout wrapper for the entire application.
 * It sets up:
 * - Global styles and fonts (Inter for UI, JetBrains Mono for code)
 * - Dark mode by default
 * - Metadata for SEO
 * - Session provider for NextAuth
 * - Toast notifications provider
 * 
 * Built by Carphatian
 */

import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "@/components/session-provider";

export const metadata: Metadata = {
  title: "Carphatian AI Marketplace | AI-Powered Freelance Platform",
  description: "Connect with top talent through AI-powered matching. The next-generation freelance marketplace built by Carphatian.",
  keywords: ["freelance", "AI", "marketplace", "talent", "hiring", "remote work"],
  authors: [{ name: "Carphatian", url: "https://carphatian.ro" }],
  openGraph: {
    title: "Carphatian AI Marketplace",
    description: "AI-Powered Freelance Platform",
    url: "https://chat.carphatian.ro",
    siteName: "Carphatian AI Marketplace",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Carphatian AI Marketplace",
    description: "AI-Powered Freelance Platform",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased">
        <SessionProvider>
          {children}
        </SessionProvider>
        
        {/* Toast Notifications - appears in bottom-right */}
        <Toaster 
          position="bottom-right"
          toastOptions={{
            classNames: {
              toast: "glass",
              title: "text-sm font-medium",
              description: "text-xs text-muted-foreground",
            },
          }}
        />
      </body>
    </html>
  );
}
