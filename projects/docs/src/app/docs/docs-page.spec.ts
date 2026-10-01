import { TestBed } from '@angular/core/testing';
import { LOCALE_ID } from '@angular/core';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { DocsPageComponent } from './docs-page';
import { loadProject } from './docs-data';
import { PUBLISHED_DOCS_LOCALES } from '../../../../../shared/docs-locales';

describe('documentation pagination', () => {
  for (const { code: locale } of PUBLISHED_DOCS_LOCALES) {
    for (const position of ['first', 'middle', 'last'] as const) {
      it(`links adjacent ${locale} pages at the ${position} position`, async () => {
        const project = (await loadProject('ionic-theme-ios27', locale))!;
        const index = position === 'first' ? 0 : position === 'last' ? project.pages.length - 1 : 1;
        await TestBed.configureTestingModule({
          imports: [DocsPageComponent],
          providers: [
            provideRouter([]),
            { provide: LOCALE_ID, useValue: locale },
            { provide: ActivatedRoute, useValue: {
              snapshot: { data: { project, pageSlug: project.pages[index].slug } },
              fragment: of(null),
            } },
          ],
        }).compileComponents();
        const fixture = TestBed.createComponent(DocsPageComponent);
        fixture.detectChanges();
        const element = fixture.nativeElement as HTMLElement;
        expect(element.querySelector('a[rel="prev"]')?.getAttribute('href')).toBe(project.pages[index - 1]?.path);
        expect(element.querySelector('a[rel="next"]')?.getAttribute('href')).toBe(project.pages[index + 1]?.path);
        expect(element.querySelector('.oss-resource-links__link')?.getAttribute('href')).toBe(
          locale === 'en' ? '/support' : `/${locale}/support`,
        );
      });
    }
  }
});
