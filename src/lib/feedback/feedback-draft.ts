import type { FeedbackCategory } from "@/lib/feedback/schema";

// Feedback form fields are plain useState inside a Radix Dialog, which
// unmounts its content on close — an accidental outside-click, Escape, or
// tab switch used to wipe whatever the person had already typed with no way
// back. Persisted here instead of lifting state to the dialog's parent so
// it also survives a full page reload, not just a close/reopen within the
// same session.
const FEEDBACK_DRAFT_STORAGE_KEY = "anvilnote-feedback-draft";

export type FeedbackDraft = {
  email: string;
  name: string;
  title: string;
  category: FeedbackCategory;
  message: string;
};

export function readFeedbackDraft(): FeedbackDraft | null {
  try {
    const raw = localStorage.getItem(FEEDBACK_DRAFT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as FeedbackDraft;
  } catch {
    return null;
  }
}

export function writeFeedbackDraft(draft: FeedbackDraft) {
  try {
    localStorage.setItem(FEEDBACK_DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // Storage full or unavailable (e.g. private browsing) — draft-saving is
    // a nice-to-have, not worth surfacing an error over.
  }
}

export function clearFeedbackDraft() {
  try {
    localStorage.removeItem(FEEDBACK_DRAFT_STORAGE_KEY);
  } catch {
    // ignore
  }
}
