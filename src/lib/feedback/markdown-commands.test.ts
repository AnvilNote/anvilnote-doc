import { describe, expect, it } from "vitest";
import { insertImage, insertLink, prefixLines, wrapInline } from "./markdown-commands";

describe("wrapInline", () => {
  it("wraps a selection with the marker on both sides", () => {
    const result = wrapInline({ value: "hello world", start: 0, end: 5 }, "**", "bold text");
    expect(result.value).toBe("**hello** world");
    expect(result.value.slice(result.selectionStart, result.selectionEnd)).toBe("hello");
  });

  it("inserts marker pair with placeholder selected when nothing is selected", () => {
    const result = wrapInline({ value: "", start: 0, end: 0 }, "**", "bold text");
    expect(result.value).toBe("**bold text**");
    expect(result.value.slice(result.selectionStart, result.selectionEnd)).toBe("bold text");
  });

  it("supports different open/close markers (e.g. strikethrough uses the same marker both sides, links do not)", () => {
    const result = wrapInline({ value: "abc", start: 0, end: 3 }, "~~", "strikethrough text");
    expect(result.value).toBe("~~abc~~");
  });

  it("preserves text before and after the selection", () => {
    const result = wrapInline({ value: "before HERE after", start: 7, end: 11 }, "*", "italic text");
    expect(result.value).toBe("before *HERE* after");
  });
});

describe("prefixLines", () => {
  it("prefixes the single line containing the cursor when nothing is selected", () => {
    const result = prefixLines({ value: "hello world", start: 3, end: 3 }, "# ");
    expect(result.value).toBe("# hello world");
  });

  it("prefixes every line touched by a multi-line selection", () => {
    const value = "line one\nline two\nline three";
    const start = value.indexOf("one");
    const end = value.indexOf("two") + "two".length;
    const result = prefixLines({ value, start, end }, "- ");
    expect(result.value).toBe("- line one\n- line two\nline three");
  });

  it("only prefixes the touched lines, leaving untouched lines alone", () => {
    const value = "keep\nchange this\nkeep too";
    const start = value.indexOf("change");
    const end = start;
    const result = prefixLines({ value, start, end }, "1. ");
    expect(result.value).toBe("keep\n1. change this\nkeep too");
  });
});

describe("insertLink", () => {
  it("wraps a selection as link text and selects the url placeholder", () => {
    const result = insertLink({ value: "check out AnvilNote", start: 10, end: 19 }, "url");
    expect(result.value).toBe("check out [AnvilNote](url)");
    expect(result.value.slice(result.selectionStart, result.selectionEnd)).toBe("url");
  });

  it("inserts a full link placeholder and selects the text portion when nothing is selected", () => {
    const result = insertLink({ value: "", start: 0, end: 0 }, "url");
    expect(result.value).toBe("[link text](url)");
    expect(result.value.slice(result.selectionStart, result.selectionEnd)).toBe("link text");
  });
});

describe("insertImage", () => {
  it("inserts an image on its own line outside a list", () => {
    const value = "hello";
    const result = insertImage({ value, start: value.length, end: value.length }, "url", "screenshot");
    expect(result.value).toBe("hello\n![screenshot](url)\n");
  });

  it("indents the image so it nests under an unordered list item", () => {
    const value = "- first item";
    const result = insertImage({ value, start: value.length, end: value.length }, "url", "screenshot");
    expect(result.value).toBe("- first item\n\n  ![screenshot](url)\n");
  });

  it("indents to match a wider ordered list marker", () => {
    const value = "1. first item";
    const result = insertImage({ value, start: value.length, end: value.length }, "url", "screenshot");
    expect(result.value).toBe("1. first item\n\n   ![screenshot](url)\n");
  });

  it("reuses the indentation of an already-indented continuation line", () => {
    const value = "- item\n  more text";
    const result = insertImage({ value, start: value.length, end: value.length }, "url", "screenshot");
    expect(result.value).toBe("- item\n  more text\n\n  ![screenshot](url)\n");
  });

  it("places the cursor right after the inserted image", () => {
    const value = "hello";
    const result = insertImage({ value, start: value.length, end: value.length }, "url", "screenshot");
    expect(result.selectionStart).toBe(result.value.length);
    expect(result.selectionEnd).toBe(result.value.length);
  });
});
