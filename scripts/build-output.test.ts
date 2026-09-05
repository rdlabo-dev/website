import assert from 'node:assert/strict';
import { access, constants, readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import test from 'node:test';
import {
  CURRENT_SPONSORS,
  PAST_SPONSORS,
} from '../projects/docs/src/app/generated/sponsors.generated';

test('places locale-specific static 404 pages in the browser output', async () => {
  const [english, japanese] = await Promise.all([
    readFile(new URL('../dist/docs/browser/404.html', import.meta.url), 'utf8'),
    readFile(new URL('../dist/docs/browser/ja/404.html', import.meta.url), 'utf8'),
  ]);
  assert.match(english, /<html lang="en">/);
  assert.match(japanese, /<html lang="ja">/);
  await assert.rejects(() =>
    access(new URL('../dist/docs/browser/ja/ja/404.html', import.meta.url), constants.F_OK),
  );
});

test('legacy prerender output redirects to an absolute canonical route', async () => {
  const html = await readFile(
    new URL('../dist/docs/browser/stripe/docs/react/index.html', import.meta.url),
    'utf8',
  );
  assert.match(html, /\/projects\/capacitor-stripe\/docs\/react/);
  assert.doesNotMatch(html, /\/stripe\/docs\/projects\/capacitor-stripe/);
});

test('ships permanent edge redirects for canonical documentation paths', async () => {
  const redirects = await readFile(
    new URL('../dist/docs/browser/_redirects', import.meta.url),
    'utf8',
  );

  assert.match(
    redirects,
    /^\/docs\/\* https:\/\/docs\.rdlabo\.dev\/projects\/capacitor-stripe\/docs\/:splat 301$/m,
  );
  assert.match(
    redirects,
    /^\/docs\/identity https:\/\/docs\.rdlabo\.dev\/projects\/capacitor-stripe-identity\/docs\/identity-verification-sheet 301$/m,
  );
  assert.match(
    redirects,
    /^\/ja\/docs\/\* https:\/\/docs\.rdlabo\.dev\/ja\/projects\/capacitor-stripe\/docs\/:splat 301$/m,
  );
  assert.match(
    redirects,
    /^\/src\/rules\/ionic-attr-type-check\.ts https:\/\/docs\.rdlabo\.dev\/projects\/eslint-plugin-rules\/docs\/rules\/ionic-attr-type-check 301$/m,
  );
});

test('prerender output includes localized SEO metadata', async () => {
  const html = await readFile(
    new URL('../dist/docs/browser/ja/projects/capacitor-admob/index.html', import.meta.url),
    'utf8',
  );
  assert.match(html, /<html lang="ja"/);
  assert.match(
    html,
    /rel="canonical" href="https:\/\/docs\.rdlabo\.dev\/ja\/projects\/capacitor-admob"/,
  );
  assert.match(html, /hreflang="en"/);
  assert.match(html, /hreflang="ja"/);
  assert.match(
    html,
    /property="og:image" content="https:\/\/docs\.rdlabo\.dev\/assets\/brand\/og-card\.png"/,
  );
  assert.match(html, /name="twitter:card" content="summary_large_image"/);
  assert.match(html, /data-rdlabo-json-ld/);
  assert.match(html, /"@type":"BreadcrumbList"/);
});

test('prerenders intent-focused metadata for high-impression documentation pages', async () => {
  const cases = [
    {
      path: 'projects/capacitor-stripe/index.html',
      title: 'Capacitor Stripe Plugin Documentation | rdlabo',
      description:
        'Integrate Stripe PaymentSheet, Apple Pay, and Google Pay in Capacitor apps with @capacitor-community/stripe for iOS, Android, and web.',
    },
    {
      path: 'projects/capacitor-stripe/docs/configuration/index.html',
      title: 'Configure Capacitor Stripe for iOS, Android, and Web | rdlabo',
      description:
        'Configure @capacitor-community/stripe with a publishable key and platform settings before presenting PaymentSheet, Apple Pay, or Google Pay.',
    },
    {
      path: 'projects/eslint-plugin-rules/docs/rules/index.html',
      title: 'Angular, Ionic, and TypeScript ESLint Rules | rdlabo',
      description:
        'Browse every @rdlabo/eslint-plugin-rules rule for Angular Signals, Ionic components, component boundaries, forms, and safe asynchronous code.',
    },
    {
      path: 'projects/capacitor-admob/docs/interstitial/index.html',
      title: 'Capacitor AdMob Interstitial Ads Guide | rdlabo',
      description:
        'Prepare, show, and handle interstitial ad events in Capacitor apps with @capacitor-community/admob on iOS and Android.',
    },
  ] as const;

  for (const entry of cases) {
    const html = await readFile(
      new URL(`../dist/docs/browser/${entry.path}`, import.meta.url),
      'utf8',
    );
    assert.ok(html.includes(`<title>${entry.title}</title>`), entry.path);
    assert.ok(html.includes(`<meta name="description" content="${entry.description}"`), entry.path);
  }
});

test('prerenders current and past public sponsors in both locales', async () => {
  const [english, japanese] = await Promise.all([
    readFile(new URL('../dist/docs/browser/support/index.html', import.meta.url), 'utf8'),
    readFile(new URL('../dist/docs/browser/ja/support/index.html', import.meta.url), 'utf8'),
  ]);

  for (const html of [english, japanese]) {
    for (const sponsor of [...CURRENT_SPONSORS, ...PAST_SPONSORS]) {
      assert.match(html, new RegExp(`href="${sponsor.profileUrl}"`));
    }
    assert.match(html, /(?:Sponsor from \$5\/month|月5ドルから支援する)/);
    assert.doesNotMatch(html, /monthlyPriceInDollars/);
  }
  if (CURRENT_SPONSORS.length > 0) {
    assert.match(english, />Current sponsors</);
    assert.match(japanese, />現在のスポンサー</);
  }
  if (PAST_SPONSORS.length > 0) {
    assert.match(english, />Past sponsors</);
    assert.match(japanese, />過去のスポンサー</);
  }
});

test('Japanese home prerender uses slashless canonical SEO URLs and clear site navigation', async () => {
  const html = await readFile(
    new URL('../dist/docs/browser/ja/index.html', import.meta.url),
    'utf8',
  );
  assert.match(html, /rel="canonical" href="https:\/\/docs\.rdlabo\.dev\/ja"/);
  assert.match(html, /property="og:url" content="https:\/\/docs\.rdlabo\.dev\/ja"/);
  assert.match(html, /hreflang="ja" href="https:\/\/docs\.rdlabo\.dev\/ja"/);
  assert.doesNotMatch(html, /rel="canonical" href="https:\/\/docs\.rdlabo\.dev\/ja\/"/);
  assert.doesNotMatch(html, /property="og:url" content="https:\/\/docs\.rdlabo\.dev\/ja\/"/);
  assert.doesNotMatch(html, /hreflang="ja" href="https:\/\/docs\.rdlabo\.dev\/ja\/"/);
  assert.match(
    html,
    /<a(?=[^>]*\bclass="docs-brand[^"]*")(?=[^>]*\bhref="https:\/\/rdlabo\.dev\/")[^>]*>/,
  );
  assert.doesNotMatch(html, /<a[^>]*href="https:\/\/rdlabo\.dev\/"[^>]*target="_blank"[^>]*>/);
  assert.match(html, /class="docs-home-link[^"]*"[^>]*href="\/ja"/);
  assert.match(html, />docs</);
  assert.match(html, /(?:href="\/ja"[^>]*aria-current="page"|aria-current="page"[^>]*href="\/ja")/);
  assert.match(html, /data-rdlabo-json-ld/);
  assert.match(html, /"url":"https:\/\/docs\.rdlabo\.dev\/ja"/);
  assert.match(html, /"inLanguage":"ja"/);
  assert.match(html, /"@type":"WebPage"/);
  assert.match(html, /"@id":"https:\/\/docs\.rdlabo\.dev\/#website"/);
});

test('prerendered docs mark current location and hide empty search hosts', async () => {
  const [home, support, landing, docPage, japaneseLanding] = await Promise.all([
    readFile(new URL('../dist/docs/browser/index.html', import.meta.url), 'utf8'),
    readFile(new URL('../dist/docs/browser/support/index.html', import.meta.url), 'utf8'),
    readFile(
      new URL('../dist/docs/browser/projects/ionic-theme-md3/index.html', import.meta.url),
      'utf8',
    ),
    readFile(
      new URL(
        '../dist/docs/browser/projects/ionic-theme-md3/docs/migration/index.html',
        import.meta.url,
      ),
      'utf8',
    ),
    readFile(
      new URL('../dist/docs/browser/ja/projects/ionic-theme-md3/index.html', import.meta.url),
      'utf8',
    ),
  ]);

  assert.match(home, /(?:href="\/"[^>]*aria-current="page"|aria-current="page"[^>]*href="\/")/);
  assert.match(
    support,
    /(?:href="\/support"[^>]*aria-current="page"|aria-current="page"[^>]*href="\/support")/,
  );
  assert.match(
    landing,
    /(?:href="\/projects\/ionic-theme-md3"[^>]*aria-current="page"|aria-current="page"[^>]*href="\/projects\/ionic-theme-md3")/,
  );
  assert.match(
    docPage,
    /(?:href="\/projects\/ionic-theme-md3\/docs\/migration"[^>]*aria-current="page"|aria-current="page"[^>]*href="\/projects\/ionic-theme-md3\/docs\/migration")/,
  );
  assert.doesNotMatch(
    docPage,
    /href="\/projects\/ionic-theme-md3"(?![^>]*\/docs\/)[^>]*aria-current="page"|aria-current="page"[^>]*href="\/projects\/ionic-theme-md3"(?![^>]*\/docs\/)/,
  );
  assert.match(japaneseLanding, /関連記事（英語）/);
  assert.match(japaneseLanding, /related-article-lang[^>]*>英語</);
  assert.match(japaneseLanding, /lang="en"/);
  assert.doesNotMatch(landing, /関連記事（英語）/);
  assert.doesNotMatch(landing, /related-article-lang/);

  const [docsStyles, siteStyles] = await Promise.all([
    readFile(new URL('../projects/docs/src/styles.css', import.meta.url), 'utf8'),
    readFile(new URL('../projects/web-site/src/styles.css', import.meta.url), 'utf8'),
  ]);
  assert.match(docsStyles, /pagefind-modal-trigger\.docs-search:empty\s*\{\s*display:\s*none;/);
  assert.match(siteStyles, /pagefind-modal-trigger\.site-search:empty\s*\{\s*display:\s*none;/);
});

test('prerendered docs shell stays layout-neutral before bootstrap', async () => {
  const html = await readFile(new URL('../dist/docs/browser/index.html', import.meta.url), 'utf8');
  assert.match(html, /data-rdlabo-json-ld/);
  assert.match(html, /"@type":"WebSite"/);
  assert.match(html, /"url":"https:\/\/docs\.rdlabo\.dev\/"/);
  const shell = html.match(/<div\b[^>]*\bclass="[^"]*\bdocs-shell\b[^"]*"[^>]*>/)?.[0];
  assert.ok(shell, 'docs-shell must be present in prerendered index.html');
  assert.doesNotMatch(shell, /\blayout-ready\b/);
  assert.match(shell, /lg:grid-cols-\[288px_minmax\(0,1fr\)\]/);

  const toggle = html.match(/<button\b[^>]*\baria-controls="docs-sidebar"[^>]*>/)?.[0];
  assert.ok(toggle, 'sidebar toggle must be present in prerendered index.html');
  assert.doesNotMatch(toggle, /\baria-expanded\b/);

  const sidebar = html.match(/<aside\b[^>]*\bid="docs-sidebar"[^>]*>/)?.[0];
  assert.ok(sidebar, 'docs-sidebar must be present in prerendered index.html');
  assert.match(sidebar, /lg:translate-x-0/);
  assert.doesNotMatch(sidebar, /\binert\b/);

  const css = await readFile(new URL('../projects/docs/src/app/app.css', import.meta.url), 'utf8');
  assert.match(
    css,
    /@media\s*\(\s*max-width:\s*1023px\s*\)[\s\S]*?\.docs-shell:not\(\.layout-ready\)\s+#docs-sidebar\s*\{[\s\S]*?visibility:\s*hidden;[\s\S]*?transform:\s*translateX\(-100%\);/,
  );
});

test('prerendered docs pages include breadcrumb JSON-LD with canonical HTTPS item URLs', async () => {
  const [docsPage, support] = await Promise.all([
    readFile(
      new URL(
        '../dist/docs/browser/projects/capacitor-admob/docs/readme/index.html',
        import.meta.url,
      ),
      'utf8',
    ),
    readFile(new URL('../dist/docs/browser/support/index.html', import.meta.url), 'utf8'),
  ]);

  assert.match(docsPage, /"@type":"BreadcrumbList"/);
  assert.match(docsPage, /"item":"https:\/\/docs\.rdlabo\.dev\/"/);
  assert.match(docsPage, /"item":"https:\/\/docs\.rdlabo\.dev\/projects\/capacitor-admob"/);
  assert.match(
    docsPage,
    /"item":"https:\/\/docs\.rdlabo\.dev\/projects\/capacitor-admob\/docs\/readme"/,
  );

  assert.match(support, /"@type":"BreadcrumbList"/);
  assert.match(support, /"item":"https:\/\/docs\.rdlabo\.dev\/support"/);
});

test('visible docs breadcrumbs use canonical locale home paths', async () => {
  const [english, japanese] = await Promise.all([
    readFile(
      new URL(
        '../dist/docs/browser/projects/ionic-theme-md3/docs/migration/index.html',
        import.meta.url,
      ),
      'utf8',
    ),
    readFile(
      new URL(
        '../dist/docs/browser/ja/projects/ionic-theme-md3/docs/migration/index.html',
        import.meta.url,
      ),
      'utf8',
    ),
  ]);
  const englishBreadcrumb = english.match(
    /<nav[^>]*aria-label="Breadcrumb"[^>]*>[\s\S]*?<\/nav>/,
  )?.[0];
  const japaneseBreadcrumb = japanese.match(
    /<nav[^>]*aria-label="パンくずリスト"[^>]*>[\s\S]*?<\/nav>/,
  )?.[0];
  assert.ok(englishBreadcrumb);
  assert.ok(japaneseBreadcrumb);
  assert.match(englishBreadcrumb, /href="\/"/);
  assert.match(japaneseBreadcrumb, /href="\/ja"/);
  assert.doesNotMatch(japaneseBreadcrumb, /href="\/ja\/"/);
});

test('prerendered locales include reusable hydration data', async () => {
  const pages = await Promise.all(
    ['index.html', 'ja/index.html'].map((path) =>
      readFile(new URL(`../dist/docs/browser/${path}`, import.meta.url), 'utf8'),
    ),
  );

  for (const html of pages) {
    assert.doesNotMatch(html, /\bngskiphydration\b/);
    assert.match(html, /\bngh="/);

    const serializedState = html.match(
      /<script id="ng-state" type="application\/json">([^<]+)<\/script>/,
    )?.[1];
    assert.ok(serializedState, 'prerendered page must include Angular hydration state');
    const hydrationData = (JSON.parse(serializedState) as { __nghData__?: unknown[] }).__nghData__;
    assert.ok(hydrationData?.length, 'Angular hydration state must include reusable views');
  }
});

test('builds bounded English and Japanese search indexes with the component UI', async () => {
  const searchDirectory = new URL('../dist/docs/browser/pagefind/', import.meta.url);
  const files = await readdir(searchDirectory, { recursive: true });
  assert.ok(files.includes('pagefind-component-ui.js'));
  assert.ok(files.includes('pagefind-component-ui.css'));
  assert.ok(files.some((file) => /^pagefind\.en_.+\.pf_meta$/.test(file)));
  assert.ok(files.some((file) => /^pagefind\.ja_.+\.pf_meta$/.test(file)));
  assert.equal(
    files.filter((file) => /^fragment\/en_.+\.pf_fragment$/.test(file)).length,
    173,
    'English search index must contain only canonical pages',
  );
  assert.equal(
    files.filter((file) => /^fragment\/ja_.+\.pf_fragment$/.test(file)).length,
    173,
    'Japanese search index must contain only canonical pages',
  );
  const sizes = await Promise.all(
    files.map(async (file) => {
      const entry = await stat(join(searchDirectory.pathname, file));
      return entry.isFile() ? entry.size : 0;
    }),
  );
  assert.ok(
    sizes.reduce((total, size) => total + size, 0) < 5 * 1024 * 1024,
    'Search bundle must remain under 5 MiB',
  );
});
