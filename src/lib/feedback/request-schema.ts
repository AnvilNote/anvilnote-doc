import { z } from "zod";
import { locales } from "@/lib/i18n/routing";
import { feedbackSchema } from "./schema";

// Wraps the domain schema (email + message, what actually gets stored) with
// request-only concerns: which locale to reply in, and a honeypot field a
// real person never sees or fills (hidden via CSS on the form).
export const feedbackRequestSchema = feedbackSchema.extend({
  locale: z.enum(locales),
  company: z.string().optional(),
});

export type FeedbackRequest = z.infer<typeof feedbackRequestSchema>;
