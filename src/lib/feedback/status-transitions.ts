import type { FeedbackStatus } from "./schema";

const ALLOWED_TRANSITIONS: Record<FeedbackStatus, readonly FeedbackStatus[]> = {
  published: ["in_progress", "rejected"],
  in_progress: ["done"],
  rejected: [],
  done: [],
};

export function canTransition(from: FeedbackStatus, to: FeedbackStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}
