# Analytics access and measurement contract

Article writing and translation stay in the local repository workflow. The weekly Devin automation
may read analytics, implement one evidence-backed site or documentation improvement, and open a
reviewable pull request. It must not edit article prose, automatically start promotion campaigns, or
publish externally.

## Required access

Grant the Google identity connected to the Devin measurement workflow:

- GA4 property for measurement ID `G-EXVGMHNGJG`: **Viewer** at property level. Do not grant Editor
  or Administrator.
- Search Console property covering `rdlabo.dev`: **Full user**, not Owner. This supports complete
  reporting and diagnostics without user-management or ownership control.

Store OAuth credentials or service-account material only in the automation's managed connector or
secret store. Never commit credentials, refresh tokens, or service-account JSON to this repository.

The Devin automation has the Google Analytics MCP enabled. Search Console is not connected. Confirm
read access to the exact property before recording results, and report missing Search Console data
without substituting estimates.

An existing GA4 Administrator must register `article_slug` and `link_domain` as event-scoped custom
dimensions once. The automation retains Viewer access; it must not be elevated merely to perform this
one-time setup.

## GA4 events

Both apps load `gtag.js` only when the page hostname is `rdlabo.dev` or one of its subdomains.
Local development (`localhost`, `127.0.0.1`) and preview hosts define the `gtag` stub but never
load the tag, so their page views and clicks do not reach the property.

The site emits these events from article pages:

| Event                  | Meaning                                               |
| ---------------------- | ----------------------------------------------------- |
| `page_view`            | Route view, including article pages                   |
| `article_to_docs`      | Article reader opened docs.rdlabo.dev                 |
| `article_to_github`    | Article reader opened a GitHub repository or resource |
| `article_to_npm`       | Article reader opened npm                             |
| `article_to_sponsor`   | Article reader opened GitHub Sponsors                 |
| `article_source_click` | Article reader opened its Japanese source             |

Journey events include `article_slug`, `link_url`, and `link_domain`.

## Recurring measurement and interpretation

- Weekly: complete-period article sessions and article-to-Docs/GitHub/npm/Sponsor events. Compare
  the latest complete 7 days with the preceding 7 days and use 28 days for context.
- When Search Console becomes available: clicks, impressions, CTR, average position, branded
  queries, and indexed-page issues.
- Per placement: cumulative snapshots at 24 hours, 7 days, and 30 days from `publishedAt`.
- Monthly: top landing articles, article-to-OSS conversion, new backlinks, branded queries,
  official/maintainer mentions, and aggregate individual sponsor health when legitimately available.

Every report must include the property, date range, timezone, filters, and data source. Search
Console data can lag; do not interpret incomplete recent days as a decline. Sponsor clicks are a
diagnostic signal, not proof of sponsorship or a direct optimization target.
