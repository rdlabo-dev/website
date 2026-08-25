import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CURRENT_SPONSORS, PAST_SPONSORS } from '../generated/sponsors.generated';
import { SupportPageComponent } from './support-page';

describe('SupportPageComponent', () => {
  let fixture: ComponentFixture<SupportPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupportPageComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(SupportPageComponent);
    fixture.detectChanges();
  });

  it('renders every generated public sponsor without exposing sponsorship amounts', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const sponsorLinks = Array.from(
      compiled.querySelectorAll<HTMLAnchorElement>('[aria-labelledby="current-sponsors-heading"] li a'),
    );

    expect(sponsorLinks).toHaveLength(CURRENT_SPONSORS.length);
    expect(sponsorLinks.map(({ href }) => href)).toEqual(
      CURRENT_SPONSORS.map(({ profileUrl }) => profileUrl),
    );
    for (const sponsor of CURRENT_SPONSORS) {
      expect(compiled.textContent).toContain(sponsor.name);
      expect(compiled.textContent).toContain(`@${sponsor.login}`);
    }
    const pastSponsorLinks = Array.from(
      compiled.querySelectorAll<HTMLAnchorElement>('[aria-labelledby="past-sponsors-heading"] li a'),
    );
    expect(pastSponsorLinks).toHaveLength(PAST_SPONSORS.length);
    expect(pastSponsorLinks.map(({ href }) => href)).toEqual(
      PAST_SPONSORS.map(({ profileUrl }) => profileUrl),
    );
    for (const sponsor of PAST_SPONSORS) {
      expect(compiled.textContent).toContain(sponsor.name);
      expect(compiled.textContent).toContain(`@${sponsor.login}`);
    }
    for (const card of compiled.querySelectorAll('[aria-labelledby$="-sponsors-heading"] li')) {
      expect(card.textContent).not.toMatch(/\$\d/);
    }
    expect(compiled.textContent).toContain('The first 10 monthly sponsors');
    expect(compiled.textContent).toContain('100 monthly sponsors');
    expect(compiled.textContent).toContain(
      'Individual sponsors who opt to be public are recognized equally here',
    );
    expect(compiled.textContent).toContain(
      'Individual sponsorships do not unlock exclusive features, priority support',
    );
    const join = compiled.querySelector<HTMLAnchorElement>(
      'a[href*="metadata_campaign=docs-support"]',
    );
    expect(join?.textContent?.trim()).toBe('Sponsor from $5/month');
  });
});
