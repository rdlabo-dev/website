export function isJapaneseLocale(locale: string): boolean {
  return locale.toLowerCase().startsWith('ja');
}

/** Canonical public home path: EN `/`, JA `/ja` (never `/ja/`). */
export function canonicalHomePath(locale = 'en'): string {
  return isJapaneseLocale(locale) ? '/ja' : '/';
}

/** Locale-prefixed public path for SEO, sitemap, and cross-locale links. */
export function localizedPublicPath(locale: string, path: string): string {
  const normalized = path || '/';
  if (normalized === '/') {
    return canonicalHomePath(locale);
  }
  return isJapaneseLocale(locale) ? `/ja${normalized}` : normalized;
}

export function localizedFragmentPath(locale: string, path: string, fragment: string): string {
  return `${localizedPublicPath(locale, path)}#${fragment}`;
}
