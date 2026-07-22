import { describe, expect, it } from "vitest";
import { readLegalDoc, type LegalDoc } from "./read-legal-doc";

const locales = ["en", "zh-TW", "ja", "ko", "ru", "th"] as const;
const expectedStructure: Record<LegalDoc, { chapters: number; sections: number; clauses: number }> = {
  privacy: { chapters: 4, sections: 13, clauses: 5 },
  terms: { chapters: 4, sections: 25, clauses: 5 },
};

describe("legal document heading hierarchy", () => {
  for (const doc of ["privacy", "terms"] as const) {
    it(`${doc} keeps the same chapter, section, and clause structure in every locale`, () => {
      const expected = expectedStructure[doc];

      for (const locale of locales) {
        const levels = readLegalDoc(doc, locale)
          .split(/\r?\n/)
          .flatMap((line) => line.match(/^(#{2,4})\s/)?.[1].length ?? []);

        expect(levels.filter((level) => level === 2), `${locale} chapter count`).toHaveLength(
          expected.chapters,
        );
        expect(levels.filter((level) => level === 3), `${locale} section count`).toHaveLength(
          expected.sections,
        );
        expect(levels.filter((level) => level === 4), `${locale} clause count`).toHaveLength(
          expected.clauses,
        );

        let previousLevel = 1;
        for (const level of levels) {
          expect(level, `${locale} must not skip a heading level`).toBeLessThanOrEqual(previousLevel + 1);
          previousLevel = level;
        }
      }
    });
  }
});
