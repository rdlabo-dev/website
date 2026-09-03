import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import test from 'node:test';
import {
  ARTICLE_SUMMARIES,
  ARTICLE_YEARS,
} from '../projects/web-site/src/app/generated/article-catalog.generated';

const browserRoot = new URL('../dist/web-site/browser/', import.meta.url);
const docsLinkOpeningNewTab =
  /<a(?=[^>]*href="https:\/\/docs\.rdlabo\.dev(?:\/|"))[^>]*target="_blank"[^>]*>/;

test('prerenders the web-site home, archive, and translated articles', async () => {
  const home = await readFile(new URL('index.html', browserRoot), 'utf8');
  assert.match(home, /Featured OSS/);
  assert.match(home, /Current milestone: 10 monthly sponsors/);
  assert.match(home, /View sponsorship options/);
  assert.match(home, /metadata_campaign=rdlabo-home/);
  assert.match(home, /https:\/\/docs\.rdlabo\.dev/);
  assert.doesNotMatch(home, docsLinkOpeningNewTab);
  assert.match(home, /rel="canonical" href="https:\/\/rdlabo\.dev"/);
  assert.match(home, /data-rdlabo-json-ld/);
  assert.match(home, /"@type":"WebSite"/);
  assert.match(home, /"@type":"Organization"/);
  assert.match(home, /"@id":"https:\/\/rdlabo\.dev\/#organization"/);

  const articles = await readFile(new URL('articles/index.html', browserRoot), 'utf8');
  assert.match(articles, /"@type":"BreadcrumbList"/);
  assert.match(articles, /"item":"https:\/\/rdlabo\.dev\/articles"/);
  assert.match(
    articles,
    /site-nav__link--active[^>]*aria-current="page"|aria-current="page"[^>]*site-nav__link--active/,
  );
  assert.match(articles, /Read article →/);

  for (const article of ARTICLE_SUMMARIES) {
    const html = await readFile(
      new URL(`articles/${article.slug}/index.html`, browserRoot),
      'utf8',
    );
    assert.match(html, new RegExp(article.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.match(html, new RegExp(article.originalUrl.replaceAll('.', '\\.')));
    assert.match(
      html,
      new RegExp(`Read the original article in Japanese on ${article.sourceName}`),
    );
    assert.match(html, /Support rdlabo OSS/);
    assert.match(html, /View sponsorship options/);
    assert.match(html, /metadata_campaign=rdlabo-article/);
    if (article.relatedLibraries?.length) {
      assert.doesNotMatch(html, /Related documentation/);
      assert.match(html, /Continue with documentation/);
      const bodyMarker = html.indexOf('class="znc article-content"');
      const continueIndex = html.indexOf('Continue with documentation');
      assert.ok(bodyMarker > -1);
      assert.ok(continueIndex > bodyMarker);
      for (const library of article.relatedLibraries) {
        const escapedName = library.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const escapedUrl = library.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        assert.match(
          html,
          new RegExp(
            `<a(?=[^>]*href="${escapedUrl}")[^>]*>\\s*${escapedName} documentation\\s*</a>`,
          ),
        );
      }
    } else {
      assert.doesNotMatch(html, /Related documentation/);
      assert.doesNotMatch(html, /Continue with documentation/);
    }
    assert.match(html, /"@type":"BlogPosting"/);
    assert.match(html, /"@type":"BreadcrumbList"/);
    assert.doesNotMatch(html, docsLinkOpeningNewTab);
    assert.match(
      html,
      new RegExp(`"mainEntityOfPage":"https://rdlabo.dev/articles/${article.slug}"`),
    );
    assert.match(
      html,
      new RegExp(`data-article-published[^>]*datetime="${article.publishedDate}"`),
    );
    assert.match(
      html,
      new RegExp(`"@id":"${article.originalUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`),
    );
    if (article.updatedAt) {
      assert.match(html, new RegExp(`"dateModified":"${article.updatedAt}"`));
      assert.match(html, new RegExp(`data-article-modified[^>]*datetime="${article.updatedAt}"`));
    } else {
      assert.doesNotMatch(html, /"dateModified":/);
      assert.doesNotMatch(html, /data-article-modified/);
    }
    const escapedImage = article.image.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    assert.match(html, new RegExp(`"image":"${escapedImage}"`));
    assert.match(html, new RegExp(`property="og:image" content="${escapedImage}"`));
    assert.match(html, new RegExp(`data-article-image[^>]*src="${escapedImage}"`));
    const generatedCover = await readFile(
      new URL(`article-images/${article.slug}.svg`, browserRoot),
      'utf8',
    );
    assert.match(generatedCover, /width="1200" height="630"/);
    assert.match(generatedCover, new RegExp(`data-article-slug="${article.slug}"`));
    if (article.slug === 'ionic-9-components-got-better') {
      assert.match(html, /class="article-link-card"/);
      assert.match(html, /Announcing Ionic Framework 9/);
      assert.match(html, /ionic-9-feature-image-1024x512\.png/);
    }
  }

  for (const year of ARTICLE_YEARS) {
    const archive = await readFile(
      new URL(`articles/archive/${year}/index.html`, browserRoot),
      'utf8',
    );
    assert.match(archive, new RegExp(`Engineering Notes from ${year}`));
    assert.match(
      archive,
      new RegExp(
        `Engineering notes published in ${year} from real-world Ionic, Angular, Capacitor, Cloudflare, and OSS work\\.`,
      ),
    );
    assert.match(archive, /"@type":"BreadcrumbList"/);
    assert.match(archive, new RegExp(`"item":"https://rdlabo.dev/articles/archive/${year}"`));
  }
});

test('ships crawler and static-not-found assets', async () => {
  const [robots, sitemap, notFound] = await Promise.all([
    readFile(new URL('robots.txt', browserRoot), 'utf8'),
    readFile(new URL('sitemap.xml', browserRoot), 'utf8'),
    readFile(new URL('404.html', browserRoot), 'utf8'),
  ]);
  assert.match(robots, /https:\/\/rdlabo\.dev\/sitemap\.xml/);
  assert.match(sitemap, /https:\/\/rdlabo\.dev\/articles/);
  assert.match(notFound, /<meta name="robots" content="noindex"/);
});

test('builds the English search index with the component UI', async () => {
  const searchDirectory = new URL('../dist/web-site/browser/pagefind/', import.meta.url);
  const files = await readdir(searchDirectory, { recursive: true });
  assert.ok(files.includes('pagefind-component-ui.js'));
  assert.ok(files.includes('pagefind-component-ui.css'));
  assert.ok(files.some((file) => /^pagefind\.en_.+\.pf_meta$/.test(file)));
  assert.equal(
    files.filter((file) => /^fragment\/en_.+\.pf_fragment$/.test(file)).length,
    2 + ARTICLE_YEARS.length + ARTICLE_SUMMARIES.length,
    'Search index must contain the home, article list, every archive, and every article',
  );
});
