import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { routing, type AppLocale } from "@/lib/i18n/routing";
import { ThemeProvider } from "@/components/app/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { QuillTransition } from "@/components/landing/quill-transition";
import { SITE_URL, ogLocaleFor, otherOgLocales } from "@/lib/seo";
import "../globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "landing" });
  const description = t("hero.kicker");

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: "AnvilNote", template: "%s | AnvilNote" },
    description,
    icons: { icon: "/favicon-light.svg" },
    openGraph: {
      siteName: "AnvilNote",
      type: "website",
      description,
      locale: ogLocaleFor(locale as AppLocale),
      alternateLocale: otherOgLocales(locale as AppLocale),
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "AnvilNote" }],
    },
    twitter: {
      card: "summary_large_image",
      description,
      images: ["/og-image.png"],
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script
          // Apply the persisted theme before first paint to avoid a flash.
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=t==='dark';var c=document.documentElement.classList;var h=d?'/favicon-light.svg':'/favicon-dark.svg';var q=function(r){var l=document.querySelector("link[rel='"+r+"']");if(!l){l=document.createElement('link');l.rel=r;document.head.appendChild(l)}l.href=h;l.type='image/svg+xml'};if(d){c.add('dark')}else{c.remove('dark')}document.documentElement.style.colorScheme=d?'dark':'light';q('icon');q('shortcut icon')}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full bg-background text-foreground antialiased" suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            {/* Keyed by locale so a language switch (a real route change, since
                locale is a route segment) remounts this wrapper and replays a
                fade+rise — distinct from the theme toggle's circle reveal. */}
            <div key={locale} className="animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out">
              {children}
            </div>
            <Toaster position="top-center" richColors />
            <QuillTransition />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
