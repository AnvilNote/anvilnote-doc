"use client";

import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

// Visible once the hero's scroll-down chevron has scrolled past the top of
// the viewport (i.e. the user is at or below the demo section it points
// to) — never floats over the hero itself. Pages without a "hero-chevron"
// anchor (feedback, legal) have nothing to hide behind, so it just shows.
export function FeedbackTab() {
  const t = useTranslations("landing.footer");
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const anchor = document.getElementById("hero-chevron");
    if (!anchor) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 },
    );
    observer.observe(anchor);
    return () => observer.disconnect();
  }, []);

  if (pathname === "/feedback") return null;

  return (
    <Link
      href="/feedback"
      aria-label={t("feedback")}
      className={cn(
        "fixed top-1/2 right-0 z-40 flex max-h-[80vh] -translate-y-1/2 flex-col items-center gap-2 bg-foreground px-2 py-3 text-background shadow-lg transition-all duration-300 hover:bg-foreground/90 sm:gap-3 sm:px-3 sm:py-5",
        visible ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-full opacity-0",
      )}
    >
      <MessageSquare className="size-4 shrink-0 sm:size-5" />
      <span className="text-xs font-semibold tracking-wide [writing-mode:vertical-rl] sm:text-sm">
        {t("feedback")}
      </span>
    </Link>
  );
}
