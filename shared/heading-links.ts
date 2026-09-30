import { Directive, ElementRef, HostListener, afterEveryRender, inject } from '@angular/core';
import { Router } from '@angular/router';

function decodeHeadingId(id: string): string {
  try {
    return decodeURIComponent(id);
  } catch {
    return id;
  }
}

/** Adds shareable links to rendered Markdown headings, including encoded Japanese IDs. */
@Directive({ selector: '[appHeadingLinks]' })
export class HeadingLinksDirective {
  readonly #host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly #router = inject(Router);

  #scrolledFragment: string | null = null;

  constructor() {
    afterEveryRender(() => {
      for (const heading of this.#host.nativeElement.querySelectorAll<HTMLElement>(
        'h2[id], h3[id], h4[id], h5[id], h6[id]',
      )) {
        if (heading.dataset['headingLinkReady']) continue;
        const label = heading.textContent?.trim() ?? '';
        const anchor =
          heading.querySelector<HTMLAnchorElement>('a.header-anchor-link') ??
          heading.ownerDocument.createElement('a');
        anchor.className = 'header-anchor-link';
        anchor.textContent = '#';
        anchor.removeAttribute('aria-hidden');
        anchor.setAttribute('aria-label', label);
        heading.setAttribute('aria-label', label);
        const url = this.#router.parseUrl(this.#router.url);
        url.fragment = decodeHeadingId(heading.id);
        anchor.href = this.#router.serializeUrl(url);
        // Include the localized base path in native links (copy link / open new tab).
        const base = new URL(heading.ownerDocument.baseURI);
        anchor.href = `${base.pathname.replace(/\/$/, '')}${anchor.getAttribute('href')}`;
        heading.prepend(anchor);
        heading.dataset['headingLinkReady'] = 'true';
      }
      const fragment = this.#router.parseUrl(this.#router.url).fragment;
      if (!fragment) {
        this.#scrolledFragment = null;
        return;
      }
      const heading = Array.from(
        this.#host.nativeElement.querySelectorAll<HTMLElement>('[id]'),
      ).find((element) => decodeHeadingId(element.id) === fragment);
      if (heading && this.#scrolledFragment !== fragment) {
        heading.scrollIntoView();
        this.#scrolledFragment = fragment;
      }
    });
  }

  @HostListener('click', ['$event'])
  protected navigate(event: MouseEvent): void {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    const heading = target.closest<HTMLElement>('h2[id], h3[id], h4[id], h5[id], h6[id]');
    if (!heading || !this.#host.nativeElement.contains(heading)) return;
    const link = target.closest('a');
    if (link && !link.classList.contains('header-anchor-link')) return;
    event.preventDefault();
    const url = this.#router.parseUrl(this.#router.url);
    url.fragment = decodeHeadingId(heading.id);
    void this.#router.navigateByUrl(url).then(() => heading.scrollIntoView());
  }
}
