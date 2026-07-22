import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionCookie,
  verifyAdminCredentials,
} from "@/lib/feedback/admin-auth";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  if (!verifyAdminCredentials(parsed.data.username, parsed.data.password)) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  const { token, maxAge } = createAdminSessionCookie();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
  return response;
}
