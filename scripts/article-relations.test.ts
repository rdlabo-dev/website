import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { loadRelatedArticlesByLibrary, parseRelatedLibraryIds } from './article-relations';

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

test('groups articles by library in deterministic filename order', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'article-relations-'));
  try {
    await Promise.all([
      writeFile(
        join(directory, 'z-last.md'),
        `---
title: Last
description: Last description
slug: last
relatedLibraries:
  - ionic-theme-md3
---
Body
`,
      ),
      writeFile(
        join(directory, 'a-first.md'),
        `---
title: First
description: First description
zennSlug: first
relatedLibraries:
  - " ionic-theme-md3 "
  - ionic-theme-ios26
  - ionic-theme-md3
---
Body
`,
      ),
      writeFile(join(directory, 'ignored.md'), '---\ntitle: Ignored\n---\nBody\n'),
    ]);

    const related = await loadRelatedArticlesByLibrary(directory);
    assert.deepEqual(
      related.get('ionic-theme-md3')?.map((article) => article.slug),
      ['first', 'last'],
    );
    assert.deepEqual(related.get('ionic-theme-ios26'), [
      {
        slug: 'first',
        title: 'First',
        description: 'First description',
        url: 'https://rdlabo.dev/articles/first',
      },
    ]);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('rejects malformed related article metadata', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'article-relations-invalid-'));
  try {
    await writeFile(
      join(directory, 'invalid.md'),
      `---
title: " "
description: Description
slug: invalid
relatedLibraries:
  - ionic-theme-md3
---
`,
    );
    await assert.rejects(loadRelatedArticlesByLibrary(directory), /must declare a non-empty title/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
