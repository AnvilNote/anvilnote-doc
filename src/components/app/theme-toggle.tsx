"use client";

import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { Moon, Sun } from "lucide-react";
import { flushSync } from "react-dom";
import { Button } from "@/components/ui/button";
import { useMounted } from "@/hooks/use-mounted";
import { cn } from "@/lib/utils";
import { startViewTransition } from "@/lib/view-transition";

// Single-tap light/dark toggle with an animated sprite swap: the sun and moon
// cross-fade while rotating and scaling, so flipping themes feels alive. The
// theme change itself radiates out from the button as an expanding circle
// (View Transitions API), not just an instant color swap.
export function ThemeToggle() {
  const t = useTranslations("settings.appearance");
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const isDark = mounted && resolvedTheme === "dark";

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    const next = isDark ? "light" : "dark";

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTheme(next);
      return;
    }

    const x = event.clientX;
    const y = event.clientY;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    const transition = startViewTransition(() => {
      flushSync(() => setTheme(next));
    });

    if (!transition) {
      setTheme(next);
      return;
    }

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        { duration: 500, easing: "ease-in-out", pseudoElement: "::view-transition-new(root)" },
      );
    });
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={t("theme")}
      aria-pressed={isDark}
      onClick={handleClick}
      className="relative overflow-hidden hover:bg-transparent dark:hover:bg-transparent"
    >
      <Sun
        className={cn(
          "size-4 transition-all duration-500 ease-out",
          isDark
            ? "rotate-90 scale-0 opacity-0"
            : "rotate-0 scale-100 opacity-100",
        )}
      />
      <Moon
        className={cn(
          "absolute size-4 transition-all duration-500 ease-out",
          isDark
            ? "rotate-0 scale-100 opacity-100"
            : "-rotate-90 scale-0 opacity-0",
        )}
      />
    </Button>
  );
}
