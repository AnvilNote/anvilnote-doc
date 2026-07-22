import { getTranslations } from "next-intl/server";
import type { AppLocale } from "@/lib/i18n/routing";
import { localizedPath, SITE_URL } from "@/lib/seo";
import type { FeedbackCategory } from "./schema";
import {
  FROM_ADDRESS,
  buildEmailHtml,
  buildEmailText,
  resendClient,
  truncateForEmailPreview,
} from "./email-template";

/**
 * Best-effort: a failed confirmation email should never fail the person's
 * actual feedback submission, which is already safely stored by the time
 * this runs. Callers should catch and log, not surface this to the person.
 */
export async function sendFeedbackConfirmationEmail(input: {
  to: string;
  name?: string;
  seq: number;
  category: FeedbackCategory;
  message: string;
  locale: AppLocale;
}): Promise<void> {
  const t = await getTranslations({ locale: input.locale, namespace: "feedback" });
  const tEmail = await getTranslations({ locale: input.locale, namespace: "feedback.email" });

  const intro = input.name
    ? tEmail("introNamed", { name: input.name })
    : tEmail("introAnonymous");

  const shared = {
    greeting: tEmail("greeting"),
    intro,
    categoryLabel: tEmail("categoryLabel"),
    categoryValue: t(`category.${input.category}`),
    message: truncateForEmailPreview(input.message),
    viewLink: tEmail("viewLink"),
    viewUrl: `${SITE_URL}${localizedPath(input.locale, "/feedback")}?id=${input.seq}`,
    closing: tEmail("closing"),
    signature: tEmail("signature"),
    doNotReply: tEmail("doNotReply"),
    contactUs: tEmail("contactUs"),
  };

  const html = buildEmailHtml({ heading: tEmail("heading"), ...shared });
  const text = buildEmailText(shared);

  await resendClient().emails.send({
    from: FROM_ADDRESS,
    to: input.to,
    subject: tEmail("subject"),
    html,
    text,
  });
}
