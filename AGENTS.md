# rdlabo-docs

`rdlabo-docs` is the monorepo for rdlabo's public sites. It builds two static Angular applications:

| App                  | Path                | Domain            |
| -------------------- | ------------------- | ----------------- |
| Documentation portal | `projects/docs`     | `docs.rdlabo.dev` |
| Top site             | `projects/web-site` | `rdlabo.dev`      |

The documentation portal generates bilingual pages from source packages (pinned in `package-lock.json`) and Markdown under `projects/docs/src/{project}/docs/`. The top site publishes reviewed English translations of selected Zenn and note articles from `projects/web-site/src/articles/`.

## Quick reference

| Task                                               | Where                                                                                                                                                                                     |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Add/remove a project, change page list or metadata | `scripts/project-manifest.ts`                                                                                                                                                             |
| Write/edit Japanese documentation                  | `projects/docs/src/{project}/docs/ja/`                                                                                                                                                    |
| Write/edit English for portal-hosted projects      | `projects/docs/src/{project}/docs/` (read via GitHub raw, not local checkout)                                                                                                             |
| Write/edit English for package-hosted projects     | The OSS package repository                                                                                                                                                                |
| Bump a package version                             | `package.json` pin → `npm install` → `npm run docs:generate`                                                                                                                              |
| Regenerate all pages                               | `npm run docs:generate` (output: `projects/docs/src/app/generated/` — never edit by hand)                                                                                                 |
| Write/edit English article translations            | `projects/web-site/src/articles/*.md`                                                                                                                                                     |
| Regenerate article catalog, HTML, and cover images | `npm run articles:generate` (output: `projects/web-site/src/app/generated/`, `projects/web-site/public/article-images/`, and `projects/web-site/public/sitemap.xml` — never edit by hand) |
| Start the top site locally                         | `npm run start:web-site`                                                                                                                                                                  |
| Build or deploy one app                            | `npm run build:docs` / `build:web-site` / `deploy:docs` / `deploy:web-site`                                                                                                               |

## Page roles

| Page                                                                          | Role                                                                                                                                                                                                                                                    |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Landing (`readme.md`, `getting-started.md`, etc.)                             | Overview, install, setup, short usage example, feature explanations, links to guides. Nav titles: `Getting Started` / `はじめに`. For rdlabo Capacitor plugins this file lives in the OSS repository and may include `<docgen-index>` / `<docgen-api>`. |
| Capacitor grouping pages (`code-scanner.md`, `payment-sheet.md`, `banner.md`) | One grouping object per file; kebab-case slug of the object. Related methods are sections on that page. Landing links here; formal signatures stay on `api.md`.                                                                                         |
| Guide pages (`http-auth.md`, `configuration.md`, etc.)                        | Feature or task documentation with examples. May use `!::...::` placeholders for formal signatures.                                                                                                                                                     |
| `api.md`                                                                      | Formal API reference: signatures, parameter tables, interfaces, enums, defaults.                                                                                                                                                                        |
| `code:`-referenced files (`.ts.md`, `.xml.md`, etc.)                          | Code examples and data. Not translated. May use `file:` front matter or ` ```lang:filename ` syntax.                                                                                                                                                    |

## Content ownership

| Content                                             | Source of truth                                      | Edit in                                                                                                          |
| --------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| English guides and landing pages                    | GitHub raw (package repo first, then portal repo)    | Package repo when docs are published there; otherwise `projects/docs/src/{project}/docs/` in this repo on GitHub |
| Japanese guides and landing pages                   | `projects/docs/src/{project}/docs/ja/*.md` only      | This portal                                                                                                      |
| `!::Identifier::` API signatures                    | Installed npm package `dist/docs.json`               | Package repo; release and bump the pin here                                                                      |
| Docgen API page (`<docgen-index>` + `<docgen-api>`) | Package or portal `readme.md` on GitHub              | Same repository as the English landing page                                                                      |
| Code example files (`code:` refs)                   | `projects/docs/src/{project}/docs/` (not translated) | This portal                                                                                                      |
| English article translations                        | `projects/web-site/src/articles/*.md`                | This repo                                                                                                        |
| Zenn article publication metadata                   | Zenn RSS (`scripts/zenn-articles.ts`)                | Fetched at generation time; not stored as source                                                                 |
| note article source and publication metadata        | note public article API (`scripts/note-articles.ts`) | Japanese source stays on note; reviewed English and localized images live in this repo                           |

## Top site (`projects/web-site`)

English-only Angular app for `rdlabo.dev`. Home page, featured OSS links, and reviewed translations of selected Zenn and note articles.

### Article generation

`npm run articles:generate` runs `scripts/generate-articles.ts`:

1. Loads Markdown from `projects/web-site/src/articles/*.md`. Zenn sources use `zennSlug`; explicitly selected note sources use `source: note`, `sourceUrl`, `sourceRevision`, and `slug`. All articles require `title` and `description`; `emoji` is optional.
2. Fetches public Zenn metadata from `https://zenn.dev/rdlabo/feed?all=1` and only the note URLs explicitly declared by translated articles.
3. Requires every source to match a public article. For note, generation also requires `sourceRevision` to match the SHA-256 of the current Japanese title and body so upstream edits cannot silently bypass translation review. `publishedDate` uses Asia/Tokyo.
4. Renders Markdown to HTML (Zenn image paths rewritten, top-level `h1` demoted to `h2`, external links get `rel="noopener noreferrer"`).
5. Writes generated TypeScript modules, lazy loaders, article-specific SVG cover images, and `projects/web-site/public/sitemap.xml`.

Generated outputs under `projects/web-site/src/app/generated/`, `projects/web-site/public/article-images/`, and `projects/web-site/public/sitemap.xml` must not be edited by hand.

`prebuild:web-site` runs `articles:generate`; root `pretest` runs it together with
`docs:generate`.

### Article routes

| Route                     | Role                                                                 |
| ------------------------- | -------------------------------------------------------------------- |
| `/`                       | Home                                                                 |
| `/articles`               | Latest translated articles                                           |
| `/articles/archive/:year` | Articles grouped by publication year (`publishedDate` year from RSS) |
| `/articles/:slug`         | Single article (`zennSlug` for Zenn, explicit `slug` for note)       |

Archive and article pages are prerendered from generated catalog data (`app.routes.server.ts`).

### Article translation rules

- Translate prose into natural English suitable for developer documentation.
- Technical terms (class names, method names, package names) remain untranslated.
- **Fenced code blocks must remain byte-for-byte identical to the Japanese Zenn source.** Do not translate code comments or examples inside fences.
- note remains the Japanese source of truth; this repo owns the reviewed English Markdown and localized image assets. Keep note automatic translation disabled so the canonical English version stays on `rdlabo.dev`.

### Zenn article workflow (LLM-maintained, feed-discovered)

Zenn candidates are discovered automatically; do not require the user to provide an article URL. When asked to add or update the latest Zenn translation:

1. Run `npm run articles:stage-zenn`. If a local checkout of the Japanese Zenn Markdown is available, pass it with `npm run articles:stage-zenn -- --source {articles-directory}` so code fences and Markdown are preserved from the local source.
2. Read `tmp/zenn-import/inventory.json`. The importer fetches the full public RSS feed, excludes slugs already translated in `projects/web-site/src/articles`, non-public entries, English articles, and Japanese articles that are themselves translations. It stages eligible missing Japanese articles under `tmp/zenn-import/`, newest first in the inventory.
3. Select the newest eligible staged entry unless the user names a different Zenn article. Copy its staged Markdown to `projects/web-site/src/articles/{zennSlug}.md` and use an LLM to translate the prose, title, and description into natural English.
4. Keep every fenced code block byte-for-byte identical to the staged Japanese source, including comments and whitespace. Preserve heading levels and order, technical identifiers, `zennSlug`, and `emoji`.
5. Run `npm run articles:validate-translations`. Resolve every reported error and untranslated-prose warning; do not use `--fix-code` without reviewing the resulting diff.
6. Run `npm run articles:generate`, then the normal CI sequence.

This automatic discovery applies only to Zenn. Never use the Zenn feed workflow to discover note content; note always starts from a URL explicitly selected by the user.

### note article workflow (LLM-maintained)

note articles are selected explicitly by URL. Do not crawl the note profile, RSS, recommendations, or related articles, and do not automatically add newly published note articles. Translation and later updates are primarily performed by an LLM agent and then verified in this repository.

1. Start from the exact URL selected by the user, in the form `https://note.com/rdlabo/n/{note-id}`.
2. Run `npm run articles:inspect-note -- {URL}`. This is read-only and returns the canonical URL, Japanese title, publication date, and current `sourceRevision`.
3. Create or update `projects/web-site/src/articles/{english-slug}.md` with `source: note`, the exact `sourceUrl`, the inspected `sourceRevision`, an explicit English `slug`, reviewed English `title` and `description`, and optional `emoji`.
4. Read the Japanese article itself rather than treating note's automatic English view as source material. Translate prose into natural developer-facing English. Preserve executable commands and real source code exactly; translate Japanese explanatory pseudo-code, tables, and diagrams when they are part of the narrative.
5. Localize text-bearing article images into English. Preserve the original composition and meaning, store final project assets under `projects/web-site/public/articles/{slug}/`, prefer compressed WebP, and give every image meaningful English alt text. Do not hotlink note CDN assets from the published English article.
6. Run `npm run articles:generate`, then the normal CI sequence. The article page must link back to the Japanese note original and identify its source as note.

`sourceRevision` is a review approval token, not a value to refresh mechanically. It is the SHA-256 of a stable JSON representation containing the trimmed Japanese title and note body HTML. During every generation, `scripts/generate-articles.ts` fetches only the explicitly declared `sourceUrl`, recomputes the revision, and compares it with front matter.

When revisions differ, generation fails before generated output is written. A mismatch means the reviewed English version may be stale. Re-read the current Japanese title and body, update every affected English passage, code-like explanation, table, link, alt text, and localized image, and only then replace `sourceRevision` with the newly inspected value. Never fix a mismatch by changing only `sourceRevision`. Likes, comments, view counts, recommendation metadata, and other fields outside the title/body hash do not trigger translation review.

## Documentation portal generation pipeline

### English resolution

`docs:generate` **always** loads English from GitHub raw — never from the local filesystem. Resolution order:

1. Package repository: `docs/{file}`, `{sourceDirectory}/docs/{file}`, then `README.md` for landings.
2. Portal repository (`rdlabo-dev/website`): `projects/docs/src/{sourceDirectory}/docs/{file}`.

For `@capacitor-community/admob` and rdlabo Capacitor plugins, English lives in the **package repository only** — do not copy those English files into `projects/docs/src/{project}/docs/`.

Optional `englishDocsRef` overrides the Git ref for English guides fetched from the package repository (default: `main`). API signatures always follow the installed npm version, not the Git ref.

### API sources

1. **`dist/docs.json`** — `!::Identifier::` placeholders expand an entry on its own line. In package `docs/*.md` that GitHub renders, wrap as `<!-- !::Identifier:: -->` so it is hidden on GitHub. The generator expands both forms.
2. **`<docgen-index>` + `<docgen-api>`** — rdlabo Capacitor plugin landings in the OSS repository. The generator splits into a README page and an API page.
3. **Hand-authored semantic headings** — for `adapter: 'markdown'` projects without `dist/docs.json`.

### Adapter choice (`project-manifest.ts`)

- **No `adapter` field** (default): requires `dist/docs.json`. Use `!::...::` placeholders in any page.
- **`adapter: 'markdown'`**: hand-author all docs. `!::...::` is still available if `dist/docs.json` happens to exist (e.g. rdlabo Capacitor plugins whose API page comes from docgen blocks).

### Package README omit blocks

Wrap GitHub/npm-only regions in the package README with:

```html
<!-- rdlabo-docs-omit -->
(content)
<!-- /rdlabo-docs-omit -->
```

Typical targets: badges, maintainers, sponsors, demo screenshots, License. For AdMob, also omit `## Index` through the README docgen API, because the portal API page comes from README docgen and `!::` signatures from `dist/docs.json`. Markers inside fenced code blocks are ignored. Unclosed markers fail the generator.

### Semantic API headings

Use a kind tag so `formatApiEntries` wraps each entry in an `api-entry` card. Supported kinds:

`method`, `interface`, `type alias`, `enum`, `class`, `component`, `directive`, `function`, `module`, `command`, `stylesheet`, `rule`

```markdown
#### `method` present(scannerOption: ScannerOption)
```

## Bilingual rules

### File structure

- Every page in `project-manifest.ts` must have an English source on GitHub and a Japanese counterpart at `projects/docs/src/{project}/docs/ja/{file}`.
- Package-hosted English (AdMob, rdlabo Capacitor plugins) must **not** be duplicated under `projects/docs/src/{project}/docs/`.
- Code example files (`code:` refs) are not translated.

### Translation rules

- **Fenced code blocks must be byte-for-byte identical between EN and JA.** Do not translate code comments or examples.
- Translate prose into natural Japanese suitable for developer documentation.
- Technical terms (class names, method names, package names) remain untranslated.
- Localize page titles for guides and narrative pages. Identifiers, product names, rule names, and generic titles (`API`, `CLI API`, `@rdlabo/...`) may remain the same in both locales.

### CI guard

`scripts/bilingual-update-blocker.test.ts` (included in `npm test`) fails when an EN page declared in `project-manifest.ts` is modified in a PR without a corresponding JA change. This prevents English-only updates from merging unintentionally.

## Front matter and headings

- Every page should start with YAML front matter declaring `title`. Front matter is the source of truth; the generator falls back to the manifest title when absent. Pages may also declare `code:` and/or `scrollActiveLine:`.
- Code example files (`code:` refs) do not need `title`; they may declare `file:`.
- For `readme.md`, `using-ion-item-group.md`, and ESLint rule pages (`rules/{rule-name}.md`), the first `# ` heading is removed by `normalizeImportedReadmeHeadings`; the heading comes from front matter.

## SEO metadata

### Document titles (`seoTitle`)

- Optional localized project- or page-level `seoTitle` in `scripts/project-manifest.ts` overrides the generated `<title>` only. Navigation titles (`title` / `navTitle`) stay unchanged.
- Project landing pages use the project's `seoTitle` when present; otherwise they keep `${shortName} - rdlabo.dev`.
- Docs pages use `${page.title} - ${shortName} - rdlabo.dev` unless `seoTitle` is set.
- Set intent-focused titles sparingly for high-value landing and API entry pages.

### Sitemap `<lastmod>` (`updatedAt`)

- Emit `<lastmod>` only from an explicit `YYYY-MM-DD` source field that represents a real content update.
- Never use build time, file mtimes, git history, RSS publication dates, or the current date.
- Docs pages declare optional localized `updatedAt` in `scripts/project-manifest.ts`.
- Translated articles declare optional `updatedAt` in article front matter. When present, it must be on or after the source article's `publishedDate` (resolved from Zenn RSS or the note API during generation).
- Generators validate calendar dates and reject future values. If no page declares `updatedAt`, sitemaps contain no `<lastmod>` entries.
- After a substantive content update, set `updatedAt` to the edit date and regenerate outputs.

### Hreflang and sitemap shape

- Bilingual docs pages emit `link[rel="alternate"][hreflang]` tags (`en`, `ja`, `x-default`) in HTML `<head>`. That is the canonical hreflang discovery surface. Each alternate `href` must be a non-empty, fully-qualified HTTPS URL (not relative paths, protocol-relative URLs, or `http:`).
- The docs sitemap is deliberately simple: standard `urlset` entries with `<loc>` and optional explicit `<lastmod>` only (same shape as the top site). It omits `xmlns:xhtml` and `xhtml:link` alternates to reduce sitemap payload while diagnosing Search Console fetch issues. XHTML sitemap hreflang remains a supported standard elsewhere; this is redundancy removal, not a claim that sitemap hreflang is invalid.
- Legacy Stripe paths forwarded from `stripe.capacitorjs.jp` are mapped to `/projects/capacitor-stripe/...` by `projects/docs/public/_redirects`. Keep exact routes before splats and use permanent 301 responses; do not rely on Angular client redirects for migrated public URLs.
- `netlify.toml` is the legacy-host deployment contract for `stripe.capacitorjs.jp`: Netlify builds the docs app with Node 24 so its Angular Runtime receives `dist/docs/browser`, while forced redirects send the root to the Stripe project landing, `/docs/*` directly to canonical Stripe pages, and unmatched historical paths to the project landing. It must never mirror arbitrary paths onto the docs portal root.

### JSON-LD structured data

- Shared JSON-LD builders and safe serialization live in `shared/json-ld.ts`. The two app-specific graph builders live in `projects/web-site/src/app/seo-json-ld.ts` and `projects/docs/src/app/docs/seo-json-ld.ts`.
- Each prerendered page may have exactly one managed `script#rdlabo-json-ld[data-rdlabo-json-ld][type="application/ld+json"]`. `SeoService.setPage` replaces it on navigation and removes it when no structured data is supplied or the page is `noIndex`.
- `rdlabo.dev` emits `WebSite` + `Organization` on the home page, `BreadcrumbList` on article indexes, and `BlogPosting` + `BreadcrumbList` on translated article pages.
- `docs.rdlabo.dev` emits `WebSite` only on the subdomain root. The Japanese `/ja` home emits a localized `WebPage` that references the root `WebSite`, because Google does not support a separate site name at a subdirectory level. Support, project landing, and documentation pages emit localized `BreadcrumbList` data.
- Article `datePublished` comes from the source publication metadata. Emit `dateModified` only from an explicit validated article `updatedAt`; never infer it from generation or deployment time.
- When `updatedAt` is present, the article page must display the same date in `time[data-article-modified]`; never expose a search-only modification date.
- Every translated article gets a deterministic 1200×630 SVG cover derived from its title, emoji, and slug. `BlogPosting.image`, the visible article image, and `og:image` must agree. An explicit article-front-matter `image` may override the generated URL only when it is an absolute HTTPS URL representing that article. Override dimensions are unknown, so the page must omit both `og:image:width` / `og:image:height` and visible `width` / `height`; generated covers declare all four values as 1200×630. Do not reuse the generic site OG card or a logo as every article's representative image.
- Translated articles identify the visible Japanese source link with `isBasedOn` as an `Article` in language `ja` while keeping the English rdlabo.dev URL canonical.
- Structured-data strings must go through `serializeJsonLd`; do not assign raw `JSON.stringify` output to a script element.

### SEO audit

- `npm run seo:audit` checks built sitemap-listed HTML for `docs.rdlabo.dev` and `rdlabo.dev`.
- For bilingual docs, the audit validates reciprocal HTML-head hreflang across all sitemap-listed pages (exactly `en`, `ja`, and `x-default` — no other hreflang keys; no empty/whitespace `hreflang` attributes; alternate `href` values must be fully-qualified HTTPS URLs; targets must be sitemap locs; identical normalized mapping on EN/JA pairs). It does not require sitemap-level hreflang when the docs sitemap omits alternates.
- Canonical URLs must match the sitemap page URL exactly after trailing-slash normalization; query strings and fragments are rejected rather than stripped silently.
- JSON-LD validation covers all blocks for syntax and object shape, then validates the managed graph by route. It requires the expected schema types, canonical alignment, one instance of each required type, internal absolute-HTTPS breadcrumb items with contiguous positions, article author/publisher/language/source fields, required valid article-specific images with JSON-LD/OG/visible agreement and consistent optional dimensions, valid non-future publication/modification dates, and agreement with visible/meta article dates. Extend both route expectations and semantic tests when adding a schema or public route.
- This audit enforces this repository's contracts; use Google's Rich Results Test after production deployment for Google's current eligibility diagnostics.
- CI runs it after `npm run build`. Fix aggregated audit errors before merging.

## Internal and external links

- Same project: `/docs/{page-slug}` (e.g. `/docs/payment-sheet`).
- Cross project: `/{project-id}/docs/{page-slug}` (use `id` from manifest, not public `slug`).
- Project root: `/{project-id}/`.
- The generator rewrites these to localized `/projects/{slug}/docs/{page}` or `/ja/projects/{slug}/docs/{page}` paths.
- Package source links: use the exact pinned version tag (`https://github.com/rdlabo-dev/{project}/blob/vX.Y.Z/...`), never `main`.

## CI (`npm test` / `npm run build`)

The CI pipeline runs:

1. `npm run fmt:check` — Prettier formatting.
2. `npm run lint` — ESLint for `projects/docs` and `projects/web-site`.
3. `npm test` — node contract tests + `ng test docs` + `ng test web-site`. Includes bilingual update blocker for documentation pages.
4. Generated-output drift checks — `git diff --exit-code` on `projects/docs/src/app/generated`, `projects/docs/public/sitemap.xml`, `projects/web-site/src/app/generated`, `projects/web-site/public/article-images`, and `projects/web-site/public/sitemap.xml` (before and after build).
5. `npm run build` — `build:docs` (pagefind search index + `build-output.test.ts`) and `build:web-site` (`web-site-build-output.test.ts`).
6. `npm run seo:audit` — validates built HTML metadata against both sitemaps.

All steps must pass before a PR is merge-ready. Run them locally in the same order.

## Deployment

Two Cloudflare Workers Static Assets services:

| Worker     | Config                    | Domain            |
| ---------- | ------------------------- | ----------------- |
| `docs`     | `wrangler.jsonc`          | `docs.rdlabo.dev` |
| `web-site` | `wrangler.web-site.jsonc` | `rdlabo.dev`      |

The `Deploy to Cloudflare` workflow deploys both after CI succeeds on `main` (`npm run deploy:docs`, then `npm run deploy:web-site`).
