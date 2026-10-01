import { LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LanguageMenu } from './language-menu';
import { DOCS_LOCALES, PUBLISHED_DOCS_LOCALES } from '../../../../shared/docs-locales';
import { localizedPublicPath } from './locale-path';

describe('LanguageMenu', () => {
  it.each(PUBLISHED_DOCS_LOCALES)(
    'keeps the document and query when switching from $code',
    async (current) => {
      await TestBed.configureTestingModule({
        imports: [LanguageMenu],
        providers: [{ provide: LOCALE_ID, useValue: current.code }],
      }).compileComponents();
      const fixture = TestBed.createComponent(LanguageMenu);
      fixture.componentRef.setInput(
        'path',
        '/projects/example/docs/guide?version=1#translated-heading',
      );
      fixture.detectChanges();
      const element = fixture.nativeElement as HTMLElement;
      expect(element.querySelector('summary')?.getAttribute('aria-label')).toBe('Switch language');
      for (const locale of DOCS_LOCALES) {
        const link = element.querySelector(`a[hreflang="${locale.code}"]`);
        if (!locale.published || locale.code === current.code) expect(link).toBeNull();
        else
          expect(link?.getAttribute('href')).toBe(
            localizedPublicPath(locale.code, '/projects/example/docs/guide?version=1'),
          );
      }
      expect(element.querySelector('[aria-current="true"]')?.textContent).toContain(current.name);
      expect(element.querySelector('[aria-current="true"]')?.hasAttribute('tabindex')).toBe(false);
    },
  );

  it('closes with Escape and returns keyboard focus to its trigger', () => {
    const fixture = TestBed.createComponent(LanguageMenu);
    fixture.componentRef.setInput('path', '/');
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const details = element.querySelector('details')!;
    details.open = true;
    // Clicking the non-interactive current language can move focus to the page body.
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(details.open).toBe(false);
    expect(document.activeElement).toBe(element.querySelector('summary'));
  });
});
