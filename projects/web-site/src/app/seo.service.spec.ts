import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { collectJsonLdTypes, RDLABO_ORGANIZATION_ID } from '../../../../shared/json-ld';
import { homeStructuredData, articleStructuredData } from './seo-json-ld';
import { SeoService } from './seo.service';

describe('SeoService', () => {
  it('writes canonical, Open Graph, robots metadata, and home JSON-LD graph', () => {
    const service = TestBed.inject(SeoService);
    const document = TestBed.inject(DOCUMENT);
    service.setPage({
      title: 'rdlabo.dev — Open source for Ionic, Angular, and Capacitor',
      description: 'Personal open source projects maintained by rdlabo.',
      path: '/',
      structuredData: homeStructuredData('Personal open source projects maintained by rdlabo.'),
    });

    expect(TestBed.inject(Title).getTitle()).toContain('rdlabo.dev');
    expect(TestBed.inject(Meta).getTag('name="robots"')?.content).toBe('index, follow');
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://rdlabo.dev',
    );

    const script = document.head.querySelector<HTMLScriptElement>(
      'script[type="application/ld+json"][data-rdlabo-json-ld]',
    );
    expect(script?.id).toBe('rdlabo-json-ld');
    const types = collectJsonLdTypes(JSON.parse(script?.textContent ?? '{}'));
    expect(types).toContain('WebSite');
    expect(types).toContain('Organization');
    expect(script?.textContent).not.toContain('</script>');
  });

  it('replaces JSON-LD on navigation and omits dateModified without updatedAt', () => {
    const service = TestBed.inject(SeoService);
    const document = TestBed.inject(DOCUMENT);
    service.setPage({
      title: 'Articles — rdlabo.dev',
      description: 'Articles.',
      path: '/articles',
      structuredData: homeStructuredData('Articles.'),
    });

    service.setPage({
      title: 'Test — rdlabo.dev',
      description: 'Test article.',
      path: '/articles/test-slug',
      type: 'article',
      publishedAt: '2026-01-01T00:00:00.000Z',
      structuredData: articleStructuredData({
        slug: 'test-slug',
        title: 'Test',
        description: 'Test article.',
        emoji: '📝',
        image: 'https://rdlabo.dev/article-images/test-slug.svg',
        sourceName: 'Zenn',
        originalUrl: 'https://zenn.dev/rdlabo/articles/test-slug',
        publishedAt: '2026-01-01T00:00:00.000Z',
        publishedDate: '2026-01-01',
      }),
    });

    const scripts = document.head.querySelectorAll(
      'script[type="application/ld+json"][data-rdlabo-json-ld]',
    );
    expect(scripts).toHaveLength(1);
    const graph = JSON.parse(scripts[0]?.textContent ?? '{}') as {
      '@graph': Record<string, unknown>[];
    };
    const blogPosting = graph['@graph'].find((node) => node['@type'] === 'BlogPosting');
    expect(blogPosting?.['mainEntityOfPage']).toBe('https://rdlabo.dev/articles/test-slug');
    expect(blogPosting?.['dateModified']).toBeUndefined();
    expect(blogPosting?.['image']).toBe('https://rdlabo.dev/article-images/test-slug.svg');
    expect(blogPosting?.['isBasedOn']).toEqual({
      '@type': 'Article',
      '@id': 'https://zenn.dev/rdlabo/articles/test-slug',
      inLanguage: 'ja',
    });
    expect(blogPosting?.['publisher']).toEqual({ '@id': RDLABO_ORGANIZATION_ID });
  });

  it('includes dateModified when updatedAt is present', () => {
    const service = TestBed.inject(SeoService);
    const document = TestBed.inject(DOCUMENT);
    service.setPage({
      title: 'Updated — rdlabo.dev',
      description: 'Updated article.',
      path: '/articles/updated-slug',
      type: 'article',
      publishedAt: '2026-01-01T00:00:00.000Z',
      structuredData: articleStructuredData({
        slug: 'updated-slug',
        title: 'Updated',
        description: 'Updated article.',
        emoji: '📝',
        sourceName: 'Zenn',
        originalUrl: 'https://zenn.dev/rdlabo/articles/updated-slug',
        publishedAt: '2026-01-01T00:00:00.000Z',
        publishedDate: '2026-01-01',
        updatedAt: '2026-02-01',
        image: 'https://rdlabo.dev/articles/updated-slug/cover.png',
      }),
    });

    const script = document.head.querySelector<HTMLScriptElement>(
      'script[type="application/ld+json"][data-rdlabo-json-ld]',
    );
    const graph = JSON.parse(script?.textContent ?? '{}') as {
      '@graph': Record<string, unknown>[];
    };
    const blogPosting = graph['@graph'].find((node) => node['@type'] === 'BlogPosting');
    expect(blogPosting?.['dateModified']).toBe('2026-02-01');
    expect(blogPosting?.['image']).toBe('https://rdlabo.dev/articles/updated-slug/cover.png');
  });

  it('omits stale dimensions for an external image with unknown dimensions', () => {
    const service = TestBed.inject(SeoService);
    const meta = TestBed.inject(Meta);
    service.setPage({
      title: 'Home',
      description: 'Home.',
      path: '/',
    });
    service.setPage({
      title: 'External image',
      description: 'External image article.',
      path: '/articles/external-image',
      image: 'https://images.example.com/cover.png',
    });

    expect(meta.getTag('property="og:image"')?.content).toBe(
      'https://images.example.com/cover.png',
    );
    expect(meta.getTag('property="og:image:width"')).toBeNull();
    expect(meta.getTag('property="og:image:height"')).toBeNull();
  });

  it('removes stale JSON-LD on noIndex pages without structured data', () => {
    const service = TestBed.inject(SeoService);
    const document = TestBed.inject(DOCUMENT);
    service.setPage({
      title: 'rdlabo.dev',
      description: 'Home.',
      path: '/',
      structuredData: homeStructuredData('Home.'),
    });
    service.setPage({
      title: 'Missing',
      description: 'Missing.',
      path: '/not-found',
      noIndex: true,
    });

    expect(
      document.head.querySelector('script[type="application/ld+json"][data-rdlabo-json-ld]'),
    ).toBeNull();
    expect(TestBed.inject(Meta).getTag('name="robots"')?.content).toBe('noindex, nofollow');
  });

  it('collapses duplicate managed scripts and suppresses structured data on noIndex pages', () => {
    const service = TestBed.inject(SeoService);
    const document = TestBed.inject(DOCUMENT);
    const markerOnly = document.createElement('script');
    markerOnly.type = 'text/plain';
    markerOnly.setAttribute('data-rdlabo-json-ld', '');
    document.head.appendChild(markerOnly);
    const idOnly = document.createElement('script');
    idOnly.id = 'rdlabo-json-ld';
    document.head.appendChild(idOnly);

    service.setPage({
      title: 'Home',
      description: 'Home.',
      path: '/',
      structuredData: homeStructuredData('Home.'),
    });
    const managed = document.head.querySelectorAll(
      'script#rdlabo-json-ld[type="application/ld+json"][data-rdlabo-json-ld]',
    );
    expect(managed).toHaveLength(1);
    expect(document.head.querySelectorAll('script[data-rdlabo-json-ld]')).toHaveLength(1);

    service.setPage({
      title: 'Missing',
      description: 'Missing.',
      path: '/not-found',
      noIndex: true,
      structuredData: homeStructuredData('Must not be emitted.'),
    });
    expect(
      document.head.querySelector('script[data-rdlabo-json-ld], script#rdlabo-json-ld'),
    ).toBeNull();
  });

  it('escapes less-than in serialized JSON-LD content', () => {
    const service = TestBed.inject(SeoService);
    const document = TestBed.inject(DOCUMENT);
    service.setPage({
      title: 'Unsafe — rdlabo.dev',
      description: '</script>',
      path: '/articles/unsafe',
      structuredData: articleStructuredData({
        slug: 'unsafe',
        title: '</script>',
        description: '</script>',
        emoji: '📝',
        image: 'https://rdlabo.dev/article-images/unsafe.svg',
        sourceName: 'Zenn',
        originalUrl: 'https://zenn.dev/rdlabo/articles/unsafe',
        publishedAt: '2026-01-01T00:00:00.000Z',
        publishedDate: '2026-01-01',
      }),
    });

    const script = document.head.querySelector<HTMLScriptElement>(
      'script[type="application/ld+json"][data-rdlabo-json-ld]',
    );
    expect(script?.textContent?.includes('</script>')).toBe(false);
    expect(script?.textContent).toContain('\\u003c/script>');
  });
});
