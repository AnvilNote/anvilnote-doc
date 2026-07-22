import { supabaseAdmin } from "./supabase-admin";
import type { AppLocale } from "@/lib/i18n/routing";
import type { FeedbackCategory, FeedbackStatus } from "./schema";

export interface FeedbackItem {
  id: string;
  seq: number;
  title: string;
  status: FeedbackStatus;
  category: FeedbackCategory;
  name: string | null;
  message: string;
  adminReason: string | null;
  createdAt: string;
}

export interface AdminFeedbackItem extends FeedbackItem {
  email: string;
  locale: AppLocale;
}

// Rejected submissions stay admin-only — not shown on the public board.
const PUBLIC_STATUSES = ["published", "in_progress", "done"] as const;

const LIST_COLUMNS =
  "id, seq, title, status, category, name, message, admin_reason, created_at";

export async function listPublicFeedback(): Promise<FeedbackItem[]> {
  const { data, error } = await supabaseAdmin()
    .from("feedback_submissions")
    .select(LIST_COLUMNS)
    .in("status", PUBLIC_STATUSES)
    .order("seq", { ascending: false });

  if (error || !data) return [];
  return data.map((row) => ({
    id: row.id,
    seq: row.seq,
    title: row.title,
    status: row.status as FeedbackStatus,
    category: row.category as FeedbackCategory,
    name: row.name,
    message: row.message,
    adminReason: row.admin_reason,
    createdAt: row.created_at,
  }));
}

export async function listAllFeedbackForAdmin(): Promise<AdminFeedbackItem[]> {
  const { data, error } = await supabaseAdmin()
    .from("feedback_submissions")
    .select(`${LIST_COLUMNS}, email, locale`)
    .order("seq", { ascending: false });

  if (error || !data) return [];
  return data.map((row) => ({
    id: row.id,
    seq: row.seq,
    title: row.title,
    status: row.status as FeedbackStatus,
    category: row.category as FeedbackCategory,
    name: row.name,
    message: row.message,
    adminReason: row.admin_reason,
    createdAt: row.created_at,
    email: row.email,
    locale: row.locale as AppLocale,
  }));
}

export async function getFeedbackForAdmin(id: string): Promise<AdminFeedbackItem | null> {
  const { data, error } = await supabaseAdmin()
    .from("feedback_submissions")
    .select(`${LIST_COLUMNS}, email, locale`)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return {
    id: data.id,
    seq: data.seq,
    title: data.title,
    status: data.status as FeedbackStatus,
    category: data.category as FeedbackCategory,
    name: data.name,
    message: data.message,
    adminReason: data.admin_reason,
    createdAt: data.created_at,
    email: data.email,
    locale: data.locale as AppLocale,
  };
}
