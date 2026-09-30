import { APP_BASE_HREF } from '@angular/common';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { HeadingLinksDirective } from '../../../../../shared/heading-links';

@Component({
  imports: [HeadingLinksDirective],
  template: `<div appHeadingLinks>
    <h2 id="%E6%97%A5%E6%9C%AC%E8%AA%9E">
      <a class="header-anchor-link" aria-hidden="true"></a>日本語 <code>API</code>
    </h2>
    <h3 id="child"><a href="#unrelated">External</a></h3>
  </div>`,
})
class Host {}

describe('heading permalinks', () => {
  const originalScroll = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollIntoView');
  let scroll: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    scroll = vi.fn();
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scroll,
    });
    vi.spyOn(document, 'baseURI', 'get').mockReturnValue('http://localhost/ja/');
    TestBed.configureTestingModule({
      imports: [Host],
      providers: [
        { provide: APP_BASE_HREF, useValue: '/ja/' },
        provideRouter([{ path: 'docs/example', component: Host }]),
      ],
    });
  });

  afterEach(() => {
    if (originalScroll)
      Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', originalScroll);
    else Reflect.deleteProperty(HTMLElement.prototype, 'scrollIntoView');
    vi.restoreAllMocks();
  });

  it('updates the real router URL from heading text and exposes a localized copyable # link', async () => {
    const harness = await RouterTestingHarness.create('/docs/example?view=full');
    const heading = harness.routeNativeElement!.querySelector('h2')!;
    const anchor = heading.querySelector('a')!;
    expect(anchor.textContent).toBe('#');
    expect(anchor.hasAttribute('aria-hidden')).toBe(false);
    expect(anchor.tabIndex).toBe(0);
    expect(anchor.getAttribute('aria-label')).toBe('日本語 API');
    expect(anchor.getAttribute('href')).toBe(
      '/ja/docs/example?view=full#%E6%97%A5%E6%9C%AC%E8%AA%9E',
    );
    heading.querySelector('code')!.click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/docs/example?view=full#%E6%97%A5%E6%9C%AC%E8%AA%9E');
    expect(scroll.mock.contexts).toContain(heading);
  });

  it('restores an encoded Japanese heading from a shared URL without duplicating # links', async () => {
    const harness = await RouterTestingHarness.create('/docs/example#%E6%97%A5%E6%9C%AC%E8%AA%9E');
    await harness.fixture.whenStable();
    const heading = harness.routeNativeElement!.querySelector('h2')!;
    expect(scroll.mock.contexts).toContain(heading);
    harness.detectChanges();
    await harness.fixture.whenStable();
    expect(heading.querySelectorAll('a.header-anchor-link')).toHaveLength(1);
  });

  it('leaves modified permalink clicks and other links inside headings to the browser', async () => {
    const harness = await RouterTestingHarness.create('/docs/example');
    const root = harness.routeNativeElement!;
    for (const [selector, options] of [
      ['h2 a', { ctrlKey: true }],
      ['h2 a', { metaKey: true }],
      ['h3 a[href="#unrelated"]', {}],
    ] as const) {
      const event = new MouseEvent('click', { bubbles: true, cancelable: true, ...options });
      // Observe the directive before suppressing native navigation, which jsdom cannot perform.
      root.addEventListener(
        'click',
        (event) => {
          expect(event.defaultPrevented).toBe(false);
          event.preventDefault();
        },
        { once: true },
      );
      root.querySelector(selector)!.dispatchEvent(event);
    }
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/docs/example');
  });
});
