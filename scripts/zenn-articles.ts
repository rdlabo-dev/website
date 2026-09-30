import { JSDOM } from 'jsdom';

export const ZENN_USERNAME = 'rdlabo';
export const ZENN_FEED_URL = `https://zenn.dev/${ZENN_USERNAME}/feed?all=1`;
export const ZENN_FEED_PROXY_URL = `https://r.jina.ai/http://zenn.dev/${ZENN_USERNAME}/feed?all=1`;

export interface ZennArticleMetadata {
  slug: string;
  title: string;
  url: string;
  publishedAt: string;
  publishedDate: string;
}

function dateInTokyo(value: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(value);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((entry) => entry.type === type)?.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

export function parseZennArticleFeed(xml: string): ZennArticleMetadata[] {
  const document = new JSDOM(xml, { contentType: 'text/xml' }).window.document;
  const parserError = document.querySelector('parsererror');
  if (parserError) throw new Error(`Zenn RSS is not valid XML: ${parserError.textContent}`);

  const articles = Array.from(document.querySelectorAll('item')).flatMap((item) => {
    const url = item.querySelector('link')?.textContent?.trim() ?? '';
    if (!URL.canParse(url)) return [];
    const match = new URL(url).pathname.match(new RegExp(`^/${ZENN_USERNAME}/articles/([^/]+)$`));
    if (!match) return [];

    const publishedAt = item.querySelector('pubDate')?.textContent?.trim() ?? '';
    const published = new Date(publishedAt);
    if (!publishedAt || Number.isNaN(published.valueOf())) {
      throw new Error(`Zenn article ${url} has an invalid pubDate: ${publishedAt}`);
    }

    return [
      {
        slug: match[1],
        title: item.querySelector('title')?.textContent?.trim() ?? '',
        url,
        publishedAt: published.toISOString(),
        publishedDate: dateInTokyo(published),
      },
    ];
  });

  const unique = new Map(articles.map((article) => [article.slug, article]));
  if (unique.size !== articles.length) throw new Error('Zenn RSS contains duplicate article slugs');
  return articles.sort((left, right) => right.publishedAt.localeCompare(left.publishedAt));
}

export function parseZennArticleFeedProxy(markdown: string): ZennArticleMetadata[] {
  const content = markdown.split('Markdown Content:').slice(1).join('Markdown Content:');
  if (!content) throw new Error('Zenn RSS proxy response is missing Markdown Content');

  const pattern =
    /###\s*(?:\[([^\]]*)\])?\((https:\/\/zenn\.dev\/rdlabo\/articles\/([^)]+))\)[^\n]*\n(?:\s*\[[^\]]+\]\([^)]+\)\s*\n)?\s*([A-Za-z]{3},\s+\d{1,2}\s+[A-Za-z]{3}\s+\d{4}\s+\d{2}:\d{2}:\d{2}\s+GMT)/g;
  const unique = new Map<string, ZennArticleMetadata>();
  for (const match of content.matchAll(pattern)) {
    const published = new Date(match[4]);
    if (Number.isNaN(published.valueOf())) continue;
    unique.set(match[3], {
      slug: match[3],
      title: match[1]?.trim() ?? '',
      url: match[2],
      publishedAt: published.toISOString(),
      publishedDate: dateInTokyo(published),
    });
  }
  if (!unique.size) throw new Error('Zenn RSS proxy response contains no articles');
  return [...unique.values()].sort((left, right) =>
    right.publishedAt.localeCompare(left.publishedAt),
  );
}

export async function fetchZennArticleFeed(): Promise<ZennArticleMetadata[]> {
  const response = await fetch(ZENN_FEED_URL, {
    headers: { 'user-agent': 'rdlabo-dev/website article generator' },
  });
  if (response.ok) return parseZennArticleFeed(await response.text());

  const proxyResponse = await fetch(ZENN_FEED_PROXY_URL, {
    headers: { 'user-agent': 'rdlabo-dev/website article generator' },
  });
  if (!proxyResponse.ok) {
    throw new Error(
      `Unable to fetch Zenn RSS (${response.status}) or proxy (${proxyResponse.status})`,
    );
  }
  return parseZennArticleFeedProxy(await proxyResponse.text());
}
