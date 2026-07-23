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

// Finds the last heading (in document order) that has scrolled past the
// activation threshold — the same "how far down have we read" scan used for
// chapters, generalized so it can also find the currently-active article
// (§ N) within whichever chapter is active, for bolding in the sidebar.
function lastHeadingPast(ids: string[], threshold: number): string {
  let result = "";
  for (const id of ids) {
    const heading = document.getElementById(id);
    if (heading && heading.getBoundingClientRect().top <= threshold) result = id;
    else break;
  }
  return result;
}

function useActiveLegalHeadings(items: LegalTableOfContentsItem[]) {
  const [activeChapterId, setActiveChapterId] = useState(items[0]?.id ?? "");
  const [activeSectionId, setActiveSectionId] = useState("");
  const [activeClauseId, setActiveClauseId] = useState("");

  useEffect(() => {
    const chapterIds = items.map((item) => item.id);
    const sectionIds = items.flatMap((item) => item.sections.map((section) => section.id));
    const clauseIds = items.flatMap((item) =>
      item.sections.flatMap((section) => section.clauses.map((clause) => clause.id)),
    );

    function updateActive() {
      const nextChapterId = lastHeadingPast(chapterIds, 160);
      if (nextChapterId) setActiveChapterId(nextChapterId);
      setActiveSectionId(lastHeadingPast(sectionIds, 160));
      setActiveClauseId(lastHeadingPast(clauseIds, 160));
    }

    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);
    return () => {
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, [items]);

  return { activeChapterId, setActiveChapterId, activeSectionId, activeClauseId } as const;
}

function LegalTableOfContentsLinks({
  items,
  activeChapterId,
  activeSectionId,
  activeClauseId,
  onNavigate,
}: {
  items: LegalTableOfContentsItem[];
  activeChapterId: string;
  activeSectionId: string;
  activeClauseId: string;
  onNavigate: (event: MouseEvent<HTMLAnchorElement>, target: LegalNavigationTarget, chapterId: string) => void;
}) {
  return (
    <ol className="space-y-1 border-l border-border text-sm">
      {items.map((item) => {
        const expanded = item.id === activeChapterId;
        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={expanded ? "location" : undefined}
              aria-expanded={expanded}
              onClick={(event) => onNavigate(event, item, item.id)}
              className={`block border-l -ml-px px-3 py-1.5 leading-5 transition-colors ${
                expanded
                  ? "border-foreground font-semibold text-foreground"
                  : "border-transparent text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              }`}
            >
              {item.title}
            </a>

            {expanded && item.sections.length > 0 ? (
              <ol className="mt-1 space-y-1 border-l border-border/70 pl-3 text-xs text-muted-foreground">
                {item.sections.map((section) => {
                  const sectionActive = section.id === activeSectionId;
                  return (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      aria-current={sectionActive ? "location" : undefined}
                      onClick={(event) => onNavigate(event, section, item.id)}
                      className={`block py-1 leading-5 hover:text-foreground ${
                        sectionActive ? "font-semibold text-foreground" : ""
                      }`}
                    >
                      {section.title}
                    </a>
                    {section.clauses.length > 0 ? (
                      <ol className="space-y-0.5 border-l border-border/50 pl-3 text-xs text-muted-foreground/80">
                        {section.clauses.map((clause) => {
                          const clauseActive = clause.id === activeClauseId;
                          return (
                            <li key={clause.id}>
                              <a
                                href={`#${clause.id}`}
                                aria-current={clauseActive ? "location" : undefined}
                                onClick={(event) => onNavigate(event, clause, item.id)}
                                className={`block py-0.5 leading-5 hover:text-foreground ${
                                  clauseActive ? "font-semibold text-foreground" : ""
                                }`}
                              >
                                {clause.title}
                              </a>
                            </li>
                          );
                        })}
                      </ol>
                    ) : null}
                  </li>
                  );
                })}
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
  const { activeChapterId, setActiveChapterId, activeSectionId, activeClauseId } =
    useActiveLegalHeadings(items);

  if (items.length === 0) return null;

  function navigate(
    event: MouseEvent<HTMLAnchorElement>,
    target: LegalNavigationTarget,
    chapterId: string,
  ) {
    event.preventDefault();
    setActiveChapterId(chapterId);

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
          <LegalTableOfContentsLinks
            items={items}
            activeChapterId={activeChapterId}
            activeSectionId={activeSectionId}
            activeClauseId={activeClauseId}
            onNavigate={navigate}
          />
        </nav>
      </aside>

      <details className="mb-8 border-y border-border py-3 xl:hidden">
        <summary className="cursor-pointer text-sm font-medium text-foreground">{label}</summary>
        <nav aria-label={label} className="mt-3">
          <LegalTableOfContentsLinks
            items={items}
            activeChapterId={activeChapterId}
            activeSectionId={activeSectionId}
            activeClauseId={activeClauseId}
            onNavigate={navigate}
          />
        </nav>
      </details>
    </>
  );
}
