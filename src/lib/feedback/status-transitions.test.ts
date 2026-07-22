import { describe, expect, it } from "vitest";
import { canTransition } from "./status-transitions";

describe("canTransition", () => {
  it("allows accepting a published item into progress", () => {
    expect(canTransition("published", "in_progress")).toBe(true);
  });

  it("allows rejecting a published item", () => {
    expect(canTransition("published", "rejected")).toBe(true);
  });

  it("allows marking an in-progress item done", () => {
    expect(canTransition("in_progress", "done")).toBe(true);
  });

  it("does not allow rejecting an in-progress item", () => {
    expect(canTransition("in_progress", "rejected")).toBe(false);
  });

  it("does not allow any transition out of rejected", () => {
    expect(canTransition("rejected", "in_progress")).toBe(false);
    expect(canTransition("rejected", "done")).toBe(false);
    expect(canTransition("rejected", "published")).toBe(false);
  });

  it("does not allow any transition out of done", () => {
    expect(canTransition("done", "in_progress")).toBe(false);
    expect(canTransition("done", "rejected")).toBe(false);
    expect(canTransition("done", "published")).toBe(false);
  });

  it("does not allow a status to transition to itself", () => {
    expect(canTransition("published", "published")).toBe(false);
  });
});
