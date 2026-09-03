# Analytics access and measurement contract

Article writing and translation stay in the local repository workflow. Codex Cloud may read
analytics, update distribution records, draft promotion copy, and open reviewable pull requests. It
must not edit article prose or publish externally unless the user explicitly requests that action.

## Required access

Grant the Google identity connected to the Codex Cloud measurement workflow:

- GA4 property for measurement ID `G-EXVGMHNGJG`: **Viewer** at property level. Do not grant Editor
  or Administrator.
- Search Console property covering `rdlabo.dev`: **Full user**, not Owner. This supports complete
  reporting and diagnostics without user-management or ownership control.

Store OAuth credentials or service-account material only in the Codex Cloud environment/secret
store. Never commit credentials, refresh tokens, or service-account JSON to this repository.

The Google Analytics and Google Search Console connectors were not installed when this contract was
created. After connecting them, confirm read access to the exact GA4 and Search Console properties
before enabling recurring measurement.

An existing GA4 Administrator must register `article_slug` and `link_domain` as event-scoped custom
dimensions once. Codex Cloud retains Viewer access; it must not be elevated merely to perform this
one-time setup.

## GA4 events

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

## Recurring measurement

- Weekly: Search Console clicks, impressions, CTR, average position, indexed-page issues, article
  sessions, and article-to-Docs/GitHub/npm/Sponsor events.
- Per placement: cumulative snapshots at 24 hours, 7 days, and 30 days from `publishedAt`.
- Monthly: top landing articles, distribution source performance, article-to-OSS conversion, new
  backlinks, branded queries, and official/maintainer mentions.

Every report must include the property, date range, timezone, filters, and data source. Search
Console data can lag; do not interpret incomplete recent days as a decline.
