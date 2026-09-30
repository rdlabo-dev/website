import assert from 'node:assert/strict';
import test from 'node:test';
import { parseZennArticleFeed, parseZennArticleFeedProxy } from './zenn-articles';

test('parses public Zenn articles and ignores books', () => {
  const articles = parseZennArticleFeed(`<?xml version="1.0"?><rss><channel>
    <item><title>Older</title><link>https://zenn.dev/rdlabo/articles/older</link><pubDate>Tue, 18 Aug 2026 23:30:00 GMT</pubDate></item>
    <item><title>Newest</title><link>https://zenn.dev/rdlabo/articles/newest</link><pubDate>Thu, 20 Aug 2026 23:21:47 GMT</pubDate></item>
    <item><title>Book</title><link>https://zenn.dev/rdlabo/books/example</link><pubDate>Fri, 21 Aug 2026 00:00:00 GMT</pubDate></item>
  </channel></rss>`);

  assert.deepEqual(articles, [
    {
      slug: 'newest',
      title: 'Newest',
      url: 'https://zenn.dev/rdlabo/articles/newest',
      publishedAt: '2026-08-20T23:21:47.000Z',
      publishedDate: '2026-08-21',
    },
    {
      slug: 'older',
      title: 'Older',
      url: 'https://zenn.dev/rdlabo/articles/older',
      publishedAt: '2026-08-18T23:30:00.000Z',
      publishedDate: '2026-08-19',
    },
  ]);
});

test('rejects invalid publication dates', () => {
  assert.throws(
    () =>
      parseZennArticleFeed(`<?xml version="1.0"?><rss><channel><item>
        <title>Broken</title><link>https://zenn.dev/rdlabo/articles/broken</link><pubDate>never</pubDate>
      </item></channel></rss>`),
    /invalid pubDate/,
  );
});

test('parses the read-only RSS proxy fallback', () => {
  const articles = parseZennArticleFeedProxy(`Title:

Markdown Content:
### [](https://zenn.dev/rdlabo/articles/example)

[https://zenn.dev/rdlabo/articles/example](https://zenn.dev/rdlabo/articles/example)

Thu, 20 Aug 2026 23:21:47 GMT
`);
  assert.equal(articles[0]?.slug, 'example');
  assert.equal(articles[0]?.publishedDate, '2026-08-21');
});

test('ignores malformed links and paths without a single article slug', () => {
  const links = [
    '',
    'not a URL',
    'https://zenn.dev/rdlabo/articles/',
    'https://zenn.dev/rdlabo/articles/example/extra',
    'https://zenn.dev/other/articles/example',
  ];
  assert.deepEqual(
    parseZennArticleFeed(
      `<rss><channel>${links
        .map((link) => `<item><link>${link}</link></item>`)
        .join('')}</channel></rss>`,
    ),
    [],
  );
});
