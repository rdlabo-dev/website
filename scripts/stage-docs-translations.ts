import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import fm from 'front-matter';
import { DOCS_LOCALES } from '../shared/docs-locales';
import { projectCategoryDefinitions, projectDefinitions } from './project-manifest';
import { fetchEnglishProjectMarkdown, fetchEnglishProjectReadme } from './package-repository';
import { extractPackageReadmeParts } from './package-markdown';
import { docsSourceRevision } from './docs-translation-review';
import { apiMarkdown } from './docgen-api';

async function main(): Promise<void> {
  const root = resolve(process.cwd());
  const staging = join(root, 'tmp/docs-translations');
  const inventory: {
    projectId: string;
    file: string;
    sourceRevision: string;
    stagedPath: string;
    targetPaths: Record<string, string>;
  }[] = [];
  const apiTexts = new Set<string>();
  const metadataTexts = new Set<string>();
  const locales = DOCS_LOCALES.filter((locale) => locale.requiresSourceReview);
  function collectMetadata(value: unknown): void {
    if (!value || typeof value !== 'object') return;
    if ('en' in value && typeof value.en === 'string') metadataTexts.add(value.en);
    else for (const child of Object.values(value)) collectMetadata(child);
  }
  collectMetadata(projectDefinitions);
  collectMetadata(projectCategoryDefinitions);
  for (const project of projectDefinitions.filter((project) => !project.hostedUrl)) {
    const cache = new Map<string, string>();
    async function stage(file: string, source: string, title: string): Promise<void> {
      const parsed = fm<Record<string, unknown>>(source);
      const sourceRevision = docsSourceRevision(source);
      const stagedPath = `tmp/docs-translations/${project.sourceDirectory}/${file}`;
      const destination = join(root, stagedPath);
      await mkdir(dirname(destination), { recursive: true });
      const attributes = {
        ...parsed.attributes,
        title: parsed.attributes['title'] ?? title,
        sourceRevision,
      };
      const frontMatter = Object.entries(attributes)
        .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
        .join('\n');
      await writeFile(destination, `---\n${frontMatter}\n---\n${parsed.body}`);
      inventory.push({
        projectId: project.id,
        file,
        sourceRevision,
        stagedPath,
        targetPaths: Object.fromEntries(
          locales.map(({ code }) => [
            code,
            `projects/docs/src/${project.sourceDirectory}/docs/${code}/${file}`,
          ]),
        ),
      });
    }
    for (const page of project.pages) {
      const source = page.localEnglishSource
        ? await readFile(
            join(root, `projects/docs/src/${project.sourceDirectory}/docs/${page.file}`),
            'utf8',
          )
        : (await fetchEnglishProjectMarkdown(project, page.file, cache)).content;
      await stage(page.file, source, page.title.en);
    }
    if (!project.pages.some((page) => page.slug === 'api')) {
      const readme = await fetchEnglishProjectReadme(project, cache);
      const api = readme && extractPackageReadmeParts(readme.content).api;
      if (api) await stage('api.md', api, 'API');
    }
    let docsJson: string | undefined;
    try {
      docsJson = await readFile(
        join(root, 'node_modules', project.packageName, 'dist/docs.json'),
        'utf8',
      );
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
    if (docsJson)
      apiMarkdown(JSON.parse(docsJson), (text) => {
        if (text.trim()) apiTexts.add(text);
        return text;
      });
  }
  await mkdir(staging, { recursive: true });
  await writeFile(join(staging, 'inventory.json'), `${JSON.stringify(inventory, null, 2)}\n`);
  await writeFile(
    join(staging, 'metadata.json'),
    `${JSON.stringify([...metadataTexts].sort(), null, 2)}\n`,
  );
  await writeFile(
    join(staging, 'api-texts.json'),
    `${JSON.stringify([...apiTexts].sort(), null, 2)}\n`,
  );
  console.log(
    `Staged ${inventory.length} English sources, ${metadataTexts.size} metadata strings, and ${apiTexts.size} API strings. No published translations were changed.`,
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
