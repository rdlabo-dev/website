import {
  breadcrumbList,
  jsonLdGraph,
  RDLABO_ORGANIZATION_ID,
  RDLABO_SITE_ORIGIN,
  rdlaboOrganization,
  type JsonLdDocument,
} from '../../../../shared/json-ld';
import type { ArticleSummary } from './articles/article-data';

const SITE_ORIGIN = RDLABO_SITE_ORIGIN;
function absoluteUrl(path: string): string {
  return path === '/' ? SITE_ORIGIN : `${SITE_ORIGIN}${path}`;
}

export function homeStructuredData(description: string): JsonLdDocument {
  return jsonLdGraph([
    {
      '@type': 'WebSite',
      '@id': `${SITE_ORIGIN}/#website`,
      url: SITE_ORIGIN,
      name: 'rdlabo.dev',
      description,
      publisher: { '@id': RDLABO_ORGANIZATION_ID },
      inLanguage: 'en',
    },
    rdlaboOrganization(),
  ]);
}

export function articlesBreadcrumbStructuredData(label: string, path: string): JsonLdDocument {
  return jsonLdGraph([
    breadcrumbList([
      { name: 'rdlabo.dev', url: SITE_ORIGIN },
      { name: label, url: absoluteUrl(path) },
    ]),
  ]);
}

export function articleStructuredData(article: ArticleSummary): JsonLdDocument {
  const canonicalUrl = absoluteUrl(`/articles/${article.slug}`);
  const blogPosting: Record<string, unknown> = {
    '@type': 'BlogPosting',
    '@id': `${canonicalUrl}#blogposting`,
    mainEntityOfPage: canonicalUrl,
    headline: article.title,
    description: article.description,
    image: article.image,
    datePublished: article.publishedAt,
    author: {
      '@type': 'Organization',
      name: 'rdlabo',
      url: SITE_ORIGIN,
    },
    publisher: { '@id': RDLABO_ORGANIZATION_ID },
    inLanguage: 'en',
    isBasedOn: {
      '@type': 'Article',
      '@id': article.originalUrl,
      inLanguage: 'ja',
    },
  };
  if (article.updatedAt) {
    blogPosting['dateModified'] = article.updatedAt;
  }

  return jsonLdGraph([
    blogPosting,
    breadcrumbList([
      { name: 'rdlabo.dev', url: SITE_ORIGIN },
      { name: 'Articles', url: `${SITE_ORIGIN}/articles` },
      { name: article.title, url: canonicalUrl },
    ]),
  ]);
}
