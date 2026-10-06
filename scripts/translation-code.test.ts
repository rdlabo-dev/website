import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeTranslationCode } from './translation-code';
import {
  articleProseBlockRevision,
  assertArticleTranslationCode,
} from './article-translation-code';

const block = (language: string, code: string) => `\`\`\`${language}\n${code}\n\`\`\`\n`;

test('allows explanatory XML, TypeScript, CSS, shell, and Swift comment translations', () => {
  for (const [language, before, after] of [
    ['xml', '<!-- 修正前 -->\n<key>value</key>', '<!-- Before -->\n<key>value</key>'],
    ['typescript', 'const n = 15; // 説明', 'const n = 15; // Explanation'],
    ['typescript', '/* 説明 */\nconst n = 15;', '/* Explanation */\nconst n = 15;'],
    ['swift', '// 説明\nButton("Save") {}', '// Explanation\nButton("Save") {}'],
    ['bash', '# Run tests\nnpx playwright test', '# Tests ausführen\nnpx playwright test'],
    ['bash', 'npm run test:e2e  # Run tests', 'npm run test:e2e  # Tests ausführen'],
    ['sh', 'echo "# literal" # Description', 'echo "# literal" # Beschreibung'],
    [
      'sh',
      '  # pnpm users:\npnpm add package',
      '  # Pour les utilisateurs de pnpm :\npnpm add package',
    ],
    [
      'css',
      '/* Description */\n.reverse-scroll { display: flex; }',
      '/* Beschreibung */\n.reverse-scroll { display: flex; }',
    ],
  ]) {
    assert.equal(
      normalizeTranslationCode(block(language, before)),
      normalizeTranslationCode(block(language, after)),
    );
  }
});

test('preserves executable code, literals, whitespace, and behavior-affecting comments', () => {
  for (const [language, before, after] of [
    ['typescript', 'const n = 15;', 'const n = 16;'],
    ['typescript', 'const s = "// before";', 'const s = "// after";'],
    ['typescript', 'const s = `/* before */`;', 'const s = `/* after */`;'],
    ['typescript', 'const r = /\\/\\/before/;', 'const r = /\\/\\/after/;'],
    ['typescript', '// @ts-ignore\nconst n = 15;', '// Explanation\nconst n = 15;'],
    ['typescript', 'const n = 15;', 'const n =  15;'],
    ['xml', '<key value="<!-- before -->"/>', '<key value="<!-- after -->"/>'],
    ['xml', '<![CDATA[<!-- before -->]]>', '<![CDATA[<!-- after -->]]>'],
    [
      'html',
      '<script>const text = "<!-- before -->";</script>',
      '<script>const text = "<!-- after -->";</script>',
    ],
    [
      'html',
      '<style>.x { content: "<!-- before -->"; }</style>',
      '<style>.x { content: "<!-- after -->"; }</style>',
    ],
    ['sh', 'echo "# before"', 'echo "# after"'],
    ['sh', "echo '# before'", "echo '# after'"],
    ['sh', 'echo before#literal', 'echo after#literal'],
    ['sh', 'echo \\#before', 'echo \\#after'],
    ['bash', "printf '%s' $'a\\' # before'", "printf '%s' $'a\\' # after'"],
    ['bash', "printf '%s' before\\ #before", "printf '%s' before\\ #after"],
    ['bash', "printf '%s' @(a #before)", "printf '%s' @(a #after)"],
    ['bash', 'npm run test:e2e # Description', 'npm run test:e2e:update # Beschreibung'],
    ['bash', 'npm run test:e2e  # Description', 'npm run test:e2e # Beschreibung'],
    ['sh', 'echo "# before" # Description', 'echo "# after" # Beschreibung'],
    ['bash', 'echo ok # shellcheck disable=SC2034', 'echo ok # Description'],
    ['bash', '#!/bin/bash\necho ok', '# Description\necho ok'],
    ['bash', '# shellcheck disable=SC2034\nx=1', '# Description\nx=1'],
    ['bash', '#SBATCH --time=10\necho ok', '# Description\necho ok'],
    ['sh', '  # Description\necho ok', '# Description\necho ok'],
    ['swift', 'Button("Save") {}', 'Button("Share") {}'],
    ['swift', 'let s = "// before"', 'let s = "// after"'],
    ['swift', 'let s = "\\"// before"', 'let s = "\\"// after"'],
    ['swift', 'Button("Save") {}', 'Button("Save")  {}'],
    ['swift', '// swiftlint:disable all', '// Explanation'],
    ['swift', '#if DEBUG\n#endif', '#if RELEASE\n#endif'],
    ['css', '.x { content: "/* before */"; }', '.x { content: "/* after */"; }'],
    [
      'css',
      '.x { background: url(https://example.com/a/*before*/b); }',
      '.x { background: url(https://example.com/a/*after*/b); }',
    ],
    ['css', '.x { color: red; }', '.x { color: blue; }'],
    ['css', '.x { color: red; }', '.x {  color: red; }'],
    ['css', '/* stylelint-disable */\n.x {}', '/* Description */\n.x {}'],
    ['css', '/* purgecss start ignore */\n.x {}', '/* Description */\n.x {}'],
    ['css', '/*! Copyright */\n.x {}', '/* Description */\n.x {}'],
    ['css', '/*\\*/\n.x {}', '/* Description */\n.x {}'],
  ]) {
    assert.notEqual(
      normalizeTranslationCode(block(language, before)),
      normalizeTranslationCode(block(language, after)),
    );
  }
});

test('complex shell syntax retains comments and literal comment markers exactly', () => {
  for (const code of [
    'cat <<EOF\n# literal data\nEOF',
    'echo "line one\n# literal data\nline three"',
    "echo 'line one\n# literal data\nline three'",
    'echo \\`literal\\`',
    'echo $(printf "data")',
    "printf '%s' ${TASK_MISSING:-\n# before\n}",
    'echo $[16\n#ff]',
    '(( TASK_NUMBER = 16#ff ))',
    '[[ "$TASK_VALUE" =~ [#] ]]',
    'echo line\\\n# continued argument',
    'echo "unterminated',
  ]) {
    const original = block('bash', `# Description\n${code}`);
    assert.equal(normalizeTranslationCode(original), original);
  }
});

test('source diffs allow standalone comments while preserving changes and literals', () => {
  const before =
    '-     // Override after launch.\n-     start("// value")\n+     start("// value")';
  const after =
    '-     // Nach dem Start anpassen.\n-     start("// value")\n+     start("// value")';
  assert.equal(
    normalizeTranslationCode(block('diff', before)),
    normalizeTranslationCode(block('diff', after)),
  );
  for (const changed of [
    after.replace('-     //', '+     //'),
    after.replace('-     //', '-    //'),
    after.replace('start("// value")', 'stop("// value")'),
    after.replace('"// value"', '"// other"'),
    after.replace('// Nach dem Start anpassen.', '// @ts-ignore'),
  ]) {
    assert.notEqual(
      normalizeTranslationCode(block('diff', before)),
      normalizeTranslationCode(block('diff', changed)),
    );
  }
  for (const code of [
    '+ let s = """\n+ // literal\n+ """',
    '+ let s = #"// literal"#',
    '+ const s = `// literal`;',
    '+ const r = /pattern/;',
    '+ /* comment */',
    '+ let s = "unterminated',
  ]) {
    const original = block('diff', `- // Description\n${code}`);
    assert.equal(normalizeTranslationCode(original), original);
  }
});

test('XML diffs translate standalone comments while preserving attributes and diff markers', () => {
  const before =
    '+ <manifest xmlns:x="https://example.com">\n+   <!-- For Bluetooth -->\n+   <permission value="<!-- literal -->" />';
  const after = before.replace('For Bluetooth', 'Pour Bluetooth');
  assert.equal(
    normalizeTranslationCode(block('diff', before)),
    normalizeTranslationCode(block('diff', after)),
  );
  for (const changed of [
    after.replace('+   <!--', '-   <!--'),
    after.replace('<!-- literal -->', '<!-- autre -->'),
    after.replace('<permission', '<other'),
  ]) {
    assert.notEqual(
      normalizeTranslationCode(block('diff', before)),
      normalizeTranslationCode(block('diff', changed)),
    );
  }
  for (const code of [
    '+ <script>const s = `\n+ <!-- literal -->\n+ `;</script>',
    '+ <style>/* Description */</style>',
  ]) {
    const original = block('diff', code);
    assert.equal(normalizeTranslationCode(original), original);
  }
  const cdata = '+ <root>\n+ <![CDATA[\n+ <!-- literal -->\n+ ]]></root>';
  assert.equal(normalizeTranslationCode(block('diff', cdata)), block('diff', cdata));
});

test('malformed CSS and unsupported SCSS keep exact comparison', () => {
  for (const [language, code] of [
    ['css', '/* Description */\n.x {'],
    ['scss', '// Description\n$x: 1;'],
  ]) {
    const original = block(language, code);
    assert.equal(normalizeTranslationCode(original), original);
  }
});

test('keeps exact Swift comparison for syntax outside line-comment support', () => {
  for (const code of [
    'let s = """\n// content\n"""',
    'let s = #"// content"#',
    'let s = "\\(render("// content"))"',
    'let r = /pattern/',
    '/* outer /* nested */ comment */',
  ]) {
    const original = block('swift', `// 説明\n${code}`);
    assert.equal(normalizeTranslationCode(original), original);
  }
});

test('article prose diagrams require an explicit hash without exempting executable code', () => {
  const source = block('text', 'スクロールイベント\n  → requestAnimationFrame');
  const target = block('text', 'Scroll event\n  → requestAnimationFrame');
  const code = block('html', '<ad-slot id="feed"></ad-slot>');
  const hash = articleProseBlockRevision(source);
  assert.deepEqual(assertArticleTranslationCode([source, code], [target, code], [hash]), [
    'Scroll event\n  → requestAnimationFrame',
  ]);
  assert.throws(() => assertArticleTranslationCode([source], [target]), /fenced code differs/);
  assert.throws(
    () =>
      assertArticleTranslationCode([source, code], [target, code.replace('feed', 'other')], [hash]),
    /fenced code differs/,
  );
  assert.throws(
    () => assertArticleTranslationCode([code], [code], [articleProseBlockRevision(code)]),
    /non-empty text fence/,
  );
  assert.throws(
    () => assertArticleTranslationCode([source], [target.replace('text', 'bash')], [hash]),
    /non-empty text fence/,
  );
});

test('article prose review rejects source drift, removed blocks, and malformed metadata', () => {
  const source = block('text', 'スクロールイベント');
  const target = block('text', 'Scroll event');
  const hash = articleProseBlockRevision(source);
  assert.throws(() => assertArticleTranslationCode([source], [], [hash]), /block count/);
  const changed = block('text', '別の処理');
  assert.throws(() => assertArticleTranslationCode([changed], [changed], [hash]), /source changed/);
  assert.throws(() => assertArticleTranslationCode([], [], [hash]), /source changed/);
  for (const invalid of [hash, [hash, hash], ['not-a-hash'], [42]]) {
    assert.throws(
      () => assertArticleTranslationCode([source], [target], invalid),
      /unique SHA-256/,
    );
  }
});
