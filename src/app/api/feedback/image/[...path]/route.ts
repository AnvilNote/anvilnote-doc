import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/feedback/supabase-admin";
import { FEEDBACK_IMAGES_BUCKET } from "@/lib/feedback/image-limits";

/**
 * Serves feedback screenshots through our own domain instead of linking
 * straight to Supabase Storage — visitors and email recipients never see
 * the underlying project URL.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const filePath = path.join("/");

  const { data, error } = await supabaseAdmin().storage.from(FEEDBACK_IMAGES_BUCKET).download(filePath);
  if (error || !data) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return new NextResponse(data, {
    headers: {
      "Content-Type": data.type || "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
