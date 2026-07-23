"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { LocaleSwitcher } from "@/components/app/locale-switcher";
import { FeedbackTab } from "@/components/landing/feedback-tab";
import { getActiveHoliday } from "@/lib/holidays";
import { cn } from "@/lib/utils";

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  // Computed once on mount (lazy initializer) rather than every render —
  // this component re-renders on every scroll tick, and the active holiday
  // never changes mid-session.
  const [holiday] = useState(() => getActiveHoliday());

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 8);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Fixed so it stays pinned while scrolling. Callers must reserve top
          space (the landing hero uses pt-24+, legal pages a plain pt-24) since
          this never participates in normal document flow. */}
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 w-full border-b transition-[background-color,border-color,box-shadow] duration-300",
          scrolled
            ? "border-border/70 bg-background/75 shadow-[0_14px_40px_-28px_rgba(0,0,0,0.26)] backdrop-blur-lg"
            : "border-transparent bg-transparent shadow-none"
        )}
      >
        <div className="flex w-full items-center justify-between gap-5 px-5 py-3 lg:px-7">
          <Link href="/" className="flex items-center gap-2.5 text-2xl font-semibold tracking-[-0.04em]">
            <span className="relative flex size-9 shrink-0 items-center justify-center">
              {holiday ? (
                <holiday.hat.Icon
                  aria-hidden="true"
                  className="absolute -top-2 -right-1.5 size-4.5"
                  style={{ transform: `rotate(${holiday.hat.deg}deg)` }}
                />
              ) : null}
              <Image src="/favicon-dark.svg" alt="" width={36} height={36} className="size-9 dark:hidden" priority />
              <Image
                src="/favicon-light.svg"
                alt=""
                width={36}
                height={36}
                className="hidden size-9 dark:block"
                priority
              />
            </span>
            <span>AnvilNote</span>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LocaleSwitcher />
          </div>
        </div>
      </header>

      <FeedbackTab />
    </>
  );
}
