import { z } from "zod";

export const FEEDBACK_CATEGORIES = ["bug", "feature", "general", "other"] as const;
export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

export const FEEDBACK_STATUSES = ["published", "in_progress", "rejected", "done"] as const;
export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number];

export const TITLE_MAX_LENGTH = 15;

export const feedbackSchema = z.object({
  email: z.string().trim().email(),
  title: z.string().trim().min(1).max(TITLE_MAX_LENGTH),
  category: z.enum(FEEDBACK_CATEGORIES),
  message: z.string().trim().min(5).max(2000),
  // Blank/whitespace-only counts as "didn't provide a name" (anonymous),
  // not a validation error — the person just left it empty.
  name: z
    .string()
    .trim()
    .max(60)
    .transform((v) => (v.length > 0 ? v : undefined))
    .optional(),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;
