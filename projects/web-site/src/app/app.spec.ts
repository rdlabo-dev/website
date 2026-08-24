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
    expect(navLabels).toEqual(['Articles', 'Docs', 'GitHub']);
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
    expect(compiled.querySelectorAll('.article-preview')).toHaveLength(3);
    expect(compiled.querySelectorAll('a.article-preview')).toHaveLength(3);
    expect(
      Array.from(compiled.querySelectorAll('.article-preview__cta')).every(
        (cta) => cta.textContent?.trim() === 'Read article →',
      ),
    ).toBe(true);
  });
});
