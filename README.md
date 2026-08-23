# rdlabo.dev

Personal open source sites maintained by rdlabo. The repository builds two Angular 22 static applications:

| Site | Angular project | Production domain |
| --- | --- | --- |
| Top site | `projects/web-site` | [`rdlabo.dev`](https://rdlabo.dev) |
| Documentation portal | `projects/docs` | [`docs.rdlabo.dev`](https://docs.rdlabo.dev) |

The `rdlabo` name is also used by 一般社団法人リレーションデザイン研究所, but every OSS project documented here is owned and maintained personally by rdlabo. These sites and their projects are not activities of that incorporated association.

Both apps deploy to separate Cloudflare Workers Static Assets services on their custom domains only (`workers.dev` and preview URLs are disabled). The repository is `rdlabo-dev/website`.

## Current projects

| Project | Documentation source |
| --- | --- |
| Ionic Framework Japanese Documentation | `ionic-jp/ionic-docs` |
| Capacitor Japanese Documentation | `ionic-jp/capacitor-docs` |
| Capacitor Community Stripe | `projects/docs/src/stripe/docs` |
| Capacitor Community Stripe Identity | `projects/docs/src/stripe-identity/docs` |
| Capacitor Community Stripe Terminal | `projects/docs/src/stripe-terminal/docs` |
| Capacitor Community AdMob | `projects/docs/src/admob/docs` |
| Capacitor Community Facebook Login | `projects/docs/src/facebook-login/docs` |
| rdlabo Capacitor Code Scanner | `projects/docs/src/capacitor-codescanner/docs` |
| rdlabo Capacitor Screenshot Event | `projects/docs/src/capacitor-screenshot-event/docs` |
| rdlabo Capacitor Printer | `projects/docs/src/capacitor-printer/docs` |
| rdlabo Capacitor Brother Print | `projects/docs/src/capacitor-brotherprint/docs` |
| rdlabo Ionic Angular Kit | `projects/docs/src/ionic-angular-kit/docs` |
| rdlabo Ionic Angular Photo Editor | `projects/docs/src/ionic-angular-photo-editor/docs` |
| rdlabo Ionic Angular Scroll Header | `projects/docs/src/ionic-angular-scroll-header/docs` |
| rdlabo Angular CDK Scroll Strategies | `projects/docs/src/ngx-cdk-scroll-strategies/docs` |
| rdlabo Ionic Theme iOS26 | `projects/docs/src/ionic-theme-ios26/docs` |
| rdlabo Ionic Theme Material Design 3 | `projects/docs/src/ionic-theme-md3/docs` |
| rdlabo Ionic Angular Collect Icons | `projects/docs/src/ionic-angular-collect-icons/docs` |
| rdlabo Workers Hono Kit | `projects/docs/src/workers-hono-kit/docs` |
| rdlabo ESLint Plugin Rules | `projects/docs/src/eslint-plugin-rules/docs` |
| rdlabo Capacitor Docgen | `projects/docs/src/capacitor-docgen/docs` |

Project metadata, navigation, localized landing copy, and API input are declared in `scripts/project-manifest.ts`. The generator creates a small catalog plus one lazy module per project and locale.

## Commands

Shared:

```bash
npm install
npm test
npm run lint
npm run fmt:check
npm run build
```

Documentation portal (`projects/docs`):

```bash
npm start              # ng serve docs (runs docs:generate first)
npm run docs:generate
npm run build:docs
npm run deploy:docs
```

Top site (`projects/web-site`):

```bash
npm run start:web-site   # articles:generate, then ng serve web-site
npm run articles:generate
npm run build:web-site
npm run deploy:web-site
```

The relevant `prestart`, `prebuild:*`, and `pretest` hooks run `docs:generate` and/or
`articles:generate` automatically.
Deploy both apps with `npm run deploy` (runs `build`, then `deploy:docs` and `deploy:web-site`).

Generate documentation without starting the app:

```bash
npm run docs:generate
```
On a local feature branch, push the current commit before generating so portal-hosted English can
be read from that commit on GitHub. CI selects the pull request head repository and commit
automatically, including for fork-based pull requests.
When generating locally from a fork, set `RDLABO_DOCS_REPOSITORY_URL` to that fork's GitHub URL.

## Canonical routes

Documentation portal (`docs.rdlabo.dev`):

```text
/
/projects/:project
/projects/:project/docs/:page
/ja/projects/:project
/ja/projects/:project/docs/:page
```

Top site (`rdlabo.dev`):

```text
/
/articles
/articles/archive/:year
/articles/:slug
```

## Documentation format

Narrative documentation uses Zenn Markdown. Markdown-only projects take their displayed version from the exactly pinned installed package. Capacitor API entries are expanded from the installed package's pinned `dist/docs.json` with placeholders such as:

```md
<!-- !::createPaymentSheet:: -->
```

The generator also accepts the bare `!::createPaymentSheet::` form. Package guides that GitHub renders should use the HTML-comment form so the placeholder stays hidden.

Capacitor READMEs containing both `<docgen-index>` and `<docgen-api>` are automatically exposed as
separate README and API pages. The source README remains the single file to update.

Every project exposes a dedicated API page. Hand-authored API Markdown uses semantic entry headings
such as `` #### `component` PhotoEditorPage `` or `` #### `function` generate ``; the generator
normalizes those entries and Capacitor docgen output into the same API-card presentation.

Generated project modules live under `projects/docs/src/app/generated/projects` and must not be edited by hand.

API input is restricted to packages declared in `scripts/project-manifest.ts` and installed at exact
versions in `package-lock.json`. Generated HTML is reviewed as part of the repository diff; adding a
new documentation adapter or package source requires its own fixture, schema validation, and review.

Documentation-source packages are inspected at generation time and are never imported into the site
bundle. `.npmrc` enables legacy peer resolution because those packages may document a different
Angular major than the portal itself; every source version remains exact in `package-lock.json`.

Production `anyScript` budgets in `angular.json` warn at 425kB and fail at 450kB. The warning
baseline covers the shared bilingual catalog and GitHub Star UI for 19 projects (the current
production main is about 419.1kB); documentation bodies remain lazy-loaded, so the hard error stays
at 450kB.

## Top site (`projects/web-site`)

The top site is English-only. It links to the documentation portal and GitHub, and publishes reviewed English translations of selected Japanese articles from Zenn and note.

### Article sources

Edit translated articles as Markdown under `projects/web-site/src/articles/*.md`. Zenn translations declare `title`, `description`, and `zennSlug`. Explicitly selected note translations declare `source: note`, `sourceUrl`, `sourceRevision`, and a public `slug`. Optional `emoji` defaults to `✦`.

Stage automatically discovered, untranslated Zenn feed entries for LLM translation, then validate the translated Markdown:

```bash
npm run articles:stage-zenn
npm run articles:validate-translations
```

Inspect a selected note source before an LLM creates or updates its English translation:

```bash
npm run articles:inspect-note -- https://note.com/rdlabo/n/na69e5aad6840
```

`npm run articles:generate` (`scripts/generate-articles.ts`) fetches Zenn publication metadata from RSS and only the note URLs explicitly declared by translated articles, validates every remote source, renders the Markdown body to HTML, and writes generated outputs. For note, `sourceRevision` is the SHA-256 of the Japanese title and source body; generation fails when either changes until the English translation is reviewed and its revision updated. Publication dates are normalized to Asia/Tokyo (`publishedDate`).

Generated outputs must not be edited by hand:

- `projects/web-site/src/app/generated/article-catalog.generated.ts`
- `projects/web-site/src/app/generated/article-loaders.generated.ts`
- `projects/web-site/src/app/generated/articles/*.generated.ts`
- `projects/web-site/public/sitemap.xml`

When translating an article, **fenced code blocks must remain byte-for-byte identical to the Japanese Zenn source.** Translate prose only; do not translate code comments or examples inside fences.

## Deployment

Two Cloudflare Workers Static Assets services deploy from this repository:

| Worker | Wrangler config | Assets | Custom domain |
| --- | --- | --- | --- |
| `docs` | `wrangler.jsonc` | `dist/docs/browser` | `docs.rdlabo.dev` |
| `web-site` | `wrangler.web-site.jsonc` | `dist/web-site/browser` | `rdlabo.dev` |

After `CI` succeeds for the current `main` revision, the separate `Deploy to Cloudflare` workflow checks out that exact verified commit, rebuilds the production assets, and deploys both Workers with the repository-pinned Wrangler version (`npm run deploy:docs`, then `npm run deploy:web-site`). A completed CI run for an older revision is skipped, preventing an out-of-order build from rolling production back. The workflow can also be dispatched manually from `main`.

The GitHub Actions repository secret `CLOUDFLARE_API_TOKEN` is required. Create a narrowly scoped Cloudflare API token that can edit Workers for the account declared in the Wrangler configs; never commit the token. Local deployment remains available for recovery through `npm run deploy` and `npm run deploy:dry-run`, but is not part of the normal release flow.

Cloudflare drops trailing slashes (`html_handling: drop-trailing-slash`) so URLs match canonical routes on both domains.

## Maintainers

- [rdlabo](https://rdlabo.dev/)
