# Migration and cutover

Source: rdlabo-dev/website@7bd562b441ee69d29a6400230229cd7711f6dfa5. Source history remains in that repository.
Destination: https://github.com/webview-native-ui/docs
Origin: https://webview-native-ui.rdlabo.dev

## Content

The five projects are webview-native-ui-engine, capacitor-native-ui, ionic-theme-ios27, ionic-theme-ios26, ionic-theme-md3. All 210 tracked source files,
including translations and code samples, are recorded with SHA-256 in
`migration/source-inventory.json`. Translation revision tokens and immutable upstream refs are retained.
The inventory is a one-time extraction record. Run `npm run migration:verify-source` in the
destination to compare the extraction byte for byte before cutover. Normal CI permits future
reviewed documentation edits without rewriting this historical record.

Shared Angular rendering, locale support, SEO, search, support/sponsors, assets, and tests are copied
where required. rdlabo.dev and its articles stay in the source repository, with updated documentation
links. Only related-article metadata is retained here. Source project cards become external links;
local document sources, generated pages and unnecessary package dependencies are removed there.

## Ordered production cutover (requires explicit approval)

1. Establish the initial default main branch in the empty destination repository, then enable its CI.
   There is no existing base commit for an initial PR. Do not create/push main without approval.
2. Configure GitHub production environment and a Cloudflare API token scoped to the intended account.
   The new Worker name is `webview-native-ui-docs`; do not overwrite the old `docs` Worker.
3. Publish the new static site and verify all four languages, representative deep URLs, search,
   canonical/hreflang/sitemap, images, and static 404 responses on the custom domain.
4. If retaining production Markdown/x402 behavior, configure the distinct agent-router Worker secrets
   and publish it, then set its routes to fail open as described in workers/README.md. Test HTML and
   Markdown negotiation without sending a payment. Never reuse old-host Worker routes accidentally.
5. Publish the source change only after the new site is healthy. Deploy BOTH the source static Worker
   and source agent router: both must perform 301 redirects before asset/classification/payment handling.
6. Check 301 Location and query retention for all five projects and four languages, legacy project
   aliases, nested Engine guides, historical renamed pages, and an unaffected Stripe page.
7. Monitor 404s and search indexing. Retain the permanent redirects.

## Rollback

Before source cutover, keep serving the old site. If the new site fails after source cutover,
revert and redeploy the source migration commit (including its previous docs and agent-router bundles)
to restore the original content. Keep the new service available until caches and old redirects recover.
No package releases, npm names, theme demos, or library repositories change in this migration.

## Local validation (2026-11-11)

- Destination: generated 268 localized documentation pages in 20 lazy modules. Formatter, ESLint,
  Node contracts, agent-router tests, 95 Angular tests, all-page internal-link audit,
  10 built-output contracts, SEO audit, and both Worker dry-runs passed.
- Source: generated 660 remaining localized documentation pages in 84 lazy modules. Formatter,
  ESLint, 194 Node contracts, 16 agent-router tests, 94 documentation Angular tests,
  35 top-site Angular tests, 19 documentation output contracts, 4 top-site output contracts,
  SEO audit, and both Worker dry-runs passed. Redirect tests also cover legacy aliases,
  nested paths, every published language, query strings, and unaffected routes.
- `npm run migration:verify-source` verified all 210 original source files byte for byte.
- Browser: opened the destination catalog, a nested Engine Capacitor guide, and the same Japanese
  guide after language switching. Confirmed the new canonical hostname and translation edit URL.
- Angular build retains a non-failing script-size warning (approximately 636 kB vs the 550 kB
  warning threshold, below the 650 kB error threshold). Production behavior remains unverified
  until the approved custom-domain deployment.
- No remote branches, pull requests, secrets, DNS records, or production services were changed.
