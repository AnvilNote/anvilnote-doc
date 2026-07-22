import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/i18n/navigation", () => ({
  Link: ({ children, ...props }: React.ComponentProps<"a">) => <a {...props}>{children}</a>,
}));

import { LandingFooter } from "./landing-footer";

describe("LandingFooter", () => {
  it("keeps legal links with copyright and exposes GitHub, Instagram, and email on the right", () => {
    render(
      <LandingFooter
        rights="Copyright 2026 AnvilNote"
        privacy="Privacy Policy"
        terms="Terms of Service"
        feedback="Feedback"
      />,
    );

    const footer = screen.getByRole("contentinfo");
    const legalGroup = screen.getByLabelText("Legal");

    expect(footer).toContainElement(screen.getByText("Copyright 2026 AnvilNote"));
    expect(legalGroup).toContainElement(screen.getByRole("link", { name: "Feedback" }));
    expect(legalGroup).toContainElement(screen.getByRole("link", { name: "Privacy Policy" }));
    expect(legalGroup).toContainElement(screen.getByRole("link", { name: "Terms of Service" }));
    expect(legalGroup.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2);
    expect(screen.getByRole("link", { name: "Privacy Policy" })).toHaveClass(
      "before:origin-left",
      "before:bg-foreground",
      "before:duration-300",
      "hover:before:scale-x-100",
      "hover:text-background",
      "motion-reduce:before:transition-none",
    );
    expect(screen.getByRole("link", { name: "GitHub" })).toHaveAttribute(
      "href",
      "https://github.com/AnvilNote",
    );
    expect(screen.getByRole("link", { name: "Instagram" })).toHaveAttribute(
      "href",
      "https://www.instagram.com/anvilnoteapp",
    );
    expect(screen.getByRole("link", { name: "Email" })).toHaveAttribute(
      "href",
      "mailto:contact@anvilnote.org",
    );
  });
});
