import ReactMarkdown from "react-markdown";
import { ChevronLeft } from "lucide-react";
import { Link } from "@/lib/i18n/navigation";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingFooter } from "@/components/landing/landing-footer";
import { fillRevealContentClass, fillRevealSurfaceClass } from "@/components/landing/fill-reveal";
import { LegalTableOfContents } from "@/components/legal/legal-table-of-contents";
import { extractLegalHeadings, extractLegalTableOfContents } from "@/lib/legal/table-of-contents";

export function LegalPage({
  backHome,
  tableOfContentsLabel,
  footerRights,
  footerPrivacy,
  footerTerms,
  footerFeedback,
  markdown,
}: {
  backHome: string;
  tableOfContentsLabel: string;
  footerRights: string;
  footerPrivacy: string;
  footerTerms: string;
  footerFeedback: string;
  markdown: string;
}) {
  const tableOfContents = extractLegalTableOfContents(markdown);
  const headings = extractLegalHeadings(markdown);
  let headingIndex = 0;

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <LandingHeader />

      <main className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 px-6 pt-32 pb-16 xl:grid-cols-[18rem_minmax(0,48rem)] xl:justify-center xl:gap-12 xl:px-0">
        <LegalTableOfContents label={tableOfContentsLabel} items={tableOfContents} />

        <article className="min-w-0 w-full max-w-3xl xl:max-w-none">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            {backHome}
          </Link>

          <div className="mt-6">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-4xl font-semibold tracking-[-0.04em] text-balance">{children}</h1>
              ),
              h2: ({ children }) => {
                const heading = headings[headingIndex++];
                return (
                  <h2
                    id={heading?.id}
                    className="mt-14 scroll-mt-28 text-2xl font-semibold tracking-[-0.03em]"
                  >
                    {children}
                  </h2>
                );
              },
              h3: ({ children }) => (
                <h3
                  id={headings[headingIndex++]?.id}
                  className="mt-8 scroll-mt-28 text-lg font-semibold tracking-[-0.015em]"
                >
                  {children}
                </h3>
              ),
              h4: ({ children }) => (
                <h4
                  id={headings[headingIndex++]?.id}
                  className="mt-6 scroll-mt-28 text-base font-medium tracking-[-0.01em]"
                >
                  {children}
                </h4>
              ),
              p: ({ children }) => (
                <p className="mt-3 text-base leading-8 text-muted-foreground first:mt-2">{children}</p>
              ),
              // Set an explicit weight and inherit the paragraph line height. This
              // keeps mixed CJK and Latin legal copy visually aligned instead of
              // relying on browser-specific <strong> defaults and font fallback.
              strong: ({ children }) => (
                <strong className="align-baseline font-semibold leading-8">{children}</strong>
              ),
              ol: ({ children }) => (
                <ol className="mt-3 list-decimal space-y-1 pl-6 text-base leading-8 text-muted-foreground">
                  {children}
                </ol>
              ),
              ul: ({ children }) => (
                <ul className="mt-3 list-disc space-y-1 pl-6 text-base leading-8 text-muted-foreground">
                  {children}
                </ul>
              ),
              li: ({ children }) => <li className="pl-1">{children}</li>,
              em: ({ children }) => <span className="text-sm text-muted-foreground">{children}</span>,
              // Legal copy is Markdown. Rendering its links here keeps every
              // inline email and project link consistent with the footer
              // without asking each translated document to carry styling.
              a: ({ children, href }) => (
                <a
                  href={href}
                  className={`${fillRevealSurfaceClass} inline-flex px-1 py-0.5 text-foreground`}
                >
                  <span className={fillRevealContentClass}>{children}</span>
                </a>
              ),
            }}
          >
            {markdown}
          </ReactMarkdown>
          </div>
        </article>
      </main>

      <LandingFooter
        rights={footerRights}
        privacy={footerPrivacy}
        terms={footerTerms}
        feedback={footerFeedback}
      />
    </div>
  );
}
