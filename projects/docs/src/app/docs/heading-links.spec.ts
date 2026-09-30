import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { HeadingLinksDirective } from '../../../../../shared/heading-links';

@Component({
  imports: [HeadingLinksDirective],
  template: `<div appHeadingLinks><h2 id="%E6%97%A5%E6%9C%AC%E8%AA%9E"><a class="header-anchor-link" aria-hidden="true"></a>日本語 <code>API</code></h2><h3 id="child"><a href="https://example.com">External</a></h3></div>`,
})
class Host {}

describe('heading permalinks', () => {
  it('shows a keyboard accessible # link and navigates using a singly encoded Japanese fragment', async () => {
    TestBed.configureTestingModule({ imports: [Host], providers: [provideRouter([])] });
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
    const heading = fixture.nativeElement.querySelector('h2') as HTMLElement;
    const scroll = vi.fn();
    heading.scrollIntoView = scroll;
    const anchor = heading.querySelector('a')!;
    expect(anchor.textContent).toBe('#');
    expect(anchor.hasAttribute('aria-hidden')).toBe(false);
    expect(anchor.getAttribute('href')).toContain('#%E6%97%A5%E6%9C%AC%E8%AA%9E');
    heading.querySelector('code')!.click();
    await fixture.whenStable();
    expect(router.serializeUrl(navigate.mock.calls[0][0] as ReturnType<Router['parseUrl']>)).toBe('/#%E6%97%A5%E6%9C%AC%E8%AA%9E');
    expect(scroll).toHaveBeenCalled();
    navigate.mockClear();
    anchor.dispatchEvent(new MouseEvent('click', { bubbles: true, ctrlKey: true }));
    const external = fixture.nativeElement.querySelector('a[href="https://example.com"]');
    external.addEventListener('click', (event: Event) => event.preventDefault());
    external.click();
    expect(navigate).not.toHaveBeenCalled();
  });
});
