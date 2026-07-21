import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n/routing";
import { SITE_URL, languageAlternates } from "@/lib/seo";

const ROUTES = ["", "/privacy", "/terms"];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.flatMap((route) =>
    locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${route}`,
      alternates: { languages: languageAlternates(route) },
    })),
  );
}
