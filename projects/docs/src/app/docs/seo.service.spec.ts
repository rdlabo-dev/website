import { DOCUMENT } from '@angular/common';
import { LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { collectJsonLdTypes } from '../../../../../shared/json-ld';
import { SITE_CONFIG } from '../site-config';
import { docsBreadcrumbStructuredData, docsHomeStructuredData } from './seo-json-ld';
import { SeoService } from './seo.service';

describe('SeoService', () => {
  it('writes canonical, hreflang, Open Graph, and robots metadata', () => {
    const service = TestBed.inject(SeoService);
    const document = TestBed.inject(DOCUMENT);
    service.setPage({
      title: 'Example - rdlabo.dev',
      description: 'Example documentation.',
      path: '/projects/example/docs/api',
    });

    expect(TestBed.inject(Title).getTitle()).toBe('Example - rdlabo.dev');
    expect(TestBed.inject(Meta).getTag('property="og:title"')?.content).toBe(
      'Example - rdlabo.dev',
    );
    expect(TestBed.inject(Meta).getTag('property="og:image"')?.content).toBe(
      `${SITE_CONFIG.origin}${SITE_CONFIG.socialImagePath}`,
    );
    expect(TestBed.inject(Meta).getTag('name="twitter:card"')?.content).toBe('summary_large_image');
    expect(TestBed.inject(Meta).getTag('name="robots"')?.content).toBe('index, follow');
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      `${SITE_CONFIG.origin}/projects/example/docs/api`,
    );
    expect(
      document.head.querySelector('link[rel="alternate"][hreflang="ja"]')?.getAttribute('href'),
    ).toBe(`${SITE_CONFIG.origin}/ja/projects/example/docs/api`);

    service.setPage({
      title: 'Missing',
      description: 'Missing.',
      path: '/not-found',
      noIndex: true,
    });
    expect(TestBed.inject(Meta).getTag('name="robots"')?.content).toBe('noindex, nofollow');
  });

  it('uses slashless Japanese home canonical, og:url, and hreflang', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: LOCALE_ID, useValue: 'ja' }],
    });

    const service = TestBed.inject(SeoService);
    const document = TestBed.inject(DOCUMENT);
    service.setPage({
      title: 'rdlabo.dev',
      description: 'Japanese home.',
      path: '/',
    });

    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      `${SITE_CONFIG.origin}/ja`,
    );
    expect(TestBed.inject(Meta).getTag('property="og:url"')?.content).toBe(
      `${SITE_CONFIG.origin}/ja`,
    );
    expect(
      document.head.querySelector('link[rel="alternate"][hreflang="ja"]')?.getAttribute('href'),
    ).toBe(`${SITE_CONFIG.origin}/ja`);
    expect(
      document.head.querySelector('link[rel="alternate"][hreflang="en"]')?.getAttribute('href'),
    ).toBe(`${SITE_CONFIG.origin}/`);
  });

  it('writes WebSite JSON-LD for docs home and breadcrumb JSON-LD for project pages', () => {
    const service = TestBed.inject(SeoService);
    const document = TestBed.inject(DOCUMENT);
    const description = 'Example documentation portal.';
    service.setPage({
      title: 'Example - rdlabo.dev',
      description,
      path: '/',
      structuredData: docsHomeStructuredData('en', description),
    });

    let script = document.head.querySelector<HTMLScriptElement>(
      'script[type="application/ld+json"][data-rdlabo-json-ld]',
    );
    expect(collectJsonLdTypes(JSON.parse(script?.textContent ?? '{}'))).toEqual(['WebSite']);

    service.setPage({
      title: 'Capacitor AdMob - rdlabo.dev',
      description: 'AdMob plugin.',
      path: '/projects/capacitor-admob',
      structuredData: docsBreadcrumbStructuredData('en', [
        { name: 'rdlabo.dev', path: '/' },
        { name: 'Capacitor AdMob', path: '/projects/capacitor-admob' },
      ]),
    });

    script = document.head.querySelector<HTMLScriptElement>(
      'script[type="application/ld+json"][data-rdlabo-json-ld]',
    );
    const graph = JSON.parse(script?.textContent ?? '{}') as {
      '@graph': Record<string, unknown>[];
    };
    const breadcrumb = graph['@graph'][0] as {
      itemListElement: { position: number; item: string }[];
    };
    expect(breadcrumb['itemListElement'].map((item) => item['item'])).toEqual([
      `${SITE_CONFIG.origin}/`,
      `${SITE_CONFIG.origin}/projects/capacitor-admob`,
    ]);
  });

  it('removes JSON-LD on noIndex pages without structured data', () => {
    const service = TestBed.inject(SeoService);
    const document = TestBed.inject(DOCUMENT);
    service.setPage({
      title: 'Docs home',
      description: 'Docs home.',
      path: '/',
      structuredData: docsHomeStructuredData('en', 'Docs home.'),
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
      title: 'Docs home',
      description: 'Docs home.',
      path: '/',
      structuredData: docsHomeStructuredData('en', 'Docs home.'),
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
      structuredData: docsHomeStructuredData('en', 'Must not be emitted.'),
    });
    expect(
      document.head.querySelector('script[data-rdlabo-json-ld], script#rdlabo-json-ld'),
    ).toBeNull();
  });
});
