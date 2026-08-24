import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { JSDOM } from 'jsdom';
import {
  assertLocalArticleImagesExist,
  generateArticles,
  normalizeFootnoteIds,
  renderArticleCoverSvg,
} from './generate-articles';

test('requires root-relative article images to exist under the public directory', async () => {
  const root = await mkdtemp(join(tmpdir(), 'article-local-image-'));
  const publicRoot = join(root, 'public');
  const imagePath = join(publicRoot, 'images/example/screenshot.png');

  try {
    await mkdir(join(publicRoot, 'images/example'), { recursive: true });
    await writeFile(imagePath, 'image');
    await assertLocalArticleImagesExist(
      '![Screenshot](/images/example/screenshot.png)',
      publicRoot,
      'example.md',
    );
    await assert.rejects(
      assertLocalArticleImagesExist(
        '![Missing](/images/example/missing.png)',
        publicRoot,
        'example.md',
      ),
      /example\.md references a missing local image: \/images\/example\/missing\.png/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('renders an article-specific 1200x630 cover with escaped content', () => {
  const svg = renderArticleCoverSvg({
    slug: 'capacitor-example',
    title: 'Capacitor <Example> & Setup',
    emoji: '⚡',
  });
  assert.match(svg, /width="1200" height="630"/);
  assert.match(svg, /Capacitor &lt;Example&gt; &amp; Setup/);
  assert.match(svg, /⚡/);
  assert.doesNotMatch(svg, /<Example>/);
  const longWordSvg = renderArticleCoverSvg({
    slug: 'long-word',
    title:
      '@capacitor-community/extraordinarily-long-package-name setup and troubleshooting guide for enterprise production applications',
    emoji: '🔧',
  });
  assert.equal(longWordSvg.match(/font-size="58"/g)?.length, 3);
  assert.match(longWordSvg, /…<\/text>/);
});

test('normalizes random Zenn footnote ids to stable article-scoped ids', () => {
  const rendered = new JSDOM(`
    <sup class="footnote-ref"><a href="#fn-a1b2-1" id="fnref-a1b2-1">[1]</a></sup>
    <li class="footnote-item" id="fn-a1b2-1">
      Footnote <a href="#fnref-a1b2-1" class="footnote-backref">↩︎</a>
    </li>
  `);

  normalizeFootnoteIds(rendered.window.document, 'example-article');

  assert.ok(rendered.window.document.getElementById('fnref-example-article-1'));
  assert.ok(rendered.window.document.getElementById('fn-example-article-1'));
  assert.equal(
    rendered.window.document
      .querySelector<HTMLAnchorElement>('.footnote-ref a')
      ?.getAttribute('href'),
    '#fn-example-article-1',
  );
  assert.equal(
    rendered.window.document
      .querySelector<HTMLAnchorElement>('.footnote-backref')
      ?.getAttribute('href'),
    '#fnref-example-article-1',
  );
});

test('writes sitemap lastmod only when article front matter declares updatedAt', async () => {
  const root = await mkdtemp(join(tmpdir(), 'article-lastmod-'));
  const articlesRoot = join(root, 'projects/web-site/src/articles');
  const publicRoot = join(root, 'projects/web-site/public');

  try {
    await Promise.all([
      mkdir(articlesRoot, { recursive: true }),
      mkdir(publicRoot, { recursive: true }),
    ]);
    await writeFile(
      join(articlesRoot, 'example.md'),
      `---
title: Example translation
description: Example description
updatedAt: 2024-06-15
zennSlug: example
---
Translated body.
`,
      'utf8',
    );

    await generateArticles({
      root,
      fetchZennArticles: async () => [
        {
          slug: 'example',
          title: 'Japanese source',
          url: 'https://zenn.dev/rdlabo/articles/example',
          publishedAt: '2024-06-01T03:18:54.000Z',
          publishedDate: '2024-06-01',
        },
      ],
      fetchNoteSource: async () => {
        throw new Error('note fetch must not run in this test');
      },
    });

    const sitemap = await readFile(join(publicRoot, 'sitemap.xml'), 'utf8');
    assert.match(
      sitemap,
      /<loc>https:\/\/rdlabo\.dev\/articles\/example<\/loc>\s*<lastmod>2024-06-15<\/lastmod>/,
    );
    assert.doesNotMatch(sitemap, /<loc>https:\/\/rdlabo\.dev\/<\/loc>\s*<lastmod>/);
    const catalog = await readFile(
      join(root, 'projects/web-site/src/app/generated/article-catalog.generated.ts'),
      'utf8',
    );
    assert.match(catalog, /"image": "https:\/\/rdlabo\.dev\/article-images\/example\.svg"/);
    assert.match(catalog, /"imageWidth": 1200/);
    assert.match(catalog, /"imageHeight": 630/);
    const cover = await readFile(join(publicRoot, 'article-images/example.svg'), 'utf8');
    assert.match(cover, /Example translation/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('invalid explicit article image aborts before generated outputs are changed', async () => {
  const root = await mkdtemp(join(tmpdir(), 'article-image-'));
  const articlesRoot = join(root, 'projects/web-site/src/articles');
  const generatedArticlesRoot = join(root, 'projects/web-site/src/app/generated/articles');
  const sentinelPath = join(generatedArticlesRoot, 'keep.generated.ts');

  try {
    await Promise.all([
      mkdir(articlesRoot, { recursive: true }),
      mkdir(generatedArticlesRoot, { recursive: true }),
    ]);
    await Promise.all([
      writeFile(
        join(articlesRoot, 'example.md'),
        `---
title: Example translation
description: Example description
image: http://example.com/insecure.png
zennSlug: example
---
Translated body.
`,
        'utf8',
      ),
      writeFile(sentinelPath, 'existing generated output\n', 'utf8'),
    ]);

    await assert.rejects(() => generateArticles({ root }), /absolute HTTPS URL/);
    assert.equal(await readFile(sentinelPath, 'utf8'), 'existing generated output\n');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('updatedAt before source publishedDate aborts before generated outputs are changed', async () => {
  const root = await mkdtemp(join(tmpdir(), 'article-updated-at-'));
  const articlesRoot = join(root, 'projects/web-site/src/articles');
  const generatedArticlesRoot = join(root, 'projects/web-site/src/app/generated/articles');
  const publicRoot = join(root, 'projects/web-site/public');
  const sentinelPath = join(generatedArticlesRoot, 'keep.generated.ts');

  try {
    await Promise.all([
      mkdir(articlesRoot, { recursive: true }),
      mkdir(generatedArticlesRoot, { recursive: true }),
      mkdir(publicRoot, { recursive: true }),
    ]);
    await Promise.all([
      writeFile(
        join(articlesRoot, 'example.md'),
        `---
title: Example translation
description: Example description
updatedAt: 2024-05-01
zennSlug: example
---
Translated body.
`,
        'utf8',
      ),
      writeFile(sentinelPath, 'existing generated output\n', 'utf8'),
      writeFile(join(publicRoot, 'sitemap.xml'), '<urlset></urlset>\n', 'utf8'),
    ]);

    await assert.rejects(
      () =>
        generateArticles({
          root,
          fetchZennArticles: async () => [
            {
              slug: 'example',
              title: 'Japanese source',
              url: 'https://zenn.dev/rdlabo/articles/example',
              publishedAt: '2024-06-01T03:18:54.000Z',
              publishedDate: '2024-06-01',
            },
          ],
          fetchNoteSource: async () => {
            throw new Error('note fetch must not run in this test');
          },
        }),
      /updatedAt on or after the source publishedDate \(2024-06-01\), got 2024-05-01/,
    );
    assert.equal(await readFile(sentinelPath, 'utf8'), 'existing generated output\n');
    assert.equal(await readFile(join(publicRoot, 'sitemap.xml'), 'utf8'), '<urlset></urlset>\n');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('updatedAt before note publishedDate aborts before generated outputs are changed', async () => {
  const root = await mkdtemp(join(tmpdir(), 'note-updated-at-'));
  const articlesRoot = join(root, 'projects/web-site/src/articles');
  const generatedArticlesRoot = join(root, 'projects/web-site/src/app/generated/articles');
  const sentinelPath = join(generatedArticlesRoot, 'keep.generated.ts');

  try {
    await Promise.all([
      mkdir(articlesRoot, { recursive: true }),
      mkdir(generatedArticlesRoot, { recursive: true }),
    ]);
    await Promise.all([
      writeFile(
        join(articlesRoot, 'example.md'),
        `---
title: Example translation
description: Example description
source: note
sourceUrl: https://note.com/rdlabo/n/nexample
sourceRevision: reviewed-revision
updatedAt: 2024-05-01
slug: example
---
Translated body.
`,
        'utf8',
      ),
      writeFile(sentinelPath, 'existing generated output\n', 'utf8'),
    ]);

    await assert.rejects(
      () =>
        generateArticles({
          root,
          fetchZennArticles: async () => [],
          fetchNoteSource: async () => ({
            id: 'nexample',
            title: 'Japanese source',
            url: 'https://note.com/rdlabo/n/nexample',
            publishedAt: '2024-06-01T03:18:54.000Z',
            publishedDate: '2024-06-01',
            sourceRevision: 'reviewed-revision',
          }),
        }),
      /updatedAt on or after the source publishedDate \(2024-06-01\), got 2024-05-01/,
    );
    assert.equal(await readFile(sentinelPath, 'utf8'), 'existing generated output\n');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('a stale note revision aborts before generated outputs are changed', async () => {
  const root = await mkdtemp(join(tmpdir(), 'note-revision-'));
  const articlesRoot = join(root, 'projects/web-site/src/articles');
  const generatedArticlesRoot = join(root, 'projects/web-site/src/app/generated/articles');
  const sentinelPath = join(generatedArticlesRoot, 'keep.generated.ts');

  try {
    await Promise.all([
      mkdir(articlesRoot, { recursive: true }),
      mkdir(generatedArticlesRoot, { recursive: true }),
    ]);
    await Promise.all([
      writeFile(
        join(articlesRoot, 'example.md'),
        `---
title: Example translation
description: Example description
source: note
sourceUrl: https://note.com/rdlabo/n/nexample
sourceRevision: reviewed-revision
slug: example
---
Translated body.
`,
        'utf8',
      ),
      writeFile(sentinelPath, 'existing generated output\n', 'utf8'),
    ]);

    await assert.rejects(
      () =>
        generateArticles({
          root,
          fetchZennArticles: async () => [],
          fetchNoteSource: async () => ({
            id: 'nexample',
            title: 'Japanese source',
            url: 'https://note.com/rdlabo/n/nexample',
            publishedAt: '2026-08-19T03:18:54.000Z',
            publishedDate: '2026-08-19',
            sourceRevision: 'changed-revision',
          }),
        }),
      /older note revision/,
    );
    assert.equal(await readFile(sentinelPath, 'utf8'), 'existing generated output\n');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
