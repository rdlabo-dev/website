# Weekly OSS improvement playbook

This file is the recurring workflow for the Devin automation. The filename is retained because the
automation already references it. The workflow is provider-independent and may also be run locally.

The public purpose of rdlabo is to make useful, reliable OSS and documentation available to
developers. Sponsorship is a private, lagging sustainability metric—not the editorial voice, the
optimization target, or a reason to reduce public access.

Article prose, translations, and new articles remain a local workflow. Never edit files under
`projects/web-site/src/articles/` in this cycle. Never publish to an external service.

## Weekly objective

Find one evidence-backed opportunity to make the OSS ecosystem more useful, trustworthy, or easier
to adopt. Prefer a small change whose effect can be evaluated in the next cycle. Do not create work
merely to satisfy the schedule.

## Inputs

1. Read `AGENTS.md`, this file, and `marketing/analytics-access.md` completely.
2. Read GA4 for the exact property and ranges defined in the analytics contract.
3. Inspect the relevant site, documentation, repository, generated catalog, and tests.
4. Read `marketing/distribution-plan.json` only when evaluating an already active or explicitly
   approved distribution campaign.
5. Use primary, current sources for any external platform rule or technical claim.

## Decision order

Evaluate these areas in order:

1. broken builds, links, metadata, tracking, or public routes;
2. friction from an article or landing page to relevant Docs, GitHub, or npm resources;
3. setup and adoption friction in project landing pages and documentation;
4. inconsistencies between the site, Docs, READMEs, releases, and supported versions;
5. discoverability of existing problem-solving content;
6. evidence that a previous improvement helped, failed, or needs more time.

Do not rank an idea higher merely because it could increase Sponsor clicks.

## Evidence and baseline

For each candidate, record:

- the exact GA4 property, timezone, date range, comparison range, filters, and data source;
- the affected route, project, or user journey;
- the observed problem and the evidence for it;
- the proposed change and why it should help users;
- one primary success metric and any guardrail metric;
- the earliest date on which the result can be evaluated.

Compare the latest complete 7-day period with the preceding 7 days. Use a complete 28-day view for
context when available. Do not treat incomplete recent data as a decline. Do not invent unavailable
values or imply causation from a single correlation.

## Choose one outcome

Choose exactly one:

- **Implement:** one small, reversible, evidence-backed improvement;
- **Observe:** the prior change has not reached its evaluation date;
- **Report:** there is a meaningful finding but no safe repository change;
- **No action:** evidence is insufficient or no user-benefiting change is justified.

An empty week is acceptable. Never open an empty or cosmetic pull request to demonstrate activity.

## Implementation boundaries

- Do not edit article source Markdown.
- Do not add exclusive sponsor-only features or restrict existing public functionality.
- Do not add sponsorship prompts to issue replies, support responses, install steps, or error states.
- Do not place a prominent Sponsor CTA above the primary task of a page.
- Do not repeatedly add or A/B test donation language.
- Prefer clearer navigation, accurate compatibility information, reproducible examples, accessible
  UI, faster pages, and better measurement.
- Keep every change small enough to attribute and revert.

## Sponsorship guardrail

The internal north-star outcome is healthy, retained individual monthly sponsorship, but the weekly
agent must not optimize directly for it. Public-facing decisions must pass this test:

> Would this still be a good change for users if it produced no new sponsors?

If the answer is no, do not implement it.

Sponsorship may be observed monthly through active individual sponsors, new sponsors, cancellations,
net change, and retention when those values are legitimately available. Sponsor-link clicks are a
diagnostic signal only. Never identify or profile individual sponsors, infer motives, or manufacture
attribution that the data cannot support.

Keep sponsorship availability quiet and optional: GitHub's standard Sponsor surface, the existing
home-page section, and a short contextual note at the end of an appropriate maintenance report are
sufficient. Individual sponsorship must not promise priority support, an SLA, or exclusive access.

## Review cycle

For an implementation:

1. Run a manager review for user value, accuracy, scope, and repository policy.
2. Run a marketing review for audience fit, trust, tone, measurement quality, and over-promotion.
3. Fix every blocking issue and repeat both reviews until both approve.
4. Run `npm run fmt:check`, `npm run lint`, relevant tests, and required generated-output checks.
5. Create a work branch and a reviewable pull request only when files changed.

The pull request must state the evidence, hypothesis, primary metric, guardrail, evaluation date,
review approvals, and limitations. It must not claim causation before the evaluation window closes.

## Distribution is opt-in

Do not start a backlog campaign automatically. Distribution work is allowed only when the user has
explicitly selected an article or campaign for promotion. When authorized, follow
`distribution-plan.schema.json`, create one artifact per placement, run both review cycles, and run
`npm run marketing:validate`.

A merged copy artifact never authorizes publication. The user publishes manually unless they grant
separate approval for the exact copy, destination, and account. Hacker News, Reddit, Discord, and
forums remain personal, human-led community participation rather than automated brand posting.

## Weekly report

Every run reports:

- complete measurement ranges and data availability;
- the single selected outcome and its evidence;
- what changed, or why no change was justified;
- the next evaluation date;
- blockers such as missing GA4 or Search Console access;
- any action that still requires explicit user approval.
