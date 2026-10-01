import { LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LanguageMenu } from './language-menu';

describe('LanguageMenu', () => {
  it('keeps the current document and query across published languages', async () => {
    await TestBed.configureTestingModule({
      imports: [LanguageMenu],
      providers: [{ provide: LOCALE_ID, useValue: 'ja' }],
    }).compileComponents();
    const fixture = TestBed.createComponent(LanguageMenu);
    fixture.componentRef.setInput(
      'path',
      '/projects/example/docs/guide?version=1#translated-heading',
    );
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('summary')?.getAttribute('aria-label')).toBe('Switch language');
    expect(element.querySelector('a[hreflang="en"]')?.getAttribute('href')).toBe(
      '/projects/example/docs/guide?version=1',
    );
    expect(element.querySelector('a[hreflang="ja"]')).toBeNull();
    expect(element.querySelector('[aria-current="true"]')?.textContent).toContain('日本語');
    expect(element.querySelector('[aria-current="true"]')?.hasAttribute('tabindex')).toBe(false);
    expect(element.querySelector('a[hreflang="fr"]')).toBeNull();
    expect(element.querySelector('a[hreflang="de"]')).toBeNull();
  });

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
