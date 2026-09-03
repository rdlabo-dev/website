import assert from 'node:assert/strict';
import { test } from 'node:test';
import { type DistributionPlan, validateDistributionPlan } from './validate-distribution-plan';

const placement = (id: string) => ({
  id,
  channel: 'x',
  destination: '@rdlabo',
  status: 'planned' as const,
});
const base = (): DistributionPlan => ({
  campaigns: [
    {
      priority: 1,
      id: '2026q3-example',
      slug: 'same-article',
      audience: 'Engineers',
      status: 'backlog',
      placements: [placement('x-launch'), placement('x-followup')],
    },
    {
      priority: 2,
      id: '2026q4-example',
      slug: 'same-article',
      audience: 'Engineers',
      status: 'backlog',
      placements: [placement('x-launch')],
    },
  ],
});
const options = { articleSlugs: new Set(['same-article']), copyIsFile: () => true };

test('allows repeated articles and channels across placements', () =>
  assert.doesNotThrow(() => validateDistributionPlan(base(), options)));
test('rejects invalid lifecycle evidence', () => {
  const plan = base();
  plan.campaigns[0].status = 'complete';
  assert.throws(() => validateDistributionPlan(plan, options), /complete requires/);
});
test('rejects schema-invalid channel, missing copy, and missing npmClicks', () => {
  const channel = structuredClone(base()) as any;
  channel.campaigns[0].placements[0].channel = 'unknown';
  assert.throws(() => validateDistributionPlan(channel, options), /allowed values/);
  const copy = base();
  copy.campaigns[0].status = 'copy-ready';
  copy.campaigns[0].placements[0].status = 'drafted';
  assert.throws(() => validateDistributionPlan(copy, options), /copyPath/);
  const metrics = structuredClone(base()) as any;
  metrics.campaigns[0].status = 'active';
  metrics.campaigns[0].placements = [
    {
      id: 'x-launch',
      channel: 'x',
      destination: '@rdlabo',
      status: 'published',
      copyPath: 'marketing/campaigns/2026q3-example/x-launch.md',
      url: 'https://example.com/post',
      publishedAt: '2026-09-03T10:00:00+09:00',
      results: [
        {
          window: '24h',
          measuredAt: '2026-09-04T10:00:00+09:00',
          source: 'GA4',
          articleVisitors: 1,
          docsClicks: 0,
          githubClicks: 0,
          sponsorClicks: 0,
          backlinks: 0,
          officialMentions: 0,
        },
      ],
    },
  ];
  assert.throws(() => validateDistributionPlan(metrics, options), /npmClicks/);
});
test('rejects timezone-free datetime and mismatched copy path', () => {
  const plan = base() as any;
  plan.campaigns[0].status = 'scheduled';
  plan.campaigns[0].placements = [
    {
      id: 'x-launch',
      channel: 'x',
      destination: '@rdlabo',
      status: 'scheduled',
      copyPath: 'marketing/campaigns/wrong/x-launch.md',
      scheduledAt: '2026-09-03T10:00:00',
    },
  ];
  assert.throws(() => validateDistributionPlan(plan, options), /date-time/);
  plan.campaigns[0].placements[0].scheduledAt = '2026-09-03T10:00:00+09:00';
  assert.throws(() => validateDistributionPlan(plan, options), /copyPath must match/);
});
