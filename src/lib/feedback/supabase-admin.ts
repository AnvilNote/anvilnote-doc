import { createClient } from "@supabase/supabase-js";

// Minimal hand-written schema (not full supabase-gen output) — just enough
// to type the one table this app touches. Extend here if more tables get
// added rather than pulling in codegen for a single-table app.
export interface Database {
  public: {
    Tables: {
      feedback_submissions: {
        Row: {
          id: string;
          seq: number;
          email: string;
          name: string | null;
          title: string;
          category: string;
          message: string;
          status: string;
          admin_reason: string | null;
          locale: string;
          created_at: string;
        };
        Insert: {
          email: string;
          title: string;
          category: string;
          message: string;
          locale: string;
          name?: string | null;
          status?: string;
          admin_reason?: string | null;
          id?: string;
          seq?: number;
          created_at?: string;
        };
        Update: Partial<{
          email: string;
          name: string | null;
          title: string;
          category: string;
          message: string;
          status: string;
          admin_reason: string | null;
        }>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// Service-role client for server-only code (API routes). Never import this
// from a client component — the service role key bypasses row-level
// security entirely, which is exactly why it must stay server-side.
let client: ReturnType<typeof createClient<Database>> | null = null;

export function supabaseAdmin() {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  }
  client = createClient<Database>(url, key, {
    auth: { persistSession: false },
  });
  return client;
}
