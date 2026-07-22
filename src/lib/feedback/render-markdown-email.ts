import { marked } from "marked";

// Emails can't rely on the site's CSS, so headings/images get explicit
// inline styles; raw HTML tokens are dropped since email clients (and the
// people receiving these emails) shouldn't get arbitrary injected markup.
marked.use({
  gfm: true,
  breaks: true,
  renderer: {
    heading({ tokens, depth }) {
      const text = this.parser.parseInline(tokens);
      const fontSize = depth === 1 ? "18px" : depth === 2 ? "16px" : "14px";
      return `<h${depth} style="margin:16px 0 8px 0;font-size:${fontSize};font-weight:600;color:#18181b;">${text}</h${depth}>`;
    },
    image({ href, text }) {
      return `<img src="${href}" alt="${text}" style="max-width:100%;height:auto;border-radius:8px;margin-top:8px;" />`;
    },
    html() {
      return "";
    },
  },
});

export function renderMarkdownForEmail(markdown: string): string {
  return marked.parse(markdown, { async: false }) as string;
}
