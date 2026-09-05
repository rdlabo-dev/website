import { access, readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { rewritePackageDocLinks } from './package-markdown';

export interface RepositoryCoordinates {
  owner: string;
  repo: string;
}

export const CANONICAL_DOCS_PORTAL_REPOSITORY_URL = 'https://github.com/rdlabo-dev/website';
export const DOCS_PORTAL_REPOSITORY_URL =
  process.env['RDLABO_DOCS_REPOSITORY_URL'] ?? CANONICAL_DOCS_PORTAL_REPOSITORY_URL;

function localPortalRef(): string {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  } catch {
    return 'main';
  }
}

export const DOCS_PORTAL_REF = process.env['RDLABO_DOCS_REF'] ?? localPortalRef();

const portalDocsRoot = join(process.cwd(), 'projects/docs/src');
const pinnedVersionCache = new Map<string, string | undefined>();

async function pinnedVersionFor(packageName: string): Promise<string | undefined> {
  if (pinnedVersionCache.has(packageName)) return pinnedVersionCache.get(packageName);
  const packageJson = JSON.parse(await readFile(join(process.cwd(), 'package.json'), 'utf8')) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  const version =
    packageJson.dependencies?.[packageName] ?? packageJson.devDependencies?.[packageName];
  pinnedVersionCache.set(packageName, version);
  return version;
}

export async function resolveEnglishSourceRef(project: {
  englishDocsRef?: string;
  packageName: string;
}): Promise<string> {
  if (project.englishDocsRef) {
    if (!/^(?:[0-9a-f]{40}|v\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)$/.test(project.englishDocsRef)) {
      throw new Error(`English docs ref must be immutable: ${project.englishDocsRef}`);
    }
    return project.englishDocsRef;
  }
  const version = await pinnedVersionFor(project.packageName);
  return version ? `v${version}` : 'main';
}

export async function pinPackageSourceLinks(
  project: { repositoryUrl: string; packageName: string },
  content: string,
): Promise<string> {
  const version = await pinnedVersionFor(project.packageName);
  if (!version) return content;

  const { owner, repo } = parseRepositoryUrl(project.repositoryUrl);
  const escapedOwner = owner.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapedRepo = repo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return content
    .replace(
      /\(\.\.\/\.\.\/(src|tests)\//g,
      `(https://github.com/${owner}/${repo}/blob/v${version}/$1/`,
    )
    .replace(
      new RegExp(
        `(https://github\\.com/${escapedOwner}/${escapedRepo}/(?:blob|tree)/)[A-Za-z0-9._-]+/`,
        'g',
      ),
      `$1v${version}/`,
    )
    .replace(
      new RegExp(
        `(https://raw\\.githubusercontent\\.com/${escapedOwner}/${escapedRepo}/)[A-Za-z0-9._-]+/`,
        'g',
      ),
      `$1v${version}/`,
    );
}

async function portalEnglishTrackedLocally(
  sourceDirectory: string,
  file: string,
): Promise<boolean> {
  try {
    await access(join(portalDocsRoot, sourceDirectory, 'docs', file));
    return true;
  } catch {
    return false;
  }
}

function portalRepositoryPath(sourceDirectory: string, file: string): string {
  return `projects/docs/src/${sourceDirectory}/docs/${file}`;
}

function legacyPortalRepositoryPath(sourceDirectory: string, file: string): string {
  return `src/${sourceDirectory}/docs/${file}`;
}

export interface FetchedEnglishMarkdown {
  content: string;
  repositoryPath: string;
  repositoryRef: string;
  repositoryUrl: string;
}

export function canonicalizePortalSource(
  source: FetchedEnglishMarkdown,
  sourceDirectory?: string,
  file?: string,
): FetchedEnglishMarkdown {
  const repositoryPath =
    sourceDirectory && file
      ? portalRepositoryPath(sourceDirectory, file)
      : source.repositoryPath.replace(/^src\//, 'projects/docs/src/');
  return {
    ...source,
    repositoryPath,
    repositoryUrl: CANONICAL_DOCS_PORTAL_REPOSITORY_URL,
    repositoryRef: 'main',
  };
}

export function parseRepositoryUrl(repositoryUrl: string): RepositoryCoordinates {
  const match = repositoryUrl.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/?$/);
  if (!match) {
    throw new Error(`Unsupported repository URL: ${repositoryUrl}`);
  }
  return { owner: match[1], repo: match[2] };
}

export function repositoryRawUrl(repositoryUrl: string, ref: string, path: string): string {
  const { owner, repo } = parseRepositoryUrl(repositoryUrl);
  return `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${path}`;
}

export function repositorySourceLabel(repositoryUrl: string, ref: string, path: string): string {
  const { owner, repo } = parseRepositoryUrl(repositoryUrl);
  return `${owner}/${repo}@${ref}/${path}`;
}

export async function fetchRepositoryFile(
  repositoryUrl: string,
  ref: string,
  path: string,
  cache = new Map<string, string>(),
): Promise<string | undefined> {
  const key = `${repositoryUrl}@${ref}:${path}`;
  if (cache.has(key)) {
    return cache.get(key);
  }

  const response = await fetch(repositoryRawUrl(repositoryUrl, ref, path));
  if (response.status === 404) {
    return undefined;
  }
  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${repositorySourceLabel(repositoryUrl, ref, path)}: HTTP ${response.status}`,
    );
  }

  const content = await response.text();
  cache.set(key, content);
  return content;
}

async function fetchFirstRepositoryPath(
  repositoryUrl: string,
  ref: string,
  paths: readonly string[],
  cache: Map<string, string>,
): Promise<FetchedEnglishMarkdown | undefined> {
  for (const repositoryPath of paths) {
    const content = await fetchRepositoryFile(repositoryUrl, ref, repositoryPath, cache);
    if (content !== undefined) {
      return { content, repositoryPath, repositoryRef: ref, repositoryUrl };
    }
  }
  return undefined;
}

function packageEnglishPaths(
  project: {
    repositoryUrl: string;
    sourceDirectory: string;
  },
  file: string,
): string[] {
  const { sourceDirectory } = project;
  const scopedDirectory = packageScopedDirectory(project);
  if (scopedDirectory) {
    return [`${scopedDirectory}/docs/${file}`];
  }
  return [`docs/${file}`, `${sourceDirectory}/docs/${file}`];
}

function packageScopedDirectory(project: {
  repositoryUrl: string;
  sourceDirectory: string;
}): string | undefined {
  const { repositoryUrl, sourceDirectory } = project;

  if (repositoryUrl === 'https://github.com/rdlabo-dev/workers-hono-kit') {
    if (sourceDirectory === 'workers-timezone') return 'packages/timezone';
    if (sourceDirectory === 'workers-mysql') return 'packages/mysql';
    return undefined;
  }

  if (repositoryUrl === 'https://github.com/capacitor-community/stripe') {
    if (sourceDirectory === 'stripe') return 'packages/payment';
    if (sourceDirectory === 'stripe-identity') return 'packages/identity';
    if (sourceDirectory === 'stripe-terminal') return 'packages/terminal';
    return undefined;
  }

  if (repositoryUrl === 'https://github.com/rdlabo-dev/ionic-angular-library') {
    if (sourceDirectory === 'ionic-angular-kit') return 'projects/kit';
    if (sourceDirectory === 'ionic-angular-photo-editor') return 'projects/photo-editor';
    if (sourceDirectory === 'ionic-angular-scroll-header') return 'projects/scroll-header';
    if (sourceDirectory === 'ngx-cdk-scroll-strategies') return 'projects/scroll-strategies';
    return undefined;
  }

  return undefined;
}

function repositoryReadmePaths(project: {
  repositoryUrl: string;
  sourceDirectory: string;
}): string[] {
  const scopedDirectory = packageScopedDirectory(project);
  return scopedDirectory ? [`${scopedDirectory}/README.md`, 'README.md'] : ['README.md'];
}

export async function fetchEnglishProjectMarkdown(
  project: {
    repositoryUrl: string;
    englishDocsRef?: string;
    packageName: string;
    sourceDirectory: string;
  },
  file: string,
  cache = new Map<string, string>(),
): Promise<FetchedEnglishMarkdown> {
  const ref = await resolveEnglishSourceRef(project);
  const shouldFallbackToRepositoryReadme = file === 'readme.md' || file === 'getting-started.md';
  const fromPackage = await fetchFirstRepositoryPath(
    project.repositoryUrl,
    ref,
    packageEnglishPaths(project, file),
    cache,
  );
  if (fromPackage) {
    return {
      ...fromPackage,
      content: await pinPackageSourceLinks(project, fromPackage.content),
    };
  }

  if (shouldFallbackToRepositoryReadme) {
    const fromReadme = await fetchFirstRepositoryPath(
      project.repositoryUrl,
      ref,
      repositoryReadmePaths(project),
      cache,
    );
    if (fromReadme) {
      // `site-contract.test.ts` expects guide links to be normalized to `/docs/...` format.
      // Upstream READMEs often use `./docs/*.md`, so rewrite them here consistently.
      let rewrittenContent =
        file === 'readme.md'
          ? rewritePackageDocLinks(fromReadme.content, new Map())
          : fromReadme.content;

      // Keep the README guide link pinned to the installed documentation release.
      if (file === 'readme.md' && project.packageName === '@rdlabo/ionic-theme-ios26') {
        const version = await pinnedVersionFor(project.packageName);
        if (version) {
          rewrittenContent = rewrittenContent.replace(
            /More info:\s+\.\.?\/docs\/using-ion-item-group\.md/g,
            `More info: https://github.com/rdlabo-dev/ionic-theme-ios26/blob/v${version}/docs/using-ion-item-group.md`,
          );
        }
      }
      return {
        ...fromReadme,
        content: await pinPackageSourceLinks(project, rewrittenContent),
      };
    }
  }

  if (await portalEnglishTrackedLocally(project.sourceDirectory, file)) {
    const fromPortal = await fetchFirstRepositoryPath(
      DOCS_PORTAL_REPOSITORY_URL,
      DOCS_PORTAL_REF,
      [
        portalRepositoryPath(project.sourceDirectory, file),
        legacyPortalRepositoryPath(project.sourceDirectory, file),
      ],
      cache,
    );
    if (fromPortal) {
      return canonicalizePortalSource(fromPortal, project.sourceDirectory, file);
    }
  }

  throw new Error(
    `${project.packageName} is missing English ${file} at ${project.repositoryUrl}@${ref}`,
  );
}

export async function fetchEnglishProjectReadme(
  project: {
    repositoryUrl: string;
    englishDocsRef?: string;
    packageName: string;
    sourceDirectory: string;
  },
  cache = new Map<string, string>(),
): Promise<FetchedEnglishMarkdown | undefined> {
  const ref = await resolveEnglishSourceRef(project);
  return (
    (await fetchFirstRepositoryPath(
      project.repositoryUrl,
      ref,
      packageEnglishPaths(project, 'readme.md'),
      cache,
    )) ??
    ((await portalEnglishTrackedLocally(project.sourceDirectory, 'readme.md'))
      ? await fetchFirstRepositoryPath(
          DOCS_PORTAL_REPOSITORY_URL,
          DOCS_PORTAL_REF,
          [
            portalRepositoryPath(project.sourceDirectory, 'readme.md'),
            legacyPortalRepositoryPath(project.sourceDirectory, 'readme.md'),
          ],
          cache,
        ).then((result) =>
          result
            ? canonicalizePortalSource(result, project.sourceDirectory, 'readme.md')
            : undefined,
        )
      : undefined) ??
    (await fetchFirstRepositoryPath(
      project.repositoryUrl,
      ref,
      repositoryReadmePaths(project),
      cache,
    ))
  );
}
