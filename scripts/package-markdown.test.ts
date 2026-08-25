import assert from 'node:assert/strict';
import test from 'node:test';
import {
  apiAnchorFragments,
  expandApiPlaceholders,
  extractPackageReadme,
  extractPackageReadmeParts,
  extractRdlaboDocsPick,
  normalizePackageMarkdown,
  rewritePackageDocLinks,
  stripLeadingH1,
  stripRdlaboDocsOmit,
} from './package-markdown';

test('keeps Overview through Documentation and drops preamble, Index, and API', () => {
  const markdown = `<p align="center">badge</p>

## Maintainers

rdlabo

## Overview

Native AdMob.

## Installation

npm install

## Documentation

See [Banner Ads](./docs/banner.md).

## Index

<docgen-index>
* [\`initialize(...)\`](#initialize)
</docgen-index>

<docgen-api>
### initialize(...)
</docgen-api>

## License

MIT
`;

  assert.equal(
    extractPackageReadme(markdown),
    `## Overview

Native AdMob.

## Installation

npm install

## Documentation

See [Banner Ads](./docs/banner.md).
`,
  );
});

test('drops rdlabo-docs-omit regions and keeps the rest', () => {
  const markdown = `<!-- rdlabo-docs-omit -->
## Maintainers

rdlabo

<!-- /rdlabo-docs-omit -->

## Install

\`\`\`bash
npm install
\`\`\`

<!-- rdlabo-docs-omit -->
## License

MIT
<!-- /rdlabo-docs-omit -->
`;

  assert.equal(
    stripRdlaboDocsOmit(markdown),
    `## Install

\`\`\`bash
npm install
\`\`\`
`,
  );
  assert.equal(
    extractPackageReadme(markdown),
    `## Install

\`\`\`bash
npm install
\`\`\`
`,
  );
});

test('ignores omit markers inside fenced code', () => {
  const markdown = `## Overview

\`\`\`md
<!-- rdlabo-docs-omit -->
hidden in a sample
<!-- /rdlabo-docs-omit -->
\`\`\`
`;

  assert.equal(stripRdlaboDocsOmit(markdown), markdown);
});

test('ignores omit markers inside tilde fences and respects the closing fence length', () => {
  const markdown = `## Overview

~~~~md
<!-- rdlabo-docs-omit -->
literal example
<!-- /rdlabo-docs-omit -->
~~~
still fenced
~~~~
`;

  assert.equal(stripRdlaboDocsOmit(markdown), markdown);
});

test('extracts rdlabo-docs-pick regions for the project Overview', () => {
  const markdown = `# Theme

Intro.

<!-- rdlabo-docs-pick -->
![Theme screenshot](https://example.com/theme.png)
<!-- /rdlabo-docs-pick -->

## Overview

Theme details.

## Installation

npm install
`;

  assert.deepEqual(extractPackageReadmeParts(markdown), {
    readme: `## Overview

Theme details.

## Installation

npm install
`,
    overview: '![Theme screenshot](https://example.com/theme.png)',
    api: undefined,
  });
});

test('extracts localized rdlabo-docs-pick regions without leaving them in the README', () => {
  assert.deepEqual(
    extractRdlaboDocsPick(`紹介

<!-- rdlabo-docs-pick -->
![テーマのスクリーンショット](theme.png)
<!-- /rdlabo-docs-pick -->

## 概要

詳細
`),
    {
      markdown: `紹介


## 概要

詳細
`,
      picked: ['![テーマのスクリーンショット](theme.png)'],
    },
  );
});

test('ignores pick markers inside backtick and tilde fenced code', () => {
  const markdown = `## Overview

\`\`\`md
<!-- rdlabo-docs-pick -->
literal example
<!-- /rdlabo-docs-pick -->
\`\`\`

~~~~md
<!-- rdlabo-docs-pick -->
another literal example
<!-- /rdlabo-docs-pick -->
~~~~
`;

  assert.deepEqual(extractRdlaboDocsPick(markdown), { markdown, picked: [] });
});

test('throws on an unclosed rdlabo-docs-pick block', () => {
  assert.throws(
    () => extractRdlaboDocsPick('<!-- rdlabo-docs-pick -->\nScreenshot\n'),
    /unclosed rdlabo-docs-pick block/,
  );
});

test('throws on an unclosed rdlabo-docs-omit block', () => {
  assert.throws(
    () => stripRdlaboDocsOmit('<!-- rdlabo-docs-omit -->\n## License\n'),
    /unclosed rdlabo-docs-omit block/,
  );
});

test('omits regions that contain fenced code', () => {
  const markdown = `## Overview

Keep this.

<!-- rdlabo-docs-omit -->
## API

\`\`\`ts
initialize()
\`\`\`
<!-- /rdlabo-docs-omit -->
`;

  assert.equal(
    extractPackageReadme(markdown),
    `## Overview

Keep this.
`,
  );
});

test('extracts docgen API from an omit-wrapped README section', () => {
  const markdown = `## Overview

Keep this.

<!-- rdlabo-docs-omit -->
## Index

<docgen-index>
* [\`initialize(...)\`](#initialize)
</docgen-index>

<docgen-api>
### initialize(...)
</docgen-api>
<!-- /rdlabo-docs-omit -->
`;

  assert.equal(
    extractPackageReadme(markdown).trim(),
    `## Overview

Keep this.`,
  );
  assert.match(extractPackageReadmeParts(markdown).api ?? '', /### initialize\(\.\.\.\)/);
});

test('keeps a README that has no Overview heading', () => {
  assert.equal(
    extractPackageReadme(`# @rdlabo/capacitor-printer

## Install

\`\`\`bash
npm install
\`\`\`

## API

<docgen-index>
* [\`printFile(...)\`](#printfile)
</docgen-index>

<docgen-api>
### printFile(...)
</docgen-api>
`),
    `## Install

\`\`\`bash
npm install
\`\`\`
`,
  );
});
test('strips a leading markdown title', () => {
  assert.equal(stripLeadingH1('# Banner Ads\n\nHello.\n'), 'Hello.\n');
});

test('rewrites legacy GitHub org links to rdlabo-dev', () => {
  const legacyOwner = ['rdlabo', 'team'].join('-');
  assert.equal(
    normalizePackageMarkdown(`[theme](https://github.com/${legacyOwner}/ionic-theme-md3)`),
    '[theme](https://github.com/rdlabo-dev/ionic-theme-md3)',
  );
});

test('rewrites package-relative guide and API links', () => {
  const api = new Map([
    ['AdMobError', '#### `interface` AdMobError\nError payload.\n'],
    ['initialize', '#### `method` initialize(...)\nStart the SDK.\n'],
  ]);
  const markdown = `See [Installation](../README.md#installation), [initialize](../README.md#initialize), [\`AdMobError\`](../README.md#admoberror), [API](../README.md#api), [Banner](./banner.md), and [guides](./docs/consent.md).`;

  assert.equal(
    rewritePackageDocLinks(markdown, apiAnchorFragments(api)),
    'See [Installation](/docs/readme#installation), [initialize](/docs/api#method-initialize(...)), [`AdMobError`](/docs/api#interface-admoberror), [API](/docs/api), [Banner](/docs/banner), and [guides](/docs/consent).',
  );
});

test('expands bare and HTML-commented API placeholders', () => {
  const api = new Map([['createPaymentSheet', '#### `method` createPaymentSheet(...)\n']]);
  assert.equal(
    expandApiPlaceholders('Before\n\n!::createPaymentSheet::\n\nAfter\n', api).expanded,
    'Before\n\n#### `method` createPaymentSheet(...)\n\n\nAfter\n',
  );
  assert.equal(
    expandApiPlaceholders('Before\n\n<!-- !::createPaymentSheet:: -->\n\nAfter\n', api).expanded,
    'Before\n\n#### `method` createPaymentSheet(...)\n\n\nAfter\n',
  );
  assert.deepEqual(expandApiPlaceholders('!::missing::\n', api).missing, ['missing']);
});

test('rewrites nested package-relative guide links', () => {
  assert.equal(
    rewritePackageDocLinks(
      'See [Event Listeners](./docs/learn/event-listeners.md) and [the same page](./learn/event-listeners.md).',
      new Map(),
    ),
    'See [Event Listeners](/docs/learn/event-listeners) and [the same page](/docs/learn/event-listeners).',
  );
});
