import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ChevronDown } from "lucide-react";
import type { AppLocale } from "@/lib/i18n/routing";
import { languageAlternates, localizedPath } from "@/lib/seo";
import { HeroParticles } from "@/components/landing/hero-particles";
import { ParallaxLayer } from "@/components/landing/parallax-layer";
import { ScrollDownLink } from "@/components/landing/scroll-down-link";
import { DemoVideo } from "@/components/landing/demo-video";
import { ShowcaseCarousel } from "@/components/landing/showcase-carousel";
import { DownloadButtons } from "@/components/landing/download-buttons";
import { getLatestDesktopRelease } from "@/lib/latest-release";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingFooter } from "@/components/landing/landing-footer";

type LandingCopy = {
  heroLabel: string;
  heroLine1: string;
  heroLine2Before: string;
  heroHighlight: string;
  heroLine2After: string;
  heroLine3: string;
  heroKicker: string;
  cta: string;
  secondaryCta: string;
  showcaseTitle: string;
  showcaseDescription: string;
  downloadTitle: string;
  downloadSubtitle: string;
  footerRights: string;
  footerPrivacy: string;
  footerTerms: string;
  closingTitle: string;
  closingDescription: string;
  closingCta: string;
};

// Curated subset of templates shown in the carousel (not the full roster).
// Each has a screenshot per locale under public/landing/{locale}/{slug}.png,
// generated from the same localized sample document used for template
// previews in anvilnote-web/anvilnote-api.
const SHOWCASE_SLUGS = [
  { slug: "plain-note", alt: "Plain Note template preview" },
  { slug: "flow-way", alt: "Flow Way template preview" },
  { slug: "bubble", alt: "Bubble template preview" },
  { slug: "hetvid", alt: "Hetvid template preview" },
  { slug: "typsidian", alt: "Typsidian template preview" },
  { slug: "obelisk", alt: "Obelisk template preview" },
  { slug: "metropole-report", alt: "Metropole Report template preview" },
  { slug: "elsearticle", alt: "Elsearticle template preview" },
];

function showcaseItemsFor(locale: AppLocale) {
  return SHOWCASE_SLUGS.map(({ slug, alt }) => ({
    src: `/landing/${locale}/${slug}.png`,
    alt,
  }));
}

// Simple Icons-style marks are single-color SVGs (fill="#111111") — invisible
// against a dark background, so each one ships a light-fill "-dark" twin
// (same convention as the header's favicon-dark/favicon-light swap).
const techStack = [
  { name: "Next.js", src: "/tech-logos/nextdotjs.svg", darkSrc: "/tech-logos/nextdotjs-dark.svg", width: 110, height: 22 },
  { name: "React", src: "/tech-logos/react.svg", darkSrc: "/tech-logos/react-dark.svg", width: 92, height: 22 },
  { name: "Tiptap", src: "/tech-logos/tiptap.png", darkSrc: null, width: 28, height: 28 },
  { name: "TypeScript", src: "/tech-logos/typescript.svg", darkSrc: "/tech-logos/typescript-dark.svg", width: 126, height: 24 },
  { name: "Tailwind CSS", src: "/tech-logos/tailwindcss.svg", darkSrc: "/tech-logos/tailwindcss-dark.svg", width: 142, height: 18 },
  { name: "shadcn/ui", src: "/tech-logos/shadcnui.svg", darkSrc: "/tech-logos/shadcnui-dark.svg", width: 112, height: 22 },
  { name: "Radix UI", src: "/tech-logos/radixui.svg", darkSrc: "/tech-logos/radixui-dark.svg", width: 110, height: 20 },
  { name: "Typst", src: "/tech-logos/typst.svg", darkSrc: "/tech-logos/typst-dark.svg", width: 90, height: 22 },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    alternates: {
      canonical: localizedPath(locale),
      languages: languageAlternates(),
    },
  };
}

export default async function LocaleIndexPage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landing" });
  const release = await getLatestDesktopRelease();
  const copy: LandingCopy = {
    heroLabel: t("hero.label"),
    heroLine1: t("hero.line1"),
    heroLine2Before: t("hero.line2Before"),
    heroHighlight: t("hero.highlight"),
    heroLine2After: t("hero.line2After"),
    heroLine3: t("hero.line3"),
    heroKicker: t("hero.kicker"),
    cta: t("hero.cta"),
    secondaryCta: t("hero.secondaryCta"),
    showcaseTitle: t("showcase.title"),
    showcaseDescription: t("showcase.description"),
    downloadTitle: t("download.title"),
    downloadSubtitle: t("download.subtitle"),
    footerRights: t("footer.rights", { year: new Date().getFullYear() }),
    footerPrivacy: t("footer.privacy"),
    footerTerms: t("footer.terms"),
    closingTitle: t("closing.title"),
    closingDescription: t("closing.description"),
    closingCta: t("closing.cta"),
  };

  return (
    <div className="bg-background text-foreground">
      {/* Fixed so it stays pinned while scrolling. Lifted out of the hero
          <section> because that section is overflow-hidden (for the particle
          canvas), which would otherwise clip a sticky header out of view. */}
      <LandingHeader />

      <main>
        <section className="relative overflow-hidden">
          {/* Particle field is a decorative extra, not worth the canvas/paint
              cost on small screens — hidden below sm instead of just pausing
              its animation (hero-particles.tsx already skips motion on
              mobile, but still mounts the canvas if not hidden here). */}
          <div className="hidden sm:block">
            <ParallaxLayer speed={0.4}>
              <HeroParticles />
            </ParallaxLayer>
          </div>
          <div className="relative mx-auto w-full max-w-7xl px-6 py-8 lg:px-10 lg:py-10">
            <div className="px-1 pt-24 pb-16 text-center lg:pt-32 lg:pb-18">
              <div className="mx-auto max-w-6xl text-[3.2rem] leading-[0.93] font-semibold tracking-[-0.08em] sm:text-[4.6rem] lg:text-[6.4rem]">
                <div className="text-balance">{copy.heroLine1}</div>
                {copy.heroLine2Before ? (
                  <div className="text-balance">{copy.heroLine2Before}</div>
                ) : null}
                {/* Highlight always sits alone on its own line — mixing it
                    with heroLine2Before/After on one flex row let the browser
                    wrap the surrounding text awkwardly mid-phrase. */}
                <div>
                  <span className="inline-block bg-foreground px-[0.2em] py-[0.06em] text-background">
                    {copy.heroHighlight}
                  </span>
                </div>
                {copy.heroLine2After ? (
                  <div className="text-balance">{copy.heroLine2After}</div>
                ) : null}
                <div className="text-balance">{copy.heroLine3}</div>
              </div>
              <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-foreground/76">
                {copy.heroKicker}
              </p>

              <div className="mt-16 flex items-center justify-center">
                <ScrollDownLink
                  targetId="demo"
                  ariaLabel={copy.secondaryCta}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ChevronDown className="size-7" />
                </ScrollDownLink>
              </div>
            </div>
          </div>
        </section>

        <section id="demo" className="px-6 pt-10 pb-8 lg:px-10 lg:pt-16 lg:pb-10">
          <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-[2rem] border border-border shadow-[0_24px_80px_-48px_rgba(0,0,0,0.38)]">
            <DemoVideo src="/landing/demo.mp4" poster="/landing/demo-poster.jpg" />
          </div>
        </section>

        <section className="py-7 lg:py-9">
          <div className="relative mx-auto w-full max-w-7xl overflow-hidden px-6 lg:px-10">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-background to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-background to-transparent" />
            <div className="landing-marquee-track flex w-max items-center">
              {[0, 1].map((groupIndex) => (
                <div
                  key={groupIndex}
                  className="landing-marquee-group flex shrink-0 items-center gap-5 pr-5 whitespace-nowrap"
                  aria-hidden={groupIndex === 1}
                >
                  {techStack.map((item) => (
                    <div
                      key={`${groupIndex}-${item.name}`}
                      className="flex min-h-28 min-w-[9.5rem] flex-col items-center justify-center gap-3 rounded-[1.5rem] px-6 py-4"
                    >
                      <div className="flex h-20 items-center justify-center">
                        <Image
                          src={item.src}
                          alt={item.name}
                          width={item.width}
                          height={item.height}
                          className={`h-14 w-auto object-contain ${item.darkSrc ? "dark:hidden" : ""}`}
                          unoptimized
                        />
                        {item.darkSrc ? (
                          <Image
                            src={item.darkSrc}
                            alt={item.name}
                            width={item.width}
                            height={item.height}
                            className="hidden h-14 w-auto object-contain dark:block"
                            unoptimized
                          />
                        ) : null}
                      </div>
                      <span className="text-sm font-medium tracking-[-0.02em] text-muted-foreground">
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-border/70">
          <div className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-10 lg:py-12">
            <div className="max-w-2xl">
              <p className="text-[0.68rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
                {copy.showcaseTitle}
              </p>
              <p className="mt-5 text-base leading-8 whitespace-pre-line text-muted-foreground sm:text-lg">
                {copy.showcaseDescription}
              </p>
            </div>

            <ShowcaseCarousel items={showcaseItemsFor(locale)} />
          </div>
        </section>

        <section className="border-b border-border/70">
          <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-6 px-6 py-16 text-center lg:px-10 lg:py-20">
            <div className="max-w-xl">
              <p className="text-3xl leading-tight font-semibold tracking-[-0.04em] text-balance sm:text-4xl">
                {copy.downloadTitle}
              </p>
              <p className="mt-4 text-base leading-8 text-muted-foreground sm:text-lg">
                {copy.downloadSubtitle}
              </p>
            </div>

            <DownloadButtons
              macOS={release.macOS}
              windows={release.windows}
              linux={release.linux}
              versionLabel={t("download.version", { version: release.version })}
            />
          </div>
        </section>

        <section>
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-16 lg:flex-row lg:items-end lg:justify-between lg:px-10 lg:py-20">
            <div className="max-w-2xl">
              <p className="text-4xl leading-tight font-semibold tracking-[-0.05em] text-balance whitespace-pre-line sm:text-5xl">
                {copy.closingTitle}
              </p>
              <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
                {copy.closingDescription}
              </p>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter
        rights={copy.footerRights}
        privacy={copy.footerPrivacy}
        terms={copy.footerTerms}
      />
    </div>
  );
}
