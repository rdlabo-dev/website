import { TestBed } from '@angular/core/testing';
import { OssResourceLinksComponent } from '../../../../../shared/oss-resource-links';

describe('OssResourceLinksComponent in docs', () => {
  it('renders the same resource links as rdlabo.dev', async () => {
    await TestBed.configureTestingModule({
      imports: [OssResourceLinksComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(OssResourceLinksComponent);
    fixture.detectChanges();
    const links = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLAnchorElement>('a'),
    );

    expect(
      links.map((link) => [link.textContent?.trim(), link.getAttribute('href'), link.target, link.rel]),
    ).toEqual([
      ['Support this OSS', '/support', '', ''],
      ['Zenn', 'https://zenn.dev/rdlabo', '_blank', 'noopener noreferrer'],
      ['X / @rdlabo', 'https://x.com/rdlabo', '_blank', 'noopener noreferrer'],
    ]);
  });
});
