import assert from 'node:assert/strict';
import test from 'node:test';
import {
  breadcrumbList,
  collectJsonLdTypes,
  extractBreadcrumbItemUrl,
  serializeJsonLd,
} from './json-ld';

test('serializeJsonLd escapes less-than so script boundaries stay safe', () => {
  const serialized = serializeJsonLd({ headline: '</script><script>alert(1)</script>' });
  assert.equal(serialized.includes('</script>'), false);
  assert.match(serialized, /\\u003c\/script>/);
});

test('breadcrumbList uses contiguous positions and absolute item URLs', () => {
  const list = breadcrumbList([
    { name: 'Home', url: 'https://rdlabo.dev/' },
    { name: 'Articles', url: 'https://rdlabo.dev/articles' },
  ]);
  const items = list.itemListElement as Array<{ position: number; item: string }>;
  assert.deepEqual(
    items.map((item) => item.position),
    [1, 2],
  );
  assert.equal(extractBreadcrumbItemUrl(items[0]), 'https://rdlabo.dev/');
});

test('collectJsonLdTypes reads nodes from @graph', () => {
  const types = collectJsonLdTypes({
    '@context': 'https://schema.org',
    '@graph': [{ '@type': 'WebSite' }, { '@type': 'Organization' }],
  });
  assert.deepEqual(types, ['WebSite', 'Organization']);
});
