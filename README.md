# AnvilNote Doc

`anvilnote-doc` is the public AnvilNote website: the localized marketing
landing page, the privacy policy, and the terms of use. It is a standalone
Next.js App Router project with no dependency on `anvilnote-web`, `anvilnote-api`,
or any editor code — it only ever serves these static-ish pages, so it
installs and deploys cleanly on its own (for example on Vercel).

`anvilnote-web` is the full desktop application (the editor itself), always
built in its Electron/browser "app" shape; it no longer has a public-web
build mode. This split exists so the marketing site's dependency tree stays
completely separate from the app's — the app depends on local sibling
packages (like `@anvilnote/ai-writer`) that only resolve on a full checkout
of the whole `anvilnote/` sibling-repo layout, which a standalone Vercel
clone of just one repo can never have.

## Development

```bash
make install
make dev
```

Or directly with pnpm:

```bash
pnpm install
pnpm dev
```

Opens at `http://localhost:3000`. Locales: `en`, `zh-TW`, `ja`, `ko`, `th`, `ru`
(see `src/lib/i18n/routing.ts`).

## Structure

- `src/app/[locale]/page.tsx` — the landing page (hero, tech-stack marquee,
  template showcase carousel, closing section). The `#demo` section is
  currently a placeholder reserved for a product demo video.
- `src/app/[locale]/privacy/page.tsx`, `terms/page.tsx` — legal pages,
  rendering markdown from `data/legal/{privacy,terms}/{locale}.md`.
- `src/components/landing/` — landing-page-only components (header, footer,
  hero particle canvas, showcase carousel).
- `src/components/legal/` — the shared legal-page markdown renderer.
- `i18n/{locale}.json` — only the `landing`, `legal`, `locale`, and
  `settings.appearance.theme` translation keys are needed here.
- `public/landing/{locale}/{slug}.png` — per-locale template preview
  screenshots shown in the showcase carousel.

## Testing

```bash
make test
make check   # lint + typecheck
```
