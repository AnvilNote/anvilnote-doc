import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { AppLocale } from "@/lib/i18n/routing";
import { LegalPage } from "@/components/legal/legal-page";
import { readLegalDoc } from "@/lib/legal/read-legal-doc";
import { languageAlternates, localizedPath } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landing.footer" });
  return {
    title: t("terms"),
    alternates: {
      canonical: localizedPath(locale, "/terms"),
      languages: languageAlternates("/terms"),
    },
  };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });
  const tFooter = await getTranslations({ locale, namespace: "landing.footer" });

  return (
    <LegalPage
      backHome={t("backHome")}
      footerRights={tFooter("rights", { year: new Date().getFullYear() })}
      footerPrivacy={tFooter("privacy")}
      footerTerms={tFooter("terms")}
      markdown={readLegalDoc("terms", locale)}
    />
  );
}
