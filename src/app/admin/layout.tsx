import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "@/components/app/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "../globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AnvilNote Admin",
  robots: { index: false, follow: false },
};

// Admin tool is internal-only (not part of the public locale routing), but
// still reuses public-site components (status badges, markdown renderer)
// that read translations — so it needs its own fixed-locale intl provider.
const ADMIN_LOCALE = "zh-TW";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const messages = (await import(`../../../i18n/${ADMIN_LOCALE}.json`)).default;

  return (
    <html
      lang="zh-Hant"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background text-foreground antialiased" suppressHydrationWarning>
        <NextIntlClientProvider locale={ADMIN_LOCALE} messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            {children}
            <Toaster position="top-center" richColors />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
