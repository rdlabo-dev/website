import assert from 'node:assert/strict';
import test from 'node:test';
import { enforceGeneratedHtmlPolicy } from './html-policy';
import { JSDOM } from 'jsdom';
import { compactDocsHtml } from './compact-docs-html';

test('compacts editor metadata and default tokens while preserving code and anchor behavior', () => {
  const document = new JSDOM(
    '<h2 id="example" data-line="4" class="code-line other">Example</h2>' +
      '<pre class="shiki" style="background-color:#151e2c;color:#e1e4e8"><code data-line="6" class="code-line">' +
      '<span class="line"><span style="color:#F97583">const</span><span style="color:#E1E4E8"> x = 1;</span></span>\n' +
      '<span class="line"><span style="color:#E1E4E8">  next(x);</span></span></code></pre>',
  ).window.document;
  const before = document.querySelector('code')!.textContent;
  compactDocsHtml(document);
  assert.equal(document.querySelector('code')!.textContent, before);
  assert.equal(document.querySelector('code')!.getAttribute('style'), 'color:#e1e4e8');
  assert.equal(document.querySelectorAll('code span[style]').length, 1);
  assert.equal(document.querySelector('code span[style]')!.getAttribute('style'), 'color:#F97583');
  assert.equal(document.querySelectorAll('.line').length, 2);
  assert.equal(document.getElementById('example')!.className, 'other');
  assert.equal(document.querySelectorAll('[data-line], .code-line').length, 0);
  assert.doesNotThrow(() => enforceGeneratedHtmlPolicy(document.body.innerHTML, 'compact'));
  const once = document.body.innerHTML;
  compactDocsHtml(document);
  assert.equal(document.body.innerHTML, once);
});

test('keeps plain, diff, and annotated tokens intact during compaction', () => {
  const html =
    '<pre class="shiki" style="color:#e1e4e8"><code><span class="line diff add">' +
    '<span class="diff-prefix">+</span> plain <span style="color:#E1E4E8">text</span>' +
    '</span></code></pre>' +
    '<pre class="shiki" style="color:#e1e4e8"><code><span class="line">' +
    '<span id="token" style="color:#E1E4E8">linked token</span></span></code></pre>';
  const document = new JSDOM(html).window.document;
  const before = document.body.innerHTML;
  compactDocsHtml(document);
  assert.equal(document.body.innerHTML, before);
});

test('accepts documentation markup and syntax highlighting styles', () => {
  const html =
    '<h2 id="install" data-line="1" class="code-line">Install</h2>' +
    '<h5 id="details" data-line="2" class="code-line">Details</h5>' +
    '<hr>' +
    '<ol start="0"><li>First step</li></ol>' +
    '<blockquote data-line="2" class="code-line"><p>Rule summary</p></blockquote>' +
    '<pre class="shiki" style="background-color:#151e2c;color:#e1e4e8"><code>' +
    '<span style="color:#b392f0">npm</span>' +
    '<span style="font-style:italic;color:#e1e4e8">comment</span></code></pre>' +
    '<a href="https://example.com" target="_blank" rel="nofollow noopener noreferrer">Source</a>';
  const sanitized = enforceGeneratedHtmlPolicy(html, 'fixture');
  assert.match(sanitized, /<h2/);
  assert.match(sanitized, /<h5/);
  assert.match(sanitized, /<hr>/);
  assert.match(sanitized, /<ol start="0">/);
  assert.match(sanitized, /<blockquote/);
  assert.match(sanitized, /font-style:italic/);
});

for (const [name, html] of [
  ['script element', '<script>alert(1)</script>'],
  ['event handler', '<img src="/logo.svg" onerror="alert(1)">'],
  ['javascript URL', '<a href="javascript:alert(1)">Open</a>'],
  ['unsafe style', '<span style="background-image:url(https://example.com/x)">Text</span>'],
  ['unapproved font style', '<span style="font-style:oblique">Text</span>'],
  ['invalid ordered-list start', '<ol start="next"><li>Step</li></ol>'],
] as const) {
  test(`rejects ${name}`, () => {
    assert.throws(
      () => enforceGeneratedHtmlPolicy(html, 'dangerous fixture'),
      /disallowed|unsafe|invalid/,
    );
  });
}
