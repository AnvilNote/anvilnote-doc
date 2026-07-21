import { locales, type AppLocale } from "@/lib/i18n/routing";

export const SITE_URL = "https://anvilnote.org";

// og:locale wants underscore region codes, not BCP-47 hyphens.
const OG_LOCALES: Record<AppLocale, string> = {
  en: "en_US",
  "zh-TW": "zh_TW",
  ja: "ja_JP",
  ko: "ko_KR",
  th: "th_TH",
  ru: "ru_RU",
};

export function ogLocaleFor(locale: AppLocale): string {
  return OG_LOCALES[locale];
}

export function otherOgLocales(locale: AppLocale): string[] {
  return locales.filter((l) => l !== locale).map((l) => OG_LOCALES[l]);
}

// Every locale is always prefixed (routing.ts uses next-intl's default
// localePrefix: "always") — canonical/hreflang paths all include it, "en"
// included, there is no bare unprefixed route.
export function localizedPath(locale: AppLocale, path = ""): string {
  return `/${locale}${path}`;
}

// Absolute (not relative) so the same values work both in page metadata
// <link> tags and in sitemap.xml, whose hreflang entries the sitemap spec
// requires to be fully-qualified URLs.
function absolute(path: string): string {
  return `${SITE_URL}${path}`;
}

/** hreflang alternates for every supported locale, plus x-default. */
export function languageAlternates(path = ""): Record<string, string> {
  const entries = locales.map((locale) => [locale, absolute(localizedPath(locale, path))] as const);
  return {
    ...Object.fromEntries(entries),
    "x-default": absolute(localizedPath("en", path)),
  };
}
