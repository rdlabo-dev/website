import assert from 'node:assert/strict';
import test from 'node:test';
import { JSDOM } from 'jsdom';
import markdownToHtml from 'zenn-markdown-html';
import { rewritePackageDocLinks } from './package-markdown';
import { docgenApiAnchors, normalizeDocgenAnchors, splitDocgenReadme } from './docgen-readme';

test('docgen method links resolve after README splitting in both locale render paths', async () => {
  const api =
    "### getAvailability()\n\n### addListener('textChunk', ...)\n\n### Interfaces\n\n#### ChatOptions\n";
  const anchors = docgenApiAnchors(api);
  const document = new JSDOM(await markdownToHtml(api)).window.document;
  normalizeDocgenAnchors(document);
  for (const fragment of anchors.values()) assert.ok(document.getElementById(fragment), fragment);
  assert.ok(document.getElementById('getavailability()'), 'old renderer ID remains an alias');
  const source =
    '[method](../README.md#getavailability) [index](/docs/readme#getavailability) [event](#addlistenertextchunk-) [types](#interfaces)';
  assert.equal(
    rewritePackageDocLinks(source, anchors),
    '[method](/docs/api#getavailability) [index](/docs/api#getavailability) [event](/docs/api#addlistenertextchunk-) [types](/docs/api#interfaces)',
  );
});

test('splits a generated Capacitor API from its README', () => {
  const source = `# Plugin

## Install

npm install plugin

## API

<docgen-index>
* [run](#run)
</docgen-index>

<docgen-api>
### run(...)
</docgen-api>
`;

  assert.deepEqual(splitDocgenReadme(source), {
    readme: '# Plugin\n\n## Install\n\nnpm install plugin\n',
    api: '* [run](#run)\n\n### run(...)\n',
  });
});

test('splits docgen when an API heading sits between index and api blocks', () => {
  const source = `## Index

<docgen-index>
* [\`initialize(...)\`](#initialize)
</docgen-index>

## API

<docgen-api>
### initialize(...)
</docgen-api>
`;

  assert.deepEqual(splitDocgenReadme(source), {
    readme: '## Index\n',
    api: '* [`initialize(...)`](#initialize)\n\n### initialize(...)\n',
  });
});

test('does not split ordinary Markdown or incomplete docgen output', () => {
  assert.equal(splitDocgenReadme('# README\n\n## API\n'), undefined);
  assert.equal(splitDocgenReadme('# README\n\n<docgen-api>\nAPI\n</docgen-api>\n'), undefined);
});
