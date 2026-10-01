import assert from 'node:assert/strict';
import test from 'node:test';
import { JSDOM } from 'jsdom';
import { addHeadingAliases, normalizeImportedReadmeHeadings } from './markdown-headings';

test('keeps an old published fragment attached to a renamed heading', () => {
  const document = new JSDOM('<h2 id="initialize">initialize</h2>').window.document;
  const oldId = encodeURIComponent('初期化');
  addHeadingAliases(document, { [oldId]: 'initialize' }, 'terminal');
  assert.equal(document.getElementById(oldId)?.parentElement?.id, 'initialize');
  assert.equal(document.querySelector('h2')?.textContent, 'initialize');
  assert.equal(document.getElementById(oldId)?.getAttribute('aria-hidden'), 'true');
  assert.equal(document.getElementById(oldId)?.hasAttribute('data-docs-heading-alias'), true);
  assert.throws(
    () => addHeadingAliases(document, { missing: 'absent' }, 'terminal'),
    /missing alias target/,
  );
  assert.throws(
    () => addHeadingAliases(document, { initialize: 'initialize' }, 'terminal'),
    /duplicate alias/,
  );
  assert.throws(() => addHeadingAliases(document, [], 'terminal'), /must map old IDs/);
  assert.throws(() => addHeadingAliases(document, { old: 1 }, 'terminal'), /non-empty string IDs/);
});

test('removes the README title and preserves nested heading levels after another h1', () => {
  const document = new JSDOM(`
    <h1 id="package">Package</h1>
    <h2 id="install">Installation</h2>
    <h1 id="faq">FAQ</h1>
    <h2 id="question">Question</h2>
    <h3 id="detail">Detail</h3>
  `).window.document;

  normalizeImportedReadmeHeadings(document);

  const page = document.createElement('main');
  page.innerHTML = `<h1>Page title</h1>${document.body.innerHTML}`;
  assert.equal(page.querySelectorAll('h1').length, 1);
  assert.deepEqual(
    Array.from(page.querySelectorAll('h1, h2, h3, h4')).map((heading) => [
      heading.tagName,
      heading.id,
    ]),
    [
      ['H1', ''],
      ['H2', 'install'],
      ['H2', 'faq'],
      ['H3', 'question'],
      ['H4', 'detail'],
    ],
  );
});
