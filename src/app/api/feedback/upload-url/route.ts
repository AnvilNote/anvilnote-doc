import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { supabaseAdmin } from "@/lib/feedback/supabase-admin";
import { FEEDBACK_IMAGES_BUCKET } from "@/lib/feedback/image-limits";

/**
 * Issues a short-lived signed upload URL for one feedback image. The
 * browser then PUTs the file bytes directly to Storage using that URL —
 * our server never sees the image data, and the browser never sees the
 * service_role key.
 */
export async function POST(request: NextRequest) {
  const supabase = supabaseAdmin();
  const path = `${randomUUID()}.png`;

  const { data, error } = await supabase.storage
    .from(FEEDBACK_IMAGES_BUCKET)
    .createSignedUploadUrl(path);

  if (error || !data) {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  // Derived from the request rather than the hardcoded SITE_URL constant so
  // this also resolves correctly against localhost during local testing.
  const origin = new URL(request.url).origin;

  return NextResponse.json({
    path: data.path,
    token: data.token,
    publicUrl: `${origin}/api/feedback/image/${path}`,
  });
}
