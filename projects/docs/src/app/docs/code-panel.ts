import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  PLATFORM_ID,
  inject,
  signal,
} from '@angular/core';
import { CodeSample } from './docs-data';
import { SafeHtmlPipe } from './safe-html.pipe';

@Component({
  selector: 'app-code-panel',
  imports: [SafeHtmlPipe],
  host: {
    class: 'sticky top-20 block h-[calc(100dvh-96px)] max-h-[calc(100dvh-96px)]',
  },
  styles: `
    @container docs-content (max-width: 960px) {
      :host {
        display: none;
      }
    }
  `,
  template: `
    <aside
      class="block h-full max-h-full overflow-hidden rounded-lg bg-[#151e2c] text-[#e1e4e8] shadow-[0_4px_14px_rgba(0,14,30,0.15)]"
      aria-label="Code example"
    >
      <div
        class="flex gap-1.5 overflow-x-auto border-b border-[#0c121c] px-5 pt-[18px] pb-3.5"
        role="tablist"
        aria-label="Files"
      >
        @for (code of codes; track code.file) {
          <button
            type="button"
            role="tab"
            class="shrink-0 cursor-pointer rounded-[18px] border-0 bg-transparent px-2.5 py-[5px] font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[12px] text-white/50 [&.active]:bg-[#ea572a] [&.active]:text-white"
            [attr.aria-selected]="activeFile() === code.file"
            [class.active]="activeFile() === code.file"
            (click)="select(code.file)"
          >
            {{ code.file }}
          </button>
        }
      </div>
      <div #scroller class="h-[calc(100%-58px)] overflow-auto scroll-smooth">
        @for (code of codes; track code.file) {
          @if (activeFile() === code.file) {
            <pre
              class="m-0 min-w-max px-6 pt-5 pb-12 font-[ui-monospace,SFMono-Regular,Menlo,Consolas,monospace] text-[13px]/[1.3]"
            ><code
                >@for (line of code.lines; track $index) {<span
                  class="code-row block min-h-[1.3em] transition-opacity duration-[160ms] [&.dimmed]:opacity-40"
                  [class.highlight]="isHighlighted(code.file, $index + 1)"
                  [class.dimmed]="isDimmed(code.file, $index + 1)"
                  [innerHTML]="line | safeHtml"
                ></span>
}</code></pre>
          }
        }
      </div>
    </aside>
  `,
})
export class CodePanel implements OnChanges {
  readonly #document = inject(DOCUMENT);
  readonly #platformId = inject(PLATFORM_ID);
  @ViewChild('scroller') protected readonly scroller?: ElementRef<HTMLElement>;
  /** @Input bindings are assigned by Angular; readonly breaks parent template binding. */
  // eslint-disable-next-line @rdlabo/rules/component-property-use-readonly -- @Input
  @Input({ required: true }) codes: readonly CodeSample[] = [];
  // eslint-disable-next-line @rdlabo/rules/component-property-use-readonly -- @Input
  @Input() activeLines: Record<string, readonly number[]> = {};
  readonly activeFile = signal('');

  ngOnChanges(changes: SimpleChanges): void {
    const mappedFile = Object.keys(this.activeLines).find((file) =>
      this.codes.some((code) => code.file === file),
    );
    if (mappedFile) this.activeFile.set(mappedFile);
    else if (!this.codes.some((code) => code.file === this.activeFile()))
      this.activeFile.set(this.codes[0]?.file ?? '');
    if (changes['activeLines']) this.scrollToHighlight();
  }

  select(file: string): void {
    this.activeFile.set(file);
  }

  isHighlighted(file: string, line: number): boolean {
    const range = this.activeLines[file];
    return this.#hasActiveExclusiveRange(range) && line > range[0] && line < range[1];
  }

  isDimmed(file: string, line: number): boolean {
    const range = this.activeLines[file];
    return this.#hasActiveExclusiveRange(range) && !(line > range[0] && line < range[1]);
  }

  #hasActiveExclusiveRange(range: readonly number[] | undefined): range is readonly number[] {
    return !!range?.length && range[1] > range[0];
  }

  scrollToHighlight(): void {
    if (!isPlatformBrowser(this.#platformId)) return;
    const view = this.#document.defaultView;
    if (!view) return;
    view.requestAnimationFrame(() => {
      const row = this.scroller?.nativeElement.querySelector<HTMLElement>('.code-row.highlight');
      if (row && this.scroller)
        this.scroller.nativeElement.scrollTo({
          top: Math.max(0, row.offsetTop - 72),
          behavior: 'smooth',
        });
    });
  }
}
