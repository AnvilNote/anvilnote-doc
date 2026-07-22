import { describe, expect, it } from "vitest";
import { feedbackRequestSchema } from "./request-schema";

describe("feedbackRequestSchema", () => {
  it("accepts a valid request with no honeypot value", () => {
    const result = feedbackRequestSchema.safeParse({
      email: "person@example.com",
      title: "Title",
      category: "general",
      message: "Some feedback that is long enough.",
      locale: "en",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid request with an empty honeypot field", () => {
    const result = feedbackRequestSchema.safeParse({
      email: "person@example.com",
      title: "Title",
      category: "bug",
      message: "Some feedback that is long enough.",
      locale: "zh-TW",
      company: "",
    });
    expect(result.success).toBe(true);
  });

  it("still parses when the honeypot field is filled in (bot detection happens after parsing)", () => {
    const result = feedbackRequestSchema.safeParse({
      email: "person@example.com",
      title: "Title",
      category: "feature",
      message: "Some feedback that is long enough.",
      locale: "en",
      company: "Acme Bot Corp",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.company).toBe("Acme Bot Corp");
  });

  it("rejects an unsupported locale", () => {
    const result = feedbackRequestSchema.safeParse({
      email: "person@example.com",
      title: "Title",
      category: "general",
      message: "Some feedback that is long enough.",
      locale: "fr",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a request missing the locale", () => {
    const result = feedbackRequestSchema.safeParse({
      email: "person@example.com",
      title: "Title",
      category: "general",
      message: "Some feedback that is long enough.",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a request missing the category", () => {
    const result = feedbackRequestSchema.safeParse({
      email: "person@example.com",
      title: "Title",
      message: "Some feedback that is long enough.",
      locale: "en",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a request missing the title", () => {
    const result = feedbackRequestSchema.safeParse({
      email: "person@example.com",
      category: "general",
      message: "Some feedback that is long enough.",
      locale: "en",
    });
    expect(result.success).toBe(false);
  });
});
