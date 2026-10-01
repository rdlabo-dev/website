import assert from 'node:assert/strict';
import test from 'node:test';
import { apiMarkdown } from './docgen-api';
import {
  assertReviewedDocsTranslation,
  docsSourceRevision,
  translateApiText,
} from './docs-translation-review';

const english = '# Guide\n\n```ts\n// Start the service\nstart("literal");\n```\n';
const translation = (body: string, revision = docsSourceRevision(english)) =>
  `---\ntitle: Guide traduit\nsourceRevision: ${revision}\n---\n${body}`;

test('reviewed docs allow comment translation while preserving executable code', () => {
  const translated = translation(english.replace('Start the service', 'Démarrer le service'));
  assert.doesNotThrow(() => assertReviewedDocsTranslation(english, translated, 'fr/guide'));
  assert.throws(
    () =>
      assertReviewedDocsTranslation(english, translated.replace('literal', 'littéral'), 'fr/guide'),
    /non-comment code/,
  );
});

test('source changes invalidate translation approval', () => {
  assert.throws(
    () =>
      assertReviewedDocsTranslation(`${english}\nNew behavior`, translation(english), 'de/guide'),
    /stale/,
  );
  assert.throws(
    () => assertReviewedDocsTranslation(english, translation(english, ''), 'de/guide'),
    /missing or stale/,
  );
});

test('API placeholders cannot disappear from translated guides', () => {
  const source = 'Call initialize.\n\n<!-- !::initialize:: -->\n';
  const translated = translation('Appelez initialize.\n', docsSourceRevision(source));
  assert.throws(
    () => assertReviewedDocsTranslation(source, translated, 'fr/guide'),
    /API placeholders/,
  );
});

test('README API signatures and HTML code cannot be rewritten', () => {
  const source =
    '### initialize(...)\n\n`initialize(options: InitializeOptions): Promise<void>`\n\n<code>InitializeOptions</code>\n';
  const revision = docsSourceRevision(source);
  assert.throws(
    () =>
      assertReviewedDocsTranslation(
        source,
        translation(source.replace('options: InitializeOptions', ''), revision),
        'de/API',
      ),
    /signatures/,
  );
  assert.throws(
    () =>
      assertReviewedDocsTranslation(
        source,
        translation(source.replace('### initialize(...)', '### initialize()'), revision),
        'de/API',
      ),
    /signatures/,
  );
  assert.throws(
    () =>
      assertReviewedDocsTranslation(
        source,
        translation(
          source.replace('<code>InitializeOptions</code>', '<code>Options</code>'),
          revision,
        ),
        'de/API',
      ),
    /identifiers/,
  );
});

test('API prose translations preserve code and generated type links', () => {
  const source = 'Pass <a href="#initializeoptions">InitializeOptions</a> to `initialize()`.';
  assert.throws(
    () => translateApiText(source, { [source]: 'Passez des options à `initialize()`.' }, 'fr/API'),
    /type references/,
  );
  assert.throws(
    () =>
      translateApiText(
        source,
        { [source]: 'Pass <a href="#initializeoptions">InitializeOptions</a> to `initialiser()`.' },
        'fr/API',
      ),
    /identifiers/,
  );
});

test('standalone and embedded README APIs preserve type links while guide anchors can localize', () => {
  const api = '| options | <a href="#initializeoptions">InitializeOptions</a> |';
  const source = `### initialize(...)\n\n${api}\n\n### Interfaces\n\n#### InitializeOptions\n`;
  for (const changed of [
    source.replace('#initializeoptions', '#wrong-type'),
    source.replace('>InitializeOptions<', '>Options<'),
  ]) {
    assert.throws(
      () =>
        assertReviewedDocsTranslation(
          source,
          translation(changed, docsSourceRevision(source)),
          'fr/API',
          { api: true },
        ),
      /type references/,
    );
  }
  assert.throws(
    () =>
      assertReviewedDocsTranslation(
        source,
        translation(
          source.replace('#### InitializeOptions', '#### Options'),
          docsSourceRevision(source),
        ),
        'de/API',
        { api: true },
      ),
    /heading identifiers/,
  );
  const embedded = `# Guide\n\n<docgen-index>\n* initialize\n</docgen-index>\n\n<docgen-api>\n${source}\n</docgen-api>\n`;
  assert.throws(
    () =>
      assertReviewedDocsTranslation(
        embedded,
        translation(
          embedded.replace('#initializeoptions', '#wrong-type'),
          docsSourceRevision(embedded),
        ),
        'de/README',
      ),
    /type references/,
  );
  const guide = '<a href="#listen">Listen to the result</a>';
  assert.doesNotThrow(() =>
    assertReviewedDocsTranslation(
      guide,
      translation('<a href="#écouter">Écouter le résultat</a>', docsSourceRevision(guide)),
      'fr/guide',
    ),
  );
});

test('nested code fences and compiler directives cannot bypass translation checks', () => {
  const source = '  ~~~ts\n  // @ts-expect-error\n  run();\n  ~~~\n';
  const target = translation(
    source.replace('@ts-expect-error', '@ts-ignore'),
    docsSourceRevision(source),
  );
  assert.throws(
    () => assertReviewedDocsTranslation(source, target, 'de/guide'),
    /non-comment code/,
  );
});

test('API prose is localized while signatures and identifiers stay package-owned', () => {
  const source = {
    interfaces: [],
    typeAliases: [],
    enums: [],
    api: {
      methods: [
        {
          name: 'start',
          parameters: [],
          signature: '() => Promise<void>',
          docs: 'Starts the service.',
        },
      ],
    },
  };
  const entries = apiMarkdown(source, (text) =>
    translateApiText(text, { 'Starts the service.': 'Démarre le service.' }, 'fr/API'),
  );
  assert.match(entries.get('start')!, /Démarre le service\./);
  assert.match(entries.get('start')!, /start\(\) => Promise<void>/);
  assert.throws(
    () => apiMarkdown(source, (text) => translateApiText(text, {}, 'fr/API')),
    /missing API translation/,
  );
});
