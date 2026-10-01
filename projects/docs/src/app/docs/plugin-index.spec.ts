import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LOCALE_ID } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import {
  loadProject,
  projectCatalog,
  projectCategoriesForLocale,
  projectGroupsForLocale,
  projectsForLocale,
} from './docs-data';
import { PluginIndexComponent } from './plugin-index';
import { PUBLISHED_DOCS_LOCALES } from '../../../../../shared/docs-locales';

describe('PluginIndexComponent', () => {
  let fixture: ComponentFixture<PluginIndexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PluginIndexComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(PluginIndexComponent);
    fixture.detectChanges();
  });

  it('renders documentation categories and project links', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(TestBed.inject(Title).getTitle()).toBe(
      'Cloudflare Workers, Ionic & Capacitor OSS Docs | rdlabo',
    );
    expect(compiled.querySelector('h1')?.textContent).toContain('Documentation');
    expect(compiled.textContent).toContain('developed and maintained personally by rdlabo');
    expect(compiled.textContent).toContain('independent of the incorporated association');
    const categoryLinks = compiled.querySelectorAll<HTMLAnchorElement>('.category-nav a');
    expect(categoryLinks.length).toBe(projectGroupsForLocale('en').length);
    for (const link of categoryLinks) {
      const section = compiled.querySelector(link.getAttribute('href')!);
      expect(section?.querySelector('h2')?.textContent?.trim()).toBe(link.textContent?.trim());
    }

    const cards = Array.from(compiled.querySelectorAll<HTMLAnchorElement>('li > a'));
    const groupedProjects = projectGroupsForLocale('en').flatMap((group) => group.projects);
    expect(cards.map((card) => card.getAttribute('href'))).toEqual(
      groupedProjects.map((project) => project.hostedUrl ?? project.path),
    );
    expect(cards.map((card) => card.querySelector('h3')?.textContent?.trim())).toEqual(
      groupedProjects.map((project) => project.shortName),
    );
    expect(compiled.querySelectorAll('app-project-icon')).toHaveLength(groupedProjects.length);
  });

  it('keeps Japanese catalog metadata and lazy documentation in parity', async () => {
    const japaneseProjects = projectsForLocale('ja');
    const englishProjects = projectsForLocale('en');
    expect(japaneseProjects).toHaveLength(projectCatalog.length);
    expect(englishProjects.find((project) => project.id === 'ionic-docs')).toEqual(
      expect.objectContaining({
        category: 'translations',
        shortName: 'Ionic Docs Japanese',
        packageName: 'Authorized Japanese translation',
      }),
    );
    expect(englishProjects.find((project) => project.id === 'capacitor-docs')).toEqual(
      expect.objectContaining({
        category: 'translations',
        shortName: 'Capacitor Docs Japanese',
        packageName: 'Authorized Japanese translation',
      }),
    );
    expect(japaneseProjects.find((project) => project.id === 'ionic-docs')).toEqual(
      expect.objectContaining({
        category: 'translations',
        shortName: 'Ionic Docs 日本語版',
        packageName: 'Authorized Japanese translation',
      }),
    );
    expect(japaneseProjects.find((project) => project.id === 'capacitor-docs')).toEqual(
      expect.objectContaining({
        category: 'translations',
        shortName: 'Capacitor Docs 日本語版',
        packageName: 'Authorized Japanese translation',
      }),
    );
    expect(japaneseProjects.flatMap((project) => project.pages)).toHaveLength(
      projectCatalog.flatMap((project) => project.pages).length,
    );
    const apiProjects = japaneseProjects.filter((project) =>
      project.pages.some((page) => page.slug === 'api'),
    );
    for (const project of apiProjects) {
      expect(project.pages).toEqual(
        expect.arrayContaining([expect.objectContaining({ slug: 'api', section: 'リファレンス' })]),
      );
    }
    const projectsWithApi = await Promise.all(
      apiProjects.map((project) => loadProject(project.id, 'ja')),
    );
    for (const project of projectsWithApi) {
      expect(project?.pages.find((page) => page.slug === 'api')?.html).toContain(
        'class="api-entry"',
      );
    }
    for (const summary of japaneseProjects.filter((project) => !project.hostedUrl)) {
      const project = await loadProject(summary.id, 'ja');
      expect(project).toBeDefined();
      expect(project?.version).toBe(summary.version);
      expect(project?.pages.map((page) => page.path)).toEqual(
        summary.pages.map((page) => page.path),
      );
      expect(project?.pages.every((page) => page.html.trim().length > 0)).toBe(true);
    }
  });

  it('groups each catalog project exactly once with localized category labels', () => {
    const english = projectCategoriesForLocale('en');
    const japanese = projectCategoriesForLocale('ja');
    expect(japanese.map((category) => category.id)).toEqual(english.map((category) => category.id));
    expect(japanese.every((category) => category.label.trim().length > 0)).toBe(true);
    for (const { code: locale } of PUBLISHED_DOCS_LOCALES) {
      const groups = projectGroupsForLocale(locale);
      const projects = groups.flatMap((group) => group.projects);
      expect(projects.map((project) => project.id).sort()).toEqual(
        projectCatalog.map((project) => project.id).sort(),
      );
      expect(new Set(projects.map((project) => project.id)).size).toBe(projects.length);
      for (const group of groups) {
        expect(group.projects.every((project) => project.category === group.id)).toBe(true);
      }
    }
  });

  it.each(PUBLISHED_DOCS_LOCALES)('loads every $code document from its own locale catalog', async ({ code }) => {
    const englishProjects = projectsForLocale('en');
    const summaries = projectsForLocale(code);
    expect(summaries.map(({ id }) => id)).toEqual(englishProjects.map(({ id }) => id));
    for (const summary of summaries.filter((project) => !project.hostedUrl)) {
      const project = await loadProject(summary.id, code);
      expect(project?.path).toBe(summary.path);
      expect(project?.description).toBe(summary.description);
      expect(project?.pages.map(({ title, navTitle, section, path }) => ({ title, navTitle, section, path }))).toEqual(summary.pages.map(({ title, navTitle, section, path }) => ({ title, navTitle, section, path })));
      expect(project?.pages.map(({ path }) => path)).toEqual(summary.pages.map(({ path }) => path));
      expect(project?.pages.every(({ html }) => html.trim().length > 0)).toBe(true);
    }
  });
});

describe('localized project links', () => {
  it.each(PUBLISHED_DOCS_LOCALES)('keeps $code when opening internal cards and preserves external destinations', async ({ code, subPath }) => {
    await TestBed.configureTestingModule({
      imports: [PluginIndexComponent],
      providers: [provideRouter([]), { provide: LOCALE_ID, useValue: code }],
    }).compileComponents();
    const fixture = TestBed.createComponent(PluginIndexComponent);
    fixture.detectChanges();
    const cards = [...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLAnchorElement>('.catalog-card')];
    const projects = projectGroupsForLocale(code).flatMap(({ projects }) => projects);
    expect(cards).toHaveLength(projects.length);
    for (const [index, project] of projects.entries()) {
      expect(cards[index].getAttribute('href')).toBe(project.hostedUrl ?? `${subPath ? `/${subPath}` : ''}${project.path}`);
      expect(cards[index].target).toBe(project.hostedUrl ? '_blank' : '');
      expect(cards[index].rel).toBe(project.hostedUrl ? 'noopener noreferrer' : '');
    }
  });
});
