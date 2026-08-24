import { Component, LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';

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
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([
          { path: '', pathMatch: 'full', component: StubPage },
          { path: 'support', component: StubPage },
          { path: 'projects/capacitor-stripe', component: StubPage },
          { path: 'projects/capacitor-stripe/docs/configuration', component: StubPage },
          { path: 'projects/capacitor-admob', component: StubPage },
        ]),
      ],
    }).compileComponents();
  });

  afterEach(() => {
    delete (window as GoogleAnalyticsWindow).gtag;
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

  it('renders the new brand and all projects in the sidebar', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('header')?.textContent).toContain('rdlabo.dev');
    const projectButtons = compiled.querySelectorAll<HTMLButtonElement>(
      'nav[aria-label="Primary navigation"] button[id^="project-button-"]',
    );
    expect(projectButtons).toHaveLength(19);
    for (const button of Array.from(projectButtons)) {
      expect(button.getAttribute('aria-expanded')).toBe('false');
      expect(button.getAttribute('aria-controls')).toMatch(/^project-panel-/);
      expect(button.getAttribute('aria-label')).toContain('navigation for');
    }
    const articlesLink = compiled.querySelector<HTMLAnchorElement>(
      'nav[aria-label="Primary navigation"] a[href="https://rdlabo.dev/articles"]',
    );
    expect(articlesLink?.target).toBe('');
    expect(articlesLink?.textContent?.trim()).toBe('Articles');
    const projectOverviewLinks = compiled.querySelectorAll<HTMLAnchorElement>(
      'nav[aria-label="Primary navigation"] a[href^="/projects/"]',
    );
    expect(projectOverviewLinks.length).toBeGreaterThanOrEqual(19);
    const panels = compiled.querySelectorAll<HTMLElement>('[id^="project-panel-"]');
    expect(panels).toHaveLength(19);
    for (const panel of Array.from(panels)) {
      expect(panel.hasAttribute('inert')).toBe(true);
      expect(panel.getAttribute('aria-hidden')).toBe('true');
    }
    expect(compiled.textContent).toContain('Stripe Identity');
    expect(compiled.textContent).toContain('AdMob');
    expect(compiled.textContent).toContain('ESLint Plugin Rules');
    expect(compiled.textContent).toContain('Workers Hono Kit');
    expect(compiled.textContent).toContain('Ionic Angular Kit');
    const footer = compiled.querySelector('footer')?.textContent ?? '';
    expect(footer).toContain('Personal open source projects maintained by rdlabo');
    expect(footer).toContain('© 2026 rdlabo');
    expect(footer).not.toContain('GENERAL INC. ASSOCIATION');
  });

  it('shows only the active project documentation tree', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/projects/capacitor-stripe');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const stripeButton = compiled.querySelector<HTMLButtonElement>('#project-button-stripe')!;
    const stripePanel = compiled.querySelector<HTMLElement>('#project-panel-stripe')!;
    const admobButton = compiled.querySelector<HTMLButtonElement>('#project-button-admob')!;
    const admobPanel = compiled.querySelector<HTMLElement>('#project-panel-admob')!;

    expect(stripeButton.getAttribute('aria-expanded')).toBe('true');
    expect(stripeButton.getAttribute('aria-controls')).toBe('project-panel-stripe');
    expect(stripePanel.hasAttribute('inert')).toBe(false);
    expect(stripePanel.getAttribute('aria-hidden')).toBe('false');
    expect(admobButton.getAttribute('aria-expanded')).toBe('false');
    expect(admobPanel.hasAttribute('inert')).toBe(true);
    expect(admobPanel.getAttribute('aria-hidden')).toBe('true');
    expect(compiled.textContent).toContain('PaymentSheet');
    expect(compiled.textContent).toContain('Server Integration');
  });

  it('toggles project accordion panels without navigating', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const stripeButton = compiled.querySelector<HTMLButtonElement>('#project-button-stripe')!;
    const stripePanel = compiled.querySelector<HTMLElement>('#project-panel-stripe')!;
    const admobButton = compiled.querySelector<HTMLButtonElement>('#project-button-admob')!;
    const admobPanel = compiled.querySelector<HTMLElement>('#project-panel-admob')!;

    stripeButton.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(router.url).toBe('/');
    expect(stripeButton.getAttribute('aria-expanded')).toBe('true');
    expect(stripePanel.hasAttribute('inert')).toBe(false);
    expect(stripePanel.getAttribute('aria-hidden')).toBe('false');
    expect(compiled.textContent).toContain('PaymentSheet');

    stripeButton.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(router.url).toBe('/');
    expect(stripeButton.getAttribute('aria-expanded')).toBe('false');
    expect(stripePanel.hasAttribute('inert')).toBe(true);
    expect(stripePanel.getAttribute('aria-hidden')).toBe('true');

    admobButton.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(router.url).toBe('/');
    expect(admobButton.getAttribute('aria-expanded')).toBe('true');
    expect(admobPanel.hasAttribute('inert')).toBe(false);
    expect(admobPanel.getAttribute('aria-hidden')).toBe('false');
    expect(stripeButton.getAttribute('aria-expanded')).toBe('false');
    expect(stripePanel.hasAttribute('inert')).toBe(true);
    expect(stripePanel.getAttribute('aria-hidden')).toBe('true');
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
    expect(docsHome.textContent?.trim()).toBe('Docs');
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
    expect(docsHome.textContent?.trim()).toBe('Docs');
    expect(router.url).toBe('/projects/capacitor-stripe');
  });

  it('marks exactly one sidebar location with aria-current for each docs route kind', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    const compiled = fixture.nativeElement as HTMLElement;
    const currentLinks = () =>
      Array.from(
        compiled.querySelectorAll<HTMLAnchorElement>(
          'nav[aria-label="Primary navigation"] a[aria-current="page"]',
        ),
      );

    await router.navigateByUrl('/');
    fixture.detectChanges();
    expect(currentLinks().map((link) => link.textContent?.trim())).toEqual(['All projects']);

    await router.navigateByUrl('/support');
    fixture.detectChanges();
    expect(currentLinks().map((link) => link.textContent?.trim())).toEqual(['Support']);

    await router.navigateByUrl('/projects/capacitor-stripe');
    fixture.detectChanges();
    expect(currentLinks().map((link) => link.textContent?.trim())).toEqual(['Stripe']);

    await router.navigateByUrl('/projects/capacitor-stripe/docs/configuration');
    fixture.detectChanges();
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
    expect(document.activeElement).toBe(menu.querySelector('a'));

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
    expect(document.activeElement).toBe(menu.querySelector('a'));

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(menu.hasAttribute('inert')).toBe(true);
    expect(document.activeElement).toBe(button);
  });

  it('keeps the mobile menu open and expands the project panel without navigating', async () => {
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
    const stripeButton = menu.querySelector<HTMLButtonElement>('#project-button-stripe')!;
    const stripePanel = menu.querySelector<HTMLElement>('#project-panel-stripe')!;

    stripeButton.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(router.url).toBe('/');
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(menu.hasAttribute('inert')).toBe(false);
    expect(stripeButton.getAttribute('aria-expanded')).toBe('true');
    expect(stripePanel.hasAttribute('inert')).toBe(false);
    expect(stripePanel.getAttribute('aria-hidden')).toBe('false');
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
