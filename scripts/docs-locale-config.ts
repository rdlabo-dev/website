import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { DOCS_LOCALES } from '../shared/docs-locales';

interface LocaleDefinition {
  code: string;
  subPath: string;
  published: boolean;
}

interface AngularLocaleConfig {
  projects: {
    docs: {
      i18n: {
        sourceLocale: { code: string; subPath: string };
        locales: Record<string, { translation: string; subPath: string }>;
      };
      architect: {
        build: {
          options: { localize: boolean | string[] };
          defaultConfiguration?: string;
          configurations?: Record<string, { localize?: boolean | string[] }>;
        };
      };
    };
  };
}

export function assertDocsLocaleConfiguration(
  config: AngularLocaleConfig,
  locales: readonly LocaleDefinition[] = DOCS_LOCALES,
): void {
  const { i18n, architect } = config.projects.docs;
  const published = locales.filter((locale) => locale.published);
  const configured = { [i18n.sourceLocale.code]: i18n.sourceLocale, ...i18n.locales };
  const build = architect.build;
  const configuration = build.defaultConfiguration
    ? build.configurations?.[build.defaultConfiguration]
    : undefined;
  const built = configuration?.localize ?? build.options.localize;
  const builtLocales = built === true ? Object.keys(configured) : built === false ? [] : built;
  if (
    published
      .map(({ code }) => code)
      .sort()
      .join(',') !== [...builtLocales].sort().join(',')
  ) {
    throw new Error('Published docs locales must match Angular build localize configuration');
  }
  if (i18n.sourceLocale.code !== 'en' || i18n.sourceLocale.subPath !== '') {
    throw new Error('The docs source locale must be English at the domain root');
  }
  if (
    new Set(locales.map(({ code }) => code)).size !== locales.length ||
    new Set(locales.map(({ subPath }) => subPath)).size !== locales.length
  ) {
    throw new Error('Docs locale codes and URL subpaths must be unique');
  }
  for (const locale of published) {
    if (configured[locale.code]?.subPath !== locale.subPath) {
      throw new Error(`${locale.code}: Angular subPath must match the docs locale registry`);
    }
    if (locale.code !== 'en' && !i18n.locales[locale.code]?.translation) {
      throw new Error(`${locale.code}: a UI translation file is required before publication`);
    }
  }
}

export async function validateDocsLocaleConfiguration(root: string): Promise<void> {
  const config = JSON.parse(
    await readFile(join(root, 'angular.json'), 'utf8'),
  ) as AngularLocaleConfig;
  assertDocsLocaleConfiguration(config);
  for (const { code } of DOCS_LOCALES.filter(
    (locale) => locale.published && locale.code !== 'en',
  )) {
    await access(join(root, config.projects.docs.i18n.locales[code].translation));
  }
}
