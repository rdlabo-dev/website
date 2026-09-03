import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { App } from './app';
import { routes } from './app.routes';
import { HomePage } from './pages/home/home-page';

type GoogleAnalyticsWindow = Window & {
  gtag?: (...args: unknown[]) => void;
};

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App, HomePage],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  afterEach(() => {
    delete (window as GoogleAnalyticsWindow).gtag;
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the site header brand', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.site-brand__name')?.textContent).toContain('rdlabo.dev');
    const navLabels = Array.from(compiled.querySelectorAll('.site-nav__link')).map((link) =>
      link.textContent?.trim(),
    );
    expect(navLabels).toEqual(['Articles', 'Docs', 'Support', 'GitHub']);
    expect(compiled.querySelector('pagefind-modal-trigger')).toBeTruthy();
    expect(compiled.querySelector('pagefind-modal')).toBeTruthy();
  });

  it('sends one page_view for each completed router navigation', async () => {
    const gtag = vi.fn();
    (window as GoogleAnalyticsWindow).gtag = gtag;
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    document.title = 'Tracked page';

    await router.navigateByUrl('/articles?source=test');

    expect(gtag).toHaveBeenCalledTimes(1);
    expect(gtag).toHaveBeenCalledWith('event', 'page_view', {
      page_title: 'Tracked page',
      page_location: window.location.href,
      page_path: '/articles?source=test',
    });
    fixture.destroy();
  });

  it('tracks article journeys to Docs, GitHub, npm, sponsors, and source articles', async () => {
    const gtag = vi.fn();
    (window as GoogleAnalyticsWindow).gtag = gtag;
    const fixture = TestBed.createComponent(App);
    window.history.pushState({}, '', '/articles/example');

    for (const href of [
      'https://docs.rdlabo.dev/projects/example',
      'https://github.com/rdlabo-dev/example',
      'https://www.npmjs.com/package/example',
      'https://github.com/sponsors/rdlabo',
      'https://zenn.dev/rdlabo/articles/example',
    ]) {
      const anchor = document.createElement('a');
      anchor.href = href;
      anchor.addEventListener('click', (event) => event.preventDefault());
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    }

    expect(gtag.mock.calls.filter(([type]) => type === 'event').slice(-5)).toEqual([
      ['event', 'article_to_docs', expect.objectContaining({ article_slug: 'example' })],
      ['event', 'article_to_github', expect.objectContaining({ article_slug: 'example' })],
      ['event', 'article_to_npm', expect.objectContaining({ article_slug: 'example' })],
      ['event', 'article_to_sponsor', expect.objectContaining({ article_slug: 'example' })],
      ['event', 'article_source_click', expect.objectContaining({ article_slug: 'example' })],
    ]);
    window.history.pushState({}, '', '/');
    fixture.destroy();
  });

  it('renders four featured projects and the three latest translated articles', async () => {
    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelectorAll('.featured-project-card')).toHaveLength(4);
    expect(compiled.querySelector<HTMLAnchorElement>('.featured-project-card')?.href).toBe(
      'https://docs.rdlabo.dev/projects/capacitor-stripe',
    );
    expect(compiled.textContent).toContain('@capacitor-community/stripe');
    expect(compiled.textContent).toContain('@rdlabo/ionic-theme-ios26');
    expect(compiled.textContent).toContain('@rdlabo/ionic-theme-md3');
    expect(compiled.textContent).toContain('@rdlabo/ngx-cdk-scroll-strategies');
    const allProjects = compiled.querySelector<HTMLAnchorElement>('.project-grid__all a');
    expect(allProjects?.textContent?.trim()).toBe('All Projects');
    expect(allProjects?.href).toBe('https://docs.rdlabo.dev/');
    const supportCta = compiled.querySelector<HTMLAnchorElement>('.community-cta a');
    expect(supportCta?.textContent?.trim()).toBe('View sponsorship options');
    expect(supportCta?.href).toBe(
      'https://github.com/sponsors/rdlabo?metadata_campaign=rdlabo-home',
    );
    expect(supportCta?.target).toBe('_blank');
    expect(compiled.querySelector('.community-cta__vision')?.textContent).toContain(
      '10 monthly sponsors',
    );
    expect(compiled.querySelectorAll('.article-preview')).toHaveLength(3);
    expect(compiled.querySelectorAll('a.article-preview')).toHaveLength(3);
    expect(
      Array.from(compiled.querySelectorAll('.article-preview__cta')).every(
        (cta) => cta.textContent?.trim() === 'Read article →',
      ),
    ).toBe(true);
  });
});
