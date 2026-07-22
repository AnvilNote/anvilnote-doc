import { describe, expect, it } from "vitest";
import { signAdminSession, verifyAdminSession } from "./admin-session";

const SECRET = "test-secret-value";

describe("admin session token", () => {
  it("verifies a token signed with the same secret and a future expiry", () => {
    const token = signAdminSession(SECRET, Date.now() + 60_000);
    expect(verifyAdminSession(SECRET, token)).toBe(true);
  });

  it("rejects a token signed with a different secret", () => {
    const token = signAdminSession("other-secret", Date.now() + 60_000);
    expect(verifyAdminSession(SECRET, token)).toBe(false);
  });

  it("rejects an expired token", () => {
    const token = signAdminSession(SECRET, Date.now() - 1_000);
    expect(verifyAdminSession(SECRET, token)).toBe(false);
  });

  it("rejects a tampered token", () => {
    const token = signAdminSession(SECRET, Date.now() + 60_000);
    const tampered = token.slice(0, -1) + (token.at(-1) === "0" ? "1" : "0");
    expect(verifyAdminSession(SECRET, tampered)).toBe(false);
  });

  it("rejects a malformed token", () => {
    expect(verifyAdminSession(SECRET, "not-a-real-token")).toBe(false);
    expect(verifyAdminSession(SECRET, "")).toBe(false);
  });
});
