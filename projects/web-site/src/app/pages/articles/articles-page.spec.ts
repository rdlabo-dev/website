import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { ArticlesPage } from './articles-page';

describe('ArticlesPage', () => {
  let fixture: ComponentFixture<ArticlesPage>;
  const paramMap = new BehaviorSubject(convertToParamMap({}));
  const queryParamMap = new BehaviorSubject(convertToParamMap({}));

  beforeEach(async () => {
    paramMap.next(convertToParamMap({}));
    queryParamMap.next(convertToParamMap({}));
    await TestBed.configureTestingModule({
      imports: [ArticlesPage],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({}),
              queryParamMap: convertToParamMap({}),
            },
            paramMap,
            queryParamMap,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ArticlesPage);
    fixture.detectChanges();
  });

  it('uses the shared article layout with the sidebar', () => {
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('.article-layout')).not.toBeNull();
    expect(root.querySelector('.article-main')).not.toBeNull();
    expect(root.querySelector('.article-sidebar')).not.toBeNull();
  });

  it('makes each article card a single link', () => {
    const root = fixture.nativeElement as HTMLElement;
    const cards = Array.from(root.querySelectorAll<HTMLAnchorElement>('a.article-preview'));

    expect(cards.length).toBeGreaterThan(0);
    expect(cards.every((card) => card.getAttribute('href')?.startsWith('/articles/'))).toBe(true);
    expect(cards.every((card) => card.querySelector('a') === null)).toBe(true);
    expect(
      cards.every(
        (card) =>
          card.querySelector('.article-preview__cta')?.textContent?.trim() === 'Read article →',
      ),
    ).toBe(true);
  });

  it('describes both source platforms and displays each article source', () => {
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('.page-header__lead')?.textContent).toContain('Zenn and note');
    expect(
      Array.from(root.querySelectorAll('.article-preview__source')).some(
        (source) => source.textContent?.trim() === 'From note',
      ),
    ).toBe(true);
  });

  it('includes the shared resource links in the sidebar', () => {
    const root = fixture.nativeElement as HTMLElement;
    const links = Array.from(
      root.querySelectorAll<HTMLAnchorElement>('.article-sidebar__resource-link'),
    );

    expect(links.map((link) => link.textContent?.trim())).toEqual([
      'Support my OSS',
      'Zenn',
      'X / @rdlabo',
    ]);
  });

  it('updates the archive when the year route parameter changes', () => {
    paramMap.next(convertToParamMap({ year: '2024' }));
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('h1')?.textContent?.trim()).toBe('Articles from 2024');
    expect(root.querySelector('.article-years__active')?.textContent?.trim()).toBe('2024');
    expect(
      Array.from(root.querySelectorAll<HTMLTimeElement>('.article-preview__date')).every((date) =>
        date.dateTime.startsWith('2024'),
      ),
    ).toBe(true);
  });

  it('filters articles by the selected related-library category', () => {
    queryParamMap.next(convertToParamMap({ library: 'ionic-theme-md3' }));
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const cards = Array.from(root.querySelectorAll<HTMLAnchorElement>('a.article-preview'));
    expect(cards.map((card) => card.getAttribute('href'))).toEqual([
      '/articles/ionic-themes-ionic9-major-update',
      '/articles/ionic-theme-md3',
    ]);
    expect(root.querySelector('.article-sidebar__category-link--active')?.textContent?.trim()).toBe(
      'Ionic Theme MD3',
    );
    expect(root.querySelector('h1')?.textContent?.trim()).toBe('Articles for Ionic Theme MD3');
    expect(root.querySelector('.article-filter-status a')?.getAttribute('href')).toBe('/articles');
    expect(root.querySelector('.article-years__active')).toBeNull();
    expect(
      root.querySelector('.article-sidebar__category-link--active')?.getAttribute('aria-current'),
    ).toBe('page');
  });

  it('ignores an unknown related-library category', () => {
    queryParamMap.next(convertToParamMap({ library: 'unknown-library' }));
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('h1')?.textContent?.trim()).toBe('Articles');
    expect(root.querySelectorAll('a.article-preview')).toHaveLength(12);
    expect(root.querySelector('.article-years__active')?.textContent?.trim()).toBe('Latest');
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://rdlabo.dev/articles',
    );
  });

  it('normalizes an archive URL with a category to the all-years category view', () => {
    paramMap.next(convertToParamMap({ year: '2024' }));
    queryParamMap.next(convertToParamMap({ library: 'ionic-theme-md3' }));
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('h1')?.textContent?.trim()).toBe('Articles for Ionic Theme MD3');
    expect(
      Array.from(root.querySelectorAll<HTMLTimeElement>('.article-preview__date')).some(
        (date) => !date.dateTime.startsWith('2024'),
      ),
    ).toBe(true);
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://rdlabo.dev/articles?library=ionic-theme-md3',
    );
    expect(
      root.querySelector('.article-sidebar__category-link--active')?.getAttribute('href'),
    ).toBe('/articles?library=ionic-theme-md3');
  });
});
