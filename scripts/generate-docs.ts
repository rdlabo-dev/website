import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import fm from 'front-matter';
import markdownToHtml from 'zenn-markdown-html';
import { JSDOM } from 'jsdom';
import { format as formatWithPrettier } from 'prettier';
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
import {
  addHeadingAliases,
  normalizeImportedReadmeHeadings,
  resolveGeneratedHeadingId,
} from './markdown-headings';
import { docgenApiAnchors, normalizeDocgenAnchors, splitDocgenReadme } from './docgen-readme';
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
  rewriteRelativeDocLinks,
  stripLeadingH1,
  stripRdlaboDocsOmit,
} from './package-markdown';
import { assertValidContentUpdatedAt, formatSitemapLastmod } from './seo-dates';
import { groupRelatedArticlesByLibrary, type RelatedArticle } from './article-relations';
import { ARTICLE_SUMMARIES } from '../projects/web-site/src/app/generated/article-catalog.generated';
import { apiMarkdown } from './docgen-api';
import {
  docsLocalePrefix,
  PUBLISHED_DOCS_LOCALES,
  requiresDocsTranslationReview,
} from '../shared/docs-locales';
import { validateDocsLocaleConfiguration } from './docs-locale-config';
import { assertReviewedDocsTranslation, translateApiText } from './docs-translation-review';
import { preserveSourceHeadingLinks } from './localized-heading-anchors';

const root = resolve(process.cwd());
const docsRepositoryUrl = 'https://github.com/rdlabo-dev/website';
function rewriteAgentMarkdownLinks(
  markdown: string,
  project: ProjectDefinition,
  locale: Locale,
): string {
  const localePrefix = docsLocalePrefix(locale);
  let rewritten = markdown.replaceAll(
    '](https://docs.rdlabo.dev/projects/',
    `](${localePrefix}/projects/`,
  );
  rewritten = rewritten.replaceAll('](/docs/', `](${localePrefix}/projects/${project.slug}/docs/`);
  for (const target of projectDefinitions) {
    rewritten = rewritten.replaceAll(
      `](/${target.id}/docs/`,
      `](${localePrefix}/projects/${target.slug}/docs/`,
    );
    rewritten = rewritten.replaceAll(
      `](/${target.id})`,
      `](${localePrefix}/projects/${target.slug})`,
    );
    rewritten = rewritten.replaceAll(
      `](/${target.id}/`,
      `](${localePrefix}/projects/${target.slug}/`,
    );
  }
  return rewritten;
}

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
    ['Schnittstellen', 'interface'],
    ['Type Aliases', 'type alias'],
    ['型エイリアス', 'type alias'],
    ['Alias de type', 'type alias'],
    ['Alias de types', 'type alias'],
    ['Typaliase', 'type alias'],
    ['Enums', 'enum'],
    ['列挙型', 'enum'],
    ['Énumérations', 'enum'],
    ['Aufzählungen', 'enum'],
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
  if (project.entryGuideSlugs) {
    const slugs = project.entryGuideSlugs;
    if (
      slugs.length > 3 ||
      new Set(slugs).size !== slugs.length ||
      slugs.some(
        (slug) =>
          slug === project.pages[0]?.slug ||
          slug === 'api' ||
          !project.pages.some((page) => page.slug === slug),
      )
    ) {
      throw new Error(
        `${project.id}: entryGuideSlugs must select up to three distinct guide pages`,
      );
    }
  }
  return {
    id: project.id,
    slug: project.slug,
    name: project.name,
    shortName: project.localizedShortName
      ? localize(project.localizedShortName, locale)
      : project.shortName,
    packageName: project.packageName,
    repositoryUrl: project.repositoryUrl,
    ...(project.repositoryBrowseUrl ? { repositoryBrowseUrl: project.repositoryBrowseUrl } : {}),
    demoUrl: project.demoUrl,
    ...(project.releaseNotesUrl ? { releaseNotesUrl: project.releaseNotesUrl } : {}),
    ...(project.entryGuideSlugs ? { entryGuideSlugs: project.entryGuideSlugs } : {}),
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
      ...(feature.icon ? { icon: feature.icon } : {}),
      title: localize(feature.title, locale),
      description: localize(feature.description, locale),
    })),
  };
}

function rewriteInternalLinks(html: string, project: ProjectDefinition, locale: Locale): string {
  const localePrefix = docsLocalePrefix(locale);
  let rewritten = html.replace(
    /<a\b[^>]*\bhref="https:\/\/docs\.rdlabo\.dev(\/projects\/[^" ]*)"[^>]*>/g,
    (tag, path: string) =>
      tag
        .replace(`https://docs.rdlabo.dev${path}`, `${localePrefix}${path}`)
        .replace(/ target="_blank"/g, '')
        .replace(/ rel="[^"]*"/g, ''),
  );
  rewritten = rewritten.replace(
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
  const rendered = /^<p>\s*(?:<img\b[^>]*\/?>(?:\s*))+<\/p>$/.test(markdown.trim())
    ? markdown
    : await markdownToHtml(markdown);
  const html = rewriteInternalLinks(rendered, project, locale).replace(
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
  editBranch = 'main',
): string {
  if (fromPackage && repositoryPath) {
    return `${repositoryUrl}/edit/${editBranch}/${repositoryPath}`;
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
    ...(locale === 'en' ? [] : [locale]),
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
  importedMarkdown?: boolean;
  repositoryUrl: string;
  repositoryPath?: string;
};

async function resolvePageSource(
  project: ProjectDefinition,
  locale: Locale,
  page: ProjectPageDefinition,
  repositoryCache: Map<string, string>,
): Promise<ResolvedPageSource> {
  const { file } = page;
  if (locale !== 'en' || page.localEnglishSource) {
    const srcPath = srcDocsPath(project, locale, file);
    const content = await readFile(srcPath, 'utf8');
    let importedMarkdown = false;
    if (requiresDocsTranslationReview(locale)) {
      const english = await resolvePageSource(project, 'en', page, repositoryCache);
      importedMarkdown = english.fromPackage;
      assertReviewedDocsTranslation(english.content, content, relative(root, srcPath), {
        api: page.slug === 'api',
      });
    }
    return {
      content,
      sourcePath: srcPath,
      fromPackage: false,
      importedMarkdown,
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
  repositoryCache = new Map<string, string>(),
): Promise<any> {
  const isHostedDocumentation = !!project.hostedUrl;
  const packageRoot = join(root, 'node_modules', project.packageName);
  const packageJson = isHostedDocumentation
    ? { version: '' }
    : JSON.parse(await readFile(join(packageRoot, 'package.json'), 'utf8'));
  const docsJsonPath = join(packageRoot, 'dist/docs.json');
  const apiTranslations: Record<string, string> =
    requiresDocsTranslationReview(locale) && (await fileExists(docsJsonPath))
      ? JSON.parse(
          await readFile(join(root, `projects/docs/src/locale/api.${locale}.json`), 'utf8'),
        )
      : {};
  const translateApi = requiresDocsTranslationReview(locale)
    ? (text: string) => translateApiText(text, apiTranslations, `${project.id} (${locale})`)
    : (text: string) => text;
  const api =
    !isHostedDocumentation && (await fileExists(docsJsonPath))
      ? apiMarkdown(JSON.parse(await readFile(docsJsonPath, 'utf8')), translateApi)
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
    importedMarkdown?: boolean;
    repositoryPath?: string;
    repositoryUrl: string;
    annotateDocgen: boolean;
  };
  const sourcePages: SourcePage[] = [];
  let overviewMarkdown: string | undefined;
  let docgenApiPage: SourcePage | undefined;
  const declaresApiPage = project.pages.some((entry) => entry.slug === 'api');
  if (!isHostedDocumentation && !declaresApiPage) {
    const readme = await fetchEnglishProjectReadme(project, repositoryCache);
    const docgenApi = readme && extractPackageReadmeParts(readme.content).api;
    if (docgenApi) {
      for (const [name, fragment] of docgenApiAnchors(docgenApi)) apiAnchors.set(name, fragment);
    }
  }
  for (const declaredPage of project.pages) {
    const { file } = declaredPage;
    const resolved = await resolvePageSource(project, locale, declaredPage, repositoryCache);
    const parsed = fm<any>(resolved.content);
    const importedMarkdown = resolved.fromPackage || resolved.importedMarkdown;
    const isPackageLanding = importedMarkdown && PACKAGE_LANDING_FILES.has(file);
    let preparedBody = parsed.body || resolved.content;
    if (!importedMarkdown) {
      preparedBody = rewriteRelativeDocLinks(preparedBody, file);
    }
    if (!importedMarkdown && file === 'readme.md') {
      const extracted = extractRdlaboDocsPick(preparedBody);
      preparedBody = extracted.markdown;
      if (extracted.picked.length) overviewMarkdown = extracted.picked.join('\n\n');
    }
    let splitReadme =
      !importedMarkdown && file === 'readme.md' ? splitDocgenReadme(preparedBody) : undefined;
    if (importedMarkdown) {
      if (isPackageLanding) {
        const extracted = extractPackageReadmeParts(parsed.body || resolved.content);
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
            file,
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
      importedMarkdown,
      repositoryPath: resolved.repositoryPath,
      repositoryUrl: resolved.repositoryUrl,
      annotateDocgen: false,
    });
    if (splitReadme) {
      docgenApiPage = {
        page: {
          title: { en: 'API', ja: 'API', fr: 'API', de: 'API' },
          section: { en: 'Reference', ja: 'リファレンス', fr: 'Référence', de: 'Referenz' },
          slug: 'api',
          file,
        },
        body: rewritePackageDocLinks(splitReadme.api, apiAnchors, packageLandingSlug),
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
        const reviewedLocale = requiresDocsTranslationReview(locale);
        const apiPath = srcDocsPath(project, locale, 'api.md');
        const apiSource = reviewedLocale ? await readFile(apiPath, 'utf8') : extracted.api;
        if (reviewedLocale)
          assertReviewedDocsTranslation(extracted.api, apiSource, relative(root, apiPath), {
            api: true,
          });
        docgenApiPage = {
          page: {
            title: { en: 'API', ja: 'API', fr: 'API', de: 'API' },
            section: { en: 'Reference', ja: 'リファレンス', fr: 'Référence', de: 'Referenz' },
            slug: 'api',
            file: 'readme.md',
          },
          body: rewritePackageDocLinks(
            reviewedLocale ? fm(apiSource).body : extracted.api,
            apiAnchors,
            packageLandingSlug,
          ),
          useFrontMatterTitle: false,
          parsed: fm(''),
          sourcePath: reviewedLocale
            ? apiPath
            : repositorySourceLabel(
                readme.repositoryUrl,
                readme.repositoryRef,
                readme.repositoryPath,
              ),
          fromPackage: !reviewedLocale,
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

  const apiLinks = sourcePages.some(({ page }) => page.slug === 'api')
    ? new Map([...apiAnchors].map(([name, fragment]) => [name, `/docs/api#${fragment}`]))
    : new Map<string, string>();

  for (const {
    page,
    body,
    useFrontMatterTitle,
    parsed,
    sourcePath,
    fromPackage,
    importedMarkdown,
    repositoryPath,
    repositoryUrl,
    annotateDocgen,
  } of sourcePages) {
    const { slug, file } = page;
    const context = fromPackage ? sourcePath : relative(root, sourcePath);
    const { expanded, missing: missingApiEntries } = expandApiPlaceholders(body, api, apiLinks);
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
      importedMarkdown ||
      (project.id === 'eslint-plugin-rules' && slug.startsWith('rules/')) ||
      slug === 'readme' ||
      file === 'using-ion-item-group.md'
    ) {
      normalizeImportedReadmeHeadings(htmlDocument);
    }
    addHeadingAliases(htmlDocument, parsed.attributes.headingAliases, context);
    const headingIds = Array.from(htmlDocument.querySelectorAll<HTMLElement>('h1, h2, h3, h4')).map(
      (heading) => heading.id,
    );
    const scrollMap = (parsed.attributes.scrollActiveLine ?? []).map((entry: any) => {
      return entry.id ? { ...entry, id: resolveGeneratedHeadingId(headingIds, entry.id) } : entry;
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
    if (annotateDocgen || splitDocgenReadme(expanded)) {
      normalizeDocgenAnchors(htmlDocument);
    }
    if (annotateDocgen) {
      annotateDocgenApiEntries(htmlDocument);
    }
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
      ...(page.seoDescription ? { seoDescription: localize(page.seoDescription, locale) } : {}),
      ...(page.updatedAt?.[locale]
        ? {
            updatedAt: assertValidContentUpdatedAt(
              page.updatedAt[locale]!,
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
      markdown: rewriteAgentMarkdownLinks(preparedDocgen.markdown, project, locale),
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
        project.englishDocsEditBranch,
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
  await validateDocsLocaleConfiguration(root);
  const generatedDirectory = join(root, 'projects/docs/src/app/generated');
  const projectsDirectory = join(generatedDirectory, 'projects');
  await mkdir(projectsDirectory, { recursive: true });
  const relatedArticlesByLibrary = groupRelatedArticlesByLibrary(ARTICLE_SUMMARIES);
  const locales = PUBLISHED_DOCS_LOCALES.map(({ code }) => code);
  const projectsByLocale = Object.fromEntries(locales.map((locale) => [locale, []])) as Record<
    Locale,
    any[]
  >;
  const agentMarkdownByPath: Record<string, string> = {};
  for (const project of projectDefinitions) {
    let englishProject: any;
    const repositoryCache = new Map<string, string>();
    for (const locale of locales) {
      const generated = await generateProject(
        project,
        locale,
        relatedArticlesByLibrary.get(project.id),
        repositoryCache,
      );
      if (locale === 'en') englishProject = generated;
      else if (requiresDocsTranslationReview(locale)) {
        for (const page of generated.pages) {
          const sourcePage = englishProject.pages.find((source: any) => source.slug === page.slug);
          if (!sourcePage)
            throw new Error(`${project.id}/${page.slug}: missing English source page`);
          page.html = preserveSourceHeadingLinks(
            sourcePage.html,
            page.html,
            `${project.id}/${page.slug} (${locale})`,
          );
        }
      }
      const generatedForApp = {
        ...generated,
        pages: generated.pages.map(({ markdown: _markdown, ...page }: any) => page),
      };
      if (!project.hostedUrl) {
        const localePrefix = docsLocalePrefix(locale);
        for (const page of generated.pages) {
          const markdown = `# ${page.title}\n\n${page.markdown.trim()}\n`;
          agentMarkdownByPath[`${localePrefix}${page.path}`] = markdown;
          if (page.slug === 'readme') {
            agentMarkdownByPath[`${localePrefix}${generated.path}`] = markdown;
          }
        }
      }
      projectsByLocale[locale].push(generatedForApp);
      if (!project.hostedUrl) {
        await writeFile(
          join(projectsDirectory, `${project.id}.${locale}.generated.ts`),
          `// Generated by scripts/generate-docs.ts. Do not edit.\nexport const PROJECT = ${JSON.stringify(generatedForApp, null, 2)} as const;\n`,
        );
      }
    }
  }

  const catalogs = Object.fromEntries(
    locales.map((locale) => [
      locale,
      projectsByLocale[locale].map(
        ({
          pages,
          name: _name,
          relatedArticles: _relatedArticles,
          headline: _headline,
          overview: _overview,
          overviewHtml: _overviewHtml,
          featuresHeading: _featuresHeading,
          features: _features,
          seoTitle: _seoTitle,
          demoUrl: _demoUrl,
          releaseNotesUrl: _releaseNotesUrl,
          entryGuideSlugs: _entryGuideSlugs,
          ...project
        }) => ({
          ...project,
          pages: pages.map(
            ({
              html,
              headings,
              codes,
              scrollMap,
              editUrl,
              file,
              seoTitle,
              seoDescription,
              updatedAt,
              demo,
              ...page
            }: any) => page,
          ),
        }),
      ),
    ]),
  ) as Record<Locale, any[]>;
  const categories = Object.fromEntries(
    locales.map((locale) => [
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
    `// Generated by scripts/generate-docs.ts. Do not edit.\n${locales.map((locale) => `export const PROJECT_CATEGORIES_${locale.toUpperCase()} = ${JSON.stringify(categories[locale], null, 2)} as const;\n\nexport const PROJECTS_${locale.toUpperCase()} = ${JSON.stringify(catalogs[locale], null, 2)} as const;\n`).join('\n')}\nexport const PROJECT_CATEGORIES_BY_LOCALE = {\n${locales.map((locale) => `  ${locale}: PROJECT_CATEGORIES_${locale.toUpperCase()},`).join('\n')}\n} as const;\n\nexport const PROJECTS_BY_LOCALE = {\n${locales.map((locale) => `  ${locale}: PROJECTS_${locale.toUpperCase()},`).join('\n')}\n} as const;\n`,
  );
  const loaderEntries = projectDefinitions
    .filter((project) => !project.hostedUrl)
    .map(
      (project) =>
        `  ${JSON.stringify(project.id)}: {\n${locales.map((locale) => `    ${locale}: () => import('./projects/${project.id}.${locale}.generated').then((module) => module.PROJECT),`).join('\n')}\n  },`,
    )
    .join('\n');
  await writeFile(
    join(generatedDirectory, 'project-loaders.generated.ts'),
    `// Generated by scripts/generate-docs.ts. Do not edit.\nexport const PROJECT_LOADERS = {\n${loaderEntries}\n} as const;\n`,
  );
  if (Object.keys(agentMarkdownByPath).length === 0) {
    throw new Error('No agent Markdown documentation was generated');
  }
  const agentMarkdownDirectory = join(root, 'workers/generated');
  await mkdir(agentMarkdownDirectory, { recursive: true });
  await writeFile(
    join(agentMarkdownDirectory, 'agent-markdown.generated.ts'),
    await formatWithPrettier(
      `// Generated by scripts/generate-docs.ts. Do not edit.\nexport const AGENT_MARKDOWN = ${JSON.stringify(agentMarkdownByPath, null, 2)} as const;\n`,
      { parser: 'typescript', printWidth: 100, singleQuote: true },
    ),
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
      updatedAtByPublicPath.set(
        publicPath,
        Object.fromEntries(
          locales.map((locale) => [
            locale,
            declaredPage.updatedAt?.[locale]
              ? assertValidContentUpdatedAt(
                  declaredPage.updatedAt[locale]!,
                  `${project.id}/${declaredPage.slug} (${locale})`,
                )
              : undefined,
          ]),
        ),
      );
    }
  }
  const sitemapEntries = canonicalPaths
    .map((path) => {
      const updatedAt = updatedAtByPublicPath.get(path);
      return locales
        .map(
          (locale) =>
            `  <url>\n    <loc>${SITE_CONFIG.origin}${localizedPublicPath(locale, path)}</loc>${formatSitemapLastmod(updatedAt?.[locale])}\n  </url>`,
        )
        .join('\n');
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
    `Generated ${pageCount * locales.length} localized documentation pages in ${projectDefinitions.filter((project) => !project.hostedUrl).length * locales.length} lazy project modules.`,
  );
}

void main();
