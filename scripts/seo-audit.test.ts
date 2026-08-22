import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { JSDOM } from 'jsdom';
import { isValidContentUpdatedAt } from './seo-dates';
import {
  auditDuplicateMetadata,
  auditHreflangKeys,
  auditHtmlHreflangReciprocity,
  auditHtmlPage,
  auditJsonLdSemantics,
  auditOrphanSitemapPages,
  auditSitemapEntries,
  collectInternalSitemapLinks,
  expectedJsonLdTypes,
  htmlPathToPublicUrl,
  normalizeCanonicalUrl,
  normalizePublicUrl,
  parseSitemap,
  resolveInternalSitemapLink,
  runSeoAudit,
  sitemapUrlToHtmlPath,
} from './seo-audit';

const WEB_SITE_HOME_JSON_LD =
  '<script id="rdlabo-json-ld" type="application/ld+json" data-rdlabo-json-ld>{"@context":"https://schema.org","@graph":[{"@type":"WebSite","url":"https://rdlabo.dev","publisher":{"@id":"https://rdlabo.dev/#organization"},"inLanguage":"en"},{"@type":"Organization","@id":"https://rdlabo.dev/#organization","name":"rdlabo","url":"https://rdlabo.dev"}]}</script>';

function webSiteArticleJsonLd(slug: string): string {
  const pageUrl = `https://rdlabo.dev/articles/${slug}`;
  const sourceUrl = `https://zenn.dev/rdlabo/articles/${slug}`;
  const imageUrl = `https://rdlabo.dev/article-images/${slug}.svg`;
  return `<meta property="article:published_time" content="2026-01-01T00:00:00.000Z"><meta property="og:image" content="${imageUrl}"><script id="rdlabo-json-ld" type="application/ld+json" data-rdlabo-json-ld>{"@context":"https://schema.org","@graph":[{"@type":"BlogPosting","mainEntityOfPage":"${pageUrl}","headline":"Article","description":"Example article.","image":"${imageUrl}","datePublished":"2026-01-01T00:00:00.000Z","author":{"@type":"Organization","name":"rdlabo","url":"https://rdlabo.dev"},"publisher":{"@id":"https://rdlabo.dev/#organization"},"inLanguage":"en","isBasedOn":{"@type":"Article","@id":"${sourceUrl}","inLanguage":"ja"}},{"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://rdlabo.dev"},{"@type":"ListItem","position":2,"name":"Articles","item":"https://rdlabo.dev/articles"},{"@type":"ListItem","position":3,"name":"Article","item":"${pageUrl}"}]}]}</script>`;
}

function webSiteArticleBody(slug: string): string {
  return `<time data-article-published datetime="2026-01-01">January 1, 2026</time><img data-article-image src="https://rdlabo.dev/article-images/${slug}.svg"><aside class="article-original"><a href="https://zenn.dev/rdlabo/articles/${slug}">Original</a></aside>`;
}

const DOCS_HOME_JSON_LD_EN =
  '<script id="rdlabo-json-ld" type="application/ld+json" data-rdlabo-json-ld>{"@context":"https://schema.org","@graph":[{"@type":"WebSite","url":"https://docs.rdlabo.dev/","publisher":{"@id":"https://rdlabo.dev/#organization"},"inLanguage":"en"}]}</script>';

const DOCS_HOME_JSON_LD_JA =
  '<script id="rdlabo-json-ld" type="application/ld+json" data-rdlabo-json-ld>{"@context":"https://schema.org","@graph":[{"@type":"WebPage","url":"https://docs.rdlabo.dev/ja","isPartOf":{"@id":"https://docs.rdlabo.dev/#website"},"inLanguage":"ja"}]}</script>';

test('parseSitemap reads loc and lastmod only', () => {
  const entries = parseSitemap(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://docs.rdlabo.dev/</loc>
    <lastmod>2026-08-23</lastmod>
  </url>
</urlset>`);
  assert.equal(entries.length, 1);
  assert.equal(entries[0]?.loc, 'https://docs.rdlabo.dev/');
  assert.equal(entries[0]?.lastmod, '2026-08-23');
});

test('auditSitemapEntries rejects duplicate locs and future lastmod values', () => {
  const now = new Date('2026-08-23T12:00:00.000Z');
  const errors = auditSitemapEntries(
    [
      { loc: 'https://rdlabo.dev/' },
      { loc: 'https://rdlabo.dev/' },
      { loc: 'https://rdlabo.dev/articles', lastmod: '2026-08-24' },
    ],
    'https://rdlabo.dev',
  ).filter((error) => error.includes('future') || error.includes('duplicate'));
  assert.match(errors.join('\n'), /duplicate sitemap loc https:\/\/rdlabo\.dev\//);
  assert.match(errors.join('\n'), /invalid or future lastmod 2026-08-24/);
  assert.equal(isValidContentUpdatedAt('2026-08-24', now), false);
});

test('auditHtmlPage rejects empty hreflang attributes even when en, ja, and x-default are present', () => {
  const origin = 'https://docs.rdlabo.dev';
  const html = `<!doctype html><html lang="en"><head>
<title>Docs home</title>
<meta name="description" content="Docs portal home." />
<link rel="canonical" href="${origin}/" />
<link rel="alternate" hreflang="en" href="${origin}/" />
<link rel="alternate" hreflang="ja" href="${origin}/ja" />
<link rel="alternate" hreflang="x-default" href="${origin}/" />
<link rel="alternate" hreflang="  " href="${origin}/fr" />
</head><body></body></html>`;
  assert.match(
    auditHtmlPage(html, `${origin}/`, { bilingual: true }).join('\n'),
    /hreflang alternate link must not have an empty hreflang attribute/,
  );
});

test('auditHtmlPage rejects relative and non-HTTPS hreflang alternate hrefs', () => {
  const origin = 'https://docs.rdlabo.dev';
  const baseHead = (enHref: string, jaHref: string) => `<!doctype html><html lang="en"><head>
<title>Docs home</title>
<meta name="description" content="Docs portal home." />
<link rel="canonical" href="${origin}/" />
<link rel="alternate" hreflang="en" href="${enHref}" />
<link rel="alternate" hreflang="ja" href="${jaHref}" />
<link rel="alternate" hreflang="x-default" href="${origin}/" />
</head><body></body></html>`;

  assert.match(
    auditHtmlPage(baseHead('/', `${origin}/ja`), `${origin}/`, { bilingual: true }).join('\n'),
    /hreflang="en" alternate href must be a fully-qualified HTTPS URL \(got "\/"\)/,
  );
  assert.match(
    auditHtmlPage(baseHead(`${origin}/`, '/ja'), `${origin}/`, { bilingual: true }).join('\n'),
    /hreflang="ja" alternate href must be a fully-qualified HTTPS URL \(got "\/ja"\)/,
  );
  assert.match(
    auditHtmlPage(baseHead('//docs.rdlabo.dev/', `${origin}/ja`), `${origin}/`, {
      bilingual: true,
    }).join('\n'),
    /hreflang="en" alternate href must be a fully-qualified HTTPS URL \(got protocol-relative/,
  );
  assert.match(
    auditHtmlPage(baseHead('http://docs.rdlabo.dev/', `${origin}/ja`), `${origin}/`, {
      bilingual: true,
    }).join('\n'),
    /hreflang="en" alternate href must use HTTPS/,
  );
  assert.match(
    auditHtmlPage(baseHead('https:docs.rdlabo.dev', `${origin}/ja`), `${origin}/`, {
      bilingual: true,
    }).join('\n'),
    /hreflang="en" alternate href must be a fully-qualified HTTPS URL/,
  );
});

test('auditHtmlPage rejects unexpected hreflang keys such as fr', () => {
  const origin = 'https://docs.rdlabo.dev';
  const html = `<!doctype html><html lang="en"><head>
<title>Docs home</title>
<meta name="description" content="Docs portal home." />
<link rel="canonical" href="${origin}/" />
<link rel="alternate" hreflang="en" href="${origin}/" />
<link rel="alternate" hreflang="ja" href="${origin}/ja" />
<link rel="alternate" hreflang="x-default" href="${origin}/" />
<link rel="alternate" hreflang="fr" href="${origin}/fr" />
</head><body></body></html>`;
  assert.match(
    auditHtmlPage(html, `${origin}/`, { bilingual: true }).join('\n'),
    /unexpected hreflang="fr" alternate link/,
  );
});

test('auditHtmlHreflangReciprocity rejects reciprocal pairs with matching extra fr hreflang', () => {
  const origin = 'https://docs.rdlabo.dev';
  const english = normalizePublicUrl(origin, `${origin}/support`);
  const japanese = normalizePublicUrl(origin, `${origin}/ja/support`);
  const french = normalizePublicUrl(origin, `${origin}/fr/support`);
  const sitemapLocs = new Set([english, japanese, french]);
  const shared = new Map<string, string>([
    ['en', english],
    ['ja', japanese],
    ['x-default', english],
    ['fr', french],
  ]);

  const errors = auditHtmlHreflangReciprocity(
    new Map([
      [english, shared],
      [japanese, shared],
    ]),
    sitemapLocs,
  );
  assert.match(errors.join('\n'), /unexpected hreflang="fr" alternate link/);
});

test('auditHreflangKeys allows only en, ja, and x-default', () => {
  const origin = 'https://docs.rdlabo.dev';
  assert.deepEqual(auditHreflangKeys(`${origin}/`, new Map([['en', `${origin}/`]])), [
    `${origin}/: missing hreflang="ja" alternate link`,
    `${origin}/: missing hreflang="x-default" alternate link`,
  ]);
});

test('auditHtmlPage rejects canonical URLs with query strings or fragments', () => {
  const origin = 'https://docs.rdlabo.dev';
  const baseHead = (canonical: string) => `<!doctype html><html lang="en"><head>
<title>Docs home</title>
<meta name="description" content="Docs portal home." />
<link rel="canonical" href="${canonical}" />
</head><body></body></html>`;

  assert.match(
    auditHtmlPage(baseHead(`${origin}/?utm_source=test`), `${origin}/`, { bilingual: false }).join(
      '\n',
    ),
    /canonical mismatch \(expected https:\/\/docs\.rdlabo\.dev\/, got https:\/\/docs\.rdlabo\.dev\/\?utm_source=test\)/,
  );
  assert.match(
    auditHtmlPage(baseHead(`${origin}/#section`), `${origin}/`, { bilingual: false }).join('\n'),
    /canonical mismatch \(expected https:\/\/docs\.rdlabo\.dev\/, got https:\/\/docs\.rdlabo\.dev\/#section\)/,
  );
  assert.deepEqual(auditHtmlPage(baseHead(`${origin}/`), `${origin}/`, { bilingual: false }), []);
  assert.equal(normalizeCanonicalUrl(origin, `${origin}/ja/`), `${origin}/ja`);
});

test('auditHtmlPage rejects an empty canonical href on the site root', () => {
  const html = `<!doctype html><html lang="en"><head>
<title>Docs home</title>
<meta name="description" content="Docs portal home." />
<link rel="canonical" href="" />
</head><body></body></html>`;
  assert.match(
    auditHtmlPage(html, 'https://rdlabo.dev/', { bilingual: false }).join('\n'),
    /canonical href must not be empty/,
  );
});

test('auditHtmlPage reports duplicate hreflang alternate links', () => {
  const html = `<!doctype html><html lang="en"><head>
<title>Docs home</title>
<meta name="description" content="Docs portal home." />
<link rel="canonical" href="https://docs.rdlabo.dev/" />
<link rel="alternate" hreflang="en" href="https://docs.rdlabo.dev/" />
<link rel="alternate" hreflang="en" href="https://docs.rdlabo.dev/support" />
<link rel="alternate" hreflang="ja" href="https://docs.rdlabo.dev/ja" />
<link rel="alternate" hreflang="x-default" href="https://docs.rdlabo.dev/" />
</head><body></body></html>`;
  assert.match(
    auditHtmlPage(html, 'https://docs.rdlabo.dev/', { bilingual: true }).join('\n'),
    /duplicate hreflang="en" alternate link/,
  );
});

test('auditHtmlHreflangReciprocity requires reciprocal en/ja mappings across sitemap pages', () => {
  const origin = 'https://docs.rdlabo.dev';
  const english = normalizePublicUrl(origin, `${origin}/support`);
  const japanese = normalizePublicUrl(origin, `${origin}/ja/support`);
  const sitemapLocs = new Set([english, japanese]);
  const shared = new Map<string, string>([
    ['en', english],
    ['ja', japanese],
    ['x-default', english],
  ]);

  assert.deepEqual(
    auditHtmlHreflangReciprocity(
      new Map([
        [english, shared],
        [japanese, shared],
      ]),
      sitemapLocs,
    ),
    [],
  );
});

test('auditHtmlHreflangReciprocity reports non-reciprocal and off-sitemap hreflang targets', () => {
  const origin = 'https://docs.rdlabo.dev';
  const english = normalizePublicUrl(origin, `${origin}/support`);
  const japanese = normalizePublicUrl(origin, `${origin}/ja/support`);
  const sitemapLocs = new Set([english, japanese]);
  const englishMap = new Map<string, string>([
    ['en', english],
    ['ja', japanese],
    ['x-default', english],
  ]);
  const mismatchedJapaneseMap = new Map<string, string>([
    ['en', english],
    ['ja', japanese],
    ['x-default', japanese],
  ]);

  const errors = auditHtmlHreflangReciprocity(
    new Map([
      [english, englishMap],
      [japanese, mismatchedJapaneseMap],
    ]),
    sitemapLocs,
  );
  assert.match(errors.join('\n'), /hreflang mapping is not reciprocal with/);

  const offSitemapErrors = auditHtmlHreflangReciprocity(
    new Map([
      [
        english,
        new Map<string, string>([
          ['en', english],
          ['ja', `${origin}/ja/missing`],
          ['x-default', english],
        ]),
      ],
    ]),
    sitemapLocs,
  );
  assert.match(offSitemapErrors.join('\n'), /hreflang="ja" must point to a sitemap-listed URL/);
});

test('auditHtmlPage validates title, description, canonical, and hreflang metadata', () => {
  const html = `<!doctype html><html lang="en"><head>
<title>Open Source Project Documentation | rdlabo</title>
<meta name="description" content="Docs portal home." />
<link rel="canonical" href="https://docs.rdlabo.dev/" />
<link rel="alternate" hreflang="en" href="https://docs.rdlabo.dev/" />
<link rel="alternate" hreflang="ja" href="https://docs.rdlabo.dev/ja" />
<link rel="alternate" hreflang="x-default" href="https://docs.rdlabo.dev/" />
</head><body></body></html>`;
  assert.deepEqual(auditHtmlPage(html, 'https://docs.rdlabo.dev/', { bilingual: true }), []);
});

test('maps sitemap URLs and built HTML paths for docs locales', () => {
  const browserRoot = '/tmp/docs/browser';
  assert.equal(
    sitemapUrlToHtmlPath('https://docs.rdlabo.dev', 'https://docs.rdlabo.dev/ja', browserRoot),
    join(browserRoot, 'ja', 'index.html'),
  );
  assert.equal(
    htmlPathToPublicUrl(
      'https://docs.rdlabo.dev',
      join(browserRoot, 'ja', 'projects', 'capacitor-admob', 'index.html'),
      browserRoot,
    ),
    'https://docs.rdlabo.dev/ja/projects/capacitor-admob',
  );
  assert.equal(
    normalizePublicUrl('https://docs.rdlabo.dev', 'https://docs.rdlabo.dev/ja/'),
    'https://docs.rdlabo.dev/ja',
  );
});

test('runSeoAudit reports missing build output', async () => {
  const root = await mkdtemp(join(tmpdir(), 'seo-audit-'));
  const errors = await runSeoAudit({
    root,
    targets: [
      {
        name: 'docs',
        origin: 'https://docs.rdlabo.dev',
        sitemapPath: 'dist/docs/browser/sitemap.xml',
        browserRoot: 'dist/docs/browser',
        bilingual: true,
      },
    ],
  });
  assert.match(errors[0] ?? '', /build output is missing/);
});

test('auditDuplicateMetadata reports duplicate nonempty descriptions by html lang', () => {
  const errors = auditDuplicateMetadata(
    'https://rdlabo.dev',
    new Map([
      [
        'en',
        new Map([
          ['Shared description.', ['https://rdlabo.dev/', 'https://rdlabo.dev/articles/example']],
          ['Unique description.', ['https://rdlabo.dev/articles/other']],
        ]),
      ],
    ]),
    'meta description',
  );
  assert.deepEqual(errors, [
    'https://rdlabo.dev (en): duplicate meta description "Shared description." on https://rdlabo.dev/, https://rdlabo.dev/articles/example',
  ]);
});

test('auditOrphanSitemapPages requires inbound internal links except site root', () => {
  const origin = 'https://rdlabo.dev';
  const sitemapLocs = new Set([
    normalizePublicUrl(origin, `${origin}/`),
    normalizePublicUrl(origin, `${origin}/articles/example`),
    normalizePublicUrl(origin, `${origin}/articles/orphan`),
  ]);
  const inboundLinks = new Map([
    [
      normalizePublicUrl(origin, `${origin}/articles/example`),
      new Set([normalizePublicUrl(origin, `${origin}/`)]),
    ],
  ]);
  assert.deepEqual(auditOrphanSitemapPages(origin, inboundLinks, sitemapLocs), [
    `${origin}/articles/orphan: orphan sitemap page with no inbound internal links`,
  ]);
});

test('resolveInternalSitemapLink normalizes same-origin, relative, and trailing-slash links', () => {
  const origin = 'https://rdlabo.dev';
  const sitemapLocs = new Set([
    normalizePublicUrl(origin, `${origin}/`),
    normalizePublicUrl(origin, `${origin}/articles/example`),
  ]);
  const fromUrl = `${origin}/`;
  assert.equal(
    resolveInternalSitemapLink(origin, fromUrl, '/articles/example/', sitemapLocs),
    `${origin}/articles/example`,
  );
  assert.equal(
    resolveInternalSitemapLink(origin, fromUrl, 'articles/example#section?q=1', sitemapLocs),
    `${origin}/articles/example`,
  );
  assert.equal(
    resolveInternalSitemapLink(origin, fromUrl, 'https://example.com/', sitemapLocs),
    undefined,
  );
  assert.equal(
    resolveInternalSitemapLink(origin, fromUrl, 'mailto:hello@example.com', sitemapLocs),
    undefined,
  );
});

test('collectInternalSitemapLinks ignores external and fragment-only anchors', () => {
  const origin = 'https://rdlabo.dev';
  const sitemapLocs = new Set([
    normalizePublicUrl(origin, `${origin}/`),
    normalizePublicUrl(origin, `${origin}/articles/example`),
  ]);
  const document = new JSDOM(`<!doctype html><html lang="en"><body>
<a href="/articles/example/">Example</a>
<a href="https://example.com/">External</a>
<a href="#section">Fragment</a>
<a href="mailto:hello@example.com">Mail</a>
</body></html>`).window.document;
  assert.deepEqual(collectInternalSitemapLinks(origin, `${origin}/`, document, sitemapLocs), [
    `${origin}/articles/example`,
  ]);
});

test('runSeoAudit reports orphan pages and duplicate descriptions', async () => {
  const root = await mkdtemp(join(tmpdir(), 'seo-audit-orphan-'));
  const browserRoot = join(root, 'dist/web-site/browser');
  await mkdir(join(browserRoot, 'articles', 'linked'), { recursive: true });
  await mkdir(join(browserRoot, 'articles', 'orphan'), { recursive: true });
  await writeFile(
    join(root, 'dist/web-site/browser/sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://rdlabo.dev/</loc></url>
  <url><loc>https://rdlabo.dev/articles/linked</loc></url>
  <url><loc>https://rdlabo.dev/articles/orphan</loc></url>
</urlset>`,
    'utf8',
  );
  const sharedDescription = 'Shared description for audit test.';
  const head = (
    title: string,
    canonical: string,
    jsonLd = '',
  ) => `<!doctype html><html lang="en"><head>
<title>${title}</title>
<meta name="description" content="${sharedDescription}" />
<link rel="canonical" href="${canonical}" />
${jsonLd}
</head><body>`;
  await Promise.all([
    writeFile(
      join(browserRoot, 'index.html'),
      `${head('Home — rdlabo.dev', 'https://rdlabo.dev/', WEB_SITE_HOME_JSON_LD)}<a href="/articles/linked">Linked</a></body></html>`,
      'utf8',
    ),
    writeFile(
      join(browserRoot, 'articles', 'linked', 'index.html'),
      `${head('Linked — rdlabo.dev', 'https://rdlabo.dev/articles/linked', webSiteArticleJsonLd('linked'))}${webSiteArticleBody('linked')}</body></html>`,
      'utf8',
    ),
    writeFile(
      join(browserRoot, 'articles', 'orphan', 'index.html'),
      `${head('Orphan — rdlabo.dev', 'https://rdlabo.dev/articles/orphan', webSiteArticleJsonLd('orphan'))}${webSiteArticleBody('orphan')}</body></html>`,
      'utf8',
    ),
  ]);

  const errors = await runSeoAudit({
    root,
    targets: [
      {
        name: 'web-site',
        origin: 'https://rdlabo.dev',
        sitemapPath: 'dist/web-site/browser/sitemap.xml',
        browserRoot: 'dist/web-site/browser',
        bilingual: false,
      },
    ],
  });

  assert.match(
    errors.join('\n'),
    /duplicate meta description "Shared description for audit test\." on https:\/\/rdlabo\.dev\/, https:\/\/rdlabo\.dev\/articles\/linked, https:\/\/rdlabo\.dev\/articles\/orphan/,
  );
  assert.match(
    errors.join('\n'),
    /https:\/\/rdlabo\.dev\/articles\/orphan: orphan sitemap page with no inbound internal links/,
  );
});

test('runSeoAudit passes for a minimal built site', async () => {
  const root = await mkdtemp(join(tmpdir(), 'seo-audit-site-'));
  const browserRoot = join(root, 'dist/web-site/browser');
  await mkdir(join(browserRoot, 'articles', 'example'), { recursive: true });
  await writeFile(
    join(root, 'dist/web-site/browser/sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://rdlabo.dev/</loc></url>
  <url><loc>https://rdlabo.dev/articles/example</loc></url>
</urlset>`,
    'utf8',
  );
  const page = `<!doctype html><html lang="en"><head>
<title>Example — rdlabo.dev</title>
<meta name="description" content="Example home page." />
<link rel="canonical" href="https://rdlabo.dev/" />
${WEB_SITE_HOME_JSON_LD}
</head><body><a href="/articles/example">Example article</a></body></html>`;
  const articlePage = `<!doctype html><html lang="en"><head>
<title>Example article — rdlabo.dev</title>
<meta name="description" content="Example article page." />
<link rel="canonical" href="https://rdlabo.dev/articles/example" />
${webSiteArticleJsonLd('example')}
</head><body>${webSiteArticleBody('example')}</body></html>`;
  await Promise.all([
    writeFile(join(browserRoot, 'index.html'), page, 'utf8'),
    writeFile(join(browserRoot, 'articles', 'example', 'index.html'), articlePage, 'utf8'),
  ]);

  const errors = await runSeoAudit({
    root,
    targets: [
      {
        name: 'web-site',
        origin: 'https://rdlabo.dev',
        sitemapPath: 'dist/web-site/browser/sitemap.xml',
        browserRoot: 'dist/web-site/browser',
        bilingual: false,
      },
    ],
  });
  assert.deepEqual(errors, []);
});

test('expectedJsonLdTypes maps representative routes to required schema types', () => {
  assert.deepEqual(expectedJsonLdTypes('https://rdlabo.dev/', 'web-site'), [
    'WebSite',
    'Organization',
  ]);
  assert.deepEqual(expectedJsonLdTypes('https://rdlabo.dev/articles', 'web-site'), [
    'BreadcrumbList',
  ]);
  assert.deepEqual(expectedJsonLdTypes('https://rdlabo.dev/articles/example', 'web-site'), [
    'BlogPosting',
    'BreadcrumbList',
  ]);
  assert.deepEqual(expectedJsonLdTypes('https://docs.rdlabo.dev/', 'docs'), ['WebSite']);
  assert.deepEqual(expectedJsonLdTypes('https://docs.rdlabo.dev/ja', 'docs'), ['WebPage']);
  assert.deepEqual(expectedJsonLdTypes('https://docs.rdlabo.dev/support', 'docs'), [
    'BreadcrumbList',
  ]);
  assert.deepEqual(
    expectedJsonLdTypes('https://docs.rdlabo.dev/projects/capacitor-admob/docs/readme', 'docs'),
    ['BreadcrumbList'],
  );
  assert.deepEqual(
    expectedJsonLdTypes(
      'https://docs.rdlabo.dev/projects/eslint-plugin/docs/rules/example-rule',
      'docs',
    ),
    ['BreadcrumbList'],
  );
});

test('auditJsonLdSemantics validates breadcrumbs, BlogPosting canonical alignment, and dateModified rules', () => {
  const origin = 'https://rdlabo.dev';
  const pageUrl = `${origin}/articles/example`;
  const validArticle = `<!doctype html><html lang="en"><head>
<title>Example — rdlabo.dev</title>
<meta name="description" content="Example article." />
<link rel="canonical" href="${pageUrl}" />
<meta property="article:published_time" content="2025-12-31T16:00:00.000Z" />
<meta property="og:image" content="${origin}/article-images/example.svg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<script id="rdlabo-json-ld" type="application/ld+json" data-rdlabo-json-ld>{
  "@context":"https://schema.org",
  "@graph":[
    {
      "@type":"BlogPosting",
      "mainEntityOfPage":"${pageUrl}",
      "headline":"Example",
      "description":"Example article.",
      "image":"${origin}/article-images/example.svg",
      "datePublished":"2025-12-31T16:00:00.000Z",
      "dateModified":"2026-02-01",
      "author":{"@type":"Organization","name":"rdlabo","url":"${origin}"},
      "publisher":{"@id":"${origin}/#organization"},
      "inLanguage":"en",
      "isBasedOn":{"@type":"Article","@id":"https://zenn.dev/rdlabo/articles/example","inLanguage":"ja"}
    },
    {
      "@type":"BreadcrumbList",
      "itemListElement":[
        {"@type":"ListItem","position":1,"name":"Home","item":"${origin}"},
        {"@type":"ListItem","position":2,"name":"Articles","item":"${origin}/articles"},
        {"@type":"ListItem","position":3,"name":"Example","item":"${pageUrl}"}
      ]
    }
  ]
}</script>
</head><body><time data-article-published datetime="2026-01-01">January 1, 2026</time><time data-article-modified datetime="2026-02-01">February 1, 2026</time><img data-article-image src="${origin}/article-images/example.svg" width="1200" height="630"><aside class="article-original"><a href="https://zenn.dev/rdlabo/articles/example">Original</a></aside></body></html>`;
  const document = new JSDOM(validArticle).window.document;
  assert.deepEqual(auditJsonLdSemantics(document, pageUrl, origin, 'web-site'), []);

  const wrongImageDimensions = validArticle.replace(
    'property="og:image:width" content="1200"',
    'property="og:image:width" content="800"',
  );
  assert.match(
    auditJsonLdSemantics(
      new JSDOM(wrongImageDimensions).window.document,
      pageUrl,
      origin,
      'web-site',
    ).join('\n'),
    /og:image dimensions must match the visible article image/,
  );

  const unknownImageDimensions = validArticle
    .replace(/<meta property="og:image:(?:width|height)"[^>]+>\n/g, '')
    .replace(' width="1200" height="630"', '');
  assert.deepEqual(
    auditJsonLdSemantics(
      new JSDOM(unknownImageDimensions).window.document,
      pageUrl,
      origin,
      'web-site',
    ),
    [],
  );

  const staleModified = validArticle.replace(
    '"dateModified":"2026-02-01"',
    '"dateModified":"2025-12-01"',
  );
  assert.match(
    auditJsonLdSemantics(
      new JSDOM(staleModified).window.document,
      pageUrl,
      origin,
      'web-site',
    ).join('\n'),
    /dateModified must not be before datePublished/,
  );

  const badBreadcrumb = validArticle.replace('"position":2', '"position":3');
  assert.match(
    auditJsonLdSemantics(
      new JSDOM(badBreadcrumb).window.document,
      pageUrl,
      origin,
      'web-site',
    ).join('\n'),
    /BreadcrumbList positions must be contiguous/,
  );

  const missingSource = validArticle.replace(
    ',\n      "isBasedOn":{"@type":"Article","@id":"https://zenn.dev/rdlabo/articles/example","inLanguage":"ja"}',
    '',
  );
  assert.match(
    auditJsonLdSemantics(
      new JSDOM(missingSource).window.document,
      pageUrl,
      origin,
      'web-site',
    ).join('\n'),
    /must declare isBasedOn as an Article object/,
  );

  const invalidUnmarkedBlock = validArticle.replace(
    '</head>',
    '<script type="application/ld+json">{broken}</script></head>',
  );
  assert.match(
    auditHtmlPage(invalidUnmarkedBlock, pageUrl, {
      bilingual: false,
      siteName: 'web-site',
    }).join('\n'),
    /invalid JSON/,
  );
});

test('runSeoAudit passes for a minimal bilingual docs site with simple sitemap', async () => {
  const root = await mkdtemp(join(tmpdir(), 'seo-audit-docs-'));
  const browserRoot = join(root, 'dist/docs/browser');
  await mkdir(join(browserRoot, 'ja'), { recursive: true });
  const origin = 'https://docs.rdlabo.dev';
  await writeFile(
    join(root, 'dist/docs/browser/sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${origin}/</loc></url>
  <url><loc>${origin}/ja</loc></url>
</urlset>`,
    'utf8',
  );
  const head = (lang: string, canonical: string, en: string, ja: string, jsonLd = '', body = '') =>
    `<!doctype html><html lang="${lang}"><head>
<title>Docs home</title>
<meta name="description" content="Docs portal home." />
<link rel="canonical" href="${canonical}" />
<link rel="alternate" hreflang="en" href="${en}" />
<link rel="alternate" hreflang="ja" href="${ja}" />
<link rel="alternate" hreflang="x-default" href="${en}" />
${jsonLd}
</head><body>${body}</body></html>`;
  await Promise.all([
    writeFile(
      join(browserRoot, 'index.html'),
      head(
        'en',
        `${origin}/`,
        `${origin}/`,
        `${origin}/ja`,
        DOCS_HOME_JSON_LD_EN,
        `<a href="/ja">Japanese</a>`,
      ),
      'utf8',
    ),
    writeFile(
      join(browserRoot, 'ja', 'index.html'),
      head('ja', `${origin}/ja`, `${origin}/`, `${origin}/ja`, DOCS_HOME_JSON_LD_JA),
      'utf8',
    ),
  ]);

  const errors = await runSeoAudit({
    root,
    targets: [
      {
        name: 'docs',
        origin,
        sitemapPath: 'dist/docs/browser/sitemap.xml',
        browserRoot: 'dist/docs/browser',
        bilingual: true,
      },
    ],
  });
  assert.deepEqual(errors, []);
});

test('runSeoAudit catches empty hreflang and relative href via global extraction', async () => {
  const root = await mkdtemp(join(tmpdir(), 'seo-audit-hreflang-'));
  const browserRoot = join(root, 'dist/docs/browser');
  await mkdir(join(browserRoot, 'ja'), { recursive: true });
  const origin = 'https://docs.rdlabo.dev';
  await writeFile(
    join(root, 'dist/docs/browser/sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${origin}/</loc></url>
  <url><loc>${origin}/ja</loc></url>
</urlset>`,
    'utf8',
  );
  const englishPage = `<!doctype html><html lang="en"><head>
<title>Docs home</title>
<meta name="description" content="Docs portal home." />
<link rel="canonical" href="${origin}/" />
<link rel="alternate" hreflang="en" href="${origin}/" />
<link rel="alternate" hreflang="ja" href="/ja" />
<link rel="alternate" hreflang="x-default" href="${origin}/" />
<link rel="alternate" hreflang="  " href="${origin}/ignored" />
${DOCS_HOME_JSON_LD_EN}
</head><body><a href="/ja">Japanese</a></body></html>`;
  const japanesePage = `<!doctype html><html lang="ja"><head>
<title>Docs home</title>
<meta name="description" content="Docs portal home." />
<link rel="canonical" href="${origin}/ja" />
<link rel="alternate" hreflang="en" href="${origin}/" />
<link rel="alternate" hreflang="ja" href="${origin}/ja" />
<link rel="alternate" hreflang="x-default" href="${origin}/" />
${DOCS_HOME_JSON_LD_JA}
</head><body></body></html>`;
  await Promise.all([
    writeFile(join(browserRoot, 'index.html'), englishPage, 'utf8'),
    writeFile(join(browserRoot, 'ja', 'index.html'), japanesePage, 'utf8'),
  ]);

  const errors = await runSeoAudit({
    root,
    targets: [
      {
        name: 'docs',
        origin,
        sitemapPath: 'dist/docs/browser/sitemap.xml',
        browserRoot: 'dist/docs/browser',
        bilingual: true,
      },
    ],
  });

  const joined = errors.join('\n');
  assert.match(joined, /hreflang alternate link must not have an empty hreflang attribute/);
  assert.match(
    joined,
    /hreflang="ja" alternate href must be a fully-qualified HTTPS URL \(got "\/ja"\)/,
  );
  assert.doesNotMatch(joined, /duplicate hreflang alternate link must not have an empty hreflang/);
});

test('runSeoAudit ignores built HTML outside the sitemap', async () => {
  const root = await mkdtemp(join(tmpdir(), 'seo-audit-legacy-'));
  const browserRoot = join(root, 'dist/web-site/browser');
  await mkdir(join(browserRoot, 'legacy-redirect'), { recursive: true });
  await writeFile(
    join(root, 'dist/web-site/browser/sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://rdlabo.dev/</loc></url>
</urlset>`,
    'utf8',
  );
  const homePage = `<!doctype html><html lang="en"><head>
<title>Home — rdlabo.dev</title>
<meta name="description" content="Example home page." />
<link rel="canonical" href="https://rdlabo.dev/" />
${WEB_SITE_HOME_JSON_LD}
</head><body></body></html>`;
  const legacyPage = `<!doctype html><html lang="en"><head>
<title>Legacy redirect — rdlabo.dev</title>
<meta name="description" content="Legacy redirect page." />
<link rel="canonical" href="https://rdlabo.dev/legacy-redirect" />
</head><body></body></html>`;
  await Promise.all([
    writeFile(join(browserRoot, 'index.html'), homePage, 'utf8'),
    writeFile(join(browserRoot, 'legacy-redirect', 'index.html'), legacyPage, 'utf8'),
  ]);

  const errors = await runSeoAudit({
    root,
    targets: [
      {
        name: 'web-site',
        origin: 'https://rdlabo.dev',
        sitemapPath: 'dist/web-site/browser/sitemap.xml',
        browserRoot: 'dist/web-site/browser',
        bilingual: false,
      },
    ],
  });
  assert.deepEqual(errors, []);
});
