import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import fm from 'front-matter';
import markdownToHtml from 'zenn-markdown-html';
import { JSDOM } from 'jsdom';
import { enforceGeneratedHtmlPolicy } from './html-policy';
import { fetchNoteArticle } from './note-articles';
import { fetchZennArticleFeed } from './zenn-articles';
import {
  assertUpdatedAtOnOrAfterPublishedDate,
  assertValidContentUpdatedAt,
  formatContentUpdatedAt,
  formatSitemapLastmod,
} from './seo-dates';

interface ArticleFrontMatter {
  title: string;
  description: string;
  updatedAt?: string;
  zennSlug?: string;
  source?: 'zenn' | 'note';
  sourceUrl?: string;
  sourceRevision?: string;
  slug?: string;
  emoji?: string;
  image?: string;
}

interface ArticleTranslation {
  file: string;
  source: 'zenn' | 'note';
  sourceKey: string;
  sourceRevision?: string;
  slug: string;
  title: string;
  description: string;
  updatedAt?: string;
  emoji: string;
  image?: string;
  body: string;
}

interface GeneratedArticle {
  slug: string;
  title: string;
  description: string;
  updatedAt?: string;
  emoji: string;
  image: string;
  imageWidth?: number;
  imageHeight?: number;
  sourceName: 'Zenn' | 'note';
  originalUrl: string;
  publishedAt: string;
  publishedDate: string;
  html: string;
  headings: GeneratedArticleHeading[];
}

interface GeneratedArticleHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

interface ArticleLinkCard {
  title: string;
  description: string;
  siteName: string;
  imageUrl: string;
}

const ARTICLE_LINK_CARDS: Readonly<Record<string, ArticleLinkCard>> = {
  'https://ionic.io/blog/announcing-ionic-framework-9': {
    title: 'Announcing Ionic Framework 9',
    description:
      'Ionic Framework 9 is here with broader Angular compatibility, modern router support, richer components, and a new migration tool.',
    siteName: 'ionic.io',
    imageUrl: 'https://ionic.io/blog/wp-content/uploads/2026/08/ionic-9-feature-image-1024x512.png',
  },
};

interface GenerateArticlesOptions {
  root?: string;
  fetchZennArticles?: typeof fetchZennArticleFeed;
  fetchNoteSource?: typeof fetchNoteArticle;
}

function required(value: unknown, field: string, file: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${file} must declare a non-empty ${field} in front matter`);
  }
  return value.trim();
}

function optionalHttpsUrl(value: unknown, field: string, file: string): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${file} must declare ${field} as a non-empty HTTPS URL when present`);
  }
  const normalized = value.trim();
  try {
    if (new URL(normalized).protocol !== 'https:') throw new Error('not HTTPS');
  } catch {
    throw new Error(`${file} must declare ${field} as an absolute HTTPS URL when present`);
  }
  return normalized;
}

function rewriteZennImages(markdown: string): string {
  return markdown.replaceAll(/([("'])\/images\//g, '$1https://zenn.dev/images/');
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function wrapCoverTitle(title: string): string[] {
  const words = title
    .trim()
    .split(/\s+/)
    .flatMap((word) => word.match(/.{1,34}/gu) ?? []);
  const lines: string[] = [];
  let truncated = false;
  for (const word of words) {
    const current = lines.at(-1);
    if (!current) {
      lines.push(word);
    } else if (current.length + word.length + 1 <= 34) {
      lines[lines.length - 1] = `${current} ${word}`;
    } else if (lines.length < 3) {
      lines.push(word);
    } else {
      truncated = true;
      break;
    }
  }
  if (truncated && lines[2]) lines[2] = `${lines[2].slice(0, 33).trimEnd()}…`;
  return lines;
}

export function renderArticleCoverSvg(article: {
  slug: string;
  title: string;
  emoji: string;
}): string {
  let hash = 0;
  for (const character of article.slug) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  const hue = hash % 360;
  const titleLines = wrapCoverTitle(article.title)
    .map(
      (line, index) =>
        `<text x="96" y="${300 + index * 76}" fill="#fff" font-family="system-ui, sans-serif" font-size="58" font-weight="700">${escapeXml(line)}</text>`,
    )
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-labelledby="title description" data-article-slug="${escapeXml(article.slug)}"><title id="title">${escapeXml(article.title)}</title><desc id="description">Cover image for ${escapeXml(article.title)}</desc><defs><linearGradient id="background" x1="0" y1="0" x2="1" y2="1"><stop stop-color="hsl(${hue} 58% 24%)"/><stop offset="1" stop-color="hsl(${(hue + 42) % 360} 72% 42%)"/></linearGradient></defs><rect width="1200" height="630" rx="36" fill="url(#background)"/><circle cx="1050" cy="80" r="230" fill="#fff" opacity=".08"/><text x="96" y="165" font-family="Apple Color Emoji, Segoe UI Emoji, sans-serif" font-size="92">${escapeXml(article.emoji)}</text>${titleLines}<text x="96" y="570" fill="#fff" opacity=".78" font-family="system-ui, sans-serif" font-size="28" font-weight="600">rdlabo.dev · English developer article</text></svg>\n`;
}

function renderArticleLinkCards(document: Document): void {
  for (const paragraph of Array.from(document.querySelectorAll('p'))) {
    const links = Array.from(paragraph.querySelectorAll<HTMLAnchorElement>('a'));
    const primaryLink = links.find((link) => link.style.display !== 'none');
    if (!primaryLink) continue;
    const metadata = ARTICLE_LINK_CARDS[primaryLink.href];
    if (!metadata) continue;
    if (links.some((link) => link.href !== primaryLink.href)) continue;

    const card = document.createElement('a');
    card.className = 'article-link-card';
    card.href = primaryLink.href;
    card.target = '_blank';
    card.rel = 'noopener noreferrer';

    const body = document.createElement('span');
    body.className = 'article-link-card__body';

    const title = document.createElement('strong');
    title.className = 'article-link-card__title';
    title.textContent = metadata.title;

    const description = document.createElement('span');
    description.className = 'article-link-card__description';
    description.textContent = metadata.description;

    const site = document.createElement('span');
    site.className = 'article-link-card__site';
    site.textContent = metadata.siteName;

    const image = document.createElement('img');
    image.className = 'article-link-card__image';
    image.src = metadata.imageUrl;
    image.alt = '';
    image.loading = 'lazy';
    image.width = 1024;
    image.height = 512;

    body.append(title, description, site);
    card.append(body, image);
    paragraph.replaceWith(card);
  }
}

function renderEmbeddedFrames(document: Document): void {
  for (const frame of Array.from(document.querySelectorAll<HTMLIFrameElement>('iframe[src]'))) {
    const sourceUrl = frame.src;
    if (!sourceUrl.startsWith('https://')) continue;

    const link = document.createElement('a');
    link.className = 'article-embed-card';
    link.href = sourceUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';

    const label = document.createElement('strong');
    label.textContent = sourceUrl.includes('youtube')
      ? 'Watch this video on YouTube'
      : 'Open embedded content';
    const arrow = document.createElement('span');
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '→';
    link.append(label, arrow);

    const container = frame.closest('.embed-block') ?? frame;
    container.replaceWith(link);
  }
}

export function normalizeFootnoteIds(document: Document, documentId: string): void {
  const replacements = new Map<string, string>();
  for (const element of Array.from(
    document.querySelectorAll<HTMLElement>('[id^="fn-"], [id^="fnref-"]'),
  )) {
    const match = /^(fn|fnref)-[a-f0-9]{4}-(\d+(?::\d+)?)$/.exec(element.id);
    if (!match) continue;
    const replacement = `${match[1]}-${documentId}-${match[2]}`;
    replacements.set(element.id, replacement);
    element.id = replacement;
  }

  for (const link of Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href^="#fn"]'))) {
    const target = replacements.get(link.hash.slice(1));
    if (target) link.setAttribute('href', `#${target}`);
  }
}

async function writeIfChanged(path: string, content: string): Promise<void> {
  let current: string | undefined;
  try {
    current = await readFile(path, 'utf8');
  } catch {
    // The first generation creates the file.
  }
  if (current !== content) await writeFile(path, content);
}

function optionalUpdatedAt(value: unknown, file: string): string | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw new Error(`${file} must declare updatedAt as a real YYYY-MM-DD date when present`);
    }
    return assertValidContentUpdatedAt(formatContentUpdatedAt(value), file);
  }
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${file} must declare updatedAt as a non-empty YYYY-MM-DD date when present`);
  }
  return assertValidContentUpdatedAt(value.trim(), file);
}

async function loadTranslations(sourceRoot: string): Promise<ArticleTranslation[]> {
  await mkdir(sourceRoot, { recursive: true });
  const files = (await readdir(sourceRoot)).filter((file) => file.endsWith('.md')).sort();
  return Promise.all(
    files.map(async (file) => {
      const parsed = fm<Partial<ArticleFrontMatter>>(
        await readFile(join(sourceRoot, file), 'utf8'),
      );
      const source = parsed.attributes.source ?? 'zenn';
      if (source === 'note') {
        return {
          file,
          source,
          sourceKey: required(parsed.attributes.sourceUrl, 'sourceUrl', file),
          sourceRevision: required(parsed.attributes.sourceRevision, 'sourceRevision', file),
          slug: required(parsed.attributes.slug, 'slug', file),
          title: required(parsed.attributes.title, 'title', file),
          description: required(parsed.attributes.description, 'description', file),
          updatedAt: optionalUpdatedAt(parsed.attributes.updatedAt, file),
          image: optionalHttpsUrl(parsed.attributes.image, 'image', file),
          emoji:
            typeof parsed.attributes.emoji === 'string' && parsed.attributes.emoji.trim()
              ? parsed.attributes.emoji.trim()
              : '✦',
          body: parsed.body,
        };
      }

      const zennSlug = required(parsed.attributes.zennSlug, 'zennSlug', file);
      return {
        file,
        source,
        sourceKey: zennSlug,
        slug: zennSlug,
        title: required(parsed.attributes.title, 'title', file),
        description: required(parsed.attributes.description, 'description', file),
        updatedAt: optionalUpdatedAt(parsed.attributes.updatedAt, file),
        image: optionalHttpsUrl(parsed.attributes.image, 'image', file),
        emoji:
          typeof parsed.attributes.emoji === 'string' && parsed.attributes.emoji.trim()
            ? parsed.attributes.emoji.trim()
            : '✦',
        body: parsed.body,
      };
    }),
  );
}

export async function generateArticles(options: GenerateArticlesOptions = {}): Promise<void> {
  const root = options.root ?? resolve(process.cwd());
  const sourceRoot = join(root, 'projects/web-site/src/articles');
  const generatedRoot = join(root, 'projects/web-site/src/app/generated');
  const generatedArticlesRoot = join(generatedRoot, 'articles');
  const publicRoot = join(root, 'projects/web-site/public');
  const fetchZennArticles = options.fetchZennArticles ?? fetchZennArticleFeed;
  const fetchNoteSource = options.fetchNoteSource ?? fetchNoteArticle;
  const translations = await loadTranslations(sourceRoot);
  const noteSourceUrls = [
    ...new Set(
      translations
        .filter((translation) => translation.source === 'note')
        .map((translation) => translation.sourceKey),
    ),
  ];
  const [zennArticles, noteArticles] = await Promise.all([
    fetchZennArticles(),
    Promise.all(noteSourceUrls.map((sourceUrl) => fetchNoteSource(sourceUrl))),
  ]);
  const zennMetadataBySlug = new Map(zennArticles.map((article) => [article.slug, article]));
  const noteMetadataByUrl = new Map(noteArticles.map((article) => [article.url, article]));
  const seen = new Set<string>();
  const articles: GeneratedArticle[] = [];

  for (const translation of translations) {
    const slug = translation.slug;
    if (seen.has(slug)) throw new Error(`Duplicate translated article slug: ${slug}`);
    seen.add(slug);
    const metadata =
      translation.source === 'note'
        ? noteMetadataByUrl.get(translation.sourceKey)
        : zennMetadataBySlug.get(translation.sourceKey);
    if (!metadata) {
      throw new Error(
        `${translation.file} does not match a public ${translation.source === 'note' ? 'note' : 'Zenn'} article`,
      );
    }
    if (translation.source === 'note' && translation.sourceRevision !== metadata.sourceRevision) {
      throw new Error(
        `${translation.file} is based on an older note revision; review the Japanese source and update sourceRevision`,
      );
    }
    if (translation.updatedAt) {
      assertUpdatedAtOnOrAfterPublishedDate(
        translation.updatedAt,
        metadata.publishedDate,
        translation.file,
      );
    }
    const rendered = new JSDOM(await markdownToHtml(rewriteZennImages(translation.body)));
    for (const heading of Array.from(rendered.window.document.querySelectorAll('h1'))) {
      const replacement = rendered.window.document.createElement('h2');
      for (const attribute of Array.from(heading.attributes)) {
        replacement.setAttribute(attribute.name, attribute.value);
      }
      replacement.innerHTML = heading.innerHTML;
      heading.replaceWith(replacement);
    }
    for (const link of Array.from(
      rendered.window.document.querySelectorAll<HTMLAnchorElement>('a[target="_blank"]'),
    )) {
      link.rel = 'noopener noreferrer';
    }
    renderArticleLinkCards(rendered.window.document);
    renderEmbeddedFrames(rendered.window.document);
    normalizeFootnoteIds(rendered.window.document, slug);
    const headings = Array.from(
      rendered.window.document.querySelectorAll<HTMLHeadingElement>('h2, h3'),
    )
      .filter((heading) => heading.id)
      .map((heading) => ({
        id: heading.id,
        text: heading.textContent.trim(),
        level: Number(heading.tagName.slice(1)) as 2 | 3,
      }));
    const html = enforceGeneratedHtmlPolicy(
      rendered.window.document.body.innerHTML,
      `translated article ${slug}`,
    );
    const generatedImage = !translation.image;
    articles.push({
      slug,
      title: translation.title,
      description: translation.description,
      ...(translation.updatedAt ? { updatedAt: translation.updatedAt } : {}),
      image:
        translation.image ?? `https://rdlabo.dev/article-images/${encodeURIComponent(slug)}.svg`,
      ...(generatedImage ? { imageWidth: 1200, imageHeight: 630 } : {}),
      emoji: translation.emoji,
      sourceName: translation.source === 'note' ? 'note' : 'Zenn',
      originalUrl: metadata.url,
      publishedAt: metadata.publishedAt,
      publishedDate: metadata.publishedDate,
      html,
      headings,
    });
  }
  articles.sort((left, right) => right.publishedAt.localeCompare(left.publishedAt));

  await rm(generatedArticlesRoot, { recursive: true, force: true });
  const articleImagesRoot = join(publicRoot, 'article-images');
  await rm(articleImagesRoot, { recursive: true, force: true });
  await Promise.all([
    mkdir(generatedArticlesRoot, { recursive: true }),
    mkdir(articleImagesRoot, { recursive: true }),
  ]);
  const summaries = articles.map(({ html: _html, headings: _headings, ...summary }) => summary);
  const catalog = `// Generated by scripts/generate-articles.ts. Do not edit.\nexport const ARTICLE_SUMMARIES = ${JSON.stringify(summaries, null, 2)} as const;\n\nexport const ARTICLE_YEARS = ${JSON.stringify([...new Set(articles.map((article) => article.publishedDate.slice(0, 4)))])} as const;\n`;
  const loaders = `// Generated by scripts/generate-articles.ts. Do not edit.\nexport const ARTICLE_LOADERS: Record<string, () => Promise<{ default: { html: string; headings: readonly { id: string; text: string; level: 2 | 3 }[] } }>> = {\n${articles.map((article) => `  ${JSON.stringify(article.slug)}: () => import('./articles/${article.slug}.generated'),`).join('\n')}\n};\n`;
  const publicPaths = [
    '',
    '/articles',
    ...new Set(articles.map((article) => `/articles/archive/${article.publishedDate.slice(0, 4)}`)),
    ...articles.map((article) => `/articles/${article.slug}`),
  ];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${publicPaths
    .map((path) => {
      const article = articles.find(
        (entry) =>
          entry.slug === path.replace(/^\/articles\//, '') && path.startsWith('/articles/'),
      );
      const lastmod = formatSitemapLastmod(article?.updatedAt);
      return `  <url><loc>https://rdlabo.dev${path}</loc>${lastmod}</url>`;
    })
    .join('\n')}\n</urlset>\n`;
  await Promise.all([
    writeIfChanged(join(generatedRoot, 'article-catalog.generated.ts'), catalog),
    writeIfChanged(join(generatedRoot, 'article-loaders.generated.ts'), loaders),
    writeIfChanged(join(publicRoot, 'sitemap.xml'), sitemap),
    ...articles.map((article) =>
      writeIfChanged(
        join(articleImagesRoot, `${article.slug}.svg`),
        renderArticleCoverSvg(article),
      ),
    ),
    ...articles.map((article) =>
      writeIfChanged(
        join(generatedArticlesRoot, `${article.slug}.generated.ts`),
        `// Generated by scripts/generate-articles.ts. Do not edit.\nexport default ${JSON.stringify({ html: article.html, headings: article.headings })} as const;\n`,
      ),
    ),
  ]);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  generateArticles().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
