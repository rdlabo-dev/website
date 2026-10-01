import assert from 'node:assert/strict';
import test from 'node:test';
import { JSDOM } from 'jsdom';
import { preserveSourceHeadingLinks } from './localized-heading-anchors';

test('source guide fragments reach translated headings without changing their visible text', () => {
  const html = preserveSourceHeadingLinks(
    '<h2 id="platform-setup">Platform setup</h2><h4 id="initialize">initialize()</h4>',
    '<h2 id="configuration-des-plateformes">Configuration des plateformes</h2><h4 id="initialize">initialize()</h4>',
    'fr/configuration',
  );
  const document = new JSDOM(html).window.document;
  const heading = document.getElementById('configuration-des-plateformes')!;
  assert.equal(heading.textContent, 'Configuration des plateformes');
  assert.equal(document.getElementById('platform-setup')?.parentElement, heading);
  assert.equal(document.getElementById('platform-setup')?.getAttribute('aria-hidden'), 'true');
  assert.equal(document.querySelectorAll('[data-docs-heading-alias]').length, 1);
  assert.equal(document.querySelectorAll('#initialize').length, 1);
});

test('incomplete or structurally changed translations cannot create misleading heading links', () => {
  const source = '<h2 id="setup">Setup</h2><h3 id="install">Installation</h3>';
  for (const translated of [
    '<h2 id="einrichtung">Einrichtung</h2>',
    '<h2 id="einrichtung">Einrichtung</h2><h2 id="installation">Installation</h2>',
  ]) {
    assert.throws(
      () => preserveSourceHeadingLinks(source, translated, 'de/setup'),
      /preserve source levels and order/,
    );
  }
});

test('a translated heading cannot reuse an English fragment that points to another section', () => {
  assert.throws(
    () =>
      preserveSourceHeadingLinks(
        '<h2 id="install">Install</h2><h2 id="setup">Setup</h2>',
        '<h2 id="setup">Installation</h2><h2 id="einrichtung">Einrichtung</h2>',
        'de/setup',
      ),
    /collides with source anchor #setup/,
  );
});
