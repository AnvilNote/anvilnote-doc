"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getActiveHoliday, type ActiveHoliday } from "@/lib/holidays";
import { getRandomQuote, type Quote } from "@/lib/quotes";
import { HolidayShower } from "@/components/landing/holiday-shower";

const CLEAR_AT_MS = 2000;

// Plays once per full page load — mounted in the root layout, which
// persists across client-side navigation in the App Router, so this never
// replays just from clicking between pages within the site.
export function QuillTransition() {
  const [playing, setPlaying] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [holiday, setHoliday] = useState<ActiveHoliday | null>(null);

  // Deferred to a mount-only effect (not computed during the initial
  // render) so the server-rendered HTML always matches the client's first
  // paint — getRandomQuote()'s Math.random() would otherwise pick a
  // different quote on the server than on the client and trip a hydration
  // mismatch. The splash only ever appears client-side, after hydration.
  useEffect(() => {
    setQuote(getRandomQuote());
    setHoliday(getActiveHoliday());
    setPlaying(true);
    const timer = window.setTimeout(() => setPlaying(false), CLEAR_AT_MS);
    return () => window.clearTimeout(timer);
  }, []);

  if (!playing || !quote) return null;

  return (
    <div className="quill-transition-overlay fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background">
      {holiday ? <HolidayShower holiday={holiday} /> : null}
      <span className="quill-enter relative z-10 -mt-16 inline-flex">
        <span className="quill-swing relative inline-flex">
          {holiday ? (
            <holiday.hat.Icon
              aria-hidden="true"
              className="absolute -top-6 -right-4 size-14"
              style={{ transform: `rotate(${holiday.hat.deg}deg)` }}
            />
          ) : null}
          <Image
            src="/quill-dark.svg"
            alt=""
            aria-hidden="true"
            width={112}
            height={112}
            priority
            className="size-28 dark:hidden"
          />
          <Image
            src="/quill-white.svg"
            alt=""
            aria-hidden="true"
            width={112}
            height={112}
            priority
            className="hidden size-28 dark:block"
          />
        </span>
      </span>

      <figure className="quill-quote relative z-10 mt-10 w-full max-w-md px-6">
        <blockquote className="text-balance text-center text-lg leading-relaxed text-foreground italic">
          &ldquo;{quote.content}&rdquo;
        </blockquote>
        <figcaption className="mt-3 text-right text-sm text-muted-foreground">— {quote.author}</figcaption>
      </figure>
    </div>
  );
}
