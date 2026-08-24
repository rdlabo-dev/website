import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ArticleSidebar } from './article-sidebar';

describe('ArticleSidebar', () => {
  let fixture: ComponentFixture<ArticleSidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleSidebar],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ArticleSidebar);
    fixture.detectChanges();
  });

  it('renders the shared external resource links', () => {
    const root = fixture.nativeElement as HTMLElement;
    const links = Array.from(
      root.querySelectorAll<HTMLAnchorElement>('.article-sidebar__resource-link'),
    );

    expect(
      links.map((link) => [link.textContent?.trim(), link.href, link.target, link.rel]),
    ).toEqual([
      ['Support my OSS', 'https://docs.rdlabo.dev/support', '_blank', 'noopener noreferrer'],
      ['Zenn', 'https://zenn.dev/rdlabo', '_blank', 'noopener noreferrer'],
      ['X / @rdlabo', 'https://x.com/rdlabo', '_blank', 'noopener noreferrer'],
    ]);
  });

  it('lists related-library categories and links to filtered articles', () => {
    const root = fixture.nativeElement as HTMLElement;
    const links = Array.from(
      root.querySelectorAll<HTMLAnchorElement>('.article-sidebar__category-link'),
    );

    expect(links.map((link) => link.textContent?.trim())).toEqual([
      'Ionic Theme iOS26',
      'Ionic Theme MD3',
    ]);
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/articles?library=ionic-theme-ios26',
      '/articles?library=ionic-theme-md3',
    ]);
  });

  it('exposes the current category to assistive technology', () => {
    fixture.componentRef.setInput('currentCategoryId', 'ionic-theme-md3');
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const current = root.querySelector<HTMLAnchorElement>(
      '.article-sidebar__category-link[aria-current="page"]',
    );
    expect(current?.textContent?.trim()).toBe('Ionic Theme MD3');
  });

  it('renders contents links when headings are provided', () => {
    fixture.componentRef.setInput('tocHeadings', [{ id: 'intro', text: 'Introduction', level: 2 }]);
    fixture.componentRef.setInput('articleSlug', 'sample-slug');
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const tocLink = root.querySelector<HTMLAnchorElement>('.article-sidebar__link');

    expect(root.querySelector('.article-sidebar__label')?.textContent?.trim()).toBe('Contents');
    expect(tocLink?.textContent?.trim()).toBe('Introduction');
    expect(tocLink?.getAttribute('href')).toBe('/articles/sample-slug#intro');
    expect(root.querySelector('.article-sidebar__resources--separated')).not.toBeNull();
  });

  it('omits the contents section when there are no headings', () => {
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('.article-sidebar__label')?.textContent?.trim()).toBe('Category');
    expect(root.querySelector('.article-sidebar__list')).toBeNull();
    expect(root.querySelector('.article-sidebar__resources--separated')).not.toBeNull();
    expect(root.querySelectorAll('.article-sidebar__resource-link')).toHaveLength(3);
  });
});
