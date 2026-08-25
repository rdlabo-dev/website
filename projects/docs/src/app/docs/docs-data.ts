import {
  PROJECT_CATEGORIES_EN,
  PROJECT_CATEGORIES_JA,
  PROJECTS_EN,
  PROJECTS_JA,
} from '../generated/project-catalog.generated';
import { PROJECT_LOADERS } from '../generated/project-loaders.generated';

export type ProjectCategory =
  | 'translations'
  | 'capacitor-plugins'
  | 'frontend-tools'
  | 'developer-tools';
export type ProjectIcon =
  'payments' | 'identity' | 'terminal' | 'ads' | 'lint' | 'server' | 'app' | 'theme' | 'docs';

export interface CodeSample {
  file: string;
  lines: string[];
}

export interface ScrollMapEntry {
  id: string;
  activeLine: Record<string, readonly number[]>;
}

export interface DocsHeading {
  id: string;
  text: string;
  level: 2 | 3 | 4;
}

export interface ProjectFeature {
  title: string;
  description: string;
}

export interface RelatedArticle {
  slug: string;
  title: string;
  description: string;
  publishedDate: string;
  url: string;
}

export interface InteractiveDemo {
  url: string;
  title: string;
}

export interface ProjectCategorySummary {
  id: ProjectCategory;
  label: string;
  description: string;
  order: number;
}

export interface ProjectCategoryGroup extends ProjectCategorySummary {
  projects: readonly ProjectSummary[];
}

export interface DocsPageSummary {
  title: string;
  navTitle: string;
  seoTitle?: string;
  updatedAt?: string;
  slug: string;
  section: string;
  path: string;
  demo?: InteractiveDemo;
}

export interface DocsPage extends DocsPageSummary {
  file: string;
  html: string;
  headings: readonly DocsHeading[];
  codes: readonly CodeSample[];
  scrollMap: readonly ScrollMapEntry[];
  editUrl: string;
}

export interface ProjectSummary {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  packageName: string;
  repositoryUrl: string;
  demoUrl?: string;
  hostedUrl?: string;
  category: ProjectCategory;
  icon: ProjectIcon;
  version: string;
  seoTitle?: string;
  description: string;
  headline: string;
  overview: string;
  overviewHtml?: string;
  featuresHeading: string;
  features: readonly ProjectFeature[];
  relatedArticles?: readonly RelatedArticle[];
  path: string;
  pages: readonly DocsPageSummary[];
}

export interface ProjectDocs extends Omit<ProjectSummary, 'pages'> {
  pages: readonly DocsPage[];
}

type ProjectLoader = () => Promise<ProjectDocs>;
const loaders = PROJECT_LOADERS as unknown as Record<
  string,
  { en: ProjectLoader; ja: ProjectLoader }
>;
const cache = new Map<string, Promise<ProjectDocs>>();

export const projectCatalog = PROJECTS_EN as unknown as readonly ProjectSummary[];
const japaneseProjectCatalog = PROJECTS_JA as unknown as readonly ProjectSummary[];

export function projectsForLocale(locale: string): readonly ProjectSummary[] {
  return locale.toLowerCase().startsWith('ja') ? japaneseProjectCatalog : projectCatalog;
}

export function projectCategoriesForLocale(locale: string): readonly ProjectCategorySummary[] {
  return (locale.toLowerCase().startsWith('ja')
    ? PROJECT_CATEGORIES_JA
    : PROJECT_CATEGORIES_EN) as unknown as readonly ProjectCategorySummary[];
}

export function projectGroupsForLocale(locale: string): readonly ProjectCategoryGroup[] {
  const categories = projectCategoriesForLocale(locale);
  const projects = projectsForLocale(locale);
  return categories
    .map((category) => ({
      ...category,
      projects: projects.filter((project) => project.category === category.id),
    }))
    .filter((category) => category.projects.length > 0)
    .sort((left, right) => left.order - right.order);
}

export function findProjectSummary(id: string, locale = 'en'): ProjectSummary | undefined {
  return projectsForLocale(locale).find((project) => project.id === id || project.slug === id);
}

export async function loadProject(id: string, locale = 'en'): Promise<ProjectDocs | undefined> {
  const summary = findProjectSummary(id, locale);
  if (!summary) return undefined;
  const language = locale.toLowerCase().startsWith('ja') ? 'ja' : 'en';
  const key = `${summary.id}:${language}`;
  const loader = loaders[summary.id]?.[language];
  if (!loader) return undefined;
  let loaded = cache.get(key);
  if (!loaded) {
    loaded = loader();
    cache.set(key, loaded);
  }
  return loaded;
}

export function sectionsFor(project: Pick<ProjectSummary, 'pages'>): {
  name: string;
  pages: readonly DocsPageSummary[];
}[] {
  return [...new Set(project.pages.map((page) => page.section))].map((name) => ({
    name,
    pages: project.pages.filter((page) => page.section === name),
  }));
}
