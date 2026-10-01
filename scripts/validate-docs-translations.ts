import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { DOCS_LOCALES, type DocsLocale } from '../shared/docs-locales';
import { apiMarkdown } from './docgen-api';
import { assertReviewedDocsTranslation, translateApiText } from './docs-translation-review';
import { extractPackageReadmeParts } from './package-markdown';
import { fetchEnglishProjectMarkdown, fetchEnglishProjectReadme } from './package-repository';
import { localize, projectCategoryDefinitions, projectDefinitions } from './project-manifest';

async function main(): Promise<void> {
  const root = resolve(process.cwd());
  const requestedLocales = process.argv.slice(2).filter((arg) => arg.startsWith('--locale='));
  const requestedProjects = process.argv.slice(2).filter((arg) => arg.startsWith('--project='));
  for (const arg of process.argv.slice(2)) {
    if (!arg.startsWith('--locale=') && !arg.startsWith('--project='))
      throw new Error(`Unknown translation validation argument: ${arg}`);
  }
  const locales = DOCS_LOCALES.filter(
    ({ code, requiresSourceReview }) =>
      requiresSourceReview &&
      (!requestedLocales.length || requestedLocales.includes(`--locale=${code}`)),
  ).map(({ code }) => code);
  if (
    !locales.length ||
    requestedLocales.some((arg) => !locales.includes(arg.slice(9) as DocsLocale))
  )
    throw new Error('Select a registered locale requiring translation review.');
  const projects = projectDefinitions.filter(
    (project) =>
      !project.hostedUrl &&
      (!requestedProjects.length || requestedProjects.includes(`--project=${project.id}`)),
  );
  if (
    !projects.length ||
    requestedProjects.some((arg) => !projects.some(({ id }) => arg === `--project=${id}`))
  )
    throw new Error('Select an existing portal-hosted project.');
  const errors: string[] = [];
  let pages = 0;
  const apiTexts = new Set<string>();
  function checkMetadata(value: unknown): void {
    if (!value || typeof value !== 'object') return;
    if ('en' in value && typeof value.en === 'string') {
      for (const locale of locales) {
        try {
          localize(value as { en: string; ja: string }, locale);
        } catch (error) {
          errors.push(error instanceof Error ? error.message : String(error));
        }
      }
    } else for (const child of Object.values(value)) checkMetadata(child);
  }
  checkMetadata(projectDefinitions);
  checkMetadata(projectCategoryDefinitions);
  for (const project of projects) {
    const cache = new Map<string, string>();
    const sources = new Map<string, string>();
    for (const page of project.pages) {
      sources.set(
        page.file,
        page.localEnglishSource
          ? await readFile(
              join(root, `projects/docs/src/${project.sourceDirectory}/docs/${page.file}`),
              'utf8',
            )
          : (await fetchEnglishProjectMarkdown(project, page.file, cache)).content,
      );
    }
    if (!project.pages.some((page) => page.slug === 'api')) {
      const readme = await fetchEnglishProjectReadme(project, cache);
      const api = readme && extractPackageReadmeParts(readme.content).api;
      if (api) sources.set('api.md', api);
    }
    for (const [file, english] of sources) {
      for (const locale of locales) {
        const relativePath = `projects/docs/src/${project.sourceDirectory}/docs/${locale}/${file}`;
        try {
          const translated = await readFile(join(root, relativePath), 'utf8');
          assertReviewedDocsTranslation(english, translated, relativePath, {
            api: file === 'api.md',
          });
          pages++;
        } catch (error) {
          errors.push(error instanceof Error ? error.message : String(error));
        }
      }
    }
    try {
      const docsJson = JSON.parse(
        await readFile(join(root, 'node_modules', project.packageName, 'dist/docs.json'), 'utf8'),
      );
      apiMarkdown(docsJson, (text) => {
        if (text.trim()) apiTexts.add(text);
        return text;
      });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
  }
  for (const locale of locales) {
    const translations = JSON.parse(
      await readFile(join(root, `projects/docs/src/locale/api.${locale}.json`), 'utf8'),
    ) as Record<string, string>;
    for (const text of apiTexts) {
      try {
        translateApiText(text, translations, `API (${locale})`);
      } catch (error) {
        errors.push(error instanceof Error ? error.message : String(error));
      }
    }
  }
  if (errors.length)
    throw new Error(`${errors.length} translation contract failures:\n${errors.join('\n')}`);
  console.log(
    `Validated ${pages} translated sources against pinned English originals, all metadata, and ${apiTexts.size} API strings per locale (${locales.join(', ')}). Linguistic review remains a separate step.`,
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
