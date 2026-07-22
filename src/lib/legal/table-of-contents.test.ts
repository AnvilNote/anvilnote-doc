import { describe, expect, it } from "vitest";
import { extractLegalHeadings, extractLegalTableOfContents } from "./table-of-contents";

describe("extractLegalTableOfContents", () => {
  it("builds chapters with their sections and clauses", () => {
    expect(
      extractLegalTableOfContents(`
# Privacy Policy

## Chapter 1 General provisions

### § 1 Scope

#### 1.1 Included products

## Chapter 2 Smart Mode
`),
    ).toEqual([
      {
        id: "chapter-1-general-provisions",
        title: "Chapter 1 General provisions",
        sections: [
          {
            id: "section-1-scope",
            title: "§ 1 Scope",
            clauses: [{ id: "section-1-1-included-products", title: "1.1 Included products" }],
          },
        ],
      },
      { id: "chapter-2-smart-mode", title: "Chapter 2 Smart Mode", sections: [] },
    ]);
  });

  it("ignores headings inside fenced code blocks and gives duplicate titles unique anchors", () => {
    expect(
      extractLegalHeadings(`
## Contact

\`\`\`
## Not a legal section
\`\`\`

## Contact
`),
    ).toEqual([
      { id: "contact", title: "Contact", level: 2 },
      { id: "contact-2", title: "Contact", level: 2 },
    ]);
  });
});
