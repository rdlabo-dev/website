import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
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
    expect(TestBed.inject(Title).getTitle()).toBe('Stripe - rdlabo.dev');
    expect(compiled.querySelector('h1')?.textContent).toContain(
      'Accept Stripe payments in Capacitor apps',
    );
    expect(compiled.textContent).toContain('@capacitor-community/stripe');
    expect(compiled.textContent).toContain('PaymentSheet');
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
    const links = Array.from(
      compiled.querySelectorAll<HTMLAnchorElement>('a[href^="https://rdlabo.dev/articles/"]'),
    );
    expect(links.map((link) => link.href)).toContain(
      'https://rdlabo.dev/articles/ionic-theme-md3',
    );
    expect(links.map((link) => link.href)).toContain(
      'https://rdlabo.dev/articles/ionic-themes-ionic9-major-update',
    );
    expect(compiled.textContent).toContain('Related articles');
  });
});
