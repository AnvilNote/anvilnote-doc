import { NextResponse, type NextRequest } from "next/server";
import { feedbackRequestSchema } from "@/lib/feedback/request-schema";
import { supabaseAdmin } from "@/lib/feedback/supabase-admin";
import { sendFeedbackConfirmationEmail } from "@/lib/feedback/send-confirmation-email";

const RATE_LIMIT_WINDOW_MINUTES = 60;
const RATE_LIMIT_MAX_SUBMISSIONS = 3;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = feedbackRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  // Honeypot: a real person never sees or fills this field (hidden via CSS
  // on the form). Report success so a bot can't tell its submission was
  // silently discarded.
  if (parsed.data.company) {
    return NextResponse.json({ ok: true });
  }

  const { email, title, name, category, message, locale } = parsed.data;
  const supabase = supabaseAdmin();

  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60_000).toISOString();
  const { count, error: countError } = await supabase
    .from("feedback_submissions")
    .select("id", { count: "exact", head: true })
    .eq("email", email)
    .gte("created_at", since);

  if (countError) {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
  if ((count ?? 0) >= RATE_LIMIT_MAX_SUBMISSIONS) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const { data: inserted, error: insertError } = await supabase
    .from("feedback_submissions")
    .insert({ email, title, name, category, message, locale })
    .select("seq")
    .single();

  if (insertError || !inserted) {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  // Best-effort: the feedback is already safely stored, so a flaky email
  // provider should never turn into a failure response for the person.
  try {
    await sendFeedbackConfirmationEmail({
      to: email,
      name,
      seq: inserted.seq,
      category,
      message,
      locale,
    });
  } catch (error) {
    console.error("Failed to send feedback confirmation email", error);
  }

  return NextResponse.json({ ok: true });
}
