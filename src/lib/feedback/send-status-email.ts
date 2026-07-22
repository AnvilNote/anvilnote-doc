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

export type FeedbackStatusTransition = "in_progress" | "rejected" | "done";

/**
 * Best-effort: the status change is already committed in the database by
 * the time this runs. Callers should catch and log, not fail the request.
 */
export async function sendFeedbackStatusEmail(input: {
  to: string;
  name?: string;
  seq: number;
  category: FeedbackCategory;
  message: string;
  locale: AppLocale;
  transition: FeedbackStatusTransition;
  reason?: string;
}): Promise<void> {
  const t = await getTranslations({ locale: input.locale, namespace: "feedback" });
  const tEmail = await getTranslations({ locale: input.locale, namespace: "feedback.email" });
  const tStatus = await getTranslations({
    locale: input.locale,
    namespace: `feedback.email.status.${input.transition}`,
  });

  const intro = input.name ? tStatus("introNamed", { name: input.name }) : tStatus("introAnonymous");

  let message = truncateForEmailPreview(input.message);
  if (input.transition === "rejected" && input.reason) {
    message = `${message}\n\n${tEmail("reasonLabel")}: ${input.reason}`;
  }

  const shared = {
    greeting: tEmail("greeting"),
    intro,
    categoryLabel: tEmail("categoryLabel"),
    categoryValue: t(`category.${input.category}`),
    message,
    viewLink: tEmail("viewLink"),
    viewUrl: `${SITE_URL}${localizedPath(input.locale, "/feedback")}?id=${input.seq}`,
    closing: tStatus("closing"),
    signature: tEmail("signature"),
    doNotReply: tEmail("doNotReply"),
    contactUs: tEmail("contactUs"),
  };

  const html = buildEmailHtml({ heading: tStatus("heading"), ...shared });
  const text = buildEmailText(shared);

  await resendClient().emails.send({
    from: FROM_ADDRESS,
    to: input.to,
    subject: tStatus("subject"),
    html,
    text,
  });
}
