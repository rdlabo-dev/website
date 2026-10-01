import { Component, LOCALE_ID, PLATFORM_ID, TransferState } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App, INITIAL_DOCS_URL } from './app';
import { projectsForLocale } from './docs/docs-data';

@Component({ standalone: true, template: '' })
class StubPage {}

type GoogleAnalyticsWindow = Window & {
  gtag?: (...args: unknown[]) => void;
};

function mockMatchMedia(initialMatches: boolean) {
  let matches = initialMatches;
  let changeListener: ((event: MediaQueryListEvent) => void) | undefined;
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: () => ({
      get matches() {
        return matches;
      },
      addEventListener: vi.fn((_type: string, listener: (event: MediaQueryListEvent) => void) => {
        changeListener = listener;
      }),
      removeEventListener: vi.fn(),
    }),
  });
  return {
    setMatches(next: boolean) {
      matches = next;
      changeListener?.({ matches: next } as MediaQueryListEvent);
    },
  };
}

describe('App', () => {
  beforeEach(async () => {
    mockMatchMedia(false);
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([
          { path: '', pathMatch: 'full', component: StubPage },
          { path: 'support', component: StubPage },
          { path: 'projects/capacitor-stripe', component: StubPage },
          { path: 'projects/capacitor-stripe/docs/configuration', component: StubPage },
          { path: 'projects/capacitor-admob', component: StubPage },
          { path: 'projects/eslint-plugin-rules/docs/rules', component: StubPage },
          {
            path: 'projects/eslint-plugin-rules/docs/rules/signal-use-as-signal',
            component: StubPage,
          },
          { path: 'projects/workers-mysql', component: StubPage, canActivate: [() => false] },
        ]),
      ],
    }).compileComponents();
  });

  afterEach(() => {
    delete (window as GoogleAnalyticsWindow).gtag;
    document.querySelector('dialog[data-search-test]')?.remove();
  });

  it('sends one page_view for each completed router navigation', async () => {
    const gtag = vi.fn();
    (window as GoogleAnalyticsWindow).gtag = gtag;
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    document.title = 'Tracked page';

    await router.navigateByUrl('/projects/capacitor-admob?source=test');

    expect(gtag).toHaveBeenCalledTimes(1);
    expect(gtag).toHaveBeenCalledWith('event', 'page_view', {
      page_title: 'Tracked page',
      page_location: window.location.href,
      page_path: '/projects/capacitor-admob?source=test',
    });
    fixture.destroy();
  });

  it('preserves the logo, global links, footer, and complete library catalog', async () => {
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl('/');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('header .docs-brand img')?.getAttribute('src')).toBe(
      '/assets/brand/rdlabo-logo.svg',
    );
    expect(compiled.querySelector('header .docs-brand')?.textContent).toContain('rdlabo.dev');
    const projects = projectsForLocale('en').filter((project) => !project.hostedUrl);
    const links = compiled.querySelectorAll<HTMLAnchorElement>(
      'app-library-picker a[id^="project-link-"]',
    );
    expect(Array.from(links, (link) => link.id).sort()).toEqual(
      projects.map((project) => `project-link-${project.id}`).sort(),
    );
    for (const project of projects) {
      expect(compiled.querySelector(`#project-link-${project.id}`)?.getAttribute('href')).toBe(
        project.path,
      );
    }
    expect(
      compiled.querySelector('a[href="https://rdlabo.dev/articles"]')?.textContent?.trim(),
    ).toBe('Articles');
    expect(compiled.querySelector('app-project-navigation')).toBeNull();
    expect(compiled.querySelector('footer')?.textContent).toContain(
      'Personal open source projects maintained by rdlabo',
    );
    expect(compiled.querySelector('footer')?.textContent).toMatch(/© \d{4} rdlabo/);
  });

  it('keeps the prerendered project navigation during startup before the router finishes', async () => {
    const state = TestBed.inject(TransferState);
    const path = '/projects/capacitor-stripe/docs/configuration';
    state.set(INITIAL_DOCS_URL, path);
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const track = compiled.querySelector('.docs-navigation-track')!;
    expect(TestBed.inject(Router).url).toBe('/');
    expect(track.classList.contains('is-detail')).toBe(true);
    expect(track.classList.contains('animate-ready')).toBe(false);
    expect(compiled.querySelector('.docs-active-project')?.textContent).toContain('Stripe');
    expect(compiled.querySelector('app-library-picker a')?.getAttribute('href')).toBe(path);
    expect(compiled.querySelector('app-library-picker')?.textContent).not.toContain(
      'Workers MySQL',
    );
    expect(state.hasKey(INITIAL_DOCS_URL)).toBe(false);

    await TestBed.inject(Router).navigateByUrl(path);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(track.classList.contains('is-detail')).toBe(true);
    compiled.querySelector<HTMLButtonElement>('.project-navigation-back')!.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(track.classList.contains('is-detail')).toBe(false);
    expect(track.classList.contains('animate-ready')).toBe(true);
  });

  it('transfers the resolved server route rather than the router startup path', async () => {
    TestBed.overrideProvider(PLATFORM_ID, { useValue: 'server' });
    const fixture = TestBed.createComponent(App);
    const path = '/projects/capacitor-stripe/docs/configuration';
    await TestBed.inject(Router).navigateByUrl(path);
    fixture.detectChanges();
    expect(JSON.parse(TestBed.inject(TransferState).toJson())[INITIAL_DOCS_URL]).toBe(path);
  });

  it('renders only the current project pages when entering a deep link directly', async () => {
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl('/projects/capacitor-stripe/docs/configuration');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-project-navigation')?.textContent).toContain('Stripe');
    expect(compiled.querySelector('app-project-navigation')?.textContent).toContain('PaymentSheet');
    expect(compiled.querySelector('app-project-navigation')?.textContent).toContain(
      'Server Integration',
    );
    expect(compiled.querySelector('.docs-navigation-track')?.classList.contains('is-detail')).toBe(
      true,
    );
    expect(
      compiled
        .querySelector('app-library-picker')
        ?.closest('.docs-navigation-slide')
        ?.hasAttribute('inert'),
    ).toBe(true);
  });

  it('marks only the current nested page, including query and fragment navigation', async () => {
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl(
      '/projects/eslint-plugin-rules/docs/rules/signal-use-as-signal?source=search#example',
    );
    fixture.detectChanges();
    await fixture.whenStable();
    const links = (fixture.nativeElement as HTMLElement).querySelectorAll(
      '.project-navigation-pages [aria-current="page"]',
    );
    expect(links).toHaveLength(1);
    expect(links[0]?.textContent?.trim()).toBe('signal-use-as-signal');
  });

  it('opens the library picker without navigating and keeps the current page when reselecting its library', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/projects/capacitor-stripe/docs/configuration');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    compiled.querySelector<HTMLButtonElement>('.project-navigation-back')!.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(router.url).toBe('/projects/capacitor-stripe/docs/configuration');
    expect(document.activeElement).toBe(compiled.querySelector('#project-link-stripe'));
    expect(
      compiled
        .querySelector('app-project-navigation')
        ?.closest('.docs-navigation-slide')
        ?.hasAttribute('inert'),
    ).toBe(true);
    expect(compiled.querySelector('.docs-rail')?.hasAttribute('inert')).toBe(false);
    const link = compiled.querySelector<HTMLAnchorElement>('#project-link-stripe')!;
    expect(link.getAttribute('href')).toBe(router.url);
    link.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(router.url).toBe('/projects/capacitor-stripe/docs/configuration');
    expect(compiled.querySelector('.docs-navigation-track')?.classList.contains('is-detail')).toBe(
      true,
    );
    expect(document.activeElement).toBe(
      compiled.querySelector('.project-navigation-pages [aria-current="page"]'),
    );
  });

  it('collapses the library catalog after navigating to a different library', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    compiled.querySelector<HTMLAnchorElement>('#project-link-stripe')!.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(router.url).toBe('/projects/capacitor-stripe');
    expect(compiled.querySelector('app-project-navigation')?.textContent).toContain('PaymentSheet');
    expect(compiled.querySelector('.docs-navigation-track')?.classList.contains('is-detail')).toBe(
      true,
    );
    compiled
      .querySelector<HTMLButtonElement>(
        '.docs-rail-categories button[aria-label="Capacitor plugins"]',
      )!
      .click();
    fixture.detectChanges();
    compiled.querySelector<HTMLAnchorElement>('#project-link-admob')!.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(router.url).toBe('/projects/capacitor-admob');
    expect(compiled.querySelector('app-project-navigation')?.textContent).toContain('Banner Ads');
    expect(compiled.querySelector('app-project-navigation')?.textContent).not.toContain(
      'PaymentSheet',
    );
    expect(compiled.querySelector('.docs-navigation-track')?.classList.contains('is-detail')).toBe(
      true,
    );
  });

  it('uses the primary category rail to show libraries without a filter field', async () => {
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl('/');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    compiled
      .querySelector<HTMLButtonElement>(
        '.docs-rail-categories button[aria-label="Developer tools"]',
      )!
      .click();
    await fixture.whenStable();
    fixture.detectChanges();
    const links = compiled.querySelectorAll('app-library-picker a');
    expect(links).toHaveLength(
      projectsForLocale('en').filter(
        (project) => project.category === 'developer-tools' && !project.hostedUrl,
      ).length,
    );
    expect(compiled.querySelector('#project-link-workers-mysql')).not.toBeNull();
    expect(compiled.querySelector('#project-link-stripe')).toBeNull();
    expect(compiled.querySelector('app-library-picker input')).toBeNull();
    compiled
      .querySelector<HTMLButtonElement>(
        '.docs-rail-categories button[aria-label="Browse all libraries"]',
      )!
      .click();
    await fixture.whenStable();
    expect(compiled.querySelector('#project-link-stripe')).not.toBeNull();
  });

  it('keeps the picker and current page when a library navigation is cancelled', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/projects/capacitor-stripe/docs/configuration');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    compiled.querySelector<HTMLButtonElement>('.docs-rail-categories button')!.click();
    fixture.detectChanges();
    compiled.querySelector<HTMLAnchorElement>('#project-link-workers-mysql')!.click();
    await fixture.whenStable();
    expect(router.url).toBe('/projects/capacitor-stripe/docs/configuration');
    expect(compiled.querySelector('.docs-navigation-track')?.classList.contains('is-detail')).toBe(
      false,
    );
    expect(compiled.querySelector('app-project-navigation')?.textContent).toContain('Stripe');
  });

  it('keeps native modifier-click behavior while the picker is open', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/projects/capacitor-stripe/docs/configuration');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    compiled.querySelector<HTMLButtonElement>('.project-navigation-back')!.click();
    fixture.detectChanges();
    compiled
      .querySelector<HTMLAnchorElement>('#project-link-admob')!
      .dispatchEvent(new MouseEvent('click', { bubbles: true, ctrlKey: true }));
    await fixture.whenStable();
    expect(router.url).toBe('/projects/capacitor-stripe/docs/configuration');
    expect(compiled.querySelector('.docs-navigation-track')?.classList.contains('is-detail')).toBe(
      false,
    );
  });

  it('links to the matching Japanese route', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/projects/capacitor-stripe/docs/configuration');
    fixture.detectChanges();

    expect(
      (fixture.nativeElement as HTMLElement)
        .querySelector<HTMLAnchorElement>('a[hreflang="ja"]')
        ?.getAttribute('href'),
    ).toBe('/ja/projects/capacitor-stripe/docs/configuration');
  });

  it('switches EN home language to /ja without a trailing slash', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/');
    fixture.detectChanges();

    expect(
      (fixture.nativeElement as HTMLElement)
        .querySelector<HTMLAnchorElement>('a[hreflang="ja"]')
        ?.getAttribute('href'),
    ).toBe('/ja');
  });

  it('uses slashless locale home links in the header and sidebar', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: LOCALE_ID, useValue: 'ja' },
        provideRouter([
          { path: '', pathMatch: 'full', component: StubPage },
          { path: 'projects/capacitor-stripe', component: StubPage },
          { path: 'projects/capacitor-stripe/docs/configuration', component: StubPage },
          { path: 'projects/capacitor-admob', component: StubPage },
        ]),
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const brand = compiled.querySelector<HTMLAnchorElement>('header a.docs-brand')!;
    const docsHome = compiled.querySelector<HTMLAnchorElement>('header a.docs-home-link')!;
    const allProjects = compiled.querySelector<HTMLAnchorElement>(
      'nav[aria-label="Primary navigation"] > a',
    )!;
    expect(brand.href).toBe('https://rdlabo.dev/');
    expect(brand.target).toBe('');
    expect(docsHome.getAttribute('href')).toBe('/ja');
    expect(docsHome.textContent?.trim()).toBe('docs');
    expect(allProjects.getAttribute('href')).toBe('/ja');
    expect(allProjects.getAttribute('aria-current')).toBe('page');
  });

  it('links the Japanese header brand to the main site in the same tab', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: LOCALE_ID, useValue: 'ja' },
        provideRouter([
          { path: '', pathMatch: 'full', component: StubPage },
          { path: 'projects/capacitor-stripe', component: StubPage },
          { path: 'projects/capacitor-stripe/docs/configuration', component: StubPage },
          { path: 'projects/capacitor-admob', component: StubPage },
        ]),
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/projects/capacitor-stripe');
    fixture.detectChanges();

    const brand = (fixture.nativeElement as HTMLElement).querySelector<HTMLAnchorElement>(
      'header a.docs-brand',
    )!;
    const docsHome = (fixture.nativeElement as HTMLElement).querySelector<HTMLAnchorElement>(
      'header a.docs-home-link',
    )!;
    expect(brand.href).toBe('https://rdlabo.dev/');
    expect(brand.target).toBe('');
    expect(docsHome.getAttribute('href')).toBe('/ja');
    expect(router.url).toBe('/projects/capacitor-stripe');
  });

  it('links the English header brand to the main site in the same tab', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/projects/capacitor-stripe');
    fixture.detectChanges();

    const brand = (fixture.nativeElement as HTMLElement).querySelector<HTMLAnchorElement>(
      'header a.docs-brand',
    )!;
    const docsHome = (fixture.nativeElement as HTMLElement).querySelector<HTMLAnchorElement>(
      'header a.docs-home-link',
    )!;
    expect(brand.href).toBe('https://rdlabo.dev/');
    expect(brand.target).toBe('');
    expect(docsHome.getAttribute('href')).toBe('/');
    expect(docsHome.textContent?.trim()).toBe('docs');
    expect(router.url).toBe('/projects/capacitor-stripe');
  });

  it('marks exactly one sidebar location with aria-current for each docs route kind', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    const compiled = fixture.nativeElement as HTMLElement;
    const currentLinks = () =>
      Array.from(
        compiled.querySelectorAll<HTMLAnchorElement>('#docs-sidebar a[aria-current="page"]'),
      );

    await router.navigateByUrl('/');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(currentLinks().map((link) => link.textContent?.trim())).toEqual(['Home']);

    await router.navigateByUrl('/support');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(currentLinks().map((link) => link.textContent?.trim())).toEqual(['Sponsor']);

    await router.navigateByUrl('/projects/capacitor-stripe');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(currentLinks().map((link) => link.textContent?.trim())).toEqual(['Overview']);

    await router.navigateByUrl('/projects/capacitor-stripe/docs/configuration');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(currentLinks()).toHaveLength(1);
    expect(currentLinks()[0]?.textContent?.trim()).toBe('Configuration');
    expect(
      compiled
        .querySelector<HTMLAnchorElement>('a[href="/projects/capacitor-stripe"]')
        ?.getAttribute('aria-current'),
    ).toBeNull();
  });

  it('keeps the empty pagefind search host in the DOM for production injection', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const trigger = (fixture.nativeElement as HTMLElement).querySelector('pagefind-modal-trigger');
    expect(trigger).not.toBeNull();
    expect(trigger?.childElementCount).toBe(0);
  });

  it('removes a closed mobile menu from focus order and restores focus on Escape', async () => {
    mockMatchMedia(true);
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const menu = compiled.querySelector<HTMLElement>('#docs-sidebar')!;
    const button = compiled.querySelector<HTMLButtonElement>(
      'button[aria-controls="docs-sidebar"]',
    )!;

    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(menu.hasAttribute('inert')).toBe(true);
    expect(menu.getAttribute('aria-hidden')).toBe('true');
    button.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(menu.hasAttribute('inert')).toBe(false);
    expect(document.activeElement).toBe(menu.querySelector('.library-picker-list a'));

    button.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(menu.hasAttribute('inert')).toBe(true);
    expect(document.activeElement).toBe(button);

    button.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(menu.hasAttribute('inert')).toBe(false);
    expect(document.activeElement).toBe(menu.querySelector('.library-picker-list a'));

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(menu.hasAttribute('inert')).toBe(true);
    expect(document.activeElement).toBe(button);
  });

  it('reveals the current document when opening or reselecting its library after the viewport shrinks', async () => {
    mockMatchMedia(true);
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl(
      '/projects/eslint-plugin-rules/docs/rules/signal-use-as-signal',
    );
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const navigation = compiled.querySelector<HTMLElement>('.project-navigation-pages')!;
    const current = navigation.querySelector<HTMLAnchorElement>('[aria-current="page"]')!;
    navigation.scrollTop = 600;
    vi.spyOn(navigation, 'getBoundingClientRect').mockReturnValue(new DOMRect(64, 170, 255, 398));
    vi.spyOn(current, 'getBoundingClientRect').mockImplementation(
      () => new DOMRect(74, 1400 - navigation.scrollTop, 235, 40),
    );

    compiled.querySelector<HTMLButtonElement>('button[aria-controls="docs-sidebar"]')!.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(document.activeElement).toBe(current);
    expect(navigation.scrollTop).toBe(884);
    expect(navigation.scrollLeft).toBe(0);
    expect(compiled.querySelector('.docs-navigation-pane')?.scrollLeft).toBe(0);

    compiled
      .querySelector<HTMLButtonElement>(
        '.docs-rail-categories button[aria-label="Developer tools"]',
      )!
      .click();
    fixture.detectChanges();
    await fixture.whenStable();
    navigation.scrollTop = 600;
    compiled.querySelector<HTMLAnchorElement>('#project-link-eslint-plugin-rules')!.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.activeElement).toBe(current);
    expect(navigation.scrollTop).toBe(884);
    expect(compiled.querySelector('.docs-navigation-pane')?.scrollLeft).toBe(0);
  });

  it('keeps the mobile menu open after library selection and closes it after page selection', async () => {
    mockMatchMedia(true);
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const menu = compiled.querySelector<HTMLElement>('#docs-sidebar')!;
    const button = compiled.querySelector<HTMLButtonElement>(
      'button[aria-controls="docs-sidebar"]',
    )!;
    button.click();
    fixture.detectChanges();
    await fixture.whenStable();
    compiled.querySelector<HTMLAnchorElement>('#project-link-stripe')!.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(router.url).toBe('/projects/capacitor-stripe');
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(menu.hasAttribute('inert')).toBe(false);
    expect(document.activeElement).toBe(compiled.querySelector('app-project-navigation a'));
    compiled
      .querySelector<HTMLAnchorElement>(
        'app-project-navigation a[href="/projects/capacitor-stripe/docs/configuration"]',
      )!
      .click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(router.url).toBe('/projects/capacitor-stripe/docs/configuration');
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(menu.hasAttribute('inert')).toBe(true);
    expect(document.activeElement).toBe(button);
  });

  it('lets the search dialog own Tab and Escape while the mobile menu is open', async () => {
    mockMatchMedia(true);
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const button = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      'button[aria-controls="docs-sidebar"]',
    )!;
    button.click();
    fixture.detectChanges();
    await fixture.whenStable();
    const dialog = document.createElement('dialog');
    dialog.setAttribute('open', '');
    dialog.dataset['searchTest'] = '';
    const input = document.createElement('input');
    dialog.appendChild(input);
    document.body.appendChild(dialog);
    input.focus();
    const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    input.dispatchEvent(tab);
    expect(tab.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(input);
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement).toBe(input);
  });

  it('ignores Escape on desktop, then closes and restores focus when the viewport becomes mobile', async () => {
    const media = mockMatchMedia(false);
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const menu = compiled.querySelector<HTMLElement>('#docs-sidebar')!;
    const button = compiled.querySelector<HTMLButtonElement>(
      'button[aria-controls="docs-sidebar"]',
    )!;
    const link = menu.querySelector<HTMLAnchorElement>('a')!;

    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(menu.hasAttribute('inert')).toBe(false);
    link.focus();
    expect(document.activeElement).toBe(link);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(menu.hasAttribute('inert')).toBe(false);
    expect(menu.hasAttribute('aria-hidden')).toBe(false);
    expect(document.activeElement).toBe(link);

    media.setMatches(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(menu.hasAttribute('inert')).toBe(true);
    expect(menu.getAttribute('aria-hidden')).toBe('true');
    expect(document.activeElement).toBe(button);
  });
});
