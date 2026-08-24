import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import test from 'node:test';
import { JSDOM } from 'jsdom';
import markdownToHtml from 'zenn-markdown-html';
import { prepareDocgenMarkdown, restoreDocgenInlineCode } from './docgen-inline-code';

async function render(markdown: string): Promise<Document> {
  const prepared = prepareDocgenMarkdown(markdown);
  const document = new JSDOM(await markdownToHtml(prepared.markdown)).window.document;
  restoreDocgenInlineCode(document, prepared.inlineCodes);
  return document;
}

test('renders a linked docgen type as code instead of escaped HTML', async () => {
  const document = await render('<code><a href="#printoptions">PrintOptions</a></code>');

  assert.equal(document.querySelector('code')?.textContent, 'PrintOptions');
  assert.equal(document.querySelector('code a')?.getAttribute('href'), '#printoptions');
  assert.doesNotMatch(document.body.textContent ?? '', /<\/?code>/);
});

test('preserves complex TypeScript syntax and links inside docgen code', async () => {
  const document = await render(
    '<code>{ /** * Use enum */ value: <a href="#result">Result</a>; generic: Promise&lt;Result&gt;; example: `1.0`; }</code>',
  );

  assert.equal(
    document.querySelector('code')?.textContent,
    '{ /** * Use enum */ value: Result; generic: Promise<Result>; example: `1.0`; }',
  );
  assert.equal(document.querySelector('code a')?.getAttribute('href'), '#result');
  assert.doesNotMatch(document.body.textContent ?? '', /<\/?code>/);
});

test('converts docgen links outside code to Markdown links', async () => {
  const document = await render('See <a href="#result">Result</a>.');

  assert.equal(document.querySelector('a')?.getAttribute('href'), '#result');
  assert.equal(document.body.textContent?.trim(), 'See Result.');
});

test('leaves backtick and tilde fenced code examples unchanged', async () => {
  const document = await render(
    [
      '```html',
      '<code><a href="#result">literal</a></code>',
      '```',
      '',
      '~~~~html',
      '<code>also literal</code>',
      '~~~~',
    ].join('\n'),
  );

  const blocks = Array.from(document.querySelectorAll('pre code'));
  assert.equal(blocks.length, 2);
  assert.equal(blocks[0].textContent?.trim(), '<code><a href="#result">literal</a></code>');
  assert.equal(blocks[0].querySelector('code'), null);
  assert.equal(blocks[1].textContent?.trim(), '<code>also literal</code>');
  assert.equal(blocks[1].querySelector('code'), null);
});

test('leaves Markdown inline code spans unchanged', async () => {
  const document = await render(
    'Use `<code><a href="#result">literal</a></code>` and `` `<code>nested</code>` ``.',
  );

  const codes = Array.from(document.querySelectorAll('p > code'));
  assert.equal(codes.length, 2);
  assert.equal(codes[0].textContent, '<code><a href="#result">literal</a></code>');
  assert.equal(codes[0].querySelector('code'), null);
  assert.equal(codes[1].textContent, '`<code>nested</code>`');
  assert.equal(codes[1].querySelector('code'), null);
});

test('leaves no escaped docgen markup or placeholder tokens in generated projects', async () => {
  const generatedDirectory = new URL(
    '../projects/docs/src/app/generated/projects/',
    import.meta.url,
  );
  const files = (await readdir(generatedDirectory)).filter((file) =>
    file.endsWith('.generated.ts'),
  );

  for (const file of files) {
    const source = await readFile(new URL(file, generatedDirectory), 'utf8');
    assert.doesNotMatch(source, /&lt;\/?code&gt;|&lt;a href=|RDLABODOCGENCODE\d+PLACEHOLDER/, file);
  }
});
