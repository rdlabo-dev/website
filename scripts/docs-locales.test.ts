import assert from 'node:assert/strict';
import test from 'node:test';
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { JSDOM } from 'jsdom';
import markdownToHtml from 'zenn-markdown-html';
import { DOCS_LOCALES, resolveDocsLocale } from '../shared/docs-locales';
import { localizedPublicPath } from '../projects/docs/src/app/locale-path';
import { assertDocsLocaleConfiguration } from './docs-locale-config';
import { localize } from './project-manifest';
import { auditHtmlHreflangReciprocity, expectedJsonLdTypes } from './seo-audit';
import { resolveGeneratedHeadingId } from './markdown-headings';
import { prepareDocsStaticAssets } from './static-prepare';

test('code synchronization resolves French and German accent headings', async () => {
  for (const [heading, id] of [
    ['Écouter le résultat', 'écouter-le-résultat'],
    ['Über Änderungen', 'über-änderungen'],
  ]) {
    const document = new JSDOM(await markdownToHtml(`## ${heading}`)).window.document;
    const generatedId = document.querySelector('h2')!.id;
    assert.notEqual(generatedId, id);
    assert.equal(resolveGeneratedHeadingId([generatedId], id), generatedId);
    assert.equal(resolveGeneratedHeadingId([generatedId], generatedId), generatedId);
    assert.equal(resolveGeneratedHeadingId([generatedId], 'missing'), 'missing');
  }
});

test('static output excludes unpublished locale assets while preserving published pages', async () => {
  const root = await mkdtemp(join(tmpdir(), 'docs-locales-'));
  const output = join(root, 'browser');
  try {
    for (const prefix of ['', 'ja']) {
      const source = join(root, 'projects/docs/public', prefix);
      const target = join(output, prefix);
      await mkdir(source, { recursive: true });
      await mkdir(target, { recursive: true });
      await writeFile(join(source, '404.html'), `404 ${prefix || 'en'}`);
      await writeFile(join(target, '404.html'), 'copied asset');
      await writeFile(join(target, 'index.html'), `page ${prefix || 'en'}`);
      for (const nested of ['ja', 'fr', 'de']) {
        await mkdir(join(target, nested), { recursive: true });
        await writeFile(join(target, nested, '404.html'), 'unreviewed asset');
      }
    }
    await prepareDocsStaticAssets(
      root,
      output,
      DOCS_LOCALES.map((locale) => ({
        ...locale,
        published: locale.code === 'en' || locale.code === 'ja',
      })),
    );
    for (const prefix of ['', 'ja']) {
      assert.equal(
        await readFile(join(output, prefix, '404.html'), 'utf8'),
        `404 ${prefix || 'en'}`,
      );
      assert.equal(
        await readFile(join(output, prefix, 'index.html'), 'utf8'),
        `page ${prefix || 'en'}`,
      );
      for (const unpublished of ['fr', 'de']) {
        await assert.rejects(access(join(output, prefix, unpublished)), { code: 'ENOENT' });
      }
    }
    await assert.rejects(access(join(output, 'ja/ja')), { code: 'ENOENT' });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('registered translations require reviewed metadata', () => {
  assert.deepEqual(
    DOCS_LOCALES.filter(({ requiresSourceReview }) => requiresSourceReview).map(({ code }) => code),
    ['fr', 'de'],
  );
  for (const locale of ['fr', 'de'] as const) {
    assert.throws(
      () => localize({ en: 'Unreviewed fixture metadata', ja: '未レビュー' }, locale),
      new RegExp(`Missing ${locale} translation`),
    );
  }
});

test('locale paths support all registered languages without duplicate prefixes', () => {
  for (const locale of DOCS_LOCALES) {
    const prefix = locale.subPath ? `/${locale.subPath}` : '';
    assert.equal(
      localizedPublicPath(locale.code, '/ja/projects/example?version=1#api'),
      `${prefix}/projects/example?version=1#api`,
    );
    assert.equal(localizedPublicPath(locale.code, '/fr/'), prefix || '/');
  }
  assert.equal(resolveDocsLocale('fr-FR'), 'fr');
  assert.equal(resolveDocsLocale('de_DE'), 'de');
  assert.equal(resolveDocsLocale('en-US'), 'en');
});

test('publication requires matching Angular builds and locale paths', () => {
  const initialLocales = DOCS_LOCALES.map((locale) => ({
    ...locale,
    published: locale.code === 'en' || locale.code === 'ja',
  }));
  const config = {
    projects: {
      docs: {
        i18n: {
          sourceLocale: { code: 'en', subPath: '' },
          locales: { ja: { translation: 'ja.xlf', subPath: 'ja' } },
        },
        architect: { build: { options: { localize: true } } },
      },
    },
  };
  assert.doesNotThrow(() => assertDocsLocaleConfiguration(config, initialLocales));
  const publishedFrench = initialLocales.map((locale) => ({
    ...locale,
    published: locale.published || locale.code === 'fr',
  }));
  assert.throws(() => assertDocsLocaleConfiguration(config, publishedFrench), /must match Angular/);
  config.projects.docs.i18n.locales.ja.subPath = 'japanese';
  assert.throws(() => assertDocsLocaleConfiguration(config, initialLocales), /subPath/);
  config.projects.docs.i18n.locales.ja.subPath = 'ja';
  assert.throws(
    () =>
      assertDocsLocaleConfiguration(
        {
          projects: {
            docs: {
              ...config.projects.docs,
              architect: {
                build: {
                  options: { localize: true },
                  defaultConfiguration: 'production',
                  configurations: { production: { localize: ['en'] } },
                },
              },
            },
          },
        },
        initialLocales,
      ),
    /must match Angular/,
  );
});

test('hreflang reciprocity audits every language in a four-language cluster', () => {
  const languages = ['en', 'ja', 'fr', 'de', 'x-default'];
  const alternates = new Map(
    languages.map((language) => [
      language,
      `https://docs.rdlabo.dev${localizedPublicPath(language === 'x-default' ? 'en' : language, '/projects/example')}`,
    ]),
  );
  const pages = new Map([...new Set(alternates.values())].map((url) => [url, new Map(alternates)]));
  const sitemap = new Set(pages.keys());
  assert.deepEqual(auditHtmlHreflangReciprocity(pages, sitemap, languages), []);
  pages.get(alternates.get('de')!)!.set('fr', 'https://docs.rdlabo.dev/fr/projects/other');
  assert.match(
    auditHtmlHreflangReciprocity(pages, sitemap, languages).join('\n'),
    /not reciprocal/,
  );
  assert.deepEqual(expectedJsonLdTypes('https://docs.rdlabo.dev/fr', 'docs'), ['WebPage']);
  assert.deepEqual(
    expectedJsonLdTypes('https://docs.rdlabo.dev/de/projects/example/docs/api', 'docs'),
    ['BreadcrumbList'],
  );
});
