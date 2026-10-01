import {
  Component,
  ElementRef,
  HostListener,
  LOCALE_ID,
  ViewChild,
  inject,
  input,
  output,
} from '@angular/core';
import { PUBLISHED_DOCS_LOCALES, resolveDocsLocale } from '../../../../shared/docs-locales';
import { localizedPublicPath } from './locale-path';

@Component({
  selector: 'app-language-menu',
  template: `
    <details #menu (toggle)="onToggle()">
      <summary aria-label="Switch language" i18n-aria-label="@@switchLanguage">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
          width="18"
          height="18"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M478.33 433.6l-90-218a22 22 0 00-40.67 0l-90 218a22 22 0 1040.67 16.79L316.66 406h102.67l18.33 44.39A22 22 0 00458 464a22 22 0 0020.32-30.4zM334.83 362L368 281.65 401.17 362zM267.84 342.92a22 22 0 00-4.89-30.7c-.2-.15-15-11.13-36.49-34.73 39.65-53.68 62.11-114.75 71.27-143.49H330a22 22 0 000-44H214V70a22 22 0 00-44 0v20H54a22 22 0 000 44h197.25c-9.52 26.95-27.05 69.5-53.79 108.36-31.41-41.68-43.08-68.65-43.17-68.87a22 22 0 00-40.58 17c.58 1.38 14.55 34.23 52.86 83.93.92 1.19 1.83 2.35 2.74 3.51-39.24 44.35-77.74 71.86-93.85 80.74a22 22 0 1021.07 38.63c2.16-1.18 48.6-26.89 101.63-85.59 22.52 24.08 38 35.44 38.93 36.1a22 22 0 0030.75-4.9z"
          />
        </svg>
        <svg class="language-caret" viewBox="0 0 8 5" width="8" height="5" aria-hidden="true">
          <path fill="currentColor" d="M0 0h8L4 5Z" />
        </svg>
      </summary>
      <nav aria-label="Switch language" i18n-aria-label="@@switchLanguage">
        @for (locale of locales; track locale.code) {
          @if (locale.code === currentLocale) {
            <span
              class="language-option language-current"
              [attr.lang]="locale.code"
              aria-current="true"
            >
              <span>{{ locale.name }}</span>
              <span aria-hidden="true">✓</span>
            </span>
          } @else {
            <a
              class="language-option"
              [href]="urlFor(locale.code)"
              [attr.hreflang]="locale.code"
              [attr.lang]="locale.code"
            >
              {{ locale.name }}
            </a>
          }
        }
      </nav>
    </details>
  `,
  styles: `
    :host {
      display: flex;
      border-left: 1px solid #eadfd9;
    }
    details {
      position: relative;
      display: flex;
    }
    summary {
      display: flex;
      height: 100%;
      min-height: 44px;
      min-width: 44px;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 0 16px;
      cursor: pointer;
      list-style: none;
      color: #292320;
      font-size: 14px;
      white-space: nowrap;
    }
    summary::-webkit-details-marker {
      display: none;
    }
    summary svg {
      width: 18px;
      height: 18px;
      color: #292320;
    }
    summary .language-caret {
      width: 8px;
      height: 5px;
    }
    summary:hover,
    a:hover {
      background: #fff7f2;
    }
    summary:focus-visible,
    a:focus-visible {
      outline: 2px solid #c44320;
      outline-offset: -3px;
    }
    nav {
      position: absolute;
      top: calc(100% + 6px);
      right: 6px;
      z-index: 50;
      min-width: 160px;
      padding: 6px;
      background: white;
      border: 1px solid #eadfd9;
      border-radius: 10px;
      box-shadow: 0 8px 24px #2a1b1414;
    }
    .language-option {
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: 44px;
      gap: 16px;
      padding: 0 12px;
      border-radius: 6px;
      text-decoration: none;
      color: #292320;
      font-size: 14px;
    }
    .language-current {
      color: #c44320;
      background: #fff0ea;
    }
    @media (max-width: 399px) {
      summary {
        padding-inline: 10px;
      }
    }
  `,
})
export class LanguageMenu {
  readonly path = input.required<string>();
  readonly opened = output<void>();
  protected readonly currentLocale = resolveDocsLocale(inject(LOCALE_ID));
  protected readonly locales = PUBLISHED_DOCS_LOCALES;
  readonly #element = inject(ElementRef<HTMLElement>);
  @ViewChild('menu') protected readonly menu?: ElementRef<HTMLDetailsElement>;

  protected urlFor(locale: string): string {
    // Heading IDs are localized; switching keeps the document and query but drops its fragment.
    return localizedPublicPath(locale, this.path().split('#')[0]);
  }

  protected onToggle(): void {
    if (this.menu?.nativeElement.open) this.opened.emit();
  }

  @HostListener('document:click', ['$event'])
  protected closeOutside(event: MouseEvent): void {
    if (!this.#element.nativeElement.contains(event.target as Node)) this.#close();
  }

  @HostListener('document:keydown.escape', ['$event'])
  protected closeWithEscape(event: Event): void {
    if (
      !this.menu?.nativeElement.open ||
      this.#element.nativeElement.ownerDocument.querySelector('dialog[open]')
    )
      return;
    event.preventDefault();
    event.stopPropagation();
    this.#close();
    this.menu.nativeElement.querySelector('summary')?.focus();
  }

  @HostListener('focusout', ['$event'])
  protected closeOnFocusExit(event: Event): void {
    const target = (event as FocusEvent).relatedTarget;
    if (target && !this.#element.nativeElement.contains(target as Node)) this.#close();
  }

  #close(): void {
    if (this.menu) this.menu.nativeElement.open = false;
  }
}
