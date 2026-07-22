import { describe, expect, it } from "vitest";
import { feedbackSchema } from "./schema";

describe("feedbackSchema", () => {
  it("accepts a valid submission", () => {
    const result = feedbackSchema.safeParse({
      email: "person@example.com",
      title: "Dark mode PDFs",
      category: "feature",
      message: "It would be great if AnvilNote supported dark mode PDFs.",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a submission with no name (anonymous)", () => {
    const result = feedbackSchema.safeParse({
      email: "person@example.com",
      title: "Dark mode PDFs",
      category: "feature",
      message: "Some feedback that is long enough.",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBeUndefined();
  });

  it("accepts a submission with a name", () => {
    const result = feedbackSchema.safeParse({
      email: "person@example.com",
      title: "Dark mode PDFs",
      category: "feature",
      message: "Some feedback that is long enough.",
      name: "Alice",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe("Alice");
  });

  it("rejects a missing email", () => {
    const result = feedbackSchema.safeParse({
      email: "",
      title: "Title",
      category: "general",
      message: "Some feedback that is long enough.",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a malformed email", () => {
    const result = feedbackSchema.safeParse({
      email: "not-an-email",
      title: "Title",
      category: "general",
      message: "Some feedback that is long enough.",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty message", () => {
    const result = feedbackSchema.safeParse({
      email: "person@example.com",
      title: "Title",
      category: "general",
      message: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a message that's too short to be meaningful", () => {
    const result = feedbackSchema.safeParse({
      email: "person@example.com",
      title: "Title",
      category: "general",
      message: "hi",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a message over the length limit", () => {
    const result = feedbackSchema.safeParse({
      email: "person@example.com",
      title: "Title",
      category: "general",
      message: "a".repeat(2001),
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing category", () => {
    const result = feedbackSchema.safeParse({
      email: "person@example.com",
      title: "Title",
      message: "Some feedback that is long enough.",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a category outside the known set", () => {
    const result = feedbackSchema.safeParse({
      email: "person@example.com",
      title: "Title",
      category: "not-a-real-category",
      message: "Some feedback that is long enough.",
    });
    expect(result.success).toBe(false);
  });

  it("accepts every known category", () => {
    for (const category of ["bug", "feature", "general", "other"]) {
      const result = feedbackSchema.safeParse({
        email: "person@example.com",
        title: "Title",
        category,
        message: "Some feedback that is long enough.",
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects a missing title", () => {
    const result = feedbackSchema.safeParse({
      email: "person@example.com",
      category: "general",
      message: "Some feedback that is long enough.",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty title", () => {
    const result = feedbackSchema.safeParse({
      email: "person@example.com",
      title: "",
      category: "general",
      message: "Some feedback that is long enough.",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a title longer than 15 characters", () => {
    const result = feedbackSchema.safeParse({
      email: "person@example.com",
      title: "a".repeat(16),
      category: "general",
      message: "Some feedback that is long enough.",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a title exactly 15 characters long", () => {
    const result = feedbackSchema.safeParse({
      email: "person@example.com",
      title: "a".repeat(15),
      category: "general",
      message: "Some feedback that is long enough.",
    });
    expect(result.success).toBe(true);
  });

  it("trims whitespace from email, title, name, and message", () => {
    const result = feedbackSchema.safeParse({
      email: "  person@example.com  ",
      title: "  Padded title  ",
      category: "general",
      message: "  Feedback with padding around it.  ",
      name: "  Alice  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("person@example.com");
      expect(result.data.title).toBe("Padded title");
      expect(result.data.message).toBe("Feedback with padding around it.");
      expect(result.data.name).toBe("Alice");
    }
  });

  it("treats a name that is only whitespace as anonymous", () => {
    const result = feedbackSchema.safeParse({
      email: "person@example.com",
      title: "Title",
      category: "general",
      message: "Some feedback that is long enough.",
      name: "   ",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBeUndefined();
  });
});
