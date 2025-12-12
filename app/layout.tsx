/**
 * Root Layout
 * 
 * This is the main layout wrapper for the entire application.
 * It sets up:
 * - Global styles and fonts (Inter for UI, JetBrains Mono for code)
 * - Dark mode by default
 * - Metadata for SEO
 * - PWA manifest and meta tags
 * - Session provider for NextAuth
 * - I18n provider for internationalization
 * - Toast notifications provider
 * - Cookie consent banner (GDPR compliance)
 * 
 * Built by Carphatian
 */

import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "@/components/session-provider";
import { I18nProvider } from "@/lib/i18n/provider";
import CookieConsent from "@/components/CookieConsent";

export const metadata: Metadata = {
  title: "Carphatian AI Marketplace | AI-Powered Freelance Platform",
  description: "Connect with top talent through AI-powered matching. The next-generation freelance marketplace built by Carphatian.",
  keywords: ["freelance", "AI", "marketplace", "talent", "hiring", "remote work"],
  authors: [{ name: "Carphatian", url: "https://carphatian.ro" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Carphatian",
  },
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

export const viewport: Viewport = {
  themeColor: "#7c3aed",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* PWA Icons */}
        <link rel="icon" type="image/svg+xml" href="/icons/icon.svg" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="mask-icon" href="/icons/icon.svg" color="#7c3aed" />
        
        {/* PWA Splash Screens for iOS */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* Microsoft Tiles */}
        <meta name="msapplication-TileColor" content="#7c3aed" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <SessionProvider>
          <I18nProvider>
            {children}
          </I18nProvider>
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
        
        {/* Cookie Consent Banner - GDPR Compliance */}
        <CookieConsent />
      </body>
    </html>
  );
}
