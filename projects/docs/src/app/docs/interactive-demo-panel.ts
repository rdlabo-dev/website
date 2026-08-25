import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { InteractiveDemo } from './docs-data';

@Component({
  selector: 'app-interactive-demo-panel',
  host: {
    class:
      'sticky top-2 block h-[calc(100dvh-16px)] max-h-[calc(100dvh-16px)] max-[960px]:static max-[960px]:mt-8 max-[960px]:h-auto max-[960px]:max-h-none max-[960px]:px-4',
  },
  template: `
    <aside
      class="flex h-full min-h-0 flex-col rounded-[1.5rem] border border-[#eadfd9] bg-[#fffaf7] p-4 sm:p-6"
      i18n-aria-label="@@interactiveDemo"
      aria-label="Interactive demo"
    >
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="m-0 font-semibold text-[#292320]">
          <ng-container i18n="@@interactiveDemo">Interactive demo</ng-container>
        </p>
        <a
          class="external-link text-sm font-semibold text-[#c44320] no-underline hover:text-[#923217]"
          [href]="demo().url"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ng-container i18n="@@openDemo">Open demo</ng-container>
        </a>
      </div>
      <div
        class="relative mx-auto mt-4 min-h-0 w-full max-w-[430px] flex-1 max-[960px]:h-[min(720px,75dvh)] max-[960px]:min-h-[560px] max-[960px]:flex-none"
      >
        @if (loading()) {
          <div
            class="absolute inset-0 z-10 flex items-center justify-center bg-[#fffaf7] text-sm text-[#796e68]"
            role="status"
            aria-live="polite"
          >
            <span
              class="mr-2 size-4 animate-spin rounded-full border-2 border-[#eadfd9] border-t-[#ea572a]"
              aria-hidden="true"
            ></span>
            <ng-container i18n="@@loadingDemo">Loading demo…</ng-container>
          </div>
        }
        <iframe
          class="block h-full min-h-[560px] w-full border-0 bg-white"
          [src]="trustedUrl()"
          [title]="demo().title"
          loading="lazy"
          referrerpolicy="strict-origin-when-cross-origin"
          sandbox="allow-forms allow-modals allow-popups allow-same-origin allow-scripts"
          (load)="loading.set(false)"
        ></iframe>
      </div>
    </aside>
  `,
})
export class InteractiveDemoPanel {
  readonly #sanitizer = inject(DomSanitizer);
  #demoUrl: string | undefined;
  readonly demo = input.required<InteractiveDemo>();
  readonly loading = signal(true);
  readonly trustedUrl = computed(() => {
    const url = new URL(this.demo().url);
    if (
      url.origin !== 'https://rdlabo-ionic-angular-library.netlify.app' ||
      !url.pathname.startsWith('/main/')
    ) {
      throw new Error(`Untrusted interactive demo URL: ${url.href}`);
    }
    return this.#sanitizer.bypassSecurityTrustResourceUrl(url.href);
  });

  constructor() {
    effect(() => {
      const url = this.demo().url;
      if (this.#demoUrl && this.#demoUrl !== url) this.loading.set(true);
      this.#demoUrl = url;
    });
  }
}
