import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/feedback/admin-auth";
import { supabaseAdmin } from "@/lib/feedback/supabase-admin";
import { getFeedbackForAdmin } from "@/lib/feedback/list-feedback";
import { canTransition } from "@/lib/feedback/status-transitions";
import type { FeedbackStatus } from "@/lib/feedback/schema";
import { sendFeedbackStatusEmail } from "@/lib/feedback/send-status-email";

const actionSchema = z
  .object({
    action: z.enum(["accept", "reject", "done"]),
    reason: z.string().trim().max(2000).optional(),
  })
  .refine((value) => value.action !== "reject" || !!value.reason, {
    message: "reason is required to reject feedback",
    path: ["reason"],
  });

const TARGET_STATUS: Record<z.infer<typeof actionSchema>["action"], FeedbackStatus> = {
  accept: "in_progress",
  reject: "rejected",
  done: "done",
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const item = await getFeedbackForAdmin(id);
  if (!item) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const targetStatus = TARGET_STATUS[parsed.data.action];
  if (!canTransition(item.status, targetStatus)) {
    return NextResponse.json({ error: "invalid_transition" }, { status: 409 });
  }

  const reason = parsed.data.reason ?? null;
  const { error: updateError } = await supabaseAdmin()
    .from("feedback_submissions")
    .update({ status: targetStatus, admin_reason: reason })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  try {
    await sendFeedbackStatusEmail({
      to: item.email,
      name: item.name ?? undefined,
      seq: item.seq,
      category: item.category,
      message: item.message,
      locale: item.locale,
      transition: targetStatus as "in_progress" | "rejected" | "done",
      reason: reason ?? undefined,
    });
  } catch (error) {
    console.error("Failed to send feedback status email", error);
  }

  return NextResponse.json({ ok: true, status: targetStatus });
}
