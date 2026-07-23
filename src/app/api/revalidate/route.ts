import { NextResponse, type NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { LATEST_RELEASE_TAG } from "@/lib/latest-release";

// Called by anvilnote-desktop's release-publish workflow so the download
// section picks up a new release immediately instead of waiting out the
// 1hr revalidate window in latest-release.ts.
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-revalidate-secret");
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  revalidateTag(LATEST_RELEASE_TAG, "max");
  return NextResponse.json({ revalidated: true, now: Date.now() });
}
