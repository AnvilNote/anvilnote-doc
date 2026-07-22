import { describe, expect, it } from "vitest";
import { truncateForEmailPreview } from "./email-template";

describe("truncateForEmailPreview", () => {
  it("leaves short text untouched", () => {
    expect(truncateForEmailPreview("hello world")).toBe("hello world");
  });

  it("trims surrounding whitespace even when under the limit", () => {
    expect(truncateForEmailPreview("  hello  ")).toBe("hello");
  });

  it("truncates long text and appends an ellipsis", () => {
    const long = "a".repeat(300);
    const result = truncateForEmailPreview(long);
    expect(result.endsWith("…")).toBe(true);
    expect(result.length).toBe(281);
  });

  it("keeps text exactly at the limit untouched", () => {
    const exact = "a".repeat(280);
    expect(truncateForEmailPreview(exact)).toBe(exact);
  });
});
