import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { SiteHeader } from './site-header';

describe('SiteHeader', () => {
  let fixture: ComponentFixture<SiteHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteHeader],
      providers: [
        provideRouter([
          { path: '', pathMatch: 'full', children: [] },
          { path: 'articles', children: [] },
          { path: 'articles/archive/:year', children: [] },
          { path: 'articles/:slug', children: [] },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SiteHeader);
    fixture.detectChanges();
  });

  it('keeps Articles active across list, archive, and detail routes with aria-current', async () => {
    const router = TestBed.inject(Router);
    const articlesLink = () =>
      Array.from(
        (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLAnchorElement>(
          '.site-nav__link',
        ),
      ).find((link) => link.textContent?.trim() === 'Articles');

    for (const url of ['/articles', '/articles/archive/2024', '/articles/ionic-theme-md3']) {
      await router.navigateByUrl(url);
      fixture.detectChanges();
      await fixture.whenStable();

      const link = articlesLink();
      expect(link?.classList.contains('site-nav__link--active')).toBe(true);
      expect(link?.getAttribute('aria-current')).toBe('page');
    }
  });

  it('does not mark Articles current on the home route', async () => {
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/');
    fixture.detectChanges();
    await fixture.whenStable();

    const articlesLink = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLAnchorElement>('.site-nav__link'),
    ).find((link) => link.textContent?.trim() === 'Articles');

    expect(articlesLink?.classList.contains('site-nav__link--active')).toBe(false);
    expect(articlesLink?.getAttribute('aria-current')).toBeNull();
  });
});
