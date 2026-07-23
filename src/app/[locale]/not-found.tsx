"use client";

import { useLocale, useTranslations } from "next-intl";
import { NotFoundContent } from "@/components/app/not-found-content";

// Handles the common case: a valid locale with an unmatched sub-path (e.g.
// /zh-TW/some-typo). The parent [locale]/layout.tsx has already rendered its
// NextIntlClientProvider by the time Next swaps this in, so useTranslations
// works here without needing the locale as an explicit prop (not-found.js
// boundaries don't receive route params).
export default function LocaleNotFound() {
  const t = useTranslations("notFound");
  const tLegal = useTranslations("legal");
  const locale = useLocale();
  return (
    <NotFoundContent
      title={t("title")}
      message={t("message")}
      homeHref={`/${locale}`}
      backHomeLabel={tLegal("backHome")}
    />
  );
}
