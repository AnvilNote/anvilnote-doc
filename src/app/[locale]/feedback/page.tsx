import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import type { AppLocale } from "@/lib/i18n/routing";
import { languageAlternates, localizedPath } from "@/lib/seo";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingFooter } from "@/components/landing/landing-footer";
import { FeedbackBoard } from "@/components/feedback/feedback-board";
import { listPublicFeedback } from "@/lib/feedback/list-feedback";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "feedback" });
  return {
    title: t("boardTitle"),
    alternates: {
      canonical: localizedPath(locale, "/feedback"),
      languages: languageAlternates("/feedback"),
    },
  };
}

export default async function FeedbackPage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}) {
  const { locale } = await params;
  const tFooter = await getTranslations({ locale, namespace: "landing.footer" });
  const items = await listPublicFeedback();

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <LandingHeader />

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 pt-32 pb-16 lg:px-0">
        <Suspense>
          <FeedbackBoard items={items} />
        </Suspense>
      </main>

      <LandingFooter
        rights={tFooter("rights", { year: new Date().getFullYear() })}
        privacy={tFooter("privacy")}
        terms={tFooter("terms")}
        feedback={tFooter("feedback")}
      />
    </div>
  );
}
