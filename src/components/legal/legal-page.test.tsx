import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/i18n/navigation", () => ({
  Link: ({ children, ...props }: React.ComponentProps<"a">) => <a {...props}>{children}</a>,
}));

vi.mock("@/components/landing/landing-header", () => ({
  LandingHeader: () => <header />,
}));

vi.mock("@/components/landing/landing-footer", () => ({
  LandingFooter: () => <footer />,
}));

import { LegalPage } from "./legal-page";

describe("LegalPage", () => {
  it("gives Markdown links the shared left-to-right theme-aware fill treatment", () => {
    render(
      <LegalPage
        backHome="Back to home"
        tableOfContentsLabel="On this page"
        footerRights="Copyright"
        footerPrivacy="Privacy"
        footerTerms="Terms"
        footerFeedback="Feedback"
        markdown={`## Chapter 1 General provisions

### § 1 Scope

#### 1.1 Details

Contact [AnvilNote](https://github.com/AnvilNote).`}
      />,
    );

    expect(screen.getByRole("link", { name: "AnvilNote" })).toHaveClass(
      "before:origin-left",
      "before:bg-foreground",
      "before:duration-300",
      "hover:before:scale-x-100",
      "hover:text-background",
      "motion-reduce:before:transition-none",
    );
    expect(screen.getAllByRole("navigation", { name: "On this page" })).toHaveLength(2);
    expect(screen.getByRole("main")).toHaveClass("xl:grid-cols-[18rem_minmax(0,48rem)]");
    expect(screen.getByRole("heading", { name: "Chapter 1 General provisions" })).toHaveAttribute(
      "id",
      "chapter-1-general-provisions",
    );
    expect(screen.getByRole("heading", { name: "§ 1 Scope" })).toHaveClass("text-lg");
    expect(screen.getByRole("heading", { name: "1.1 Details" })).toHaveClass("font-medium");
  });
});
