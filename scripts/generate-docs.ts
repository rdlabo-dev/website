import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import fm from 'front-matter';
import markdownToHtml from 'zenn-markdown-html';
import { JSDOM } from 'jsdom';
import {
  type Locale,
  localize,
  projectCategoryDefinitions,
  projectDefinitions,
  type ProjectDefinition,
  type ProjectPageDefinition,
} from './project-manifest';
import { localizedPublicPath } from '../projects/docs/src/app/locale-path';
import { SITE_CONFIG } from '../projects/docs/src/app/site-config';
import { enforceGeneratedHtmlPolicy } from './html-policy';
import { normalizeImportedReadmeHeadings } from './markdown-headings';
import { splitDocgenReadme } from './docgen-readme';
import { prepareDocgenMarkdown, restoreDocgenInlineCode } from './docgen-inline-code';
import {
  fetchEnglishProjectMarkdown,
  fetchEnglishProjectReadme,
  repositorySourceLabel,
} from './package-repository';
import {
  apiAnchorFragments,
  expandApiPlaceholders,
  extractPackageReadmeParts,
  extractRdlaboDocsPick,
  normalizePackageMarkdown,
  rewritePackageDocLinks,
  stripLeadingH1,
  stripRdlaboDocsOmit,
} from './package-markdown';
import { assertValidContentUpdatedAt, formatSitemapLastmod } from './seo-dates';
import { loadRelatedArticlesByLibrary, type RelatedArticle } from './article-relations';
import { apiMarkdown } from './docgen-api';

const root = resolve(process.cwd());
const docsRepositoryUrl = 'https://github.com/rdlabo-dev/website';

async function renderCode(markdown: string): Promise<{ file: string; lines: string[] }> {
  const parsed = fm<{ title?: string; file?: string }>(markdown);
  const dom = new JSDOM(await markdownToHtml(parsed.body));
  const code = dom.window.document.querySelector('pre code');
  return {
    file:
      dom.window.document.querySelector('.code-block-filename')?.textContent?.trim() ||
      parsed.attributes.file ||
      parsed.attributes.title ||
      'example.ts',
    lines: Array.from(code?.querySelectorAll(':scope > .line') ?? []).map((line, index) =>
      enforceGeneratedHtmlPolicy(line.innerHTML, `code example line ${index + 1}`),
    ),
  };
}

function formatApiEntries(document: Document): void {
  const body = document.body;
  for (const heading of Array.from(body.children)) {
    if (heading.tagName !== 'H4' || heading.parentElement !== body) continue;
    const kind = heading.querySelector(':scope > code')?.textContent?.trim();
    if (
      !kind ||
      ![
        'method',
        'interface',
        'type alias',
        'enum',
        'class',
        'component',
        'directive',
        'function',
        'module',
        'command',
        'stylesheet',
        'rule',
      ].includes(kind)
    )
      continue;

    const section = document.createElement('section');
    section.className = 'api-entry';
    body.insertBefore(section, heading);

    let sibling: Element | null = heading;
    while (sibling && (sibling === heading || !/^H[234]$/.test(sibling.tagName))) {
      const next = sibling.nextElementSibling;
      section.appendChild(sibling);
      sibling = next;
    }

    for (const paragraph of Array.from(section.querySelectorAll(':scope > p'))) {
      const children = Array.from(paragraph.children);
      const hasOnlyOneCodeElement =
        children.length === 1 &&
        children[0].tagName === 'CODE' &&
        Array.from(paragraph.childNodes).every(
          (node) => node === children[0] || !node.textContent?.trim(),
        );
      if (hasOnlyOneCodeElement) paragraph.classList.add('api-signature');
    }
  }
}

function annotateDocgenApiEntries(document: Document): void {
  const categoryKinds = new Map([
    ['Interfaces', 'interface'],
    ['インターフェース', 'interface'],
    ['Type Aliases', 'type alias'],
    ['型エイリアス', 'type alias'],
    ['Enums', 'enum'],
    ['列挙型', 'enum'],
  ]);
  let categoryKind: string | undefined;

  for (const heading of Array.from(document.body.children)) {
    if (heading.tagName === 'H3') {
      const headingText = heading.textContent?.trim() ?? '';
      categoryKind = categoryKinds.get(headingText);
      if (categoryKind) continue;

      const methodHeading = document.createElement('h4');
      for (const attribute of Array.from(heading.attributes)) {
        methodHeading.setAttribute(attribute.name, attribute.value);
      }
      const kind = document.createElement('code');
      kind.textContent = 'method';
      methodHeading.append(kind, document.createTextNode(` ${headingText}`));
      heading.replaceWith(methodHeading);
      continue;
    }

    if (heading.tagName !== 'H4' || !categoryKind) continue;
    const kind = document.createElement('code');
    kind.textContent = categoryKind;
    heading.prepend(kind, document.createTextNode(' '));
  }
}

function formatApiReference(document: Document): void {
  const body = document.body;
  const root = document.createElement('div');
  root.className = 'api-reference';
  while (body.firstChild) root.appendChild(body.firstChild);
  body.appendChild(root);
}

function localizeProject(project: ProjectDefinition, locale: Locale, version: string) {
  return {
    id: project.id,
    slug: project.slug,
    name: project.name,
    shortName: project.localizedShortName
      ? localize(project.localizedShortName, locale)
      : project.shortName,
    packageName: project.packageName,
    repositoryUrl: project.repositoryUrl,
    demoUrl: project.demoUrl,
    hostedUrl: project.hostedUrl,
    category: project.category,
    icon: project.icon,
    version,
    ...(project.seoTitle ? { seoTitle: localize(project.seoTitle, locale) } : {}),
    description: localize(project.description, locale),
    headline: localize(project.headline, locale),
    overview: localize(project.overview, locale),
    featuresHeading: localize(project.featuresHeading, locale),
    features: project.features.map((feature) => ({
      title: localize(feature.title, locale),
      description: localize(feature.description, locale),
    })),
  };
}

function rewriteInternalLinks(html: string, project: ProjectDefinition, locale: Locale): string {
  const localePrefix = locale === 'ja' ? '/ja' : '';
  let rewritten = html.replace(
    /href="\/docs\//g,
    `href="${localePrefix}/projects/${project.slug}/docs/`,
  );
  for (const target of projectDefinitions) {
    rewritten = rewritten.replaceAll(
      `href="/${target.id}/docs/`,
      `href="${localePrefix}/projects/${target.slug}/docs/`,
    );
    rewritten = rewritten.replaceAll(
      `href="/${target.id}"`,
      `href="${localePrefix}/projects/${target.slug}"`,
    );
    rewritten = rewritten.replaceAll(
      `href="/${target.id}/`,
      `href="${localePrefix}/projects/${target.slug}/`,
    );
  }
  return rewritten;
}

async function renderProjectOverview(
  markdown: string,
  project: ProjectDefinition,
  locale: Locale,
): Promise<string> {
  const context = `${project.id}/overview (${locale})`;
  const html = rewriteInternalLinks(await markdownToHtml(markdown), project, locale).replace(
    'loading="lazy"',
    'loading="eager" fetchpriority="high"',
  );
  const document = new JSDOM(html).window.document;
  return enforceGeneratedHtmlPolicy(document.body.innerHTML, context);
}

function pageEditUrl(
  fromPackage: boolean,
  repositoryUrl: string,
  version: string,
  file: string,
  sourcePath: string,
  repositoryPath?: string,
): string {
  if (fromPackage && repositoryPath) {
    return `${repositoryUrl}/edit/main/${repositoryPath}`;
  }
  if (fromPackage) {
    const packagePath = sourcePath.endsWith('README.md') ? 'README.md' : `docs/${file}`;
    return `${repositoryUrl}/blob/v${version}/${packagePath}`;
  }
  return `${docsRepositoryUrl}/edit/main/${relative(root, sourcePath)}`;
}

const PACKAGE_LANDING_FILES = new Set(['readme.md', 'getting-started.md']);

function landingPageSlug(project: ProjectDefinition): string {
  return project.pages.find((page) => PACKAGE_LANDING_FILES.has(page.file))?.slug ?? 'readme';
}

function srcDocsPath(project: ProjectDefinition, locale: Locale, file: string): string {
  return join(
    root,
    'projects/docs/src',
    project.sourceDirectory,
    'docs',
    ...(locale === 'ja' ? ['ja'] : []),
    file,
  );
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

type ResolvedPageSource = {
  content: string;
  sourcePath: string;
  fromPackage: boolean;
  repositoryUrl: string;
  repositoryPath?: string;
};

async function resolvePageSource(
  project: ProjectDefinition,
  locale: Locale,
  file: string,
  repositoryCache: Map<string, string>,
): Promise<ResolvedPageSource> {
  if (locale === 'ja') {
    const srcPath = srcDocsPath(project, locale, file);
    return {
      content: await readFile(srcPath, 'utf8'),
      sourcePath: srcPath,
      fromPackage: false,
      repositoryUrl: project.repositoryUrl,
    };
  }

  const fetched = await fetchEnglishProjectMarkdown(project, file, repositoryCache);
  return {
    content: fetched.content,
    sourcePath: repositorySourceLabel(
      fetched.repositoryUrl,
      fetched.repositoryRef,
      fetched.repositoryPath,
    ),
    fromPackage: true,
    repositoryUrl: fetched.repositoryUrl,
    repositoryPath: fetched.repositoryPath,
  };
}

async function generateProject(
  project: ProjectDefinition,
  locale: Locale,
  relatedArticles: readonly RelatedArticle[] = [],
): Promise<any> {
  const isHostedDocumentation = !!project.hostedUrl;
  const packageRoot = join(root, 'node_modules', project.packageName);
  const packageJson = isHostedDocumentation
    ? { version: '' }
    : JSON.parse(await readFile(join(packageRoot, 'package.json'), 'utf8'));
  const docsJsonPath = join(packageRoot, 'dist/docs.json');
  const api =
    !isHostedDocumentation && (await fileExists(docsJsonPath))
      ? apiMarkdown(JSON.parse(await readFile(docsJsonPath, 'utf8')))
      : new Map<string, string>();
  if (project.adapter !== 'markdown' && api.size === 0) {
    throw new Error(`${project.packageName} is missing dist/docs.json`);
  }
  const apiAnchors = apiAnchorFragments(api);
  const packageLandingSlug = landingPageSlug(project);
  const pages = [];
  type SourcePage = {
    page: ProjectPageDefinition;
    body: string;
    useFrontMatterTitle: boolean;
    parsed: ReturnType<typeof fm<any>>;
    sourcePath: string;
    fromPackage: boolean;
    repositoryPath?: string;
    repositoryUrl: string;
    annotateDocgen: boolean;
  };
  const sourcePages: SourcePage[] = [];
  let overviewMarkdown: string | undefined;
  let docgenApiPage: SourcePage | undefined;
  const declaresApiPage = project.pages.some((entry) => entry.slug === 'api');
  const repositoryCache = new Map<string, string>();
  for (const declaredPage of project.pages) {
    const { file } = declaredPage;
    const resolved = await resolvePageSource(project, locale, file, repositoryCache);
    const parsed = fm<any>(resolved.content);
    const isPackageLanding = resolved.fromPackage && PACKAGE_LANDING_FILES.has(file);
    let preparedBody = parsed.body || resolved.content;
    if (!resolved.fromPackage && file === 'readme.md') {
      const extracted = extractRdlaboDocsPick(preparedBody);
      preparedBody = extracted.markdown;
      if (extracted.picked.length) overviewMarkdown = extracted.picked.join('\n\n');
    }
    let splitReadme =
      !resolved.fromPackage && file === 'readme.md' ? splitDocgenReadme(preparedBody) : undefined;
    if (resolved.fromPackage) {
      if (isPackageLanding) {
        const extracted = extractPackageReadmeParts(resolved.content);
        if (extracted.overview) {
          overviewMarkdown = normalizePackageMarkdown(
            rewritePackageDocLinks(extracted.overview, apiAnchors, packageLandingSlug),
          );
        }
        preparedBody = normalizePackageMarkdown(
          rewritePackageDocLinks(extracted.readme, apiAnchors, packageLandingSlug),
        );
        if (extracted.api && !declaresApiPage) {
          splitReadme = { readme: preparedBody, api: extracted.api };
        }
      } else {
        preparedBody = normalizePackageMarkdown(
          rewritePackageDocLinks(
            // `fm()` has already stripped YAML front matter when present.
            // For non-landing package pages we must use `parsed.body` (not `resolved.content`)
            // to avoid leaking front matter into generated HTML.
            stripLeadingH1(stripRdlaboDocsOmit(parsed.body || resolved.content)),
            apiAnchors,
            packageLandingSlug,
          ),
        );
      }
    }
    sourcePages.push({
      page: declaredPage,
      body: splitReadme ? splitReadme.readme : preparedBody,
      useFrontMatterTitle: !resolved.fromPackage,
      parsed,
      sourcePath: resolved.sourcePath,
      fromPackage: resolved.fromPackage,
      repositoryPath: resolved.repositoryPath,
      repositoryUrl: resolved.repositoryUrl,
      annotateDocgen: false,
    });
    if (splitReadme) {
      docgenApiPage = {
        page: {
          title: { en: 'API', ja: 'API' },
          section: { en: 'Reference', ja: 'リファレンス' },
          slug: 'api',
          file,
        },
        body: splitReadme.api,
        useFrontMatterTitle: false,
        parsed,
        sourcePath: resolved.sourcePath,
        fromPackage: resolved.fromPackage,
        repositoryPath: resolved.repositoryPath,
        repositoryUrl: resolved.repositoryUrl,
        annotateDocgen: true,
      };
    }
  }
  if (!isHostedDocumentation && !docgenApiPage && !declaresApiPage) {
    const readme = await fetchEnglishProjectReadme(project, repositoryCache);
    if (readme) {
      const extracted = extractPackageReadmeParts(readme.content);
      if (extracted.api) {
        docgenApiPage = {
          page: {
            title: { en: 'API', ja: 'API' },
            section: { en: 'Reference', ja: 'リファレンス' },
            slug: 'api',
            file: 'readme.md',
          },
          body: extracted.api,
          useFrontMatterTitle: false,
          parsed: fm(''),
          sourcePath: repositorySourceLabel(
            readme.repositoryUrl,
            readme.repositoryRef,
            readme.repositoryPath,
          ),
          fromPackage: true,
          repositoryPath: readme.repositoryPath,
          repositoryUrl: readme.repositoryUrl,
          annotateDocgen: true,
        };
      }
    }
  }
  if (docgenApiPage) {
    sourcePages.push(docgenApiPage);
  }

  for (const {
    page,
    body,
    useFrontMatterTitle,
    parsed,
    sourcePath,
    fromPackage,
    repositoryPath,
    repositoryUrl,
    annotateDocgen,
  } of sourcePages) {
    const { slug, file } = page;
    const context = fromPackage ? sourcePath : relative(root, sourcePath);
    const { expanded, missing: missingApiEntries } = expandApiPlaceholders(body, api);
    if (missingApiEntries.length) {
      throw new Error(`${context} references missing API entries: ${missingApiEntries.join(', ')}`);
    }
    const codes = [];
    for (const codePath of parsed.attributes.code ?? []) {
      const normalized = String(codePath).replace(/^\/docs\/stripe\//, '');
      codes.push(
        await renderCode(
          await readFile(
            join(root, 'projects/docs/src', project.sourceDirectory, 'docs', normalized),
            'utf8',
          ),
        ),
      );
    }
    if (page.demo && codes.length) {
      throw new Error(`${context} cannot combine an interactive demo with scroll-synced code`);
    }
    const preparedDocgen = prepareDocgenMarkdown(expanded);
    let html = rewriteInternalLinks(
      await markdownToHtml(preparedDocgen.markdown),
      project,
      locale,
    ).replace('loading="lazy"', 'loading="eager" fetchpriority="high"');
    const htmlDocument = new JSDOM(html).window.document;
    if (
      fromPackage ||
      (project.id === 'eslint-plugin-rules' && slug.startsWith('rules/')) ||
      slug === 'readme' ||
      file === 'using-ion-item-group.md'
    ) {
      normalizeImportedReadmeHeadings(htmlDocument);
    }
    const headingIds = Array.from(htmlDocument.querySelectorAll<HTMLElement>('h1, h2, h3, h4')).map(
      (heading) => heading.id,
    );
    const scrollMap = (parsed.attributes.scrollActiveLine ?? []).map((entry: any) => {
      if (locale !== 'ja' || !entry.id) return entry;
      const localizedId = headingIds.find(
        (headingId) => decodeURIComponent(headingId) === entry.id,
      );
      return localizedId ? { ...entry, id: localizedId } : entry;
    });
    const codeByFile = new Map(codes.map((code) => [code.file, code]));
    let previousHeadingIndex = -1;
    for (const entry of scrollMap) {
      if (entry.id) {
        const headingIndex = headingIds.indexOf(entry.id);
        if (headingIndex < 0) {
          throw new Error(`${context} references missing heading: ${entry.id}`);
        }
        if (headingIndex <= previousHeadingIndex) {
          throw new Error(`${context} has an out-of-order or duplicate heading: ${entry.id}`);
        }
        previousHeadingIndex = headingIndex;
      }
      for (const [codeFile, range] of Object.entries<number[]>(entry.activeLine ?? {})) {
        const code = codeByFile.get(codeFile);
        if (!code) {
          throw new Error(`${context} references missing code file: ${codeFile}`);
        }
        if (
          range.length !== 2 ||
          !range.every(Number.isInteger) ||
          range[0] < 0 ||
          range[1] < range[0] ||
          range[1] > code.lines.length + 1
        ) {
          throw new Error(`${context} has an invalid ${codeFile} line range: ${range.join(', ')}`);
        }
      }
    }
    restoreDocgenInlineCode(htmlDocument, preparedDocgen.inlineCodes);
    if (annotateDocgen) annotateDocgenApiEntries(htmlDocument);
    formatApiEntries(htmlDocument);
    if (slug === 'api') formatApiReference(htmlDocument);
    html = enforceGeneratedHtmlPolicy(htmlDocument.body.innerHTML, context);
    const headings = Array.from(htmlDocument.querySelectorAll<HTMLElement>('h2, h3, h4')).map(
      (heading) => ({
        id: heading.id,
        text: heading.textContent?.trim() ?? '',
        level: Number(heading.tagName.slice(1)) as 2 | 3 | 4,
      }),
    );
    pages.push({
      title: (useFrontMatterTitle && parsed.attributes.title) || localize(page.title, locale),
      navTitle: localize(page.title, locale),
      ...(page.seoTitle ? { seoTitle: localize(page.seoTitle, locale) } : {}),
      ...(page.updatedAt
        ? {
            updatedAt: assertValidContentUpdatedAt(
              localize(page.updatedAt, locale),
              `${project.id}/${slug} (${locale})`,
            ),
          }
        : {}),
      ...(page.demo
        ? {
            demo: {
              url: page.demo.url,
              title: localize(page.demo.title, locale),
            },
          }
        : {}),
      slug,
      file,
      section: localize(page.section, locale),
      path: `/projects/${project.slug}/docs/${slug}`,
      html,
      headings,
      codes,
      scrollMap,
      editUrl: pageEditUrl(
        fromPackage,
        repositoryUrl,
        packageJson.version,
        file,
        sourcePath,
        repositoryPath,
      ),
    });
  }
  return {
    ...localizeProject(project, locale, packageJson.version),
    ...(overviewMarkdown
      ? { overviewHtml: await renderProjectOverview(overviewMarkdown, project, locale) }
      : {}),
    path: `/projects/${project.slug}`,
    ...(relatedArticles.length ? { relatedArticles } : {}),
    pages,
  };
}

async function main(): Promise<void> {
  const generatedDirectory = join(root, 'projects/docs/src/app/generated');
  const projectsDirectory = join(generatedDirectory, 'projects');
  await mkdir(projectsDirectory, { recursive: true });
  const relatedArticlesByLibrary = await loadRelatedArticlesByLibrary(
    join(root, 'projects/web-site/src/articles'),
  );
  const projectsByLocale: Record<Locale, any[]> = { en: [], ja: [] };
  for (const project of projectDefinitions) {
    for (const locale of ['en', 'ja'] as const) {
      const generated = await generateProject(
        project,
        locale,
        relatedArticlesByLibrary.get(project.id),
      );
      projectsByLocale[locale].push(generated);
      if (!project.hostedUrl) {
        await writeFile(
          join(projectsDirectory, `${project.id}.${locale}.generated.ts`),
          `// Generated by scripts/generate-docs.ts. Do not edit.\nexport const PROJECT = ${JSON.stringify(generated, null, 2)} as const;\n`,
        );
      }
    }
  }

  const catalogs = Object.fromEntries(
    (['en', 'ja'] as const).map((locale) => [
      locale,
      projectsByLocale[locale].map(({ pages, relatedArticles: _relatedArticles, ...project }) => ({
        ...project,
        pages: pages.map(
          ({ html, headings, codes, scrollMap, editUrl, file, ...page }: any) => page,
        ),
      })),
    ]),
  ) as Record<Locale, any[]>;
  const categories = Object.fromEntries(
    (['en', 'ja'] as const).map((locale) => [
      locale,
      projectCategoryDefinitions.map((category) => ({
        id: category.id,
        label: localize(category.label, locale),
        description: localize(category.description, locale),
        order: category.order,
      })),
    ]),
  ) as Record<Locale, any[]>;
  await writeFile(
    join(generatedDirectory, 'project-catalog.generated.ts'),
    `// Generated by scripts/generate-docs.ts. Do not edit.\nexport const PROJECT_CATEGORIES_EN = ${JSON.stringify(categories.en, null, 2)} as const;\n\nexport const PROJECT_CATEGORIES_JA = ${JSON.stringify(categories.ja, null, 2)} as const;\n\nexport const PROJECTS_EN = ${JSON.stringify(catalogs.en, null, 2)} as const;\n\nexport const PROJECTS_JA = ${JSON.stringify(catalogs.ja, null, 2)} as const;\n`,
  );
  const loaderEntries = projectDefinitions
    .filter((project) => !project.hostedUrl)
    .map(
      (project) =>
        `  ${JSON.stringify(project.id)}: {\n    en: () => import('./projects/${project.id}.en.generated').then((module) => module.PROJECT),\n    ja: () => import('./projects/${project.id}.ja.generated').then((module) => module.PROJECT),\n  },`,
    )
    .join('\n');
  await writeFile(
    join(generatedDirectory, 'project-loaders.generated.ts'),
    `// Generated by scripts/generate-docs.ts. Do not edit.\nexport const PROJECT_LOADERS = {\n${loaderEntries}\n} as const;\n`,
  );
  const canonicalPaths = [
    '/',
    '/support',
    ...catalogs.en
      .filter((project) => !project.hostedUrl)
      .flatMap((project) => [project.path, ...project.pages.map((page: any) => page.path)]),
  ];
  const updatedAtByPublicPath = new Map<string, Partial<Record<Locale, string>>>();
  for (const project of projectDefinitions) {
    if (project.hostedUrl) continue;
    for (const declaredPage of project.pages) {
      if (!declaredPage.updatedAt) continue;
      const publicPath = `/projects/${project.slug}/docs/${declaredPage.slug}`;
      updatedAtByPublicPath.set(publicPath, {
        en: declaredPage.updatedAt.en
          ? assertValidContentUpdatedAt(
              declaredPage.updatedAt.en,
              `${project.id}/${declaredPage.slug} (en)`,
            )
          : undefined,
        ja: declaredPage.updatedAt.ja
          ? assertValidContentUpdatedAt(
              declaredPage.updatedAt.ja,
              `${project.id}/${declaredPage.slug} (ja)`,
            )
          : undefined,
      });
    }
  }
  const sitemapEntries = canonicalPaths
    .map((path) => {
      const englishUrl = `${SITE_CONFIG.origin}${localizedPublicPath('en', path)}`;
      const japaneseUrl = `${SITE_CONFIG.origin}${localizedPublicPath('ja', path)}`;
      const updatedAt = updatedAtByPublicPath.get(path);
      const englishLastmod = formatSitemapLastmod(updatedAt?.en);
      const japaneseLastmod = formatSitemapLastmod(updatedAt?.ja);
      return `  <url>\n    <loc>${englishUrl}</loc>${englishLastmod}\n  </url>\n  <url>\n    <loc>${japaneseUrl}</loc>${japaneseLastmod}\n  </url>`;
    })
    .join('\n');
  await writeFile(
    join(root, 'projects/docs/public/sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries}\n</urlset>\n`,
  );
  await writeFile(
    join(root, 'projects/docs/public/robots.txt'),
    `User-agent: *\nAllow: /\n\nSitemap: ${SITE_CONFIG.origin}/sitemap.xml\n`,
  );
  const pageCount = projectsByLocale.en.reduce((count, project) => count + project.pages.length, 0);
  console.log(
    `Generated ${pageCount * 2} localized documentation pages in ${projectDefinitions.filter((project) => !project.hostedUrl).length * 2} lazy project modules.`,
  );
}

void main();
