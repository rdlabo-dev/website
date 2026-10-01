import { docsLocalePrefix, unlocalizedDocsPath } from '../../../../shared/docs-locales';

/** Canonical public home path: source locale `/`, other locales `/{locale}`. */
export function canonicalHomePath(locale = 'en'): string {
  return docsLocalePrefix(locale) || '/';
}

/** Locale-prefixed public path for SEO, sitemap, and cross-locale links. */
export function localizedPublicPath(locale: string, path: string): string {
  const normalized = unlocalizedDocsPath(path || '/');
  const [pathname] = normalized.split(/[?#]/);
  const suffix = normalized.slice(pathname.length);
  return pathname === '/'
    ? `${canonicalHomePath(locale)}${suffix}`
    : `${docsLocalePrefix(locale)}${normalized}`;
}

export function localizedFragmentPath(locale: string, path: string, fragment: string): string {
  return `${localizedPublicPath(locale, path)}#${fragment}`;
}
