import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { DocsPageComponent } from './docs-page';
import { loadProject } from './docs-data';

describe('documentation pagination', () => {
  for (const locale of ['en', 'ja']) {
    for (const position of ['first', 'middle', 'last'] as const) {
      it(`links adjacent ${locale} pages at the ${position} position`, async () => {
        const project = (await loadProject('ionic-theme-ios27', locale))!;
        const index = position === 'first' ? 0 : position === 'last' ? project.pages.length - 1 : 1;
        await TestBed.configureTestingModule({
          imports: [DocsPageComponent],
          providers: [
            provideRouter([]),
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
      });
    }
  }
});
