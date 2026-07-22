import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { signAdminSession, verifyAdminSession } from "./admin-session";

export const ADMIN_SESSION_COOKIE = "anvilnote_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 12;

function sessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET must be set");
  return secret;
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function verifyAdminCredentials(username: string, password: string): boolean {
  const expectedUsername = process.env.ADMIN_USERNAME ?? "";
  const expectedPassword = process.env.ADMIN_PASSWORD ?? "";
  return safeEqual(username, expectedUsername) && safeEqual(password, expectedPassword);
}

export function createAdminSessionCookie(): { token: string; maxAge: number } {
  const expiresAt = Date.now() + SESSION_DURATION_SECONDS * 1000;
  return { token: signAdminSession(sessionSecret(), expiresAt), maxAge: SESSION_DURATION_SECONDS };
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return false;
  return verifyAdminSession(sessionSecret(), token);
}
