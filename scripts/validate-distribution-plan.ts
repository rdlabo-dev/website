import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { ARTICLE_SUMMARIES } from '../projects/web-site/src/app/generated/article-catalog.generated';

type Result = { window: '24h' | '7d' | '30d' };
type Placement = {
  id: string;
  channel: string;
  destination: string;
  status: 'planned' | 'drafted' | 'scheduled' | 'published' | 'skipped';
  copyPath?: string;
  results?: Result[];
};
type Campaign = {
  priority: number;
  id: string;
  slug: string;
  audience: string;
  status: 'backlog' | 'copy-ready' | 'scheduled' | 'active' | 'complete';
  placements: Placement[];
};
export type DistributionPlan = { campaigns: Campaign[] };

const schema = JSON.parse(
  readFileSync(new URL('../marketing/distribution-plan.schema.json', import.meta.url), 'utf8'),
);
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validateSchema = ajv.compile(schema);

export function validateDistributionPlan(
  plan: DistributionPlan,
  options: { articleSlugs?: Set<string>; copyIsFile?: (path: string) => boolean } = {},
): void {
  assert(validateSchema(plan), ajv.errorsText(validateSchema.errors, { separator: '\n' }));
  const articleSlugs = options.articleSlugs ?? new Set(ARTICLE_SUMMARIES.map(({ slug }) => slug));
  const copyIsFile =
    options.copyIsFile ??
    ((path: string) => {
      try {
        return statSync(resolve(path)).isFile();
      } catch {
        return false;
      }
    });
  const ids = new Set<string>();
  const priorities = new Set<number>();
  for (const campaign of plan.campaigns) {
    assert(!ids.has(campaign.id), `Duplicate campaign id: ${campaign.id}`);
    assert(!priorities.has(campaign.priority), `Duplicate campaign priority: ${campaign.priority}`);
    assert(articleSlugs.has(campaign.slug), `Unknown article slug: ${campaign.slug}`);
    ids.add(campaign.id);
    priorities.add(campaign.priority);
    const placementIds = new Set<string>();
    for (const placement of campaign.placements) {
      assert(
        !placementIds.has(placement.id),
        `Duplicate placement id in ${campaign.id}: ${placement.id}`,
      );
      placementIds.add(placement.id);
      if (['drafted', 'scheduled', 'published'].includes(placement.status)) {
        const expected = `marketing/campaigns/${campaign.id}/${placement.id}.md`;
        assert.equal(
          placement.copyPath,
          expected,
          `${campaign.id}/${placement.id}: copyPath must match its placement`,
        );
        assert(
          copyIsFile(expected),
          `${campaign.id}/${placement.id}: copyPath is not a regular file`,
        );
      }
      const windows = (placement.results ?? []).map(({ window }) => window);
      assert(
        new Set(windows).size === windows.length,
        `${campaign.id}/${placement.id}: duplicate result window`,
      );
    }
    const statuses = campaign.placements.map(({ status }) => status);
    if (campaign.status === 'active')
      assert(
        statuses.includes('published'),
        `${campaign.id}: active requires a published placement`,
      );
    if (campaign.status === 'complete')
      assert(
        campaign.placements.every(
          (p) =>
            p.status === 'skipped' ||
            (p.status === 'published' && p.results?.some(({ window }) => window === '30d')),
        ),
        `${campaign.id}: complete requires every placement to be skipped or published with a 30d result`,
      );
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const plan = JSON.parse(
    readFileSync('marketing/distribution-plan.json', 'utf8'),
  ) as DistributionPlan;
  validateDistributionPlan(plan);
  console.log(`Validated ${plan.campaigns.length} distribution campaigns.`);
}
