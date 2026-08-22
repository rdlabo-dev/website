import { access, constants, readFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';
import {
  collectJsonLdNodes,
  collectJsonLdTypes,
  extractBreadcrumbItemUrl,
  jsonLdNodeTypes,
  RDLABO_ORGANIZATION_ID,
  type JsonLdNode,
} from '../shared/json-ld';
import { isValidContentUpdatedAt } from './seo-dates';

export interface SeoAuditTarget {
  name: string;
  origin: string;
  sitemapPath: string;
  browserRoot: string;
  bilingual: boolean;
}

export interface SitemapUrlEntry {
  loc: string;
  lastmod?: string;
}

const DEFAULT_TARGETS: readonly SeoAuditTarget[] = [
  {
    name: 'docs',
    origin: 'https://docs.rdlabo.dev',
    sitemapPath: 'dist/docs/browser/sitemap.xml',
    browserRoot: 'dist/docs/browser',
    bilingual: true,
  },
  {
    name: 'web-site',
    origin: 'https://rdlabo.dev',
    sitemapPath: 'dist/web-site/browser/sitemap.xml',
    browserRoot: 'dist/web-site/browser',
    bilingual: false,
  },
];

export function parseSitemap(xml: string): SitemapUrlEntry[] {
  const document = new JSDOM(xml, { contentType: 'text/xml' }).window.document;
  const parserError = document.querySelector('parsererror');
  if (parserError) {
    throw new Error(`Invalid sitemap XML: ${parserError.textContent?.trim() ?? 'parser error'}`);
  }

  return [...document.querySelectorAll('url')].map((entry) => {
    const loc = entry.querySelector('loc')?.textContent?.trim() ?? '';
    const lastmod = entry.querySelector('lastmod')?.textContent?.trim() || undefined;
    return { loc, lastmod };
  });
}

const REQUIRED_HREFLANG = ['en', 'ja', 'x-default'] as const;
const ALLOWED_HREFLANG = new Set<string>(REQUIRED_HREFLANG);

export function normalizePublicUrl(origin: string, url: string): string {
  const parsed = new URL(url, origin);
  if (parsed.origin !== origin) return url;
  parsed.hash = '';
  parsed.search = '';
  return normalizePublicUrlPathname(parsed);
}

export function normalizeCanonicalUrl(origin: string, url: string): string {
  const parsed = new URL(url, origin);
  if (parsed.origin !== origin) return url;
  return normalizePublicUrlPathname(parsed);
}

function normalizePublicUrlPathname(parsed: URL): string {
  if (parsed.pathname.endsWith('/') && parsed.pathname !== '/') {
    parsed.pathname = parsed.pathname.slice(0, -1);
  }
  return parsed.toString();
}

export function auditHreflangKeys(pageUrl: string, byLang: ReadonlyMap<string, string>): string[] {
  const errors: string[] = [];
  for (const lang of byLang.keys()) {
    if (!ALLOWED_HREFLANG.has(lang)) {
      errors.push(`${pageUrl}: unexpected hreflang="${lang}" alternate link`);
    }
  }
  for (const lang of REQUIRED_HREFLANG) {
    if (!byLang.has(lang)) {
      errors.push(`${pageUrl}: missing hreflang="${lang}" alternate link`);
    }
  }
  return errors;
}

export function validateHreflangAlternateLang(
  pageUrl: string,
  rawLang: string | null,
): string | undefined {
  const lang = rawLang?.trim() ?? '';
  if (!lang) {
    return `${pageUrl}: hreflang alternate link must not have an empty hreflang attribute`;
  }
  return undefined;
}

export function validateHreflangAlternateHref(
  pageUrl: string,
  lang: string,
  rawHref: string | null,
): { ok: true; href: string } | { ok: false; error: string } {
  const href = rawHref?.trim() ?? '';
  if (!href) {
    return {
      ok: false,
      error: `${pageUrl}: hreflang="${lang}" alternate href must not be empty`,
    };
  }
  if (href.startsWith('//')) {
    return {
      ok: false,
      error: `${pageUrl}: hreflang="${lang}" alternate href must be a fully-qualified HTTPS URL (got protocol-relative "${href}")`,
    };
  }
  if (!/^https:\/\//i.test(href)) {
    if (/^http:/i.test(href)) {
      return {
        ok: false,
        error: `${pageUrl}: hreflang="${lang}" alternate href must use HTTPS (got "${href}")`,
      };
    }
    return {
      ok: false,
      error: `${pageUrl}: hreflang="${lang}" alternate href must be a fully-qualified HTTPS URL (got "${href}")`,
    };
  }
  let parsed: URL;
  try {
    parsed = new URL(href);
  } catch {
    return {
      ok: false,
      error: `${pageUrl}: hreflang="${lang}" alternate href must be a fully-qualified HTTPS URL (got "${href}")`,
    };
  }
  if (parsed.protocol !== 'https:') {
    return {
      ok: false,
      error: `${pageUrl}: hreflang="${lang}" alternate href must use HTTPS (got "${href}")`,
    };
  }
  return { ok: true, href: parsed.toString() };
}

export function extractHreflangAlternates(
  document: Document,
  pageUrl: string,
  origin: string,
): { byLang: Map<string, string>; errors: string[] } {
  const errors: string[] = [];
  const byLang = new Map<string, string>();

  for (const link of document.querySelectorAll('link[rel="alternate"][hreflang]')) {
    const langError = validateHreflangAlternateLang(pageUrl, link.getAttribute('hreflang'));
    if (langError) {
      errors.push(langError);
      continue;
    }
    const lang = link.getAttribute('hreflang')!.trim();

    if (byLang.has(lang)) {
      errors.push(`${pageUrl}: duplicate hreflang="${lang}" alternate link`);
      continue;
    }

    const hrefResult = validateHreflangAlternateHref(pageUrl, lang, link.getAttribute('href'));
    if (!hrefResult.ok) {
      errors.push(hrefResult.error);
      continue;
    }

    byLang.set(lang, normalizeCanonicalUrl(origin, hrefResult.href));
  }

  return { byLang, errors };
}

function auditBilingualHreflangMetadata(
  pageUrl: string,
  origin: string,
  byLang: ReadonlyMap<string, string>,
): string[] {
  const errors: string[] = [];
  errors.push(...auditHreflangKeys(pageUrl, byLang));
  const english = byLang.get('en');
  const japanese = byLang.get('ja');
  const defaultHref = byLang.get('x-default');
  if (
    english &&
    defaultHref &&
    normalizeCanonicalUrl(origin, english) !== normalizeCanonicalUrl(origin, defaultHref)
  ) {
    errors.push(`${pageUrl}: x-default alternate must match the English URL`);
  }
  const pagePath = new URL(pageUrl).pathname;
  const isJapanesePage = pagePath === '/ja' || pagePath.startsWith('/ja/');
  if (
    isJapanesePage &&
    japanese &&
    normalizeCanonicalUrl(origin, japanese) !== normalizeCanonicalUrl(origin, pageUrl)
  ) {
    errors.push(`${pageUrl}: Japanese canonical/hreflang mismatch`);
  }
  if (
    !isJapanesePage &&
    english &&
    normalizeCanonicalUrl(origin, english) !== normalizeCanonicalUrl(origin, pageUrl)
  ) {
    errors.push(`${pageUrl}: English canonical/hreflang mismatch`);
  }
  return errors;
}

export function resolveInternalSitemapLink(
  origin: string,
  fromUrl: string,
  href: string,
  sitemapLocs: ReadonlySet<string>,
): string | undefined {
  const trimmed = href.trim();
  if (
    !trimmed ||
    trimmed.startsWith('#') ||
    /^mailto:/i.test(trimmed) ||
    /^tel:/i.test(trimmed) ||
    /^javascript:/i.test(trimmed)
  ) {
    return undefined;
  }

  let resolved: URL;
  try {
    resolved = new URL(trimmed, fromUrl);
  } catch {
    return undefined;
  }

  if (resolved.origin !== origin) return undefined;

  const normalized = normalizePublicUrl(origin, resolved.toString());
  return sitemapLocs.has(normalized) ? normalized : undefined;
}

export function collectInternalSitemapLinks(
  origin: string,
  fromUrl: string,
  document: Document,
  sitemapLocs: ReadonlySet<string>,
): string[] {
  const targets = new Set<string>();
  for (const anchor of document.querySelectorAll<HTMLAnchorElement>('a[href]')) {
    const target = resolveInternalSitemapLink(
      origin,
      fromUrl,
      anchor.getAttribute('href') ?? '',
      sitemapLocs,
    );
    if (target) targets.add(target);
  }
  return [...targets];
}

export function auditDuplicateMetadata(
  origin: string,
  valuesByLang: ReadonlyMap<string, ReadonlyMap<string, readonly string[]>>,
  label: 'document title' | 'meta description',
): string[] {
  const errors: string[] = [];
  for (const [lang, byValue] of valuesByLang) {
    for (const [value, urls] of byValue) {
      if (!value || urls.length < 2) continue;
      errors.push(`${origin} (${lang}): duplicate ${label} "${value}" on ${urls.join(', ')}`);
    }
  }
  return errors;
}

export function auditOrphanSitemapPages(
  origin: string,
  inboundLinks: ReadonlyMap<string, ReadonlySet<string>>,
  sitemapLocs: ReadonlySet<string>,
): string[] {
  const rootUrl = normalizePublicUrl(origin, `${origin}/`);
  const errors: string[] = [];
  for (const loc of sitemapLocs) {
    if (loc === rootUrl) continue;
    const inbound = inboundLinks.get(loc);
    if (!inbound || inbound.size === 0) {
      errors.push(`${loc}: orphan sitemap page with no inbound internal links`);
    }
  }
  return errors;
}

export function sitemapUrlToHtmlPath(origin: string, url: string, browserRoot: string): string {
  const parsed = new URL(url);
  if (parsed.origin !== origin) {
    throw new Error(`Expected ${origin} URL, received ${url}`);
  }

  let pathname = parsed.pathname;
  if (pathname.endsWith('/') && pathname !== '/') {
    pathname = pathname.slice(0, -1);
  }

  if (origin === 'https://docs.rdlabo.dev') {
    if (pathname === '' || pathname === '/') {
      return join(browserRoot, 'index.html');
    }
    if (pathname === '/ja') {
      return join(browserRoot, 'ja', 'index.html');
    }
    if (pathname.startsWith('/ja/')) {
      return join(browserRoot, pathname.slice(1), 'index.html');
    }
    return join(browserRoot, pathname.slice(1), 'index.html');
  }

  if (pathname === '' || pathname === '/') {
    return join(browserRoot, 'index.html');
  }
  return join(browserRoot, pathname.slice(1), 'index.html');
}

export function htmlPathToPublicUrl(origin: string, htmlPath: string, browserRoot: string): string {
  const relativePath = relative(browserRoot, htmlPath).replace(/\\/g, '/');
  if (relativePath === 'index.html') return `${origin}/`;
  const withoutIndex = relativePath.replace(/\/index\.html$/, '');
  if (origin === 'https://docs.rdlabo.dev' && withoutIndex === 'ja') {
    return `${origin}/ja`;
  }
  return `${origin}/${withoutIndex}`;
}

const JSON_LD_MARKER = 'data-rdlabo-json-ld';

export function expectedJsonLdTypes(pageUrl: string, siteName: string): readonly string[] {
  const path = new URL(pageUrl).pathname;

  if (siteName === 'web-site') {
    if (path === '/' || path === '') return ['WebSite', 'Organization'];
    if (path === '/articles') return ['BreadcrumbList'];
    if (/^\/articles\/archive\/\d{4}$/.test(path)) return ['BreadcrumbList'];
    if (/^\/articles\/[^/]+$/.test(path)) return ['BlogPosting', 'BreadcrumbList'];
    return [];
  }

  if (siteName === 'docs') {
    if (path === '/') return ['WebSite'];
    if (path === '/ja') return ['WebPage'];
    if (path === '/support' || path === '/ja/support') return ['BreadcrumbList'];
    if (/^\/projects\/[^/]+$/.test(path) || /^\/ja\/projects\/[^/]+$/.test(path)) {
      return ['BreadcrumbList'];
    }
    if (
      /^\/projects\/[^/]+\/docs\/.+$/.test(path) ||
      /^\/ja\/projects\/[^/]+\/docs\/.+$/.test(path)
    ) {
      return ['BreadcrumbList'];
    }
    return [];
  }

  return [];
}

function calendarDatePrefix(value: string): string | undefined {
  const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
  return match?.[1];
}

function siteCalendarDate(value: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(value);
  const part = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((entry) => entry.type === type)?.value ?? '';
  return `${part('year')}-${part('month')}-${part('day')}`;
}

function isAbsoluteHttpsUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function auditBreadcrumbListNode(pageUrl: string, node: JsonLdNode): string[] {
  const errors: string[] = [];
  const items = node.itemListElement;
  if (!Array.isArray(items) || items.length === 0) {
    errors.push(`${pageUrl}: BreadcrumbList must include itemListElement`);
    return errors;
  }

  const positions: number[] = [];
  for (const [index, item] of items.entries()) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      errors.push(`${pageUrl}: BreadcrumbList item ${index + 1} must be an object`);
      continue;
    }
    const record = item as JsonLdNode;
    if (!jsonLdNodeTypes(record).includes('ListItem')) {
      errors.push(`${pageUrl}: BreadcrumbList item ${index + 1} must use @type ListItem`);
    }
    if (typeof record.name !== 'string' || !record.name.trim()) {
      errors.push(`${pageUrl}: BreadcrumbList item ${index + 1} must declare a non-empty name`);
    }
    const position = record.position;
    if (typeof position !== 'number' || !Number.isInteger(position)) {
      errors.push(`${pageUrl}: BreadcrumbList item ${index + 1} must declare an integer position`);
      continue;
    }
    positions.push(position);

    const itemUrl = extractBreadcrumbItemUrl(record);
    if (!itemUrl) {
      errors.push(`${pageUrl}: BreadcrumbList item ${index + 1} must declare an absolute item URL`);
      continue;
    }
    if (!isAbsoluteHttpsUrl(itemUrl)) {
      errors.push(
        `${pageUrl}: BreadcrumbList item ${index + 1} must use an absolute HTTPS item URL (got "${itemUrl}")`,
      );
    } else if (new URL(itemUrl).origin !== new URL(pageUrl).origin) {
      errors.push(
        `${pageUrl}: BreadcrumbList item ${index + 1} must stay on the page origin (got "${itemUrl}")`,
      );
    }
  }

  const expectedPositions = [...positions].sort((left, right) => left - right);
  for (let index = 0; index < expectedPositions.length; index += 1) {
    if (expectedPositions[index] !== index + 1) {
      errors.push(
        `${pageUrl}: BreadcrumbList positions must be contiguous starting at 1 (got ${expectedPositions.join(', ')})`,
      );
      break;
    }
  }

  const lastItemUrl = extractBreadcrumbItemUrl(items.at(-1));
  if (
    lastItemUrl &&
    normalizeCanonicalUrl(new URL(pageUrl).origin, lastItemUrl) !==
      normalizeCanonicalUrl(new URL(pageUrl).origin, pageUrl)
  ) {
    errors.push(`${pageUrl}: final BreadcrumbList item must match the canonical page URL`);
  }

  return errors;
}

function auditBlogPostingNode(
  document: Document,
  pageUrl: string,
  origin: string,
  node: JsonLdNode,
  now = new Date(),
): string[] {
  const errors: string[] = [];
  const canonical = normalizeCanonicalUrl(origin, pageUrl);
  const mainEntity = node.mainEntityOfPage;
  let mainEntityUrl: string | undefined;
  if (typeof mainEntity === 'string') {
    mainEntityUrl = mainEntity;
  } else if (mainEntity && typeof mainEntity === 'object' && !Array.isArray(mainEntity)) {
    const id = (mainEntity as JsonLdNode)['@id'];
    if (typeof id === 'string') mainEntityUrl = id;
  }
  if (!mainEntityUrl) {
    errors.push(`${pageUrl}: BlogPosting must declare mainEntityOfPage`);
  } else if (normalizeCanonicalUrl(origin, mainEntityUrl) !== canonical) {
    errors.push(
      `${pageUrl}: BlogPosting mainEntityOfPage must match canonical URL (expected ${canonical}, got ${mainEntityUrl})`,
    );
  }

  const datePublished = node.datePublished;
  if (typeof datePublished !== 'string' || !datePublished.trim()) {
    errors.push(`${pageUrl}: BlogPosting must declare datePublished`);
  } else {
    const publishedPrefix = calendarDatePrefix(datePublished);
    if (
      !publishedPrefix ||
      !isValidContentUpdatedAt(publishedPrefix, now) ||
      !Number.isFinite(Date.parse(datePublished)) ||
      new Date(datePublished) > now
    ) {
      errors.push(`${pageUrl}: BlogPosting datePublished must be a valid non-future calendar date`);
    }
  }

  if (typeof datePublished === 'string') {
    const publishedMeta = document
      .querySelector('meta[property="article:published_time"]')
      ?.getAttribute('content');
    if (publishedMeta !== datePublished) {
      errors.push(`${pageUrl}: BlogPosting datePublished must match article:published_time`);
    }
    const visiblePublished = document
      .querySelector('time[data-article-published]')
      ?.getAttribute('datetime');
    const parsedPublished = new Date(datePublished);
    if (
      Number.isFinite(parsedPublished.getTime()) &&
      visiblePublished !== siteCalendarDate(parsedPublished)
    ) {
      errors.push(`${pageUrl}: BlogPosting datePublished must match the visible publication date`);
    }
  }

  for (const field of ['headline', 'description', 'inLanguage'] as const) {
    if (typeof node[field] !== 'string' || !node[field].trim()) {
      errors.push(`${pageUrl}: BlogPosting must declare a non-empty ${field}`);
    }
  }
  if (node.inLanguage !== 'en') {
    errors.push(`${pageUrl}: BlogPosting inLanguage must be en`);
  }
  const images = Array.isArray(node.image) ? node.image : [node.image];
  if (
    images.length === 0 ||
    images.some((image) => typeof image !== 'string' || !isAbsoluteHttpsUrl(image))
  ) {
    errors.push(`${pageUrl}: BlogPosting image must use absolute HTTPS URLs`);
  } else {
    const primaryImage = images[0] as string;
    const visibleImage = document.querySelector('img[data-article-image]')?.getAttribute('src');
    const openGraphImage = document
      .querySelector('meta[property="og:image"]')
      ?.getAttribute('content');
    const openGraphWidth = document
      .querySelector('meta[property="og:image:width"]')
      ?.getAttribute('content');
    const openGraphHeight = document
      .querySelector('meta[property="og:image:height"]')
      ?.getAttribute('content');
    const visibleImageElement = document.querySelector('img[data-article-image]');
    const visibleWidth = visibleImageElement?.getAttribute('width');
    const visibleHeight = visibleImageElement?.getAttribute('height');
    if (visibleImage !== primaryImage) {
      errors.push(`${pageUrl}: BlogPosting image must match the visible article image`);
    }
    if (openGraphImage !== primaryImage) {
      errors.push(`${pageUrl}: BlogPosting image must match og:image`);
    }
    if ((openGraphWidth === undefined) !== (openGraphHeight === undefined)) {
      errors.push(`${pageUrl}: og:image dimensions must be declared together`);
    }
    if (openGraphWidth !== undefined && openGraphHeight !== undefined) {
      if (!/^[1-9]\d*$/.test(openGraphWidth) || !/^[1-9]\d*$/.test(openGraphHeight)) {
        errors.push(`${pageUrl}: og:image dimensions must be positive integers`);
      }
      if (visibleWidth !== openGraphWidth || visibleHeight !== openGraphHeight) {
        errors.push(`${pageUrl}: og:image dimensions must match the visible article image`);
      }
    } else if (visibleWidth !== null || visibleHeight !== null) {
      errors.push(
        `${pageUrl}: unknown og:image dimensions must not be asserted on the visible image`,
      );
    }
  }

  const author = node.author;
  if (!author || typeof author !== 'object' || Array.isArray(author)) {
    errors.push(`${pageUrl}: BlogPosting must declare author as an object`);
  } else {
    const authorNode = author as JsonLdNode;
    const authorTypes = jsonLdNodeTypes(authorNode);
    if (!authorTypes.some((type) => type === 'Person' || type === 'Organization')) {
      errors.push(`${pageUrl}: BlogPosting author must be a Person or Organization`);
    }
    if (typeof authorNode.name !== 'string' || !authorNode.name.trim()) {
      errors.push(`${pageUrl}: BlogPosting author must declare a non-empty name`);
    }
    if (typeof authorNode.url !== 'string' || !isAbsoluteHttpsUrl(authorNode.url)) {
      errors.push(`${pageUrl}: BlogPosting author url must be an absolute HTTPS URL`);
    }
  }

  const publisher = node.publisher;
  if (!publisher || typeof publisher !== 'object' || Array.isArray(publisher)) {
    errors.push(`${pageUrl}: BlogPosting must declare publisher as an object`);
  } else if ((publisher as JsonLdNode)['@id'] !== RDLABO_ORGANIZATION_ID) {
    errors.push(`${pageUrl}: BlogPosting publisher must reference ${RDLABO_ORGANIZATION_ID}`);
  }

  const source = node.isBasedOn;
  if (!source || typeof source !== 'object' || Array.isArray(source)) {
    errors.push(`${pageUrl}: BlogPosting must declare isBasedOn as an Article object`);
  } else {
    const sourceNode = source as JsonLdNode;
    const sourceUrl = sourceNode['@id'];
    if (!jsonLdNodeTypes(sourceNode).includes('Article')) {
      errors.push(`${pageUrl}: BlogPosting isBasedOn must use @type Article`);
    }
    if (typeof sourceUrl !== 'string' || !isAbsoluteHttpsUrl(sourceUrl)) {
      errors.push(`${pageUrl}: BlogPosting isBasedOn @id must be an absolute HTTPS URL`);
    }
    if (sourceNode.inLanguage !== 'ja') {
      errors.push(`${pageUrl}: BlogPosting isBasedOn inLanguage must be ja`);
    }
    const visibleSourceUrl = document
      .querySelector('.article-original a[href]')
      ?.getAttribute('href');
    if (typeof sourceUrl === 'string' && visibleSourceUrl !== sourceUrl) {
      errors.push(`${pageUrl}: BlogPosting isBasedOn @id must match the visible original link`);
    }
  }

  const dateModified = node.dateModified;
  if (dateModified !== undefined) {
    if (typeof dateModified !== 'string' || !isValidContentUpdatedAt(dateModified, now)) {
      errors.push(`${pageUrl}: BlogPosting dateModified must be a valid non-future calendar date`);
    } else if (typeof datePublished === 'string') {
      const parsedPublished = new Date(datePublished);
      const publishedDate = Number.isFinite(parsedPublished.getTime())
        ? siteCalendarDate(parsedPublished)
        : calendarDatePrefix(datePublished);
      if (publishedDate && dateModified < publishedDate) {
        errors.push(
          `${pageUrl}: BlogPosting dateModified must not be before datePublished (${publishedDate}, got ${dateModified})`,
        );
      }
    }
  }
  const visibleModified = document
    .querySelector('time[data-article-modified]')
    ?.getAttribute('datetime');
  if (typeof dateModified === 'string' && visibleModified !== dateModified) {
    errors.push(`${pageUrl}: BlogPosting dateModified must match the visible modification date`);
  } else if (dateModified === undefined && visibleModified !== undefined) {
    errors.push(`${pageUrl}: visible modification date requires BlogPosting dateModified`);
  }

  return errors;
}

function auditWebSiteNode(pageUrl: string, origin: string, node: JsonLdNode): string[] {
  const errors: string[] = [];
  const canonical = normalizeCanonicalUrl(origin, pageUrl);
  const url = node.url;
  if (typeof url !== 'string' || !url.trim()) {
    errors.push(`${pageUrl}: WebSite must declare url`);
  } else if (normalizeCanonicalUrl(origin, url) !== canonical) {
    errors.push(
      `${pageUrl}: WebSite url must match canonical URL (expected ${canonical}, got ${url})`,
    );
  }

  const publisher = node.publisher;
  if (!publisher || typeof publisher !== 'object' || Array.isArray(publisher)) {
    errors.push(`${pageUrl}: WebSite must identify publisher`);
  } else {
    const publisherId = (publisher as JsonLdNode)['@id'];
    if (publisherId !== RDLABO_ORGANIZATION_ID) {
      errors.push(
        `${pageUrl}: WebSite publisher must reference ${RDLABO_ORGANIZATION_ID} (got ${String(publisherId)})`,
      );
    }
  }

  const expectedLanguage = new URL(pageUrl).pathname.startsWith('/ja') ? 'ja' : 'en';
  if (node.inLanguage !== expectedLanguage) {
    errors.push(`${pageUrl}: WebSite inLanguage must be ${expectedLanguage}`);
  }

  return errors;
}

function auditWebPageNode(pageUrl: string, origin: string, node: JsonLdNode): string[] {
  const errors: string[] = [];
  const canonical = normalizeCanonicalUrl(origin, pageUrl);
  if (typeof node.url !== 'string' || normalizeCanonicalUrl(origin, node.url) !== canonical) {
    errors.push(`${pageUrl}: WebPage url must match canonical URL`);
  }
  if (node.inLanguage !== 'ja') {
    errors.push(`${pageUrl}: localized docs WebPage inLanguage must be ja`);
  }
  const isPartOf = node.isPartOf;
  if (
    !isPartOf ||
    typeof isPartOf !== 'object' ||
    Array.isArray(isPartOf) ||
    (isPartOf as JsonLdNode)['@id'] !== `${origin}/#website`
  ) {
    errors.push(`${pageUrl}: localized docs WebPage must reference ${origin}/#website`);
  }
  return errors;
}

function auditOrganizationNode(pageUrl: string, node: JsonLdNode): string[] {
  const errors: string[] = [];
  const id = node['@id'];
  if (id !== RDLABO_ORGANIZATION_ID) {
    errors.push(
      `${pageUrl}: Organization @id must be ${RDLABO_ORGANIZATION_ID} (got ${String(id)})`,
    );
  }
  if (node.name !== 'rdlabo') {
    errors.push(`${pageUrl}: Organization name must be rdlabo`);
  }
  if (node.url !== 'https://rdlabo.dev') {
    errors.push(`${pageUrl}: Organization url must be https://rdlabo.dev`);
  }
  return errors;
}

export function auditJsonLdSemantics(
  document: Document,
  pageUrl: string,
  origin: string,
  siteName: string,
  now = new Date(),
): string[] {
  const errors: string[] = [];
  const expectedTypes = expectedJsonLdTypes(pageUrl, siteName);
  const scripts = [
    ...document.querySelectorAll<HTMLScriptElement>(
      `script[${JSON_LD_MARKER}], script#rdlabo-json-ld`,
    ),
  ];

  if (expectedTypes.length === 0) {
    return errors;
  }

  if (scripts.length !== 1) {
    errors.push(`${pageUrl}: expected exactly one marked JSON-LD script, found ${scripts.length}`);
    return errors;
  }
  if (
    scripts[0]?.id !== 'rdlabo-json-ld' ||
    scripts[0]?.type !== 'application/ld+json' ||
    !scripts[0]?.hasAttribute(JSON_LD_MARKER)
  ) {
    errors.push(
      `${pageUrl}: managed JSON-LD must be script#rdlabo-json-ld[type="application/ld+json"][${JSON_LD_MARKER}]`,
    );
  }

  const raw = scripts[0]?.textContent?.trim();
  if (!raw) {
    errors.push(`${pageUrl}: JSON-LD script is empty`);
    return errors;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    errors.push(
      `${pageUrl}: JSON-LD script is invalid JSON (${error instanceof Error ? error.message : error})`,
    );
    return errors;
  }

  const nodes = collectJsonLdNodes(parsed);
  if (nodes.length === 0) {
    errors.push(`${pageUrl}: JSON-LD must include at least one graph node`);
    return errors;
  }

  for (const [nodeIndex, node] of nodes.entries()) {
    if (!node || typeof node !== 'object' || Array.isArray(node)) {
      errors.push(`${pageUrl}: JSON-LD node ${nodeIndex + 1} must be an object`);
      continue;
    }
    const types = jsonLdNodeTypes(node);
    if (types.length === 0) {
      errors.push(`${pageUrl}: JSON-LD node ${nodeIndex + 1} is missing a string @type`);
    }
  }

  const foundTypes = collectJsonLdTypes(parsed);
  for (const expectedType of expectedTypes) {
    const count = foundTypes.filter((type) => type === expectedType).length;
    if (count === 0) {
      errors.push(`${pageUrl}: JSON-LD is missing required @type ${expectedType}`);
    } else if (count > 1) {
      errors.push(`${pageUrl}: JSON-LD must contain exactly one @type ${expectedType}`);
    }
  }

  if (
    !parsed ||
    typeof parsed !== 'object' ||
    Array.isArray(parsed) ||
    (parsed as JsonLdNode)['@context'] !== 'https://schema.org'
  ) {
    errors.push(`${pageUrl}: JSON-LD must declare @context https://schema.org`);
  }

  for (const node of nodes) {
    for (const type of jsonLdNodeTypes(node)) {
      if (type === 'BreadcrumbList') {
        errors.push(...auditBreadcrumbListNode(pageUrl, node));
      }
      if (type === 'BlogPosting') {
        errors.push(...auditBlogPostingNode(document, pageUrl, origin, node, now));
      }
      if (type === 'WebSite') {
        errors.push(...auditWebSiteNode(pageUrl, origin, node));
      }
      if (type === 'WebPage') {
        errors.push(...auditWebPageNode(pageUrl, origin, node));
      }
      if (type === 'Organization') {
        errors.push(...auditOrganizationNode(pageUrl, node));
      }
    }
  }

  return errors;
}

function auditJsonLd(document: Document, pageUrl: string): string[] {
  const errors: string[] = [];
  for (const [index, block] of [
    ...document.querySelectorAll('script[type="application/ld+json"]'),
  ].entries()) {
    const raw = block.textContent?.trim();
    if (!raw) {
      errors.push(`${pageUrl}: JSON-LD block ${index + 1} is empty`);
      continue;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      errors.push(
        `${pageUrl}: JSON-LD block ${index + 1} is invalid JSON (${error instanceof Error ? error.message : error})`,
      );
      continue;
    }
    const graph =
      parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? (parsed as JsonLdNode)['@graph']
        : undefined;
    const nodes = Array.isArray(parsed) ? parsed : Array.isArray(graph) ? graph : [parsed];
    if (nodes.length === 0) {
      errors.push(`${pageUrl}: JSON-LD block ${index + 1} must include at least one object node`);
      continue;
    }
    for (const [nodeIndex, node] of nodes.entries()) {
      if (!node || typeof node !== 'object' || Array.isArray(node)) {
        errors.push(
          `${pageUrl}: JSON-LD block ${index + 1} node ${nodeIndex + 1} must be an object`,
        );
        continue;
      }
      const types = jsonLdNodeTypes(node as JsonLdNode);
      if (types.length === 0) {
        errors.push(
          `${pageUrl}: JSON-LD block ${index + 1} node ${nodeIndex + 1} is missing a string @type`,
        );
      }
    }
  }
  return errors;
}

export function auditHtmlPage(
  html: string,
  pageUrl: string,
  options: {
    bilingual: boolean;
    hreflangByLang?: ReadonlyMap<string, string>;
    siteName?: string;
  },
): string[] {
  const document = new JSDOM(html).window.document;
  const errors: string[] = [];
  const origin = new URL(pageUrl).origin;
  const titles = [...document.querySelectorAll('title')];
  const descriptions = [...document.querySelectorAll('meta[name="description"]')];
  const canonicals = [...document.querySelectorAll('link[rel="canonical"]')];

  if (titles.length !== 1) {
    errors.push(`${pageUrl}: expected exactly one <title>, found ${titles.length}`);
  } else if (!titles[0]?.textContent?.trim()) {
    errors.push(`${pageUrl}: <title> must not be empty`);
  }

  if (descriptions.length !== 1) {
    errors.push(`${pageUrl}: expected exactly one meta description, found ${descriptions.length}`);
  } else if (!descriptions[0]?.getAttribute('content')?.trim()) {
    errors.push(`${pageUrl}: meta description must not be empty`);
  }

  if (canonicals.length !== 1) {
    errors.push(`${pageUrl}: expected exactly one canonical link, found ${canonicals.length}`);
  } else {
    const canonicalHref = canonicals[0]?.getAttribute('href')?.trim() ?? '';
    if (!canonicalHref) {
      errors.push(`${pageUrl}: canonical href must not be empty`);
    } else {
      const expected = normalizeCanonicalUrl(origin, pageUrl);
      const canonical = normalizeCanonicalUrl(origin, canonicalHref);
      if (canonical !== expected) {
        errors.push(
          `${pageUrl}: canonical mismatch (expected ${expected}, got ${canonical || 'empty'})`,
        );
      }
    }
  }

  if (options.bilingual) {
    let byLang: ReadonlyMap<string, string>;
    if (options.hreflangByLang) {
      byLang = options.hreflangByLang;
    } else {
      const extracted = extractHreflangAlternates(document, pageUrl, origin);
      errors.push(...extracted.errors);
      byLang = extracted.byLang;
    }
    errors.push(...auditBilingualHreflangMetadata(pageUrl, origin, byLang));
  }

  errors.push(...auditJsonLd(document, pageUrl));
  if (options.siteName) {
    errors.push(...auditJsonLdSemantics(document, pageUrl, origin, options.siteName));
  }
  return errors;
}

export function auditSitemapEntries(entries: readonly SitemapUrlEntry[], origin: string): string[] {
  const errors: string[] = [];
  const locs = entries.map((entry) => entry.loc);
  const duplicates = locs.filter((loc, index) => locs.indexOf(loc) !== index);
  for (const loc of new Set(duplicates)) {
    errors.push(`${origin}: duplicate sitemap loc ${loc}`);
  }

  for (const entry of entries) {
    if (!entry.loc) {
      errors.push(`${origin}: sitemap entry is missing <loc>`);
      continue;
    }
    if (entry.lastmod !== undefined && !isValidContentUpdatedAt(entry.lastmod)) {
      errors.push(`${origin}: invalid or future lastmod ${entry.lastmod} for ${entry.loc}`);
    }
  }

  return errors;
}

function serializeHreflangMap(map: ReadonlyMap<string, string>): string {
  return [...map.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([lang, href]) => `${lang}=${href}`)
    .join('|');
}

export function auditHtmlHreflangReciprocity(
  hreflangByPage: ReadonlyMap<string, ReadonlyMap<string, string>>,
  sitemapLocs: ReadonlySet<string>,
): string[] {
  const errors: string[] = [];

  for (const [pageUrl, byLang] of hreflangByPage) {
    errors.push(...auditHreflangKeys(pageUrl, byLang));
    for (const [lang, href] of byLang) {
      if (!sitemapLocs.has(href)) {
        errors.push(
          `${pageUrl}: hreflang="${lang}" must point to a sitemap-listed URL (got ${href})`,
        );
      }
    }
    const english = byLang.get('en');
    const japanese = byLang.get('ja');
    const defaultHref = byLang.get('x-default');
    if (english && defaultHref && english !== defaultHref) {
      errors.push(`${pageUrl}: x-default alternate must match the English URL`);
    }
    if (!english || !japanese) continue;

    const englishMap = hreflangByPage.get(english);
    const japaneseMap = hreflangByPage.get(japanese);
    if (!englishMap) {
      errors.push(`${pageUrl}: hreflang="en" target ${english} is not a sitemap-listed page`);
    }
    if (!japaneseMap) {
      errors.push(`${pageUrl}: hreflang="ja" target ${japanese} is not a sitemap-listed page`);
    }
    if (!englishMap || !japaneseMap) continue;

    const serialized = serializeHreflangMap(byLang);
    if (serializeHreflangMap(englishMap) !== serialized) {
      errors.push(`${pageUrl}: hreflang mapping is not reciprocal with ${english}`);
    }
    if (serializeHreflangMap(japaneseMap) !== serialized) {
      errors.push(`${pageUrl}: hreflang mapping is not reciprocal with ${japanese}`);
    }
  }

  return errors;
}

export async function auditSite(
  target: SeoAuditTarget,
  root = resolve(process.cwd()),
): Promise<string[]> {
  const errors: string[] = [];
  const sitemapPath = join(root, target.sitemapPath);
  const browserRoot = join(root, target.browserRoot);
  const sitemapXml = await readFile(sitemapPath, 'utf8');
  const entries = parseSitemap(sitemapXml);
  errors.push(...auditSitemapEntries(entries, target.origin));

  const sitemapLocs = new Set(entries.map((entry) => normalizePublicUrl(target.origin, entry.loc)));
  const titlesByLang = new Map<string, Map<string, string[]>>();
  const descriptionsByLang = new Map<string, Map<string, string[]>>();
  const inboundLinks = new Map<string, Set<string>>();
  const hreflangByPage = new Map<string, Map<string, string>>();

  for (const entry of entries) {
    const pageUrl = normalizePublicUrl(target.origin, entry.loc);
    const htmlPath = sitemapUrlToHtmlPath(target.origin, pageUrl, browserRoot);
    try {
      await access(htmlPath, constants.F_OK);
    } catch {
      errors.push(`${pageUrl}: sitemap URL missing built HTML at ${relative(root, htmlPath)}`);
      continue;
    }
    const html = await readFile(htmlPath, 'utf8');
    const document = new JSDOM(html).window.document;
    let hreflangByLang: Map<string, string> | undefined;
    if (target.bilingual) {
      const extracted = extractHreflangAlternates(document, pageUrl, target.origin);
      errors.push(...extracted.errors);
      hreflangByLang = extracted.byLang;
      hreflangByPage.set(pageUrl, extracted.byLang);
    }
    errors.push(
      ...auditHtmlPage(html, pageUrl, {
        bilingual: target.bilingual,
        hreflangByLang,
        siteName: target.name,
      }),
    );
    const lang = document.documentElement.lang || 'unknown';
    const title = document.querySelector('title')?.textContent?.trim() ?? '';
    const description =
      document.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() ?? '';

    const byTitle = titlesByLang.get(lang) ?? new Map<string, string[]>();
    byTitle.set(title, [...(byTitle.get(title) ?? []), pageUrl]);
    titlesByLang.set(lang, byTitle);

    const byDescription = descriptionsByLang.get(lang) ?? new Map<string, string[]>();
    byDescription.set(description, [...(byDescription.get(description) ?? []), pageUrl]);
    descriptionsByLang.set(lang, byDescription);

    for (const targetUrl of collectInternalSitemapLinks(
      target.origin,
      pageUrl,
      document,
      sitemapLocs,
    )) {
      if (targetUrl === pageUrl) continue;
      const inbound = inboundLinks.get(targetUrl) ?? new Set<string>();
      inbound.add(pageUrl);
      inboundLinks.set(targetUrl, inbound);
    }
  }

  errors.push(...auditDuplicateMetadata(target.origin, titlesByLang, 'document title'));
  errors.push(...auditDuplicateMetadata(target.origin, descriptionsByLang, 'meta description'));
  errors.push(...auditOrphanSitemapPages(target.origin, inboundLinks, sitemapLocs));
  if (target.bilingual) {
    errors.push(...auditHtmlHreflangReciprocity(hreflangByPage, sitemapLocs));
  }

  return errors;
}

export async function runSeoAudit(options?: {
  root?: string;
  targets?: readonly SeoAuditTarget[];
}): Promise<string[]> {
  const root = options?.root ?? resolve(process.cwd());
  const targets = options?.targets ?? DEFAULT_TARGETS;
  const errors: string[] = [];

  for (const target of targets) {
    try {
      await access(join(root, target.sitemapPath), constants.F_OK);
      await access(join(root, target.browserRoot), constants.F_OK);
    } catch {
      errors.push(
        `${target.name}: build output is missing (${target.sitemapPath} or ${target.browserRoot})`,
      );
      continue;
    }
    errors.push(...(await auditSite(target, root)));
  }

  return errors;
}

async function main(): Promise<void> {
  const errors = await runSeoAudit();
  if (errors.length === 0) {
    console.log('SEO audit passed.');
    return;
  }
  console.error(`SEO audit failed with ${errors.length} issue(s):\n`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  void main();
}
