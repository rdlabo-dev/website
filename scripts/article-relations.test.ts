import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { groupRelatedArticlesByLibrary, parseRelatedLibraryIds } from './article-relations';

test('normalizes, deduplicates, and validates related library IDs', () => {
  assert.deepEqual(
    parseRelatedLibraryIds(
      [' ionic-theme-md3 ', 'ionic-theme-ios26', 'ionic-theme-md3'],
      'article.md',
    ),
    ['ionic-theme-md3', 'ionic-theme-ios26'],
  );
  assert.deepEqual(parseRelatedLibraryIds(undefined, 'article.md'), []);
  assert.throws(
    () => parseRelatedLibraryIds(['   '], 'article.md'),
    /must not declare an empty relatedLibraries project ID/,
  );
  assert.throws(
    () => parseRelatedLibraryIds(['missing-library'], 'article.md'),
    /declares unknown relatedLibraries project ID: missing-library/,
  );
  assert.throws(
    () => parseRelatedLibraryIds('ionic-theme-md3', 'article.md'),
    /must declare relatedLibraries as an array of project IDs/,
  );
});

test('groups generated article summaries by library in reverse publication order', () => {
  const related = groupRelatedArticlesByLibrary([
    {
      slug: 'first',
      title: 'First',
      description: 'First description',
      publishedDate: '2026-08-23',
      relatedLibraries: [
        { id: 'ionic-theme-md3' },
        { id: 'ionic-theme-ios26' },
        { id: 'ionic-theme-md3' },
      ],
    },
    {
      slug: 'last',
      title: 'Last',
      description: 'Last description',
      publishedDate: '2026-08-24',
      relatedLibraries: [{ id: 'ionic-theme-md3' }],
    },
    {
      slug: 'ignored',
      title: 'Ignored',
      description: 'Ignored description',
      publishedDate: '2026-08-25',
    },
  ]);
  assert.deepEqual(
    related.get('ionic-theme-md3')?.map((article) => article.slug),
    ['last', 'first'],
  );
  assert.deepEqual(related.get('ionic-theme-ios26'), [
    {
      slug: 'first',
      title: 'First',
      description: 'First description',
      publishedDate: '2026-08-23',
      url: 'https://rdlabo.dev/articles/first',
    },
  ]);
});

test('rejects malformed generated related article metadata', () => {
  assert.throws(
    () =>
      groupRelatedArticlesByLibrary([
        {
          slug: 'invalid',
          title: ' ',
          description: 'Description',
          publishedDate: '2026-08-24',
          relatedLibraries: [{ id: 'ionic-theme-md3' }],
        },
      ]),
    /must declare a non-empty title/,
  );
});

test('generates article metadata before documentation through the public docs entrypoint', async () => {
  const packageJson = JSON.parse(
    await readFile(new URL('../package.json', import.meta.url), 'utf8'),
  ) as { scripts: Record<string, string> };
  assert.equal(
    packageJson.scripts['docs:generate'],
    'npm run articles:generate && npm run docs:generate:content',
  );
  assert.equal(packageJson.scripts['docs:generate:content'], 'tsx scripts/generate-docs.ts');
  for (const script of ['prestart', 'prestart:ja', 'prebuild:docs', 'pretest']) {
    assert.equal(packageJson.scripts[script], 'npm run docs:generate', script);
  }
});
