"use client";

import { useEffect, useRef, type ReactNode } from "react";

// Wraps a hero background layer and translates it at a fraction of the page's
// actual scroll speed, so it visually lags behind the foreground content —
// the classic parallax depth effect, and the source of that faint "heavier"
// scroll feel: two layers moving at different rates instead of one.
export function ParallaxLayer({
  children,
  speed = 0.4,
  className,
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ticking = false;
    const apply = () => {
      const el = ref.current;
      if (el) el.style.transform = `translate3d(0, ${window.scrollY * speed}px, 0)`;
      ticking = false;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [speed]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
