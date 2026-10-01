/** Register a locale here; publish it only after its content and UI translations are reviewed. */
export const DOCS_LOCALES = [
  { code: 'en', name: 'English', subPath: '', published: true, requiresSourceReview: false },
  { code: 'ja', name: '日本語', subPath: 'ja', published: true, requiresSourceReview: false },
  { code: 'fr', name: 'Français', subPath: 'fr', published: false, requiresSourceReview: true },
  { code: 'de', name: 'Deutsch', subPath: 'de', published: false, requiresSourceReview: true },
] as const;

export type DocsLocale = (typeof DOCS_LOCALES)[number]['code'];
export const PUBLISHED_DOCS_LOCALES = DOCS_LOCALES.filter((locale) => locale.published);

export function requiresDocsTranslationReview(locale: DocsLocale): boolean {
  return DOCS_LOCALES.find((entry) => entry.code === locale)!.requiresSourceReview;
}

export function resolveDocsLocale(locale: string): DocsLocale {
  const language = locale.toLowerCase().split(/[-_]/)[0];
  return DOCS_LOCALES.find((entry) => entry.code === language)?.code ?? 'en';
}

export function docsLocalePrefix(locale: string): string {
  const entry = DOCS_LOCALES.find((entry) => entry.code === resolveDocsLocale(locale))!;
  return entry.subPath ? `/${entry.subPath}` : '';
}

export function docsLocaleFromPath(path: string): DocsLocale {
  const segment = path.split(/[?#]/)[0].split('/')[1];
  return DOCS_LOCALES.find((entry) => entry.subPath && entry.subPath === segment)?.code ?? 'en';
}

export function unlocalizedDocsPath(path: string): string {
  const prefix = docsLocalePrefix(docsLocaleFromPath(path));
  const unlocalized = prefix ? path.slice(prefix.length) : path;
  return !unlocalized || /^[?#]/.test(unlocalized) ? `/${unlocalized}` : unlocalized;
}
