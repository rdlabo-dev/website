import { ComponentFixture, TestBed } from '@angular/core/testing';
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

  it('renders the rdlabo.dev brand and project catalog', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(TestBed.inject(Title).getTitle()).toBe(
      'Ionic, Angular, and Capacitor OSS Documentation | rdlabo',
    );
    expect(compiled.querySelector('h1')?.textContent).toContain('rdlabo.dev');
    expect(compiled.textContent).toContain('developed and maintained personally by rdlabo');
    expect(compiled.textContent).toContain('independent of the incorporated association');
    expect(compiled.querySelector('img[src="/assets/brand/rdlabo-logo.svg"]')).not.toBeNull();

    const cards = Array.from(compiled.querySelectorAll<HTMLAnchorElement>('li > a'));
    const groupedProjects = projectGroupsForLocale('en').flatMap((group) => group.projects);
    expect(cards.map((card) => card.getAttribute('href'))).toEqual(
      groupedProjects.map((project) => project.hostedUrl ?? project.path),
    );
    expect(cards.map((card) => card.querySelector('h3')?.textContent?.trim())).toEqual([
      'Ionic Docs Japanese',
      'Capacitor Docs Japanese',
      'Stripe',
      'Stripe Identity',
      'Stripe Terminal',
      'AdMob',
      'Facebook Login',
      'Local LLM',
      'Code Scanner',
      'Screenshot Event',
      'Printer',
      'Brother Print',
      'Ionic Angular Kit',
      'Ionic Angular Photo Editor',
      'Ionic Angular Scroll Header',
      'Angular CDK Scroll Strategies',
      'Ionic Theme iOS26',
      'Ionic Theme MD3',
      'Ionic Angular Collect Icons',
      'Workers Timezone',
      'Workers MySQL',
      'Workers Hono Kit',
      'ESLint Plugin Rules',
      'Docgen',
    ]);
    expect(compiled.querySelectorAll('app-project-icon')).toHaveLength(24);
  });

  it('keeps Japanese catalog metadata and lazy documentation in parity', async () => {
    const japaneseProjects = projectsForLocale('ja');
    const englishProjects = projectsForLocale('en');
    expect(japaneseProjects).toHaveLength(projectCatalog.length);
    expect(projectCatalog).toHaveLength(24);
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
    for (const projectId of [
      'capacitor-codescanner',
      'capacitor-screenshot-event',
      'capacitor-printer',
      'capacitor-brotherprint',
    ]) {
      expect(japaneseProjects.find((project) => project.id === projectId)?.pages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ slug: 'readme' }),
          expect.objectContaining({ slug: 'api', section: 'リファレンス' }),
        ]),
      );
    }
    expect(japaneseProjects.find((project) => project.id === 'stripe')?.pages[0].navTitle).toBe(
      '設定',
    );

    const admob = await loadProject('admob', 'ja');
    expect(admob?.pages.find((page) => page.slug === 'consent')?.html).toContain(
      '広告リクエストの前に同意を集める',
    );
    const facebookLogin = await loadProject('facebook-login', 'ja');
    expect(facebookLogin?.version).toBe('8.1.0');
    expect(facebookLogin?.pages.find((page) => page.slug === 'authentication')?.html).toContain(
      'Limited Login',
    );
    expect(facebookLogin?.pages.find((page) => page.slug === 'api')?.html).toContain(
      '<code>method</code> login(...)',
    );
    const eslint = await loadProject('eslint-plugin-rules', 'ja');
    expect(eslint?.version).toBe('22.0.0');
    expect(eslint?.pages.find((page) => page.slug === 'rules')?.html).toContain(
      'signal-use-as-signal-template',
    );
    const restrictTryBlock = eslint?.pages.find((page) => page.slug === 'rules/restrict-try-block');
    expect(restrictTryBlock?.path).toBe(
      '/projects/eslint-plugin-rules/docs/rules/restrict-try-block',
    );
    expect(restrictTryBlock?.html).toMatch(/オプション|Options/);
    expect(restrictTryBlock?.html).toContain('allowPromise');
    expect(restrictTryBlock?.html).toMatch(/誤り|Incorrect/i);
    const hono = await loadProject('workers-hono-kit', 'ja');
    expect(hono?.version).toBe('0.11.1');
    expect(hono?.pages.find((page) => page.slug === 'data-layer')?.html).toContain(
      'primaryHyperdrive',
    );
    const ionic = await loadProject('ionic-angular-kit', 'ja');
    expect(ionic?.version).toBe('22.0.0');
    expect(ionic?.pages.find((page) => page.slug === 'offline-realtime')?.html).toContain(
      'createOfflineAuthBridge',
    );
    const photoEditor = await loadProject('ionic-angular-photo-editor', 'ja');
    const photoEditorApi = photoEditor?.pages.find((page) => page.slug === 'api');
    expect(photoEditorApi?.section).toBe('リファレンス');
    expect(photoEditorApi?.html).toContain('<code>component</code> PhotoEditorPage');
    expect(photoEditorApi?.html).toContain('<code>class</code> PhotoFileService');
    const codeScanner = await loadProject('capacitor-codescanner', 'ja');
    const codeScannerApi = codeScanner?.pages.find((page) => page.slug === 'api');
    expect(codeScannerApi?.html).toContain('<code>method</code> present(...)');
    expect(codeScannerApi?.html).toMatch(/<code>interface<\/code>[\s\S]*?ScannerOption/);
    const iosTheme = await loadProject('ionic-theme-ios26', 'ja');
    expect(iosTheme?.version).toBe('9.1.0');
    expect(iosTheme?.pages.find((page) => page.slug === 'readme')?.html).toContain(
      'iosTransitionAnimation',
    );
    expect(iosTheme?.pages.find((page) => page.slug === 'using-ion-item-group')?.html).toContain(
      'md-ion-list-inset.css',
    );
    const md3Theme = await loadProject('ionic-theme-md3', 'ja');
    expect(md3Theme?.version).toBe('9.1.0');
    expect(md3Theme?.pages.find((page) => page.slug === 'readme')?.html).toContain(
      'mdTransitionAnimation',
    );
  });

  it('defines localized categories before adding non-Capacitor projects', () => {
    expect(projectCategoriesForLocale('en').map((category) => category.id)).toEqual([
      'translations',
      'capacitor-plugins',
      'frontend-tools',
      'developer-tools',
    ]);
    expect(projectCategoriesForLocale('ja').map((category) => category.label)).toEqual([
      'ドキュメント翻訳',
      'Capacitorプラグイン',
      'フロントエンドツール',
      '開発ツール',
    ]);
    expect(
      projectGroupsForLocale('en')
        .find((group) => group.id === 'translations')
        ?.projects.map((project) => project.id),
    ).toEqual(['ionic-docs', 'capacitor-docs']);
    expect(
      projectGroupsForLocale('en')
        .find((group) => group.id === 'frontend-tools')
        ?.projects.map((project) => project.id)
        .slice()
        .sort(),
    ).toEqual(
      [
        'ionic-angular-kit',
        'ionic-angular-photo-editor',
        'ionic-angular-scroll-header',
        'ngx-cdk-scroll-strategies',
        'ionic-theme-ios26',
        'ionic-theme-md3',
        'ionic-angular-collect-icons',
      ].sort(),
    );
    expect(
      projectGroupsForLocale('en')
        .find((group) => group.id === 'developer-tools')
        ?.projects.map((project) => project.id)
        .slice()
        .sort(),
    ).toEqual(['capacitor-docgen', 'eslint-plugin-rules', 'workers-hono-kit', 'workers-mysql', 'workers-timezone'].sort());
  });
});
