"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { routing, type AppLocale } from "@/lib/i18n/routing";
import { NotFoundContent } from "@/components/app/not-found-content";
// This boundary isn't nested inside [locale]/layout.tsx (see the comment
// below), so nothing else on the way here pulls in Tailwind's stylesheet —
// without this, every className below is inert and the page renders as
// unstyled top-left-aligned browser default flow.
import "./globals.css";

const FALLBACK = {
  locale: routing.defaultLocale,
  title: "404",
  message: "This page could not be found.",
  backHome: "Back to home",
};

function detectLocale(pathname: string): AppLocale {
  const first = pathname.split("/")[1];
  return (routing.locales as readonly string[]).includes(first)
    ? (first as AppLocale)
    : routing.defaultLocale;
}

// Root fallback for any unmatched request — including a bogus locale segment
// and, empirically, an ordinary typo'd path under a perfectly valid locale
// too: Next only renders a nested not-found.js when notFound() is thrown by
// a *page* actually inside that segment, not for a path that never matched
// any route at all. That means this root boundary is the one that's always
// actually reached in this app (no dynamic route here calls notFound()
// itself yet), so it detects the locale straight from the URL (not-found
// boundaries don't receive route params) and loads just that locale's
// strings directly, since there's no NextIntlClientProvider this high up
// the tree to lean on. [locale]/not-found.tsx is kept for if that changes.
export default function RootNotFound() {
  const pathname = usePathname();
  const [copy, setCopy] = useState(FALLBACK);

  useEffect(() => {
    const locale = detectLocale(pathname);
    import(`../../i18n/${locale}.json`)
      .then((mod) =>
        setCopy({
          locale,
          title: mod.default.notFound?.title ?? FALLBACK.title,
          message: mod.default.notFound?.message ?? FALLBACK.message,
          backHome: mod.default.legal?.backHome ?? FALLBACK.backHome,
        }),
      )
      .catch(() => setCopy(FALLBACK));
  }, [pathname]);

  return (
    <NotFoundContent
      title={copy.title}
      message={copy.message}
      homeHref={`/${copy.locale}`}
      backHomeLabel={copy.backHome}
    />
  );
}
