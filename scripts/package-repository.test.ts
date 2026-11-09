import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
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

const packagePins = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
  .devDependencies as Record<string, string>;
const ios27Ref = `ios27-v${packagePins['@rdlabo/ionic-theme-ios27']}`;

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
    ['workers-hono-kit', 'hono-kit'],
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
  assert.ok(
    requests
      .filter((url) => url.includes('/rdlabo-dev/workers-hono-kit/'))
      .every((url) => /\/packages\/(timezone|mysql|hono-kit)\//.test(url)),
    `unexpected Workers package request: ${requests.join(', ')}`,
  );
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

test('resolves README screenshot paths against the pinned package release', async () => {
  const project = {
    repositoryUrl: 'https://github.com/webview-native-ui/ionic-theme-ios27',
    packageName: '@rdlabo/ionic-theme-ios27',
    releaseTagPrefix: 'ios27-v',
  };
  const markdown = [
    '<img src="./screenshots/ios27-settings.png" />',
    '[![Comparison](./screenshots/native-ui-shell-drag/comparison.png)](./screenshots/native-ui-shell-drag/comparison.png)',
  ].join('\n');
  const base = `https://raw.githubusercontent.com/webview-native-ui/ionic-theme-ios27/${ios27Ref}/screenshots/`;

  assert.equal(
    await pinPackageSourceLinks(project, markdown),
    [
      `<img src="${base}ios27-settings.png" />`,
      `[![Comparison](${base}native-ui-shell-drag/comparison.png)](${base}native-ui-shell-drag/comparison.png)`,
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

test('supports prefixed release tags for renamed theme packages', async () => {
  const project = {
    packageName: '@rdlabo/ionic-theme-ios27',
    repositoryUrl: 'https://github.com/webview-native-ui/ionic-theme-ios27',
    releaseTagPrefix: 'ios27-v',
  };
  assert.equal(await resolveEnglishSourceRef(project), ios27Ref);
  assert.equal(
    await pinPackageSourceLinks(
      project,
      '[source](https://github.com/webview-native-ui/ionic-theme-ios27/blob/main/src/index.ts)',
    ),
    `[source](https://github.com/webview-native-ui/ionic-theme-ios27/blob/${ios27Ref}/src/index.ts)`,
  );
});

test('canonicalizes renamed iOS 26 source and image links without losing its release', async () => {
  const project = {
    packageName: '@rdlabo/ionic-theme-ios26',
    repositoryUrl: 'https://github.com/webview-native-ui/ionic-theme-ios27',
    releaseTagPrefix: 'ios26-v',
  };
  assert.equal(
    await pinPackageSourceLinks(
      project,
      '[source](https://github.com/rdlabo-dev/ionic-theme-ios26/blob/main/src/index.ts) ![image](https://raw.githubusercontent.com/rdlabo-dev/ionic-theme-ios26/ios26-v9.2.0/screenshots/ios26.png)',
    ),
    '[source](https://github.com/webview-native-ui/ionic-theme-ios27/blob/ios26-v9.4.2/src/index.ts) ![image](https://raw.githubusercontent.com/webview-native-ui/ionic-theme-ios27/ios26-v9.4.2/screenshots/ios26.png)',
  );
  assert.equal(
    await pinPackageSourceLinks(
      { ...project, packageName: '@rdlabo/ionic-theme-ios27', releaseTagPrefix: 'ios27-v' },
      '[iOS 26](https://github.com/rdlabo-dev/ionic-theme-ios26/blob/ios26-v9.4.2/src/index.ts)',
    ),
    '[iOS 26](https://github.com/webview-native-ui/ionic-theme-ios27/blob/ios26-v9.4.2/src/index.ts)',
  );
});

test('resolves independently released packages at repository roots without changing iOS 26', async (t) => {
  t.mock.method(globalThis, 'fetch', async (input: string) => {
    if (String(input).endsWith('/docs/readme.md')) return new Response('', { status: 404 });
    return new Response('# Guide');
  });
  for (const [name, directory, ref] of [
    ['ionic-theme-ios27', '', `v${packagePins['@rdlabo/ionic-theme-ios27']}`],
    ['capacitor-native-ui', '', `v${packagePins['@rdlabo/capacitor-native-ui']}`],
    ['ionic-theme-ios26', '', 'ios26-v9.4.2'],
  ]) {
    const project = {
      repositoryUrl: `https://github.com/webview-native-ui/${name === 'capacitor-native-ui' ? 'capacitor-plugin' : 'ionic-theme-ios27'}`,
      packageName: `@rdlabo/${name}`,
      sourceDirectory: name,
      releaseTagPrefix: name === 'ionic-theme-ios26' ? 'ios26-v' : 'v',
    };
    const guide = await fetchEnglishProjectMarkdown(project, 'setup.md');
    assert.equal(guide.repositoryPath, `${directory}docs/setup.md`);
    assert.equal(guide.repositoryRef, ref);
    const readme = await fetchEnglishProjectReadme(project);
    assert.equal(readme?.repositoryPath, `${directory}README.md`);
  }
});

test('repository splits preserve reviewed historical guides and their versioned assets', async (t) => {
  const requests: string[] = [];
  t.mock.method(globalThis, 'fetch', async (input: string) => {
    requests.push(String(input));
    if (String(input).endsWith('/docs/readme.md')) return new Response('', { status: 404 });
    return new Response('<img src="./screenshots/example.png" />');
  });
  const project = {
    repositoryUrl: 'https://github.com/webview-native-ui/capacitor-plugin',
    englishDocsRepositoryUrl: 'https://github.com/webview-native-ui/ionic-theme-ios27',
    englishDocsRef: '503a6fa7bfe77f0dbe556367948de95a8169b2f7',
    packageName: '@rdlabo/capacitor-native-ui',
    sourceDirectory: 'capacitor-native-ui',
    releaseTagPrefix: 'ios27-v',
  };
  const guide = await fetchEnglishProjectMarkdown(project, 'setup.md');
  const readme = await fetchEnglishProjectReadme(project);
  assert.equal(guide.repositoryUrl, project.englishDocsRepositoryUrl);
  assert.equal(guide.repositoryRef, project.englishDocsRef);
  assert.equal(readme?.repositoryPath, 'packages/capacitor-native-ui/README.md');
  assert.ok(
    requests.every((url) =>
      url.startsWith(
        `https://raw.githubusercontent.com/webview-native-ui/ionic-theme-ios27/${project.englishDocsRef}/packages/capacitor-native-ui/`,
      ),
    ),
  );
  assert.match(
    guide.content,
    new RegExp(
      `/ionic-theme-ios27/ios27-v${packagePins['@rdlabo/capacitor-native-ui']}/screenshots/example\\.png`,
    ),
  );
  requests.length = 0;
  await fetchEnglishProjectMarkdown(
    { ...project, englishDocsRepositoryUrl: undefined },
    'setup.md',
  );
  assert.equal(
    requests[0],
    `https://raw.githubusercontent.com/webview-native-ui/capacitor-plugin/${project.englishDocsRef}/docs/setup.md`,
  );
});

test('keeps Native UI extension examples at their historical release and links to current MD3 docs', async () => {
  const project = {
    repositoryUrl: 'https://github.com/webview-native-ui/capacitor-plugin',
    packageName: '@rdlabo/capacitor-native-ui',
  };
  const examples = [
    'demo/ios/App/App/NativeMiniPlayer.swift',
    'demo/ios/App/App/NativeUICounter.swift',
    'demo/src/native-ui/counter.ts',
    'demo/src/native-ui/mini-player.ts',
  ];
  for (const path of examples) {
    assert.equal(
      await pinPackageSourceLinks(
        project,
        `https://github.com/webview-native-ui/ionic-theme-ios27/blob/main/${path}`,
      ),
      `https://github.com/webview-native-ui/ionic-theme-ios27/blob/ios27-v2.1.0/${path}`,
    );
  }
  assert.equal(
    await pinPackageSourceLinks(
      project,
      'https://github.com/webview-native-ui/ionic-theme-md3/blob/main/docs/dynamic-colors.md',
    ),
    '/ionic-theme-md3/docs/dynamic-colors',
  );
});

test('links the MD3 dynamic-color guide back to the portal Native UI guide', async () => {
  assert.equal(
    await pinPackageSourceLinks(
      {
        repositoryUrl: 'https://github.com/webview-native-ui/ionic-theme-md3',
        packageName: '@rdlabo/ionic-theme-md3',
      },
      'https://github.com/webview-native-ui/capacitor-plugin/blob/main/docs/dynamic-colors.md',
    ),
    '/capacitor-native-ui/docs/dynamic-colors',
  );
});

test('pins bare README screenshot paths as well as dot-relative paths', async () => {
  const project = {
    repositoryUrl: 'https://github.com/webview-native-ui/ionic-theme-md3',
    packageName: '@rdlabo/ionic-theme-md3',
  };
  const url = `https://raw.githubusercontent.com/webview-native-ui/ionic-theme-md3/v${packagePins['@rdlabo/ionic-theme-md3']}/screenshots/md3.png`;
  for (const path of ['screenshots/md3.png', './screenshots/md3.png']) {
    assert.equal(await pinPackageSourceLinks(project, `![Theme](${path})`), `![Theme](${url})`);
    assert.equal(
      await pinPackageSourceLinks(project, `<img src="${path}" />`),
      `<img src="${url}" />`,
    );
  }
});

test('keeps MD3 measurement reports in the versioned package repository', async () => {
  assert.equal(
    await pinPackageSourceLinks(
      {
        repositoryUrl: 'https://github.com/webview-native-ui/ionic-theme-md3',
        packageName: '@rdlabo/ionic-theme-md3',
      },
      '[Report](validation/android17-tablet-2026-11-07.md#results)',
    ),
    `[Report](https://github.com/webview-native-ui/ionic-theme-md3/blob/v${packagePins['@rdlabo/ionic-theme-md3']}/docs/validation/android17-tablet-2026-11-07.md#results)`,
  );
});

test('pins reviewed screenshot assets independently of package code links', async () => {
  const ref = 'c70beb9d1e5b39de696b2b2c47a3d9bc5ffcdfbe';
  const project = {
    repositoryUrl: 'https://github.com/webview-native-ui/ionic-theme-ios27',
    packageName: '@rdlabo/ionic-theme-ios27',
    englishDocsAssetsRef: ref,
  };
  const raw = 'https://raw.githubusercontent.com/webview-native-ui/ionic-theme-ios27';
  assert.equal(
    await pinPackageSourceLinks(
      project,
      `![Theme](./screenshots/ios27-settings.png) ![Dark](${raw}/main/screenshots/ios27-settings-dark.png)`,
    ),
    `![Theme](${raw}/${ref}/screenshots/ios27-settings.png) ![Dark](${raw}/${ref}/screenshots/ios27-settings-dark.png)`,
  );
  assert.equal(
    await pinPackageSourceLinks(project, `${project.repositoryUrl}/blob/main/src/index.ts`),
    `${project.repositoryUrl}/blob/v${packagePins[project.packageName]}/src/index.ts`,
  );
  await assert.rejects(
    pinPackageSourceLinks(
      { ...project, englishDocsAssetsRef: 'main' },
      '![Theme](./screenshots/ios27-settings.png)',
    ),
    /must be immutable/,
  );
});
