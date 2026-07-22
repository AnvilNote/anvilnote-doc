import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/feedback/admin-auth";
import { supabaseAdmin } from "@/lib/feedback/supabase-admin";
import { sendFeedbackStatusEmail } from "@/lib/feedback/send-status-email";
import type { AppLocale } from "@/lib/i18n/routing";
import type { FeedbackCategory } from "@/lib/feedback/schema";

const batchSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
});

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = batchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const supabase = supabaseAdmin();
  const { data: candidates, error: fetchError } = await supabase
    .from("feedback_submissions")
    .select("id, seq, email, name, category, message, locale, status")
    .in("id", parsed.data.ids)
    .eq("status", "published");

  if (fetchError) {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
  if (!candidates || candidates.length === 0) {
    return NextResponse.json({ ok: true, updated: 0 });
  }

  const eligibleIds = candidates.map((row) => row.id);
  const { error: updateError } = await supabase
    .from("feedback_submissions")
    .update({ status: "in_progress", admin_reason: null })
    .in("id", eligibleIds);

  if (updateError) {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  await Promise.all(
    candidates.map((row) =>
      sendFeedbackStatusEmail({
        to: row.email,
        name: row.name ?? undefined,
        seq: row.seq,
        category: row.category as FeedbackCategory,
        message: row.message,
        locale: row.locale as AppLocale,
        transition: "in_progress",
      }).catch((error) => {
        console.error("Failed to send feedback status email", error);
      })
    )
  );

  return NextResponse.json({ ok: true, updated: eligibleIds.length });
}
