"use client";

import { useEffect, useState, type MouseEvent } from "react";
import type {
  LegalTableOfContentsClause,
  LegalTableOfContentsItem,
  LegalTableOfContentsSection,
} from "@/lib/legal/table-of-contents";

type LegalTableOfContentsProps = {
  label: string;
  items: LegalTableOfContentsItem[];
};

type LegalNavigationTarget =
  | LegalTableOfContentsItem
  | LegalTableOfContentsSection
  | LegalTableOfContentsClause;

function useActiveLegalChapter(items: LegalTableOfContentsItem[]) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  useEffect(() => {
    function updateActiveChapter() {
      let nextActiveId = "";

      for (const item of items) {
        const heading = document.getElementById(item.id);
        if (heading && heading.getBoundingClientRect().top <= 160) nextActiveId = item.id;
        else break;
      }

      if (nextActiveId) setActiveId(nextActiveId);
    }

    updateActiveChapter();
    window.addEventListener("scroll", updateActiveChapter, { passive: true });
    window.addEventListener("resize", updateActiveChapter);
    return () => {
      window.removeEventListener("scroll", updateActiveChapter);
      window.removeEventListener("resize", updateActiveChapter);
    };
  }, [items]);

  return [activeId, setActiveId] as const;
}

function LegalTableOfContentsLinks({
  items,
  activeId,
  onNavigate,
}: {
  items: LegalTableOfContentsItem[];
  activeId: string;
  onNavigate: (event: MouseEvent<HTMLAnchorElement>, target: LegalNavigationTarget, chapterId: string) => void;
}) {
  return (
    <ol className="space-y-1 border-l border-border text-sm">
      {items.map((item) => {
        const expanded = item.id === activeId;
        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={expanded ? "location" : undefined}
              aria-expanded={expanded}
              onClick={(event) => onNavigate(event, item, item.id)}
              className={`block border-l -ml-px px-3 py-1.5 leading-5 transition-colors ${
                expanded
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              }`}
            >
              {item.title}
            </a>

            {expanded && item.sections.length > 0 ? (
              <ol className="mt-1 space-y-1 border-l border-border/70 pl-3 text-xs text-muted-foreground">
                {item.sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      onClick={(event) => onNavigate(event, section, item.id)}
                      className="block py-1 leading-5 hover:text-foreground"
                    >
                      {section.title}
                    </a>
                    {section.clauses.length > 0 ? (
                      <ol className="space-y-0.5 border-l border-border/50 pl-3 text-xs text-muted-foreground/80">
                        {section.clauses.map((clause) => (
                          <li key={clause.id}>
                            <a
                              href={`#${clause.id}`}
                              onClick={(event) => onNavigate(event, clause, item.id)}
                              className="block py-0.5 leading-5 hover:text-foreground"
                            >
                              {clause.title}
                            </a>
                          </li>
                        ))}
                      </ol>
                    ) : null}
                  </li>
                ))}
              </ol>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

// The renderer receives a pre-built heading tree. It only tracks which
// chapter contains the current scroll position, then reveals that chapter's
// sections and clauses while keeping every other chapter compact.
export function LegalTableOfContents({ label, items }: LegalTableOfContentsProps) {
  const [activeId, setActiveId] = useActiveLegalChapter(items);

  if (items.length === 0) return null;

  function navigate(
    event: MouseEvent<HTMLAnchorElement>,
    target: LegalNavigationTarget,
    chapterId: string,
  ) {
    event.preventDefault();
    setActiveId(chapterId);

    const heading = document.getElementById(target.id);
    if (heading) {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      heading.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    }

    window.history.replaceState(null, "", `#${target.id}`);
  }

  return (
    <>
      <aside className="hidden xl:block xl:sticky xl:top-28 xl:self-start">
        <nav aria-label={label}>
          <p className="mb-3 text-xs font-medium tracking-[0.08em] text-muted-foreground uppercase">{label}</p>
          <LegalTableOfContentsLinks items={items} activeId={activeId} onNavigate={navigate} />
        </nav>
      </aside>

      <details className="mb-8 border-y border-border py-3 xl:hidden">
        <summary className="cursor-pointer text-sm font-medium text-foreground">{label}</summary>
        <nav aria-label={label} className="mt-3">
          <LegalTableOfContentsLinks items={items} activeId={activeId} onNavigate={navigate} />
        </nav>
      </details>
    </>
  );
}
