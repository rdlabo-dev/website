import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import test from 'node:test';
import {
  CANONICAL_DOCS_PORTAL_REPOSITORY_URL,
  DOCS_PORTAL_REPOSITORY_URL,
  DOCS_PORTAL_REF,
  canonicalizePortalSource,
  fetchEnglishProjectMarkdown,
  fetchEnglishProjectReadme,
  pinPackageSourceLinks,
  parseRepositoryUrl,
  repositoryRawUrl,
  resolveEnglishSourceRef,
  repositorySourceLabel,
} from './package-repository';

test('pins English docs to the installed package tag unless an immutable ref is explicit', async () => {
  assert.equal(
    await resolveEnglishSourceRef({ packageName: '@rdlabo/capacitor-docgen' }),
    'v0.4.1',
  );
  assert.equal(
    await resolveEnglishSourceRef({
      packageName: '@rdlabo/capacitor-docgen',
      englishDocsRef: '0123456789abcdef0123456789abcdef01234567',
    }),
    '0123456789abcdef0123456789abcdef01234567',
  );
  await assert.rejects(
    () =>
      resolveEnglishSourceRef({
        packageName: '@rdlabo/capacitor-docgen',
        englishDocsRef: 'main',
      }),
    /must be immutable/,
  );
});

test('resolves Workers workspace guides and README within the selected package', async (t) => {
  const requests: string[] = [];
  t.mock.method(globalThis, 'fetch', async (input: string) => {
    requests.push(String(input));
    if (String(input).endsWith('/docs/readme.md')) return new Response('', { status: 404 });
    return new Response('# Package documentation');
  });
  for (const [name, directory] of [
    ['workers-timezone', 'timezone'],
    ['workers-mysql', 'mysql'],
  ]) {
    const project = {
      repositoryUrl: 'https://github.com/rdlabo-dev/workers-hono-kit',
      englishDocsRef: '0123456789abcdef0123456789abcdef01234567',
      packageName: `@rdlabo/${name}`,
      sourceDirectory: name,
    };
    const guide = await fetchEnglishProjectMarkdown(project, 'api.md');
    assert.equal(guide.repositoryPath, `packages/${directory}/docs/api.md`);
    const readme = await fetchEnglishProjectReadme(project);
    assert.equal(readme?.repositoryPath, `packages/${directory}/README.md`);
  }
  assert.ok(requests.every((url) => /\/packages\/(timezone|mysql)\//.test(url)));
});

test('parses GitHub repository URLs', () => {
  assert.deepEqual(parseRepositoryUrl('https://github.com/capacitor-community/admob'), {
    owner: 'capacitor-community',
    repo: 'admob',
  });
  assert.deepEqual(parseRepositoryUrl('https://github.com/rdlabo-dev/capacitor-codescanner/'), {
    owner: 'rdlabo-dev',
    repo: 'capacitor-codescanner',
  });
});

test('pins only source links that belong to the package repository', async () => {
  const project = {
    repositoryUrl: 'https://github.com/rdlabo-dev/capacitor-docgen',
    packageName: '@rdlabo/capacitor-docgen',
  };
  const markdown = [
    '[fork](https://github.com/rdlabo-dev/capacitor-docgen/tree/main/src) [upstream](https://github.com/ionic-team/capacitor-docgen/tree/v0.3.1/src)',
    '[blob](https://github.com/rdlabo-dev/capacitor-docgen/blob/next/docs/api.md)',
    '![raw](https://raw.githubusercontent.com/rdlabo-dev/capacitor-docgen/main/image.png)',
    '[pinned](https://github.com/rdlabo-dev/capacitor-docgen/blob/v0.4.1/README.md)',
  ].join('\n');

  assert.equal(
    await pinPackageSourceLinks(project, markdown),
    [
      '[fork](https://github.com/rdlabo-dev/capacitor-docgen/tree/v0.4.1/src) [upstream](https://github.com/ionic-team/capacitor-docgen/tree/v0.3.1/src)',
      '[blob](https://github.com/rdlabo-dev/capacitor-docgen/blob/v0.4.1/docs/api.md)',
      '![raw](https://raw.githubusercontent.com/rdlabo-dev/capacitor-docgen/v0.4.1/image.png)',
      '[pinned](https://github.com/rdlabo-dev/capacitor-docgen/blob/v0.4.1/README.md)',
    ].join('\n'),
  );
});

test('builds raw and source labels for repository docs', () => {
  const repositoryUrl = 'https://github.com/capacitor-community/admob';
  assert.equal(
    repositoryRawUrl(repositoryUrl, 'main', 'docs/configuration.md'),
    'https://raw.githubusercontent.com/capacitor-community/admob/main/docs/configuration.md',
  );
  assert.equal(
    repositorySourceLabel(repositoryUrl, 'main', 'README.md'),
    'capacitor-community/admob@main/README.md',
  );
  assert.equal(CANONICAL_DOCS_PORTAL_REPOSITORY_URL, 'https://github.com/rdlabo-dev/website');
  assert.equal(
    DOCS_PORTAL_REPOSITORY_URL,
    process.env['RDLABO_DOCS_REPOSITORY_URL'] ?? CANONICAL_DOCS_PORTAL_REPOSITORY_URL,
  );
  assert.equal(
    DOCS_PORTAL_REF,
    process.env['RDLABO_DOCS_REF'] ??
      execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  );
  assert.ok(DOCS_PORTAL_REF);
});

test('keeps fork-fetched portal pages editable in the canonical repository', () => {
  assert.deepEqual(
    canonicalizePortalSource({
      content: '# API',
      repositoryPath: 'src/example/docs/api.md',
      repositoryRef: 'fork-head-sha',
      repositoryUrl: 'https://github.com/contributor/docs',
    }),
    {
      content: '# API',
      repositoryPath: 'projects/docs/src/example/docs/api.md',
      repositoryRef: 'main',
      repositoryUrl: 'https://github.com/rdlabo-dev/website',
    },
  );
});
