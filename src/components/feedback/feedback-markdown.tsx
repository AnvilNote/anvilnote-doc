import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function FeedbackMarkdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="mt-4 text-lg font-semibold tracking-[-0.01em] first:mt-0">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="mt-4 text-base font-semibold tracking-[-0.01em] first:mt-0">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="mt-3 text-sm font-semibold first:mt-0">{children}</h3>
        ),
        p: ({ children }) => (
          <p className="mt-2 text-sm leading-relaxed text-foreground first:mt-0">{children}</p>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-foreground"
          >
            {children}
          </a>
        ),
        ul: ({ children }) => <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{children}</ul>,
        ol: ({ children }) => <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">{children}</ol>,
        li: ({ children }) => <li>{children}</li>,
        img: ({ src, alt }) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={typeof src === "string" ? src : undefined}
            alt={alt ?? ""}
            className="mt-2 max-h-80 w-auto rounded-lg"
          />
        ),
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        del: ({ children }) => <del className="text-muted-foreground">{children}</del>,
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
