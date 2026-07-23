import { Roboto, Noto_Sans_TC } from "next/font/google";
import { fillRevealContentClass, fillRevealSurfaceClass } from "@/components/landing/fill-reveal";

// Deliberately its own pairing (not the site's Geist default) — Roboto
// covers the Latin "404", Noto Sans TC (思源黑體) covers the CJK message.
const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"] });
const notoSansTC = Noto_Sans_TC({ subsets: ["latin"], weight: ["400", "500", "700"] });

// Shared visual for both not-found boundaries (the locale-aware one for a
// bad path under a valid locale, and the root fallback for a bad locale
// segment itself, which can't rely on next-intl since layout.tsx throws
// before setting up its provider). Intentionally minimal — no header/footer,
// matching Next's own built-in 404 layout, just themed and translated.
// `homeHref` is a plain locale-prefixed path (e.g. "/zh-TW") rather than
// next-intl's Link, since the root boundary has no NextIntlClientProvider to
// resolve the current locale from.
export function NotFoundContent({
  title,
  message,
  homeHref,
  backHomeLabel,
}: {
  title: string;
  message: string;
  homeHref: string;
  backHomeLabel: string;
}) {
  return (
    <div
      className={`flex min-h-svh flex-col items-center justify-center gap-8 bg-background text-foreground ${notoSansTC.className}`}
    >
      <div className="flex items-center gap-6">
        <h1 className={`text-2xl font-semibold tracking-[-0.02em] ${roboto.className}`}>{title}</h1>
        <div className="h-10 w-px bg-border" />
        <p className="text-base text-foreground">{message}</p>
      </div>

      {/* Same fill-reveal treatment as the footer's nav links (FooterNavLink) —
          a plain text link, not a button. */}
      <a
        href={homeHref}
        className={`${fillRevealSurfaceClass} inline-flex px-1 py-0.5 text-sm text-foreground`}
      >
        <span className={fillRevealContentClass}>{backHomeLabel}</span>
      </a>
    </div>
  );
}
