import assert from 'node:assert/strict';
import { access, constants, lstat, readFile, readdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import ts from 'typescript';
import { projectDefinitions } from './project-manifest';
import {
  extractPackageReadme,
  extractPackageReadmeParts,
  normalizePackageMarkdown,
  stripLeadingH1,
  stripRdlaboDocsOmit,
} from './package-markdown';
import { fetchEnglishProjectMarkdown } from './package-repository';

const require = createRequire(import.meta.url);

async function installedEslintRuleNames(): Promise<string[]> {
  const packageJsonPath = require.resolve('@rdlabo/eslint-plugin-rules/package.json');
  try {
    const plugin = require('@rdlabo/eslint-plugin-rules') as { rules?: Record<string, unknown> };
    return Object.keys(plugin.rules ?? {}).sort();
  } catch {
    // Peer deps may be absent in this docs workspace; parse the published entry safely.
    const indexSource = await readFile(join(dirname(packageJsonPath), 'dist', 'index.js'), 'utf8');
    const rulesBlock = indexSource.match(/\brules:\s*\{([\s\S]*?)\n\s*\},?\s*\n\s*\};?\s*$/);
    assert.ok(rulesBlock, 'installed @rdlabo/eslint-plugin-rules must export a rules object');
    const names = [...rulesBlock[1].matchAll(/['"]([^'"]+)['"]\s*:/g)].map((match) => match[1]);
    assert.ok(names.length > 0, 'installed plugin rules object must list rule names');
    return [...names].sort();
  }
}

function yamlTitle(markdown: string): string {
  const frontMatter = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  assert.ok(frontMatter, 'rule markdown must include YAML front matter');
  const title = frontMatter[1].match(/^title:\s*(.+)\s*$/m)?.[1]?.trim();
  assert.ok(title, 'rule markdown must declare a YAML title');
  return title;
}

function fencedCodeBlocks(markdown: string): { language: string; body: string }[] {
  const blocks: { language: string; body: string }[] = [];
  const pattern = /^```([^\n`]*)\r?\n([\s\S]*?)^```/gm;
  for (const match of markdown.matchAll(pattern)) {
    blocks.push({ language: match[1], body: match[2] });
  }
  return blocks;
}

async function englishGuideSource(
  project: {
    repositoryUrl: string;
    englishDocsRef?: string;
    packageName: string;
    sourceDirectory: string;
  },
  file: string,
): Promise<string> {
  const { content } = await fetchEnglishProjectMarkdown(project, file);
  if (file === 'readme.md' || file === 'getting-started.md') {
    return normalizePackageMarkdown(extractPackageReadme(content));
  }
  return normalizePackageMarkdown(stripLeadingH1(stripRdlaboDocsOmit(content)));
}

test('pins every documentation source to the installed package version', async () => {
  const packageJson = JSON.parse(
    await readFile(new URL('../package.json', import.meta.url), 'utf8'),
  ) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };

  for (const project of projectDefinitions) {
    if (project.hostedUrl) continue;
    const declaredVersion =
      packageJson.dependencies?.[project.packageName] ??
      packageJson.devDependencies?.[project.packageName];
    assert.ok(declaredVersion, `${project.packageName} must be a package dependency`);
    assert.match(declaredVersion, /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/);

    const installedPackage = JSON.parse(
      await readFile(
        new URL(`../node_modules/${project.packageName}/package.json`, import.meta.url),
        'utf8',
      ),
    ) as { version: string };
    assert.equal(installedPackage.version, declaredVersion);
  }
});

test('serves locale-specific static 404 pages', async () => {
  const [english, japanese] = await Promise.all([
    readFile(new URL('../projects/docs/public/404.html', import.meta.url), 'utf8'),
    readFile(new URL('../projects/docs/public/ja/404.html', import.meta.url), 'utf8'),
  ]);
  assert.match(english, /<html lang="en">/);
  assert.match(japanese, /<html lang="ja">/);
  assert.match(japanese, /href="\/ja"/);
  assert.doesNotMatch(japanese, /href="\/ja\/"/);
});

test('rdlabo brand logo title is English-only', async () => {
  const svg = await readFile(
    new URL('../projects/docs/public/assets/brand/rdlabo-logo.svg', import.meta.url),
    'utf8',
  );
  assert.match(svg, /<title[^>]*>rdlabo\.dev logo<\/title>/);
  assert.doesNotMatch(svg, /リレーションデザイン研究所/);
});

test('uses the rdlabo-dev GitHub owner throughout site sources', async () => {
  const legacyOwner = ['rdlabo', 'team'].join('-');
  const legacyDocsRepository = ['ionic-jp', 'capacitor-plugins-docs'].join('/');
  const docsRepositoryUrl = 'https://github.com/rdlabo-dev/website';
  const roots = [
    new URL('../README.md', import.meta.url),
    new URL('../scripts/', import.meta.url),
    new URL('../projects/docs/src/', import.meta.url),
  ];
  const files = [roots[0]];
  for (const root of roots.slice(1)) {
    const entries = await readdir(root, { recursive: true });
    files.push(
      ...entries
        .filter((entry) => /\.(?:html|json|md|ts|xlf)$/.test(entry))
        .map((entry) => new URL(entry, root)),
    );
  }

  for (const file of files) {
    const source = await readFile(file, 'utf8');
    assert.ok(!source.includes(legacyOwner), `${file.pathname} must not reference ${legacyOwner}`);
    if (!/\.generated\.ts$/.test(file.pathname)) {
      assert.ok(
        !source.includes(legacyDocsRepository),
        `${file.pathname} must not reference ${legacyDocsRepository}`,
      );
    }
  }

  const generateDocs = await readFile(new URL('./generate-docs.ts', import.meta.url), 'utf8');
  assert.match(
    generateDocs,
    new RegExp(`docsRepositoryUrl\\s*=\\s*'${docsRepositoryUrl.replaceAll('.', '\\.')}'`),
  );
  assert.match(generateDocs, /\$\{docsRepositoryUrl\}\/edit\/main\//);

  const readme = await readFile(new URL('../README.md', import.meta.url), 'utf8');
  assert.match(readme, /`rdlabo-dev\/website`/);
  assert.doesNotMatch(readme, /later rollout/);
});

test('favicon brand assets are wired for rdlabo.dev', async () => {
  const [indexHtml, appleTouchIcon, faviconIco] = await Promise.all([
    readFile(new URL('../projects/docs/src/index.html', import.meta.url), 'utf8'),
    readFile(new URL('../projects/docs/public/assets/brand/apple-touch-icon.png', import.meta.url)),
    readFile(new URL('../projects/docs/public/favicon.ico', import.meta.url)),
  ]);

  assert.match(
    indexHtml,
    /<link rel="icon" type="image\/svg\+xml" href="\/assets\/brand\/rdlabo-logo\.svg"\s*\/>/,
  );
  assert.match(
    indexHtml,
    /<link rel="apple-touch-icon" href="\/assets\/brand\/apple-touch-icon\.png"\s*\/>/,
  );
  assert.deepEqual(
    appleTouchIcon.subarray(0, 8),
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  );
  assert.equal(appleTouchIcon.toString('ascii', 12, 16), 'IHDR');
  assert.equal(appleTouchIcon.readUInt32BE(16), 180);
  assert.equal(appleTouchIcon.readUInt32BE(20), 180);

  assert.deepEqual(
    faviconIco.subarray(0, 8),
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  );
  assert.equal(faviconIco.toString('ascii', 12, 16), 'IHDR');
  assert.equal(faviconIco.readUInt32BE(16), 64);
  assert.equal(faviconIco.readUInt32BE(20), 64);

  await assert.rejects(() =>
    access(
      new URL('../projects/docs/public/assets/icon/favicon.ico', import.meta.url),
      constants.F_OK,
    ),
  );
  await assert.rejects(() =>
    access(
      new URL('../projects/docs/public/assets/icon/favicon.png', import.meta.url),
      constants.F_OK,
    ),
  );
});

test('imports every installed ESLint rule README with matching EN/JA code fences', async () => {
  const eslintProject = projectDefinitions.find((project) => project.id === 'eslint-plugin-rules');
  assert.ok(eslintProject);

  const packageJson = JSON.parse(
    await readFile(new URL('../package.json', import.meta.url), 'utf8'),
  ) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  const declaredVersion =
    packageJson.dependencies?.[eslintProject.packageName] ??
    packageJson.devDependencies?.[eslintProject.packageName];
  assert.ok(declaredVersion, `${eslintProject.packageName} must be a package dependency`);
  assert.match(declaredVersion, /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/);

  const installedPackage = JSON.parse(
    await readFile(
      new URL(`../node_modules/${eslintProject.packageName}/package.json`, import.meta.url),
      'utf8',
    ),
  ) as { version: string };
  assert.equal(installedPackage.version, declaredVersion);

  const pinnedBlobPrefix = `https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v${declaredVersion}/`;
  const floatingMainBlob = 'eslint-plugin-rules/blob/main';

  const manifestRuleNames = eslintProject.pages
    .filter((page) => page.slug.startsWith('rules/'))
    .map((page) => page.slug.slice('rules/'.length))
    .sort();
  const installedRuleNames = await installedEslintRuleNames();

  assert.equal(manifestRuleNames.length, 19);
  assert.deepEqual(manifestRuleNames, installedRuleNames);

  const docsRoot = new URL('../projects/docs/src/eslint-plugin-rules/docs/', import.meta.url);
  const [englishRulesIndex, japaneseRulesIndex] = await Promise.all([
    englishGuideSource(eslintProject, 'rules.md'),
    readFile(new URL('ja/rules.md', docsRoot), 'utf8'),
  ]);

  for (const ruleName of manifestRuleNames) {
    const japanesePath = new URL(`ja/rules/${ruleName}.md`, docsRoot);
    const [english, japanese] = await Promise.all([
      englishGuideSource(eslintProject, `rules/${ruleName}.md`),
      readFile(japanesePath, 'utf8'),
    ]);

    assert.equal(yamlTitle(japanese), ruleName);
    if (/^---\r?\n[\s\S]*?\r?\n---/.test(english)) {
      assert.equal(yamlTitle(english), ruleName);
    }

    const englishBlocks = fencedCodeBlocks(english);
    const japaneseBlocks = fencedCodeBlocks(japanese);
    assert.deepEqual(
      japaneseBlocks,
      englishBlocks,
      `${ruleName} fenced code blocks must match byte-for-byte between EN and JA`,
    );

    for (const [locale, markdown] of [
      ['EN', english],
      ['JA', japanese],
    ] as const) {
      assert.doesNotMatch(
        markdown,
        new RegExp(floatingMainBlob.replaceAll('/', '\\/')),
        `${locale} ${ruleName} must not link to eslint-plugin-rules/blob/main`,
      );
      const githubBlobLinks = [
        ...markdown.matchAll(
          /https:\/\/github\.com\/rdlabo-dev\/eslint-plugin-rules\/blob\/[^\s)\]]+/g,
        ),
      ].map((match) => match[0]);
      if (locale === 'JA') {
        assert.ok(
          githubBlobLinks.length > 0,
          `${locale} ${ruleName} must include GitHub blob implementation/test links`,
        );
      }
      for (const link of githubBlobLinks) {
        assert.ok(
          link.startsWith(pinnedBlobPrefix),
          `${locale} ${ruleName} GitHub blob link must use ${pinnedBlobPrefix}: ${link}`,
        );
      }
    }

    const localRoute = `/eslint-plugin-rules/docs/rules/${ruleName}`;
    assert.match(englishRulesIndex, new RegExp(`rules/${ruleName}(?:\\.md)?`));
    assert.match(japaneseRulesIndex, new RegExp(localRoute.replaceAll('/', '\\/')));
  }
});

test('lists every ionic-angular-library package and imports localized READMEs', async () => {
  const expectedProjects = new Map([
    ['ionic-angular-kit', '@rdlabo/ionic-angular-kit'],
    ['ionic-angular-photo-editor', '@rdlabo/ionic-angular-photo-editor'],
    ['ionic-angular-scroll-header', '@rdlabo/ionic-angular-scroll-header'],
    ['ngx-cdk-scroll-strategies', '@rdlabo/ngx-cdk-scroll-strategies'],
  ]);
  const packageJson = JSON.parse(
    await readFile(new URL('../package.json', import.meta.url), 'utf8'),
  ) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  const packageVersions = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };
  const sourceVersion = packageVersions['@rdlabo/ionic-angular-kit'];
  assert.ok(sourceVersion, '@rdlabo/ionic-angular-kit must be an exact dependency');
  const libraryProjects = projectDefinitions.filter(
    (project) => project.repositoryUrl === 'https://github.com/rdlabo-dev/ionic-angular-library',
  );

  assert.deepEqual(
    new Map(libraryProjects.map((project) => [project.id, project.packageName])),
    expectedProjects,
  );

  const repositoryReadme = await readFile(new URL('../README.md', import.meta.url), 'utf8');
  for (const project of projectDefinitions) {
    const documentedSource = project.hostedUrl
      ? project.repositoryUrl.replace('https://github.com/', '')
      : `projects/docs/src/${project.sourceDirectory}/docs`;
    assert.ok(
      repositoryReadme.includes(`| ${project.name} | \`${documentedSource}\` |`),
      `README Current projects must list ${project.name}`,
    );
  }

  for (const project of libraryProjects) {
    assert.equal(project.category, 'frontend-tools');
    const declaredVersion = packageVersions[project.packageName];
    assert.ok(declaredVersion, `${project.packageName} must be an exact dependency`);
    assert.match(declaredVersion, /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/);

    const installedPackage = JSON.parse(
      await readFile(
        new URL(`../node_modules/${project.packageName}/package.json`, import.meta.url),
        'utf8',
      ),
    ) as { version: string };
    assert.equal(installedPackage.version, declaredVersion);
    assert.equal(declaredVersion, sourceVersion);
  }

  for (const projectId of [
    'ionic-angular-photo-editor',
    'ionic-angular-scroll-header',
    'ngx-cdk-scroll-strategies',
  ]) {
    const project = libraryProjects.find((entry) => entry.id === projectId);
    assert.ok(project);
    const docsRoot = new URL(`../projects/docs/src/${projectId}/docs/`, import.meta.url);
    const pageFiles = project.pages.map((page) => page.file).filter((file) => file !== 'api.md');
    const allEnglish: string[] = [];
    const allJapanese: string[] = [];
    for (const pageFile of pageFiles) {
      const [english, japanese] = await Promise.all([
        englishGuideSource(project, pageFile),
        readFile(new URL(`ja/${pageFile}`, docsRoot), 'utf8'),
      ]);
      allEnglish.push(english);
      allJapanese.push(japanese);
      assert.deepEqual(
        fencedCodeBlocks(japanese),
        fencedCodeBlocks(english),
        `${projectId}/${pageFile} fenced code blocks must match byte-for-byte between EN and JA`,
      );
    }
    for (const markdown of [...allEnglish, ...allJapanese]) {
      assert.doesNotMatch(markdown, /^#{1,6}\s+FQA\s*$/m);
      assert.doesNotMatch(markdown, /ionic-angular-library\/(?:blob|tree)\/main/);
      for (const link of markdown.matchAll(
        /https:\/\/github\.com\/rdlabo-dev\/ionic-angular-library\/(?:blob|tree)\/[^\s)\]]+/g,
      )) {
        assert.ok(
          link[0].includes(`/v${sourceVersion}/`),
          `${projectId} source link must use v${sourceVersion}: ${link[0]}`,
        );
      }
    }
    if (projectId === 'ngx-cdk-scroll-strategies') {
      const combined = [...allEnglish, ...allJapanese].join('\n');
      for (const directory of ['scroll-simple', 'scroll-advanced', 'scroll-reverse']) {
        assert.match(
          combined,
          new RegExp(`/tree/v${sourceVersion}/[^\\s)\\]]+/${directory}(?:[\\s)\\]]|$)`),
        );
        assert.doesNotMatch(
          combined,
          new RegExp(`/blob/v${sourceVersion}/[^\\s)\\]]+/${directory}(?:[\\s)\\]]|$)`),
        );
      }
      for (const fileName of [
        'dynamic-size-virtual-scroll-strategy.ts',
        'dynamic-size-virtual-scroll.service.ts',
      ]) {
        assert.match(combined, new RegExp(`/blob/v${sourceVersion}/[^\\s)\\]]+/${fileName}`));
      }
    }
  }
});

test('lists ionic theme packages and pins localized README imports', async () => {
  const expectedProjects = new Map([
    ['ionic-theme-ios26', { packageName: '@rdlabo/ionic-theme-ios26', version: '9.0.0' }],
    ['ionic-theme-md3', { packageName: '@rdlabo/ionic-theme-md3', version: '9.0.0' }],
  ]);
  const packageJson = JSON.parse(
    await readFile(new URL('../package.json', import.meta.url), 'utf8'),
  ) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  const packageVersions = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  for (const [projectId, expected] of expectedProjects) {
    const project = projectDefinitions.find((entry) => entry.id === projectId);
    assert.ok(project, `${projectId} must be declared in the manifest`);
    assert.equal(project.packageName, expected.packageName);
    assert.equal(project.category, 'frontend-tools');
    assert.equal(project.icon, 'theme');
    assert.equal(project.adapter, 'markdown');

    const declaredVersion = packageVersions[expected.packageName];
    assert.equal(declaredVersion, expected.version);
    const installedPackage = JSON.parse(
      await readFile(
        new URL(`../node_modules/${expected.packageName}/package.json`, import.meta.url),
        'utf8',
      ),
    ) as { version: string };
    assert.equal(installedPackage.version, expected.version);

    const docsRoot = new URL(`../projects/docs/src/${projectId}/docs/`, import.meta.url);
    const pageFiles = project.pages.map((page) => page.file).filter((file) => file !== 'api.md');
    for (const pageFile of pageFiles) {
      const [english, japanese] = await Promise.all([
        englishGuideSource(project, pageFile),
        readFile(new URL(`ja/${pageFile}`, docsRoot), 'utf8'),
      ]);
      assert.deepEqual(
        fencedCodeBlocks(japanese),
        fencedCodeBlocks(english),
        `${projectId}/${pageFile} fenced code blocks must match byte-for-byte between EN and JA`,
      );
      for (const markdown of [english, japanese]) {
        assert.doesNotMatch(markdown, new RegExp(['rdlabo', 'team'].join('-')));
        assert.doesNotMatch(markdown, new RegExp(`${projectId}/(?:blob|tree)/main`));
        if (pageFile === 'readme.md') {
          const portalReadme = await readFile(new URL(pageFile, docsRoot), 'utf8');
          assert.match(
            portalReadme,
            new RegExp(
              `raw\\.githubusercontent\\.com/rdlabo-dev/${projectId}/v${expected.version}/screenshots/`,
            ),
          );
        }
        for (const link of markdown.matchAll(
          new RegExp(`https://github\\.com/rdlabo-dev/${projectId}/(?:blob|tree)/[^\\s)\\]]+`, 'g'),
        )) {
          assert.ok(
            link[0].includes(`/v${expected.version}/`),
            `${projectId} source link must use v${expected.version}: ${link[0]}`,
          );
        }
      }
    }
  }

  const iosProject = projectDefinitions.find((entry) => entry.id === 'ionic-theme-ios26');
  assert.ok(iosProject);
  const usingPage = iosProject.pages.find((entry) => entry.slug === 'using-ion-item-group');
  assert.ok(usingPage);
  assert.equal(usingPage.title.en, 'Using ion-item-group');
  assert.equal(usingPage.title.ja, 'ion-item-groupの使用方法');
  assert.notEqual(usingPage.title.ja, usingPage.title.en);
  assert.match(usingPage.title.ja, /[\u3040-\u30ff\u4e00-\u9fff]/);

  const [iosReadme, _iosReadmeJa, usingDoc, usingDocJa, iosMigration, iosMigrationJa] =
    await Promise.all([
      englishGuideSource(iosProject, 'readme.md'),
      readFile(
        new URL('../projects/docs/src/ionic-theme-ios26/docs/ja/readme.md', import.meta.url),
        'utf8',
      ),
      englishGuideSource(iosProject, 'using-ion-item-group.md'),
      readFile(
        new URL(
          '../projects/docs/src/ionic-theme-ios26/docs/ja/using-ion-item-group.md',
          import.meta.url,
        ),
        'utf8',
      ),
      englishGuideSource(iosProject, 'migration.md'),
      readFile(
        new URL('../projects/docs/src/ionic-theme-ios26/docs/ja/migration.md', import.meta.url),
        'utf8',
      ),
    ]);
  const iosExpected = expectedProjects.get('ionic-theme-ios26');
  assert.ok(iosExpected);
  assert.match(iosReadme, /\]\(\/docs\/using-ion-item-group\)/);
  assert.match(
    iosReadme,
    new RegExp(
      `https://github\\.com/rdlabo-dev/ionic-theme-ios26/blob/v${iosExpected.version}/docs/using-ion-item-group\\.md`,
    ),
  );

  assert.equal(yamlTitle(usingDocJa), 'ion-item-groupの使用方法');
  assert.notEqual(yamlTitle(usingDocJa), usingPage.title.en);
  assert.match(yamlTitle(usingDocJa), /[\u3040-\u30ff\u4e00-\u9fff]/);
  if (/^---\r?\n[\s\S]*?\r?\n---/.test(usingDoc)) {
    assert.equal(yamlTitle(usingDoc), 'Using ion-item-group');
  } else {
    assert.equal(usingPage.title.en, 'Using ion-item-group');
  }
  assert.doesNotMatch(usingDocJa, /^# /m);
  assert.match(usingDoc, /wrap its items in `ion-item-group`/);
  for (const markdown of [iosMigration, iosMigrationJa]) {
    assert.match(markdown, /\.header-item-group/);
    assert.match(markdown, /\.item-group-header/);
  }
});

test('imports the remaining rdlabo utility READMEs from exact public releases', async () => {
  const expectedProjects = new Map([
    ['capacitor-codescanner', ['@rdlabo/capacitor-codescanner', '8.0.3', 'capacitor-plugins']],
    [
      'capacitor-screenshot-event',
      ['@rdlabo/capacitor-screenshot-event', '8.0.0', 'capacitor-plugins'],
    ],
    ['capacitor-printer', ['@rdlabo/capacitor-printer', '8.0.1', 'capacitor-plugins']],
    ['capacitor-brotherprint', ['@rdlabo/capacitor-brotherprint', '8.1.1', 'capacitor-plugins']],
    [
      'ionic-angular-collect-icons',
      ['@rdlabo/ionic-angular-collect-icons', '3.0.0', 'frontend-tools'],
    ],
  ] as const);
  const packageJson = JSON.parse(
    await readFile(new URL('../package.json', import.meta.url), 'utf8'),
  ) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  const packageVersions = { ...packageJson.dependencies, ...packageJson.devDependencies };

  const docgenProject = projectDefinitions.find((entry) => entry.id === 'capacitor-docgen');
  assert.ok(docgenProject, 'capacitor-docgen must be declared in the manifest');
  assert.equal(docgenProject.packageName, '@rdlabo/capacitor-docgen');
  assert.equal(docgenProject.repositoryUrl, 'https://github.com/rdlabo-dev/capacitor-docgen');
  assert.equal(docgenProject.category, 'developer-tools');
  assert.equal(docgenProject.adapter, 'markdown');
  assert.equal(docgenProject.icon, 'docs');
  assert.equal(packageVersions['@rdlabo/capacitor-docgen'], '0.4.1');
  assert.deepEqual(
    docgenProject.pages.map((page) => [page.slug, page.file, page.section.en, page.section.ja]),
    [
      ['getting-started', 'getting-started.md', 'Guide', 'ガイド'],
      ['upstream-differences', 'upstream-differences.md', 'Comparison', '比較'],
      ['api', 'api.md', 'Reference', 'リファレンス'],
    ],
  );

  for (const [projectId, [packageName, version, category]] of expectedProjects) {
    const project = projectDefinitions.find((entry) => entry.id === projectId);
    assert.ok(project, `${projectId} must be declared in the manifest`);
    assert.equal(project.packageName, packageName);
    assert.equal(project.repositoryUrl, `https://github.com/rdlabo-dev/${projectId}`);
    assert.equal(project.category, category);
    assert.equal(project.adapter, 'markdown');
    assert.equal(packageVersions[packageName], version);
    if (projectId.startsWith('capacitor-')) {
      assert.ok(
        !project.pages.some((entry) => entry.file === 'usage.md'),
        `${projectId} must not use a catch-all usage.md; use grouping object pages`,
      );
    }

    const expectedGroupSlugs: Record<string, readonly string[]> = {
      'capacitor-codescanner': ['code-scanner'],
      'capacitor-screenshot-event': ['screenshot-event'],
      'capacitor-printer': ['pdf', 'web'],
      'capacitor-brotherprint': ['installation', 'search', 'print', 'events'],
    };
    const groupSlugs = expectedGroupSlugs[projectId];
    if (groupSlugs) {
      assert.deepEqual(
        project.pages.filter((entry) => entry.file !== 'readme.md').map((entry) => entry.slug),
        groupSlugs,
      );
    }

    const installedPackage = JSON.parse(
      await readFile(
        new URL(`../node_modules/${packageName}/package.json`, import.meta.url),
        'utf8',
      ),
    ) as { version: string };
    assert.equal(installedPackage.version, version);

    const docsRoot = new URL(`../projects/docs/src/${projectId}/docs/`, import.meta.url);
    const pageFiles = project.pages.map((page) => page.file).filter((file) => file !== 'api.md');
    for (const pageFile of pageFiles) {
      const japanese = await readFile(new URL(`ja/${pageFile}`, docsRoot), 'utf8');
      const english = await englishGuideSource(project, pageFile);
      assert.deepEqual(
        fencedCodeBlocks(japanese),
        fencedCodeBlocks(english),
        `${projectId}/${pageFile} fenced code blocks must match byte-for-byte between EN and JA`,
      );
      for (const markdown of [english, japanese]) {
        assert.doesNotMatch(markdown, new RegExp(['rdlabo', 'team'].join('-')));
        assert.doesNotMatch(markdown, new RegExp(`${projectId}/(?:blob|tree)/main`));
        for (const link of markdown.matchAll(
          new RegExp(`https://github\\.com/rdlabo-dev/${projectId}/(?:blob|tree)/[^\\s)\\]]+`, 'g'),
        )) {
          assert.ok(
            link[0].includes(`/v${version}/`),
            `${projectId} source link must use v${version}: ${link[0]}`,
          );
        }
      }
    }
  }

  const docs = async (projectId: string, file = 'readme.md') => {
    const project = projectDefinitions.find((entry) => entry.id === projectId);
    assert.ok(project, `${projectId} must be declared`);
    const japanese = await readFile(
      new URL(`../projects/docs/src/${projectId}/docs/ja/${file}`, import.meta.url),
      'utf8',
    );
    const english = await englishGuideSource(project, file);
    return [english, japanese] as const;
  };
  for (const markdown of await docs('capacitor-codescanner', 'code-scanner.md')) {
    assert.match(markdown, /CodeTypes: \['qr'\]/);
    assert.doesNotMatch(markdown, /^\s*(?:metadataObjectTypes|detectionX|detectionY):/m);
  }
  for (const markdown of await docs('capacitor-codescanner')) {
    assert.match(markdown, /upper right corner|右上/);
  }
  for (const markdown of await docs('capacitor-screenshot-event', 'screenshot-event.md')) {
    assert.match(
      markdown,
      /import \{ ScreenshotEvent \} from '@rdlabo\/capacitor-screenshot-event';/,
    );
  }
  for (const markdown of await docs('capacitor-brotherprint', 'installation.md')) {
    assert.match(markdown, /mobilesdk\/android\/index\.html/);
  }
  for (const markdown of await docs('capacitor-brotherprint', 'search.md')) {
    assert.match(markdown, /BrotherPrint\.search\(\{/);
    assert.match(markdown, /searchDuration: 15/);
  }
  for (const markdown of await docs('capacitor-brotherprint', 'print.md')) {
    assert.match(markdown, /BrotherPrint\.printImage\(options\)/);
    assert.match(
      markdown,
      /import \{[\s\S]*BrotherPrint[\s\S]*BRLMPrinterModelName[\s\S]*\} from '@rdlabo\/capacitor-brotherprint';/,
    );
  }
  for (const markdown of await docs('ionic-angular-collect-icons', 'initialize.md')) {
    assert.match(markdown, /import \* as useIcons from '\.\/use-icons';/);
    assert.doesNotMatch(markdown, /import \* as useIcons from '\.\.\/use-icons';/);
  }

  const [brotherPrintImage] = await docs('capacitor-brotherprint', 'print.md');
  const brotherExample = fencedCodeBlocks(brotherPrintImage).find((block) =>
    block.body.includes('BrotherPrint.printImage(options)'),
  );
  assert.ok(brotherExample, 'Brother Print Print guide must include a typed example');
  const admobIsLinked = (
    await lstat(new URL('../node_modules/@capacitor-community/admob', import.meta.url))
  ).isSymbolicLink();
  if (admobIsLinked) {
    return;
  }
  const virtualFile = join(process.cwd(), 'brotherprint-readme-example.ts');
  const compilerOptions: ts.CompilerOptions = {
    experimentalDecorators: true,
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    noEmit: true,
    skipLibCheck: true,
    strict: true,
    target: ts.ScriptTarget.ES2022,
  };
  const host = ts.createCompilerHost(compilerOptions);
  const originalFileExists = host.fileExists;
  const originalGetSourceFile = host.getSourceFile;
  const originalReadFile = host.readFile;
  host.fileExists = (fileName) => fileName === virtualFile || originalFileExists(fileName);
  host.readFile = (fileName) =>
    fileName === virtualFile ? brotherExample.body : originalReadFile(fileName);
  host.getSourceFile = (fileName, languageVersion, onError, shouldCreateNewSourceFile) =>
    fileName === virtualFile
      ? ts.createSourceFile(fileName, brotherExample.body, languageVersion, true)
      : originalGetSourceFile(fileName, languageVersion, onError, shouldCreateNewSourceFile);
  const diagnostics = ts.getPreEmitDiagnostics(
    ts.createProgram({ rootNames: [virtualFile], options: compilerOptions, host }),
  );
  assert.deepEqual(
    diagnostics,
    [],
    diagnostics
      .map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'))
      .join('\n'),
  );
});

test('documents the exact capacitor-docgen inheritance enhancement over upstream', async () => {
  type DocgenMember = { name: string };
  type DocgenInterface = {
    name: string;
    extends?: string[];
    methods: DocgenMember[];
    properties: DocgenMember[];
  };
  type DocgenData = {
    api: DocgenInterface | null;
    interfaces: DocgenInterface[];
  };
  type DocgenModule = {
    parse(options: { inputFiles: string[] }): (api: string) => DocgenData;
  };

  const upstream = require('@capacitor/docgen') as DocgenModule;
  const fork = require('@rdlabo/capacitor-docgen') as DocgenModule;
  const packageJson = JSON.parse(
    await readFile(new URL('../package.json', import.meta.url), 'utf8'),
  ) as { devDependencies?: Record<string, string> };
  assert.equal(packageJson.devDependencies?.['@capacitor/docgen'], '0.3.1');
  assert.equal(packageJson.devDependencies?.['@rdlabo/capacitor-docgen'], '0.4.1');

  const fixture = fileURLToPath(new URL('./fixtures/docgen-inheritance.ts', import.meta.url));
  const upstreamData = upstream.parse({ inputFiles: [fixture] })('DocgenFixturePlugin');
  const forkData = fork.parse({ inputFiles: [fixture] })('DocgenFixturePlugin');
  const forkOrderData = fork.parse({ inputFiles: [fixture] })('OrderPlugin');
  const upstreamOptions = upstreamData.interfaces.find((entry) => entry.name === 'DocgenOptions');
  const forkOptions = forkData.interfaces.find((entry) => entry.name === 'DocgenOptions');
  const forkOrderBase = forkOrderData.interfaces.find((entry) => entry.name === 'OrderBase');
  const forkOrderDerived = forkOrderData.interfaces.find((entry) => entry.name === 'OrderDerived');

  assert.ok(upstreamData.api);
  assert.ok(forkData.api);
  assert.ok(upstreamOptions);
  assert.ok(forkOptions);
  assert.ok(forkOrderBase);
  assert.ok(forkOrderDerived);
  assert.deepEqual(
    upstreamData.api.methods.map((entry) => entry.name),
    ['ownMethod'],
  );
  assert.equal(upstreamData.api.extends, undefined);
  assert.deepEqual(upstreamOptions.methods, []);
  assert.deepEqual(
    upstreamOptions.properties.map((entry) => entry.name),
    ['ownProperty', 'baseProperty'],
  );

  assert.deepEqual(forkData.api.extends, ['DocgenBasePlugin']);
  assert.deepEqual(
    forkData.api.methods.map((entry) => entry.name),
    ['ownMethod', 'inheritedMethod'],
  );
  assert.deepEqual(forkOptions.extends, ['DocgenBase']);
  assert.deepEqual(
    forkOptions.methods.map((entry) => entry.name),
    ['baseMethod'],
  );
  assert.deepEqual(
    forkOptions.properties.map((entry) => entry.name),
    ['ownProperty', 'baseProperty', 'baseProperty'],
  );
  assert.doesNotMatch(
    JSON.stringify(forkOptions),
    /grand(?:Method|Property)/,
    'without prior base collection, v0.4.1 copies only the original direct base members',
  );
  assert.deepEqual(
    forkOrderBase.properties.map((entry) => entry.name),
    ['baseProperty', 'grandProperty'],
  );
  assert.deepEqual(
    forkOrderDerived.properties.map((entry) => entry.name),
    ['ownProperty', 'baseProperty', 'grandProperty'],
    'an earlier base collection mutates the shared object and propagates ancestor members',
  );

  const upstreamPackageDirectory = dirname(require.resolve('@capacitor/docgen/package.json'));
  const forkPackageDirectory = dirname(require.resolve('@rdlabo/capacitor-docgen/package.json'));
  for (const file of [
    'LICENSE',
    'bin/docgen',
    'dist/cli.d.ts',
    'dist/cli.js',
    'dist/formatting.d.ts',
    'dist/formatting.js',
    'dist/generate.d.ts',
    'dist/generate.js',
    'dist/index.d.ts',
    'dist/index.js',
    'dist/markdown.d.ts',
    'dist/markdown.js',
    'dist/output.d.ts',
    'dist/output.js',
    'dist/parse.d.ts',
    'dist/transpile.d.ts',
    'dist/transpile.js',
    'dist/types.js',
  ]) {
    const [upstreamSource, forkSource] = await Promise.all([
      readFile(join(upstreamPackageDirectory, file), 'utf8'),
      readFile(join(forkPackageDirectory, file), 'utf8'),
    ]);
    assert.equal(forkSource, upstreamSource, `${file} must retain upstream behavior`);
  }

  const docgenProject = projectDefinitions.find((entry) => entry.id === 'capacitor-docgen');
  assert.ok(docgenProject, 'capacitor-docgen must be declared in the manifest');

  const [
    upstreamParser,
    forkParser,
    upstreamTypes,
    forkTypes,
    english,
    japanese,
    englishGettingStarted,
    japaneseGettingStarted,
  ] = await Promise.all([
    readFile(join(upstreamPackageDirectory, 'dist', 'parse.js'), 'utf8'),
    readFile(join(forkPackageDirectory, 'dist', 'parse.js'), 'utf8'),
    readFile(join(upstreamPackageDirectory, 'dist', 'types.d.ts'), 'utf8'),
    readFile(join(forkPackageDirectory, 'dist', 'types.d.ts'), 'utf8'),
    englishGuideSource(docgenProject, 'upstream-differences.md'),
    readFile(
      new URL(
        '../projects/docs/src/capacitor-docgen/docs/ja/upstream-differences.md',
        import.meta.url,
      ),
      'utf8',
    ),
    englishGuideSource(docgenProject, 'getting-started.md'),
    readFile(
      new URL('../projects/docs/src/capacitor-docgen/docs/ja/getting-started.md', import.meta.url),
      'utf8',
    ),
  ]);
  assert.doesNotMatch(upstreamParser, /heritageClauses/);
  assert.match(forkParser, /heritageClauses/);
  assert.notEqual(forkParser, upstreamParser);
  assert.doesNotMatch(upstreamTypes, /extends:\s*string\[\]/);
  assert.match(forkTypes, /extends:\s*string\[\]/);
  assert.notEqual(forkTypes, upstreamTypes);
  assert.deepEqual(fencedCodeBlocks(japanese), fencedCodeBlocks(english));
  assert.deepEqual(
    fencedCodeBlocks(japaneseGettingStarted),
    fencedCodeBlocks(englishGettingStarted),
  );

  for (const markdown of [english, japanese]) {
    assert.match(markdown, /@rdlabo\/capacitor-docgen@0\.4\.1/);
    assert.match(markdown, /@capacitor\/docgen@0\.3\.1/);
    assert.match(markdown, /blob\/v0\.4\.1\/src\/(?:parse|types)\.ts|tree\/v0\.4\.1/);
    assert.match(markdown, /blob\/v0\.3\.1\/src\/(?:parse|types)\.ts|tree\/v0\.3\.1/);
    assert.match(markdown, /object identity/);
    assert.match(markdown, /in-place/);
    assert.match(markdown, /--silent/);
  }
  assert.match(english, /collection order/);
  assert.match(japanese, /収集順/);
  for (const markdown of [englishGettingStarted, japaneseGettingStarted]) {
    assert.match(markdown, /npx docgen --api MyPlugin/);
    assert.doesNotMatch(markdown, /^docgen --api MyPlugin/m);
  }
});

test('configures Cloudflare Workers Static Assets for both public sites', async () => {
  const [wranglerSource, webSiteWranglerSource, packageJsonSource] = await Promise.all([
    readFile(new URL('../wrangler.jsonc', import.meta.url), 'utf8'),
    readFile(new URL('../wrangler.web-site.jsonc', import.meta.url), 'utf8'),
    readFile(new URL('../package.json', import.meta.url), 'utf8'),
  ]);
  type WranglerConfig = {
    $schema?: string;
    name?: string;
    account_id?: string;
    compatibility_date?: string;
    main?: string;
    workers_dev?: boolean;
    preview_urls?: boolean;
    assets?: {
      directory?: string;
      binding?: string;
      run_worker_first?: string[];
      not_found_handling?: string;
      html_handling?: string;
    };
    routes?: { pattern?: string; custom_domain?: boolean }[];
  };
  const parseWrangler = (source: string) =>
    JSON.parse(source.replace(/^\s*\/\/.*$/gm, '').replace(/,(\s*[}\]])/g, '$1')) as WranglerConfig;
  const wrangler = parseWrangler(wranglerSource);
  const webSiteWrangler = parseWrangler(webSiteWranglerSource);
  const packageJson = JSON.parse(packageJsonSource) as {
    scripts?: Record<string, string>;
  };

  assert.equal(wrangler.$schema, './node_modules/wrangler/config-schema.json');
  assert.equal(wrangler.name, 'docs');
  assert.equal(wrangler.account_id, '09b7a8355cbc8a838af7de40ed9ec7f8');
  assert.equal(wrangler.compatibility_date, '2026-08-15');
  assert.equal(wrangler.main, './workers/docs-worker.mjs');
  assert.equal(wrangler.workers_dev, false);
  assert.equal(wrangler.preview_urls, false);
  assert.equal(wrangler.assets?.directory, './dist/docs/browser');
  assert.equal(wrangler.assets?.binding, 'ASSETS');
  assert.deepEqual(wrangler.assets?.run_worker_first, ['/ja/stripe/docs/angular/']);
  assert.equal(wrangler.assets?.not_found_handling, '404-page');
  assert.equal(wrangler.assets?.html_handling, 'drop-trailing-slash');
  assert.deepEqual(wrangler.routes, [{ pattern: 'docs.rdlabo.dev', custom_domain: true }]);
  assert.equal(webSiteWrangler.$schema, './node_modules/wrangler/config-schema.json');
  assert.equal(webSiteWrangler.name, 'web-site');
  assert.equal(webSiteWrangler.account_id, wrangler.account_id);
  assert.equal(webSiteWrangler.compatibility_date, wrangler.compatibility_date);
  assert.equal(webSiteWrangler.workers_dev, false);
  assert.equal(webSiteWrangler.preview_urls, false);
  assert.equal(webSiteWrangler.assets?.directory, './dist/web-site/browser');
  assert.equal(webSiteWrangler.assets?.not_found_handling, '404-page');
  assert.equal(webSiteWrangler.assets?.html_handling, 'drop-trailing-slash');
  assert.deepEqual(webSiteWrangler.routes, [{ pattern: 'rdlabo.dev', custom_domain: true }]);
  assert.equal(
    packageJson.scripts?.deploy,
    'npm run build && npm run deploy:docs && npm run deploy:web-site',
  );
  assert.equal(
    packageJson.scripts?.['deploy:dry-run'],
    'npm run build && npm run deploy:docs:dry-run && npm run deploy:web-site:dry-run',
  );
  await access(new URL('../projects/docs/public/_redirects', import.meta.url), constants.F_OK);
  await access(new URL('../workers/docs-worker.mjs', import.meta.url), constants.F_OK);
});

test('redirects the trailing-slash legacy Stripe Angular URL before static asset routing', async () => {
  const { default: docsWorker } = await import('../workers/docs-worker.mjs');
  let delegatedRequest: Request | undefined;
  const env = {
    ASSETS: {
      fetch(request: Request) {
        delegatedRequest = request;
        return Promise.resolve(new Response('asset'));
      },
    },
  };

  const redirect = await docsWorker.fetch(
    new Request('https://docs.rdlabo.dev/ja/stripe/docs/angular/?source=legacy'),
    env,
  );
  assert.equal(redirect.status, 301);
  assert.equal(
    redirect.headers.get('location'),
    'https://docs.rdlabo.dev/ja/projects/capacitor-stripe/docs/angular?source=legacy',
  );
  assert.equal(delegatedRequest, undefined);

  const request = new Request('https://docs.rdlabo.dev/projects/capacitor-stripe');
  const asset = await docsWorker.fetch(request, env);
  assert.equal(asset.status, 200);
  assert.equal(delegatedRequest, request);
});

test('deploys verified main revisions to Cloudflare', async () => {
  const [workflow, workflowFiles] = await Promise.all([
    readFile(new URL('../.github/workflows/deploy-cloudflare.yml', import.meta.url), 'utf8'),
    readdir(new URL('../.github/workflows', import.meta.url)),
  ]);

  await access(new URL('../netlify.toml', import.meta.url), constants.F_OK);
  assert.equal(
    workflowFiles.some((fileName) => /netlify/i.test(fileName)),
    false,
  );

  assert.match(workflow, /^name: Deploy to Cloudflare$/m);
  assert.match(workflow, /^ {2}workflow_run:$/m);
  assert.match(workflow, /^ {2}schedule:$/m);
  assert.match(workflow, /^ {4}- cron: '17 3 \* \* \*'$/m);
  assert.match(workflow, /^ {4}workflows: \[CI\]$/m);
  assert.match(workflow, /^ {4}branches: \[main\]$/m);
  assert.match(workflow, /github\.event\.workflow_run\.conclusion == 'success'/);
  assert.match(workflow, /github\.event\.workflow_run\.event == 'push'/);
  assert.match(workflow, /github\.event\.workflow_run\.head_sha == github\.sha/);
  assert.match(workflow, /github\.ref == 'refs\/heads\/main'/);
  assert.match(workflow, /github\.event_name == 'schedule'/);
  assert.match(workflow, /ref: \$\{\{ github\.event\.workflow_run\.head_sha \|\| github\.sha \}\}/);
  assert.match(workflow, /^ {8}run: npm ci$/m);
  assert.match(workflow, /^ {8}run: npm run sponsors:generate && npm run build$/m);
  assert.match(workflow, /^ {8}run: npm run deploy:docs$/m);
  assert.match(workflow, /^ {8}run: npm run deploy:web-site$/m);
  assert.match(workflow, /^ {6}url: https:\/\/rdlabo\.dev$/m);
  const actionReferences = [...workflow.matchAll(/^\s+uses:\s+([^\s#]+)/gm)].map(
    (match) => match[1],
  );
  assert.deepEqual(actionReferences, [
    'actions/checkout@fbc6f3992d24b796d5a048ff273f7fcc4a7b6c09',
    'actions/setup-node@a0853c24544627f65ddf259abe73b1d18a591444',
  ]);
  for (const reference of actionReferences) {
    assert.match(reference, /^[\w.-]+\/[\w.-]+@[a-f0-9]{40}$/);
  }
  assert.match(workflow, /^ {10}CLOUDFLARE_API_TOKEN: \$\{\{ secrets\.CLOUDFLARE_API_TOKEN \}\}$/m);
  assert.match(workflow, /^ {10}GITHUB_TOKEN: \$\{\{ github\.token \}\}$/m);
  assert.doesNotMatch(workflow, /netlify/i);
});

test('uses docs.rdlabo.dev as the canonical origin in site SEO outputs', async () => {
  const legacyOrigin = 'https://stripe.capacitorjs.jp';
  const canonicalOrigin = 'https://docs.rdlabo.dev';
  const [siteConfig, sitemap, robots] = await Promise.all([
    readFile(new URL('../projects/docs/src/app/site-config.ts', import.meta.url), 'utf8'),
    readFile(new URL('../projects/docs/public/sitemap.xml', import.meta.url), 'utf8'),
    readFile(new URL('../projects/docs/public/robots.txt', import.meta.url), 'utf8'),
  ]);

  assert.match(siteConfig, new RegExp(`origin:\\s*'${canonicalOrigin.replaceAll('.', '\\.')}'`));
  assert.doesNotMatch(siteConfig, new RegExp(legacyOrigin.replaceAll('.', '\\.')));
  assert.match(sitemap, new RegExp(`<loc>${canonicalOrigin.replaceAll('.', '\\.')}/</loc>`));
  assert.match(sitemap, new RegExp(`<loc>${canonicalOrigin.replaceAll('.', '\\.')}/ja</loc>`));
  assert.match(sitemap, new RegExp(`<loc>${canonicalOrigin.replaceAll('.', '\\.')}/support</loc>`));
  assert.match(
    sitemap,
    new RegExp(`<loc>${canonicalOrigin.replaceAll('.', '\\.')}/ja/support</loc>`),
  );
  assert.doesNotMatch(sitemap, new RegExp(`${canonicalOrigin.replaceAll('.', '\\.')}/ja/</`));
  assert.match(
    sitemap,
    /^<\?xml version="1\.0" encoding="UTF-8"\?>\n<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/,
  );
  assert.doesNotMatch(sitemap, /xmlns:xhtml/);
  assert.doesNotMatch(sitemap, /xhtml:link/);
  assert.doesNotMatch(sitemap, /hreflang=/);
  assert.doesNotMatch(sitemap, new RegExp(legacyOrigin.replaceAll('.', '\\.')));
  assert.match(
    robots,
    new RegExp(`Sitemap:\\s*${canonicalOrigin.replaceAll('.', '\\.')}/sitemap\\.xml`),
  );
  assert.doesNotMatch(robots, new RegExp(legacyOrigin.replaceAll('.', '\\.')));
});

test('keeps legacy Stripe host paths on permanent canonical redirects', async () => {
  const [redirects, legacyRedirects, netlify] = await Promise.all([
    readFile(new URL('../projects/docs/public/_redirects', import.meta.url), 'utf8'),
    readFile(new URL('../projects/legacy-stripe-redirect/_redirects', import.meta.url), 'utf8'),
    readFile(new URL('../netlify.toml', import.meta.url), 'utf8'),
  ]);

  assert.match(
    redirects,
    /^\/docs\/\* https:\/\/docs\.rdlabo\.dev\/projects\/capacitor-stripe\/docs\/:splat 301$/m,
  );
  assert.match(
    redirects,
    /^\/stripe\/docs\/\* https:\/\/docs\.rdlabo\.dev\/projects\/capacitor-stripe\/docs\/:splat 301$/m,
  );
  assert.doesNotMatch(redirects, /https:\/\/stripe\.capacitorjs\.jp/);
  assert.match(
    netlify,
    /from = "\/"[\s\S]*?to = "https:\/\/docs\.rdlabo\.dev\/projects\/capacitor-stripe"[\s\S]*?status = 301/,
  );
  assert.match(
    netlify,
    /from = "\/docs\/\*"[\s\S]*?to = "https:\/\/docs\.rdlabo\.dev\/projects\/capacitor-stripe\/docs\/:splat"[\s\S]*?status = 301/,
  );
  assert.doesNotMatch(netlify, /to = "https:\/\/docs\.rdlabo\.dev\/:splat"/);
  assert.match(netlify, /command = "true"/);
  assert.match(netlify, /publish = "projects\/legacy-stripe-redirect"/);
  assert.match(netlify, /NODE_VERSION = "24"/);

  const redirectLines = redirects
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));
  const parsedRedirects = redirectLines.map((line) => {
    const [source, destination, status, ...extra] = line.split(/\s+/);
    assert.equal(extra.length, 0);
    assert.ok(source);
    assert.ok(destination);
    assert.equal(status, '301');
    assert.ok(destination.startsWith('https://docs.rdlabo.dev/'));
    return { source, destination };
  });
  assert.deepEqual(parsedRedirects, [
    {
      source: '/docs/identity',
      destination:
        'https://docs.rdlabo.dev/projects/capacitor-stripe-identity/docs/identity-verification-sheet',
    },
    {
      source: '/docs/*',
      destination: 'https://docs.rdlabo.dev/projects/capacitor-stripe/docs/:splat',
    },
    {
      source: '/stripe',
      destination: 'https://docs.rdlabo.dev/projects/capacitor-stripe',
    },
    {
      source: '/stripe/docs/*',
      destination: 'https://docs.rdlabo.dev/projects/capacitor-stripe/docs/:splat',
    },
    {
      source: '/ja/docs/identity',
      destination:
        'https://docs.rdlabo.dev/ja/projects/capacitor-stripe-identity/docs/identity-verification-sheet',
    },
    {
      source: '/ja/docs/*',
      destination: 'https://docs.rdlabo.dev/ja/projects/capacitor-stripe/docs/:splat',
    },
    {
      source: '/ja/stripe',
      destination: 'https://docs.rdlabo.dev/ja/projects/capacitor-stripe',
    },
    {
      source: '/ja/stripe/docs/*',
      destination: 'https://docs.rdlabo.dev/ja/projects/capacitor-stripe/docs/:splat',
    },
  ]);
  const redirectSources = parsedRedirects.map(({ source }) => source);
  const docsIdentityIndex = redirectSources.indexOf('/docs/identity');
  const docsSplatIndex = redirectSources.indexOf('/docs/*');
  const japaneseIdentityIndex = redirectSources.indexOf('/ja/docs/identity');
  const japaneseSplatIndex = redirectSources.indexOf('/ja/docs/*');
  assert.ok(docsIdentityIndex >= 0);
  assert.ok(docsSplatIndex >= 0);
  assert.ok(japaneseIdentityIndex >= 0);
  assert.ok(japaneseSplatIndex >= 0);
  assert.ok(docsIdentityIndex < docsSplatIndex);
  assert.ok(japaneseIdentityIndex < japaneseSplatIndex);

  const netlifyBlocks = netlify.split('[[redirects]]').slice(1);
  const parsedNetlify = netlifyBlocks.map((block) => {
    const source = block.match(/from = "([^"]+)"/)?.[1];
    const destination = block.match(/to = "([^"]+)"/)?.[1];
    assert.ok(source);
    assert.ok(destination);
    assert.match(block, /status = 301/);
    assert.match(block, /force = true/);
    return { source, destination };
  });
  assert.deepEqual(parsedNetlify, [
    {
      source: '/',
      destination: 'https://docs.rdlabo.dev/projects/capacitor-stripe',
    },
    {
      source: '/docs/identity',
      destination:
        'https://docs.rdlabo.dev/projects/capacitor-stripe-identity/docs/identity-verification-sheet',
    },
    {
      source: '/docs/*',
      destination: 'https://docs.rdlabo.dev/projects/capacitor-stripe/docs/:splat',
    },
    {
      source: '/ja/docs/identity',
      destination:
        'https://docs.rdlabo.dev/ja/projects/capacitor-stripe-identity/docs/identity-verification-sheet',
    },
    {
      source: '/ja/docs/*',
      destination: 'https://docs.rdlabo.dev/ja/projects/capacitor-stripe/docs/:splat',
    },
    {
      source: '/*',
      destination: 'https://docs.rdlabo.dev/projects/capacitor-stripe',
    },
  ]);
  const netlifySources = parsedNetlify.map(({ source }) => source);
  const netlifyDocsIdentityIndex = netlifySources.indexOf('/docs/identity');
  const netlifyDocsSplatIndex = netlifySources.indexOf('/docs/*');
  const netlifyJapaneseIdentityIndex = netlifySources.indexOf('/ja/docs/identity');
  const netlifyJapaneseSplatIndex = netlifySources.indexOf('/ja/docs/*');
  assert.ok(netlifyDocsIdentityIndex >= 0);
  assert.ok(netlifyDocsSplatIndex >= 0);
  assert.ok(netlifyJapaneseIdentityIndex >= 0);
  assert.ok(netlifyJapaneseSplatIndex >= 0);
  assert.ok(netlifyDocsIdentityIndex < netlifyDocsSplatIndex);
  assert.ok(netlifyJapaneseIdentityIndex < netlifyJapaneseSplatIndex);
  assert.deepEqual(parsedNetlify.at(-1), {
    source: '/*',
    destination: 'https://docs.rdlabo.dev/projects/capacitor-stripe',
  });

  const parsedLegacyRedirects = legacyRedirects
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const [source, destination, status, ...extra] = line.split(/\s+/);
      assert.equal(extra.length, 0);
      assert.equal(status, '301!');
      assert.ok(source);
      assert.ok(destination);
      return { source, destination };
    });
  assert.deepEqual(parsedLegacyRedirects, parsedNetlify);
});

test('locks production anyScript budgets after catalog growth', async () => {
  const angularJson = JSON.parse(
    await readFile(new URL('../angular.json', import.meta.url), 'utf8'),
  ) as {
    projects: {
      docs: {
        architect: {
          build: {
            configurations: {
              production: {
                budgets: {
                  type: string;
                  maximumWarning?: string;
                  maximumError?: string;
                }[];
              };
            };
          };
        };
      };
    };
  };
  const anyScript = angularJson.projects[
    'docs'
  ].architect.build.configurations.production.budgets.find((budget) => budget.type === 'anyScript');
  assert.ok(anyScript);
  assert.equal(anyScript.maximumWarning, '425kB');
  assert.equal(anyScript.maximumError, '450kB');

  const readme = await readFile(new URL('../README.md', import.meta.url), 'utf8');
  assert.match(readme, /anyScript.*425kB/s);
  assert.match(readme, /450kB/);
});

const packageEnglishOnlyProjects = new Set([
  'admob',
  'facebook-login',
  'capacitor-codescanner',
  'capacitor-screenshot-event',
  'capacitor-printer',
  'capacitor-brotherprint',
]);

test('loads Facebook Login guides and API from the package repository', async () => {
  const project = projectDefinitions.find((entry) => entry.id === 'facebook-login');
  assert.ok(project, 'facebook-login must be declared in the manifest');
  assert.equal(project.packageName, '@capacitor-community/facebook-login');
  assert.equal(project.repositoryUrl, 'https://github.com/capacitor-community/facebook-login');
  assert.equal(project.category, 'capacitor-plugins');
  assert.equal(project.adapter, 'markdown');
  assert.deepEqual(
    project.pages.map((page) => page.slug),
    ['readme', 'configuration', 'authentication', 'app-events'],
  );

  const packageJson = JSON.parse(
    await readFile(new URL('../package.json', import.meta.url), 'utf8'),
  ) as { devDependencies: Record<string, string> };
  assert.equal(packageJson.devDependencies[project.packageName], '8.1.0');

  const installedPackage = JSON.parse(
    await readFile(
      new URL(`../node_modules/${project.packageName}/package.json`, import.meta.url),
      'utf8',
    ),
  ) as { version: string };
  assert.equal(installedPackage.version, '8.1.0');

  const readme = await fetchEnglishProjectMarkdown(project, 'readme.md');
  const extracted = extractPackageReadmeParts(readme.content);
  assert.match(extracted.readme, /^## Overview$/m);
  assert.match(extracted.api ?? '', /^### login\(\.\.\.\)$/m);
  assert.match(extracted.api ?? '', /^### logEvent\(\.\.\.\)$/m);
});

test('package-hosted English docs are not duplicated under projects/docs/src', async () => {
  for (const project of projectDefinitions.filter((entry) =>
    packageEnglishOnlyProjects.has(entry.id),
  )) {
    const srcDocs = new URL(`../projects/docs/src/${project.id}/docs/`, import.meta.url);
    const englishFiles = (await readdir(srcDocs)).filter((name) => name.endsWith('.md'));
    assert.deepEqual(
      englishFiles.sort(),
      [],
      `${project.id} must not store English Markdown under projects/docs/src/${project.id}/docs/`,
    );

    for (const page of project.pages) {
      if (page.file === 'api.md') continue;
      await access(new URL(`ja/${page.file}`, srcDocs), constants.F_OK);
    }
  }
});

test('loads AdMob English pages from GitHub', async () => {
  const project = projectDefinitions.find((entry) => entry.id === 'admob');
  assert.ok(project, 'admob must be declared in the manifest');
  assert.deepEqual(
    project.pages.map((page) => page.slug),
    [
      'readme',
      'configuration',
      'consent',
      'banner',
      'interstitial',
      'rewarded',
      'app-open',
      'events',
      'testing',
      'migration',
    ],
  );

  const srcDocs = new URL('../projects/docs/src/admob/docs/', import.meta.url);
  const englishFiles = (await readdir(srcDocs)).filter((name) => name.endsWith('.md'));
  assert.deepEqual(englishFiles.sort(), []);
  await assert.rejects(() => access(new URL('full-screen-ads.md', srcDocs), constants.F_OK));
  await assert.rejects(() => access(new URL('ja/full-screen-ads.md', srcDocs), constants.F_OK));

  const repositoryReadme = extractPackageReadme(
    (await fetchEnglishProjectMarkdown(project, 'readme.md')).content,
  );
  assert.doesNotMatch(repositoryReadme, /^## Maintainers$/m);
  assert.doesNotMatch(repositoryReadme, /^## Index$/m);
  assert.doesNotMatch(repositoryReadme, /^## License$/m);
  assert.match(repositoryReadme, /^## Overview$/m);
  assert.match(repositoryReadme, /^## Documentation$/m);

  for (const page of project.pages) {
    if (page.file === 'api.md') continue;
    const japanese = await readFile(new URL(`ja/${page.file}`, srcDocs), 'utf8');
    const english = await englishGuideSource(project, page.file);
    assert.deepEqual(
      fencedCodeBlocks(japanese),
      fencedCodeBlocks(english),
      `${page.file} fenced code blocks must match the OSS repository`,
    );
  }
});

test('declares authorized Ionic and Capacitor documentation translations', async () => {
  const expected = [
    {
      id: 'ionic-docs',
      repositoryUrl: 'https://github.com/ionic-jp/ionic-docs',
      hostedUrl: 'https://ionicframework.jp/docs/',
      shortName: 'Ionic Docs 日本語版',
      localizedShortName: {
        en: 'Ionic Docs Japanese',
        ja: 'Ionic Docs 日本語版',
      },
    },
    {
      id: 'capacitor-docs',
      repositoryUrl: 'https://github.com/ionic-jp/capacitor-docs',
      hostedUrl: 'https://capacitorjs.jp/docs',
      shortName: 'Capacitor Docs 日本語版',
      localizedShortName: {
        en: 'Capacitor Docs Japanese',
        ja: 'Capacitor Docs 日本語版',
      },
    },
  ] as const;

  for (const entry of expected) {
    const project = projectDefinitions.find((item) => item.id === entry.id);
    assert.ok(project, `${entry.id} must be declared in the manifest`);
    assert.equal(project.category, 'translations');
    assert.equal(project.adapter, 'markdown');
    assert.equal(project.packageName, 'Authorized Japanese translation');
    assert.equal(project.repositoryUrl, entry.repositoryUrl);
    assert.equal(project.hostedUrl, entry.hostedUrl);
    assert.equal(project.shortName, entry.shortName);
    assert.deepEqual(project.localizedShortName, entry.localizedShortName);
    assert.deepEqual(project.pages, []);
    assert.match(project.description.en, /authorized/i);
    assert.match(project.description.ja, /公認/);
    assert.match(project.overview.en, /authorized/i);
    assert.match(project.overview.ja, /公認/);
  }
});
