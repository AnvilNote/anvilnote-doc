import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LegalTableOfContents } from "./legal-table-of-contents";

describe("LegalTableOfContents", () => {
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
