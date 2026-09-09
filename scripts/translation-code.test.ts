import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeTranslationCode } from './translation-code';

const block = (language: string, code: string) => `\`\`\`${language}\n${code}\n\`\`\`\n`;

test('allows explanatory XML and TypeScript comment translations', () => {
  for (const [language, before, after] of [
    ['xml', '<!-- 修正前 -->\n<key>value</key>', '<!-- Before -->\n<key>value</key>'],
    ['typescript', 'const n = 15; // 説明', 'const n = 15; // Explanation'],
    ['typescript', '/* 説明 */\nconst n = 15;', '/* Explanation */\nconst n = 15;'],
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
    ['sh', 'echo "# before"', 'echo "# after"'],
  ]) {
    assert.notEqual(
      normalizeTranslationCode(block(language, before)),
      normalizeTranslationCode(block(language, after)),
    );
  }
});
