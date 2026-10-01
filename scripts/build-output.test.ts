import assert from 'node:assert/strict';
import { access, readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import test from 'node:test';
import { JSDOM } from 'jsdom';
import { DOCS_LOCALES, PUBLISHED_DOCS_LOCALES } from '../shared/docs-locales';
import { projectDefinitions } from './project-manifest';
import {
  CURRENT_SPONSORS,
  PAST_SPONSORS,
} from '../projects/docs/src/app/generated/sponsors.generated';

test('removed Ionic Framework feedback pages stay out of published docs', async () => {
  const sitemap = await readFile('dist/docs/browser/sitemap.xml', 'utf8');
  for (const { subPath } of PUBLISHED_DOCS_LOCALES) {
    const locale = subPath ? `${subPath}/` : '';
    for (const project of ['ionic-theme-ios26', 'ionic-theme-ios27']) {
      const route = `${locale}projects/${project}`;
      assert.ok(!sitemap.includes(`/${route}/docs/feedback`));
      await assert.rejects(() => access(`dist/docs/browser/${route}/docs/feedback/index.html`));
      for (const page of ['', '/docs/readme']) {
        const html = await readFile(`dist/docs/browser/${route}${page}/index.html`, 'utf8');
        assert.doesNotMatch(html, /\/docs\/feedback/);
        assert.doesNotMatch(
          html,
          /Ionic Frameworkへの機能要望|Feature requests for Ionic Framework/,
        );
      }
    }
  }
});

test('transition guides link to existing localized onboarding headings', async () => {
  for (const { subPath } of PUBLISHED_DOCS_LOCALES) {
    const locale = subPath ? `${subPath}/` : '';
    const route = `${locale}projects/ionic-theme-ios27/docs/`;
    const target = new JSDOM(
      await readFile(`dist/docs/browser/${route}iphone-duo-with-original-theme/index.html`, 'utf8'),
    ).window.document;
    for (const page of ['migration', 'native-ui-shell']) {
      const document = new JSDOM(
        await readFile(`dist/docs/browser/${route}${page}/index.html`, 'utf8'),
      ).window.document;
      const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href]'))
        .map(
          (link) => new URL(link.getAttribute('href')!, `https://docs.rdlabo.dev/${route}${page}`),
        )
        .filter((url) => url.pathname.endsWith('/iphone-duo-with-original-theme') && url.hash);
      assert.ok(links.length, `${locale}${page} should link to transition setup`);
      for (const url of links) {
        assert.equal(url.pathname, `/${route}iphone-duo-with-original-theme`);
        const fragment = url.hash.slice(1);
        // Accented and Japanese headings use URI-encoded IDs; punctuation may also be encoded.
        assert.ok(
          target.getElementById(fragment) ?? target.getElementById(decodeURIComponent(fragment)),
          url.href,
        );
      }
    }
  }
});

test('places locale-specific static 404 pages in the browser output', async () => {
  for (const locale of PUBLISHED_DOCS_LOCALES) {
    const root = join('dist/docs/browser', locale.subPath);
    const html = await readFile(join(root, '404.html'), 'utf8');
    assert.match(html, new RegExp(`<html lang="${locale.code}">`));
    for (const nested of DOCS_LOCALES.filter(({ subPath }) => subPath)) {
      if (locale.subPath || !nested.published) {
        await assert.rejects(access(join(root, nested.subPath)), { code: 'ENOENT' });
      }
    }
  }
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
  assert.match(
    redirects,
    /^\/projects\/ionic-theme-ios27\/docs\/ios-adaptive https:\/\/docs\.rdlabo\.dev\/projects\/ionic-theme-ios27\/docs\/readme 301$/m,
  );
  assert.match(
    redirects,
    /^\/ja\/projects\/ionic-theme-ios27\/docs\/ios-adaptive https:\/\/docs\.rdlabo\.dev\/ja\/projects\/ionic-theme-ios27\/docs\/readme 301$/m,
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
  const landingDom = new JSDOM(landing);
  assert.equal(landingDom.window.document.querySelector('.related-article-lang'), null);
  landingDom.window.close();

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
  assert.match(shell, /lg:grid-cols-\[304px_minmax\(0,1fr\)\]/);

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
  const route = '/projects/capacitor-stripe/docs/configuration';
  const nestedRoute = '/projects/eslint-plugin-rules/docs/rules/signal-use-as-signal';
  const pages = await Promise.all(
    [
      ['index.html', '/'],
      ['ja/index.html', '/'],
      [`${route.slice(1)}/index.html`, route],
      [`ja${route}/index.html`, route],
      [`${nestedRoute.slice(1)}/index.html`, nestedRoute],
      [`ja${nestedRoute}/index.html`, nestedRoute],
    ].map(async ([path, initialUrl]) => ({
      html: await readFile(new URL(`../dist/docs/browser/${path}`, import.meta.url), 'utf8'),
      initialUrl,
    })),
  );

  for (const { html, initialUrl } of pages) {
    assert.doesNotMatch(html, /\bngskiphydration\b/);
    assert.match(html, /\bngh="/);

    const serializedState = html.match(
      /<script id="ng-state" type="application\/json">([^<]+)<\/script>/,
    )?.[1];
    assert.ok(serializedState, 'prerendered page must include Angular hydration state');
    const state = JSON.parse(serializedState) as {
      __nghData__?: unknown[];
      'rdlabo-docs-initial-url'?: string;
    };
    const hydrationData = state.__nghData__;
    assert.ok(hydrationData?.length, 'Angular hydration state must include reusable views');
    assert.equal(state['rdlabo-docs-initial-url'], initialUrl);
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
    203,
    'English search index must contain only canonical pages',
  );
  assert.equal(
    files.filter((file) => /^fragment\/ja_.+\.pf_fragment$/.test(file)).length,
    203,
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

test('Workers landing pages and guides expose distinct Cloudflare Workers metadata in both locales', async () => {
  for (const locale of ['en', 'ja']) {
    const titles = new Set<string>();
    const descriptions = new Set<string>();
    for (const project of projectDefinitions.filter((entry) => entry.id.startsWith('workers-'))) {
      for (const page of [undefined, ...project.pages]) {
        const path = `${locale === 'ja' ? '/ja' : ''}/projects/${project.slug}${page ? `/docs/${page.slug}` : ''}`;
        const html = await readFile(
          new URL(`../dist/docs/browser${path}/index.html`, import.meta.url),
          'utf8',
        );
        const document = new JSDOM(html).window.document;
        const title = document.title;
        const description =
          document.querySelector('meta[name="description"]')?.getAttribute('content') ?? '';
        assert.match(title, /Cloudflare Workers/, path);
        assert.match(description, /Cloudflare Workers/, path);
        assert.ok(!titles.has(title), `duplicate title: ${path}`);
        assert.ok(!descriptions.has(description), `duplicate description: ${path}`);
        titles.add(title);
        descriptions.add(description);
        assert.equal(
          document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
          `https://docs.rdlabo.dev${path}`,
        );
        if (!page)
          assert.match(document.querySelector('h1')?.textContent ?? '', /Cloudflare Workers/, path);
      }
    }
    assert.equal(titles.size, 23);
  }
});

test('project entry pages link to localized onboarding, references, and support', async () => {
  for (const locale of ['', 'ja/']) {
    for (const project of projectDefinitions.filter((project) => !project.hostedUrl)) {
      const html = await readFile(
        new URL(
          `../dist/docs/browser/${locale}projects/${project.slug}/index.html`,
          import.meta.url,
        ),
        'utf8',
      );
      const dom = new JSDOM(html);
      const document = dom.window.document;
      const landing = document.querySelector('.project-landing');
      assert.ok(landing, `${locale}${project.slug}: landing page`);
      assert.equal(landing.querySelectorAll('h1').length, 1);
      assert.equal(
        landing.querySelector('.project-support a')?.getAttribute('href'),
        `/${locale}support`,
      );
      const start = landing.querySelector('.project-actions a')?.getAttribute('href');
      assert.ok(
        start?.startsWith(`/${locale}projects/${project.slug}/docs/`),
        `${project.slug}: onboarding`,
      );
      for (const link of landing.querySelectorAll('#documentation a')) {
        const href = link.getAttribute('href');
        assert.ok(href?.startsWith(`/${locale}projects/${project.slug}/docs/`));
        await access(new URL(`../dist/docs/browser${href}/index.html`, import.meta.url));
      }
      dom.window.close();
    }
  }
});

test('ESLint companion guides are reachable from each project entry and introduction', async () => {
  for (const locale of ['', 'ja/']) {
    for (const [slug, intro] of [
      ['workers-timezone', 'readme'],
      ['ionic-theme-ios26', 'readme'],
      ['ionic-theme-md3', 'readme'],
      ['ionic-angular-kit', 'getting-started'],
    ]) {
      const path = `/${locale}projects/${slug}`;
      for (const entry of ['', `/docs/${intro}`]) {
        const html = await readFile(
          new URL(`../dist/docs/browser${path}${entry}/index.html`, import.meta.url),
          'utf8',
        );
        const dom = new JSDOM(html);
        const content = dom.window.document.querySelector(entry ? '.znc' : '.project-landing');
        assert.ok(
          content?.querySelector(`a[href="${path}/docs/eslint"]`),
          `${path}${entry}: direct ESLint guide link`,
        );
        dom.window.close();
      }
      const html = await readFile(
        new URL(`../dist/docs/browser${path}/docs/eslint/index.html`, import.meta.url),
        'utf8',
      );
      const dom = new JSDOM(html);
      assert.match(dom.window.document.querySelector('h1')?.textContent ?? '', /ESLint/);
      assert.ok(
        dom.window.document.querySelector('.znc')?.textContent?.includes('--max-warnings 0'),
      );
      dom.window.close();
    }
  }
});

test('Local LLM documents Chrome text support in both locales', async () => {
  const installedPackage = JSON.parse(
    await readFile(
      new URL('../node_modules/@rdlabo/capacitor-local-llm/package.json', import.meta.url),
      'utf8',
    ),
  ) as { version: string };
  for (const locale of ['', 'ja/']) {
    const base = `/${locale}projects/capacitor-local-llm`;
    const landing = new JSDOM(
      await readFile(new URL(`../dist/docs/browser${base}/index.html`, import.meta.url), 'utf8'),
    );
    assert.match(
      landing.window.document.querySelector('.project-version')?.textContent ?? '',
      new RegExp(installedPackage.version.replaceAll('.', '\\.')),
    );
    assert.match(
      landing.window.document.querySelector('.project-summary')?.textContent ?? '',
      /Chrome/,
    );
    assert.ok(landing.window.document.querySelector(`#documentation a[href="${base}/docs/web"]`));
    landing.window.close();
    const web = new JSDOM(
      await readFile(
        new URL(`../dist/docs/browser${base}/docs/web/index.html`, import.meta.url),
        'utf8',
      ),
    );
    assert.match(web.window.document.querySelector('h1')?.textContent ?? '', /Chrome/);
    const content = web.window.document.querySelector('.znc')?.textContent ?? '';
    for (const term of [
      'Prompt API',
      'localhost',
      'LOCAL_LLM_INVALID_OPTIONS',
      'LOCAL_LLM_UNSUPPORTED',
    ]) {
      assert.ok(content.includes(term), `${locale}: ${term}`);
    }
    web.window.close();
    const intro = new JSDOM(
      await readFile(
        new URL(`../dist/docs/browser${base}/docs/readme/index.html`, import.meta.url),
        'utf8',
      ),
    );
    assert.ok(intro.window.document.querySelector(`.znc a[href="${base}/docs/web"]`));
    assert.doesNotMatch(
      intro.window.document.querySelector('.znc')?.textContent ?? '',
      /Web execution is unsupported|Web実行は非対応/,
    );
    intro.window.close();
  }
});
