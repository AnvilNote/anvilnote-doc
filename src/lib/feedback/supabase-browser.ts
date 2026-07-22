"use client";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./supabase-admin";

// Public/anon client for the browser. Only used to PUT an image straight to
// Storage using a short-lived signed URL/token issued by our own server —
// it never touches any table (no RLS policies exist for anon, by design).
let client: ReturnType<typeof createClient<Database>> | null = null;

export function supabaseBrowser() {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set");
  }
  client = createClient<Database>(url, key, {
    auth: { persistSession: false },
  });
  return client;
}
