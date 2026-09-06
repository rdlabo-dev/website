import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { LOCALE_ID } from '@angular/core';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { loadProject } from './docs-data';
import { GitHubStarsService } from './github-stars.service';
import { LandingPageComponent } from './landing-page';

describe('LandingPageComponent', () => {
  let fixture: ComponentFixture<LandingPageComponent>;

  async function setup(projectId: string): Promise<HTMLElement> {
    const project = await loadProject(projectId);
    await TestBed.configureTestingModule({
      imports: [LandingPageComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { data: { project } } } },
        { provide: GitHubStarsService, useValue: { count: vi.fn().mockResolvedValue(1234) } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(LandingPageComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders a manifest-driven Stripe landing page', async () => {
    const compiled = await setup('stripe');
    expect(TestBed.inject(Title).getTitle()).toBe(
      'Capacitor Stripe Plugin Documentation | rdlabo',
    );
    expect(compiled.querySelector('h1')?.textContent).toContain(
      'Accept Stripe payments in Capacitor apps',
    );
    expect(compiled.textContent).toContain('@capacitor-community/stripe');
    expect(compiled.textContent).toContain('PaymentSheet');
    expect(Array.from(compiled.querySelectorAll('.entry-guide a')).map((link) => link.getAttribute('href'))).toEqual([
      '/projects/capacitor-stripe/docs/vanilla-js',
      '/projects/capacitor-stripe/docs/server-integration',
      '/projects/capacitor-stripe/docs/payment-sheet',
      '/projects/capacitor-stripe/docs/api',
    ]);
    expect(
      compiled.querySelector('a[href="/projects/capacitor-stripe/docs/configuration"]'),
    ).not.toBeNull();
    await fixture.whenStable();
    fixture.detectChanges();
    const starLink = Array.from(compiled.querySelectorAll<HTMLAnchorElement>('a')).find((link) =>
      link.textContent?.includes('Star on GitHub'),
    );
    expect(starLink?.href).toBe('https://github.com/capacitor-community/stripe');
    expect(starLink?.textContent).toContain('1.2K');
  });

  it('takes Workers visitors to the paired quickstart and exposes guides and API', async () => {
    const compiled = await setup('workers-timezone');
    expect(compiled.querySelector('.project-actions a')?.getAttribute('href')).toBe('/projects/workers-timezone/docs/quickstart');
    expect(Array.from(compiled.querySelectorAll('.entry-guide a')).map((link) => link.getAttribute('href'))).toEqual([
      '/projects/workers-timezone/docs/readme',
      '/projects/workers-timezone/docs/eslint',
      '/projects/workers-timezone/docs/timezones',
      '/projects/workers-timezone/docs/api',
    ]);
    expect(compiled.querySelector('.project-support a')?.getAttribute('href')).toBe('/support');
  });

  it('renders AdMob from the same project presentation model', async () => {
    const compiled = await setup('admob');
    expect(compiled.querySelector('h1')?.textContent).toContain(
      'Monetize Capacitor apps with Google AdMob',
    );
    expect(compiled.textContent).toContain('Banner ads');
    expect(compiled.textContent).toContain('Consent controls');
    expect(
      compiled.querySelector('a[href="https://github.com/capacitor-community/admob"]'),
    ).not.toBeNull();
  });

  it('links library documentation to related articles', async () => {
    const compiled = await setup('ionic-theme-md3');
    const actionLabels = Array.from(
      compiled.querySelectorAll<HTMLAnchorElement>('.project-actions > a'),
    ).map((link) => link.textContent?.trim());
    expect(actionLabels).toEqual(['Get started', 'Demo']);
    expect(
      compiled.querySelector<HTMLAnchorElement>(
        'a[href="https://ionic-theme-md3.rdlabo.dev/"]',
      )?.textContent,
    ).toContain('Demo');
    const links = Array.from(
      compiled.querySelectorAll<HTMLAnchorElement>('a[href^="https://rdlabo.dev/articles/"]'),
    );
    expect(links.map((link) => link.href)).toContain(
      'https://rdlabo.dev/articles/ionic-theme-md3',
    );
    expect(links.map((link) => link.href)).toContain(
      'https://rdlabo.dev/articles/ionic-theme-reusable-css-v9-1',
    );
    expect(links.map((link) => link.href)).toContain(
      'https://rdlabo.dev/articles/ionic-themes-ionic9-major-update',
    );
    expect(compiled.textContent).toContain('Related articles');
    expect(compiled.querySelector('.related-article-lang')).toBeNull();
    expect(
      Array.from(compiled.querySelectorAll('.related-article-link h3')).every(
        (title) => title.getAttribute('lang') === 'en',
      ),
    ).toBe(true);
    expect(
      Array.from(compiled.querySelectorAll('.related-article-link p')).every(
        (description) => description.getAttribute('lang') === 'en',
      ),
    ).toBe(true);
    const dates = Array.from(compiled.querySelectorAll<HTMLTimeElement>('time'));
    expect(dates.map((date) => date.dateTime)).toEqual([
      '2026-09-04',
      '2026-08-25',
      '2026-08-24',
    ]);
    expect(dates.map((date) => date.textContent?.trim())).toEqual([
      'September 4, 2026',
      'August 25, 2026',
      'August 24, 2026',
    ]);
    expect(compiled.querySelectorAll('.project-feature')).toHaveLength(3);
    expect(compiled.querySelectorAll('.project-feature a')).toHaveLength(0);
    expect(compiled.querySelectorAll('a.related-article-link')).toHaveLength(3);
  });

  it('labels related English articles on the Japanese landing page', async () => {
    const project = await loadProject('ionic-theme-md3', 'ja');
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [LandingPageComponent],
      providers: [
        provideRouter([]),
        { provide: LOCALE_ID, useValue: 'ja' },
        { provide: ActivatedRoute, useValue: { snapshot: { data: { project } } } },
        { provide: GitHubStarsService, useValue: { count: vi.fn().mockResolvedValue(1234) } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(LandingPageComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.project-support a')?.getAttribute('href')).toBe('/support');
    expect(compiled.textContent).toContain('Related articles');
    expect(compiled.querySelectorAll('.related-article-lang')).toHaveLength(3);
    expect(
      Array.from(compiled.querySelectorAll('.related-article-lang')).every(
        (badge) => badge.textContent?.trim() === 'English',
      ),
    ).toBe(true);
    expect(
      Array.from(compiled.querySelectorAll('.related-article-link h3')).every(
        (title) => title.getAttribute('lang') === 'en',
      ),
    ).toBe(true);
  });
});
