# Codex Cloud article distribution playbook

Use this playbook for every article-distribution cycle. Work on one campaign at a time and open a
reviewable pull request; never publish to an external service from this workflow.

Article prose, translations, and new articles remain a local workflow. Do not edit files under
`projects/web-site/src/articles/` during a Cloud distribution or measurement cycle.

## Inputs

1. Read `AGENTS.md` and this file completely.
2. Read `marketing/distribution-plan.json` and its JSON Schema.
3. Read the selected English article and its generated catalog entry.
4. Check the current rules of every planned destination using primary sources immediately before
   drafting.
5. Read `marketing/analytics-access.md` and verify that the connected GA4 and Search Console
   properties match its contract before reading or recording measurements.

## Select work

- Continue an `active` or `scheduled` campaign before starting a new one.
- Otherwise select the lowest-priority-number `backlog` campaign.
- A later campaign may reuse an article. Do not merge it into an older campaign.
- Each actual post is a placement with a unique ID. Add another placement for a follow-up post or a
  second community; never overwrite a prior publication.

## Prepare copy

For every selected placement, create `marketing/campaigns/{campaign-id}/{placement-id}.md` with:

- destination and current rule-check date;
- post title where the channel supports one;
- final post body;
- canonical article URL;
- exact URL to use;
- CTA and image/alt-text requirements;
- a Japanese translation for user review;
- publication and measurement sections left empty.

Use channel-specific copy. Hacker News must receive the clean canonical URL, never a UTM URL. DEV
must declare the clean rdlabo.dev URL as `canonical_url`; links readers click may use UTM values.
Other tracked links use `utm_source`, `utm_medium`, `utm_campaign`, and a placement-specific
`utm_content`.

Use this fixed vocabulary so results remain comparable:

| Channel       | `utm_source`    | `utm_medium`  |
| ------------- | --------------- | ------------- |
| X             | `x`             | `social`      |
| LinkedIn      | `linkedin`      | `social`      |
| DEV Community | `devto`         | `syndication` |
| Reddit        | `reddit`        | `community`   |
| Ionic Discord | `ionic-discord` | `community`   |
| Ionic Forum   | `ionic-forum`   | `community`   |

Always set `utm_campaign` to the campaign `id` and `utm_content` to the placement `id`. Hacker
News is the sole exception: use the clean canonical URL and no UTM parameters.

## Review cycle

1. Run an editorial/manager review for accuracy, claims, tone, and repository policy.
2. Run a marketing review for audience fit, channel rules, hook, CTA, and tracking.
3. Fix every blocking issue and repeat both reviews until both approve.
4. Only then set the placement to `drafted` and add its `copyPath`.
5. Set the campaign to `copy-ready` only when every non-skipped placement has approved copy.

## State contract

- `backlog`: placements may still be `planned`.
- `copy-ready`: every non-skipped placement is at least `drafted` and has an existing `copyPath`.
- `scheduled`: every non-skipped placement is `scheduled` or `published`; scheduled placements
  have `scheduledAt` with a timezone.
- `active`: at least one placement is `published` with its public HTTPS URL and `publishedAt`.
- `complete`: every placement is either `skipped` with a reason or `published` with a `30d` result.

## Approval and publication

The pull request delivers proposed copy; it does not authorize publication. Ask the user to approve
the exact placement. After the user publishes it—or explicitly authorizes a connected service to do
so—record the immutable public URL and timestamp without rewriting the approved copy.

## Measurement

Record snapshots at 24 hours, 7 days, and 30 days after `publishedAt`. Values are cumulative from
publication time through the named window, not incremental between windows. Each result records:

- `measuredAt` with timezone;
- `source`, such as GA4 plus the destination's native analytics;
- article visitors;
- Docs, GitHub, npm, and Sponsor clicks;
- backlinks;
- official or maintainer mentions.

Do not invent unavailable values. If a metric cannot be obtained, explain that in the placement
artifact and leave the campaign active rather than entering an estimate.

Run a weekly measurement-only cycle even when no new campaign is drafted. Read GA4 and Search
Console, update due snapshots and the monthly summary, then open a pull request only when tracked
records change or an actionable finding exists. If either connection is unavailable, report the
missing connection without substituting estimates.

## Pull-request completion

- Confirm every referenced article slug exists in the generated article catalog.
- Confirm priorities and campaign IDs are unique; article slugs may repeat across campaigns.
- Confirm placement IDs are unique only within their campaign; channels may repeat.
- Run `npm run marketing:validate`; it enforces the state contract, IDs, article references, copy
  paths, and completion evidence.
- Run `npm run fmt:check`, `npm run lint`, and the relevant tests.
- Summarize the two review approvals and identify every action that still needs user approval.
