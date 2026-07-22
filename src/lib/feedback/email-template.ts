import { Resend } from "resend";
import { SITE_URL } from "@/lib/seo";
import { renderMarkdownForEmail } from "./render-markdown-email";

export const FROM_ADDRESS = "AnvilNote <no-reply@anvilnote.org>";
const LOGO_URL = `${SITE_URL}/email-logo.png`;

export const CONTACT_LINKS = {
  facebook: "https://www.facebook.com/anvilnoteapp/",
  instagram: "https://www.instagram.com/anvilnoteapp/",
  email: "contact@anvilnote.org",
};

const MESSAGE_PREVIEW_MAX_CHARS = 280;

/** Long feedback bodies get cut short in emails; the view link covers the rest. */
export function truncateForEmailPreview(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length <= MESSAGE_PREVIEW_MAX_CHARS) return trimmed;
  return `${trimmed.slice(0, MESSAGE_PREVIEW_MAX_CHARS).trimEnd()}…`;
}

let resend: Resend | null = null;

export function resendClient() {
  if (resend) return resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY must be set");
  resend = new Resend(key);
  return resend;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Hosted SVG files (not inline <svg>, which Gmail and others strip out of
// email HTML) matching the same FontAwesome brand icons the site's own
// footer uses.
function contactIcon(name: string): string {
  return `<img src="${SITE_URL}/email-icon-${name}.svg" width="14" height="14" alt="" style="vertical-align:middle;margin-right:6px;" />`;
}

const FACEBOOK_ICON = contactIcon("facebook");
const INSTAGRAM_ICON = contactIcon("instagram");
const ENVELOPE_ICON = contactIcon("envelope");

function contactCell(href: string, icon: string, label: string): string {
  return `<td style="padding:0 10px;">
    <a href="${href}" style="color:#71717a;text-decoration:none;font-size:13px;white-space:nowrap;">${icon}${escapeHtml(label)}</a>
  </td>`;
}

export function buildEmailHtml(input: {
  heading: string;
  greeting: string;
  intro: string;
  categoryLabel: string;
  categoryValue: string;
  message: string;
  viewLink: string;
  viewUrl: string;
  closing: string;
  signature: string;
  doNotReply: string;
  contactUs: string;
}): string {
  const message = renderMarkdownForEmail(input.message);
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body style="margin:0;padding:32px 16px;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background-color:#ffffff;overflow:hidden;border:1px solid #e4e4e7;">
            <tr>
              <td style="padding:32px 32px 0 32px;text-align:center;">
                <img src="${LOGO_URL}" width="40" height="40" alt="AnvilNote" style="display:inline-block;" />
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px 0 32px;text-align:center;">
                <h1 style="margin:0;font-size:20px;line-height:28px;color:#18181b;font-weight:600;">${escapeHtml(input.heading)}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 0 32px;color:#3f3f46;font-size:14px;line-height:22px;">
                <p style="margin:0 0 12px 0;">${escapeHtml(input.greeting)}</p>
                <p style="margin:0 0 16px 0;">${escapeHtml(input.intro)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;">
                  <tr>
                    <td style="padding:16px 20px;">
                      <p style="margin:0 0 8px 0;font-size:11px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;color:#71717a;">${escapeHtml(input.categoryLabel)}: ${escapeHtml(input.categoryValue)}</p>
                      <p style="margin:0;font-size:14px;line-height:22px;color:#18181b;">${message}</p>
                    </td>
                  </tr>
                </table>
                <p style="margin:8px 0 0;text-align:right;font-size:12px;">
                  <a href="${input.viewUrl}" style="color:#71717a;">${escapeHtml(input.viewLink)} →</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 32px 32px;color:#3f3f46;font-size:14px;line-height:22px;">
                <p style="margin:0 0 16px 0;">${escapeHtml(input.closing)}</p>
                <p style="margin:0;color:#71717a;">${escapeHtml(input.signature)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px 24px 32px;border-top:1px solid #e4e4e7;color:#a1a1aa;font-size:12px;line-height:20px;">
                <p style="margin:0 0 8px 0;text-align:center;">${escapeHtml(input.contactUs)}</p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center">
                      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                        <tr>
                          ${contactCell(CONTACT_LINKS.facebook, FACEBOOK_ICON, "AnvilNote")}
                          ${contactCell(CONTACT_LINKS.instagram, INSTAGRAM_ICON, "@anvilnoteapp")}
                          ${contactCell(`mailto:${CONTACT_LINKS.email}`, ENVELOPE_ICON, CONTACT_LINKS.email)}
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">
            <tr>
              <td style="padding:16px 8px 4px 8px;text-align:center;font-size:12px;color:#a1a1aa;">
                ${escapeHtml(input.doNotReply)}
              </td>
            </tr>
            <tr>
              <td style="padding:0 8px 16px 8px;text-align:center;font-size:12px;color:#a1a1aa;">
                AnvilNote · anvilnote.org
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function buildEmailText(input: {
  greeting: string;
  intro: string;
  categoryLabel: string;
  categoryValue: string;
  message: string;
  viewLink: string;
  viewUrl: string;
  closing: string;
  signature: string;
  doNotReply: string;
  contactUs: string;
}): string {
  return [
    input.greeting,
    "",
    input.intro,
    "",
    `${input.categoryLabel}: ${input.categoryValue}`,
    input.message,
    "",
    `${input.viewLink}: ${input.viewUrl}`,
    "",
    input.closing,
    "",
    input.signature,
    "",
    input.contactUs,
    `Facebook: ${CONTACT_LINKS.facebook}`,
    `Instagram: ${CONTACT_LINKS.instagram}`,
    `Email: ${CONTACT_LINKS.email}`,
    "",
    input.doNotReply,
  ].join("\n");
}
