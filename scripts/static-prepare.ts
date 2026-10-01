import { access, constants, copyFile, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DOCS_LOCALES } from '../shared/docs-locales';

async function requirePath(path: string, label: string): Promise<void> {
  try {
    await access(path, constants.F_OK);
  } catch {
    throw new Error(`${label} is missing: ${path}`);
  }
}

export async function prepareDocsStaticAssets(
  repoRoot: string,
  browserRoot: string,
  locales: readonly { code: string; subPath: string; published: boolean }[] = DOCS_LOCALES,
): Promise<void> {
  await requirePath(browserRoot, 'Angular browser output');
  const published = locales.filter((locale) => locale.published);
  for (const locale of published) {
    const source404 = join(repoRoot, 'projects/docs/public', locale.subPath, '404.html');
    const target404 = join(browserRoot, locale.subPath, '404.html');
    await requirePath(source404, `${locale.code} 404 source`);
    await requirePath(target404, `${locale.code} 404 output`);
    await copyFile(source404, target404);
    // Angular copies public assets into each locale output; remove duplicated locale directories.
    for (const nested of locales.filter((locale) => locale.subPath)) {
      if (locale.subPath || !nested.published)
        await rm(join(browserRoot, locale.subPath, nested.subPath), {
          recursive: true,
          force: true,
        });
    }
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
  prepareDocsStaticAssets(repoRoot, join(repoRoot, 'dist', 'docs', 'browser')).catch(
    (error: unknown) => {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    },
  );
}
