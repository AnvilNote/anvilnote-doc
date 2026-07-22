import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DownloadButtons } from "./download-buttons";

describe("DownloadButtons", () => {
  it("uses the shared left-to-right theme-aware fill treatment for every platform", () => {
    render(
      <DownloadButtons
        macOS="https://example.com/anvilnote.dmg"
        windows="https://example.com/anvilnote.exe"
        linux="https://example.com/anvilnote.AppImage"
        versionLabel="Version 0.18.0"
      />,
    );

    for (const name of ["macOS", "Windows", "Linux"]) {
      expect(screen.getByRole("link", { name })).toHaveClass(
        "before:origin-left",
        "before:bg-foreground",
        "before:duration-300",
        "hover:before:scale-x-100",
        "hover:text-background",
        "motion-reduce:before:transition-none",
      );
    }
  });

  it("keeps a missing platform visible but disables it", () => {
    render(
      <DownloadButtons
        macOS="https://example.com/anvilnote.dmg"
        windows="https://example.com/anvilnote.exe"
        linux={null}
        versionLabel="Version 0.18.1"
      />,
    );

    const linux = screen.getByRole("button", { name: "Linux" });
    expect(linux).toBeDisabled();
    expect(linux).toHaveClass("cursor-not-allowed", "opacity-45");
    expect(screen.getByRole("link", { name: "macOS" })).toHaveAttribute(
      "href",
      "https://example.com/anvilnote.dmg",
    );
  });
});
