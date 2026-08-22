import { localizedPublicPath } from '../locale-path';
import { SITE_CONFIG } from '../site-config';
import {
  breadcrumbList,
  jsonLdGraph,
  RDLABO_ORGANIZATION_ID,
  type JsonLdDocument,
} from '../../../../../shared/json-ld';

function docsAbsoluteUrl(locale: string, path: string): string {
  return `${SITE_CONFIG.origin}${localizedPublicPath(locale, path)}`;
}

export function docsHomeStructuredData(locale: string, description: string): JsonLdDocument {
  const url = docsAbsoluteUrl(locale, '/');
  const inLanguage = locale.toLowerCase().startsWith('ja') ? 'ja' : 'en';
  if (inLanguage === 'ja') {
    return jsonLdGraph([
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: SITE_CONFIG.name,
        description,
        isPartOf: { '@id': `${SITE_CONFIG.origin}/#website` },
        inLanguage,
      },
    ]);
  }
  return jsonLdGraph([
    {
      '@type': 'WebSite',
      '@id': `${SITE_CONFIG.origin}/#website`,
      url,
      name: SITE_CONFIG.name,
      alternateName: 'docs.rdlabo.dev',
      description,
      publisher: { '@id': RDLABO_ORGANIZATION_ID },
      inLanguage,
    },
  ]);
}

export function docsBreadcrumbStructuredData(
  locale: string,
  items: readonly { name: string; path: string }[],
): JsonLdDocument {
  return jsonLdGraph([
    breadcrumbList(
      items.map((item) => ({
        name: item.name,
        url: docsAbsoluteUrl(locale, item.path),
      })),
    ),
  ]);
}
