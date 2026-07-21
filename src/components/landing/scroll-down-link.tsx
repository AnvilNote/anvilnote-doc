"use client";

import type { MouseEvent, ReactNode } from "react";

const SCROLL_DURATION_MS = 1400;

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

// A deliberately slow, custom-eased scroll instead of the browser's default
// smooth-scroll (which has no controllable duration) — clicking the chevron
// should feel like it's guiding the page down, not jumping to it.
export function ScrollDownLink({
  targetId,
  ariaLabel,
  className,
  children,
}: {
  targetId: string;
  ariaLabel: string;
  className?: string;
  children: ReactNode;
}) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    const target = document.getElementById(targetId);
    if (!target) return;
    event.preventDefault();

    const startY = window.scrollY;
    const endY = startY + target.getBoundingClientRect().top;
    const distance = endY - startY;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.scrollTo(0, endY);
      return;
    }

    const startTime = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - startTime) / SCROLL_DURATION_MS, 1);
      window.scrollTo(0, startY + distance * easeInOutCubic(progress));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }

  return (
    <a href={`#${targetId}`} aria-label={ariaLabel} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
