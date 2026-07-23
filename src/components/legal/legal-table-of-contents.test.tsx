import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LegalTableOfContents } from "./legal-table-of-contents";

// Stubs document.getElementById for the given ids so the component's
// scroll-position scan (getBoundingClientRect().top <= 160) can be driven
// deterministically from a test, without a real layout engine. `tops` maps
// heading id -> its simulated distance from the viewport top.
function stubHeadingPositions(tops: Record<string, number>) {
  const original = document.getElementById.bind(document);
  vi.spyOn(document, "getElementById").mockImplementation((id: string) => {
    if (!(id in tops)) return original(id);
    return { getBoundingClientRect: () => ({ top: tops[id] }) } as unknown as HTMLElement;
  });
}

describe("LegalTableOfContents", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("bolds the chapter and article currently being read while scrolling", () => {
    const items = [
      {
        id: "chapter-1-general",
        title: "Chapter 1 General",
        sections: [
          { id: "section-1-scope", title: "§ 1 Scope", clauses: [] },
          { id: "section-2-data", title: "§ 2 Data", clauses: [] },
        ],
      },
      {
        id: "chapter-2-smart-mode",
        title: "Chapter 2 Smart Mode",
        sections: [{ id: "section-3-more", title: "§ 3 More", clauses: [] }],
      },
    ];

    stubHeadingPositions({
      "chapter-1-general": -400,
      "section-1-scope": -300,
      "section-2-data": 40, // scrolled just past the activation threshold
      "chapter-2-smart-mode": 900,
      "section-3-more": 950,
    });

    render(<LegalTableOfContents label="On this page" items={items} />);
    fireEvent.scroll(window);

    const activeChapter = screen.getAllByRole("link", { name: "Chapter 1 General" })[0];
    const activeSection = screen.getAllByRole("link", { name: "§ 2 Data" })[0];
    const otherSection = screen.getAllByRole("link", { name: "§ 1 Scope" })[0];

    expect(activeChapter).toHaveAttribute("aria-current", "location");
    expect(activeChapter).toHaveClass("font-semibold");
    expect(activeSection).toHaveAttribute("aria-current", "location");
    expect(activeSection).toHaveClass("font-semibold");
    expect(otherSection).not.toHaveAttribute("aria-current");
    expect(otherSection).not.toHaveClass("font-semibold");
  });

  it("also bolds the currently-active x.x clause within the active article", () => {
    const items = [
      {
        id: "chapter-1-general",
        title: "Chapter 1 General",
        sections: [
          {
            id: "section-1-scope",
            title: "§ 1 Scope",
            clauses: [
              { id: "clause-1-1", title: "1.1 Details" },
              { id: "clause-1-2", title: "1.2 More details" },
            ],
          },
        ],
      },
    ];

    stubHeadingPositions({
      "chapter-1-general": -400,
      "section-1-scope": -300,
      "clause-1-1": -50,
      "clause-1-2": 100, // scrolled just past the activation threshold
    });

    render(<LegalTableOfContents label="On this page" items={items} />);
    fireEvent.scroll(window);

    const activeClause = screen.getAllByRole("link", { name: "1.2 More details" })[0];
    const otherClause = screen.getAllByRole("link", { name: "1.1 Details" })[0];

    expect(activeClause).toHaveAttribute("aria-current", "location");
    expect(activeClause).toHaveClass("font-semibold");
    expect(otherClause).not.toHaveAttribute("aria-current");
    expect(otherClause).not.toHaveClass("font-semibold");
  });

  it("renders desktop and compact navigation from extracted legal sections", () => {
    render(
      <LegalTableOfContents
        label="On this page"
        items={[
          {
            id: "chapter-1-general",
            title: "Chapter 1 General",
            sections: [
              {
                id: "section-1-scope",
                title: "§ 1 Scope",
                clauses: [{ id: "section-1-1-details", title: "1.1 Details" }],
              },
            ],
          },
          {
            id: "chapter-2-smart-mode",
            title: "Chapter 2 Smart Mode",
            sections: [{ id: "section-2-data", title: "§ 2 Data", clauses: [] }],
          },
        ]}
      />,
    );

    expect(screen.getAllByRole("navigation", { name: "On this page" })).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: "Chapter 1 General" })).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: "§ 1 Scope" })).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: "1.1 Details" })).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: "Chapter 2 Smart Mode" })).toHaveLength(2);
    expect(screen.queryByRole("link", { name: "§ 2 Data" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Chapter 1 General" })[0]).toHaveAttribute(
      "href",
      "#chapter-1-general",
    );

    fireEvent.click(screen.getAllByRole("link", { name: "Chapter 2 Smart Mode" })[0]);
    expect(screen.getAllByRole("link", { name: "§ 2 Data" })).toHaveLength(2);
    expect(screen.queryByRole("link", { name: "§ 1 Scope" })).not.toBeInTheDocument();
  });
});
