export type LegalHeading = {
  id: string;
  title: string;
  level: 2 | 3 | 4;
};

export type LegalTableOfContentsClause = Pick<LegalHeading, "id" | "title">;

export type LegalTableOfContentsSection = Pick<LegalHeading, "id" | "title"> & {
  clauses: LegalTableOfContentsClause[];
};

export type LegalTableOfContentsItem = Pick<LegalHeading, "id" | "title"> & {
  sections: LegalTableOfContentsSection[];
};

function createAnchor(title: string) {
  const slug = title
    .normalize("NFKD")
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

  if (!slug) return "section";
  return /^\d/.test(slug) ? `section-${slug}` : slug;
}

// Legal pages use Markdown as their localized source. The heading parser is
// deliberately independent from rendering so anchors and TOC nesting always
// agree, regardless of locale.
export function extractLegalHeadings(markdown: string): LegalHeading[] {
  const counts = new Map<string, number>();
  const headings: LegalHeading[] = [];
  let fence: "`" | "~" | null = null;

  for (const line of markdown.split(/\r?\n/)) {
    const fenceMatch = line.match(/^\s*(`{3,}|~{3,})/);
    if (fenceMatch) {
      const marker = fenceMatch[1][0] as "`" | "~";
      fence = fence === marker ? null : fence ?? marker;
      continue;
    }

    if (fence) continue;

    const heading = line.match(/^\s{0,3}(#{2,4})\s+(.+?)\s*#*\s*$/);
    if (!heading) continue;

    const level = heading[1].length as LegalHeading["level"];
    const title = heading[2].trim();
    const baseId = createAnchor(title);
    const occurrence = (counts.get(baseId) ?? 0) + 1;
    counts.set(baseId, occurrence);

    headings.push({
      id: occurrence === 1 ? baseId : `${baseId}-${occurrence}`,
      title,
      level,
    });
  }

  return headings;
}

export function extractLegalTableOfContents(markdown: string): LegalTableOfContentsItem[] {
  const chapters: LegalTableOfContentsItem[] = [];
  let currentChapter: LegalTableOfContentsItem | undefined;
  let currentSection: LegalTableOfContentsSection | undefined;

  for (const heading of extractLegalHeadings(markdown)) {
    if (heading.level === 2) {
      currentChapter = { id: heading.id, title: heading.title, sections: [] };
      currentSection = undefined;
      chapters.push(currentChapter);
      continue;
    }

    if (heading.level === 3 && currentChapter) {
      currentSection = { id: heading.id, title: heading.title, clauses: [] };
      currentChapter.sections.push(currentSection);
      continue;
    }

    if (heading.level === 4 && currentSection) {
      currentSection.clauses.push({ id: heading.id, title: heading.title });
    }
  }

  return chapters;
}
