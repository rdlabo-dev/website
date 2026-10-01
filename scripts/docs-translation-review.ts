import { createHash } from 'node:crypto';
import fm from 'front-matter';
import { JSDOM } from 'jsdom';
import { extractFencedCodeBlocks, normalizeTranslationCode } from './translation-code';
import { splitDocgenReadme } from './docgen-readme';

export function docsSourceRevision(markdown: string): string {
  return createHash('sha256').update(markdown.replaceAll('\r\n', '\n').trim()).digest('hex');
}

function protectedCode(markdown: string): string[] {
  let prose = markdown;
  for (const block of extractFencedCodeBlocks(markdown)) prose = prose.replace(block, '');
  const inlinePattern =
    /(?<!`)(`+)(?!`)((?:(?!\n[ \t]*(?:\n|[-+*][ \t]|\d+\.[ \t]|#{1,6}[ \t]))[\s\S])*?)\1(?!`)/g;
  const inline = [...prose.matchAll(inlinePattern)].map((match) => match[2]);
  // A missing closing delimiter must not consume the next paragraph. Keep the
  // remaining code on that line protected, allowing the delimiter to be repaired.
  const outsideInline = prose.replace(inlinePattern, (match) => match.replace(/[^\n]/g, ' '));
  inline.push(
    ...[...outsideInline.matchAll(/(?<!`)(`+)(?!`)([^`\n]+)(?=\n|$)/g)].map((match) => match[2]),
  );
  const htmlCode = [...JSDOM.fragment(prose).querySelectorAll('code')].map(
    (code) => code.textContent ?? '',
  );
  const signatures = [
    ...prose.matchAll(
      /^#{3,4}[ \t]+(?:`(?:method|interface|type alias|enum|class|component|directive|function|module|command|stylesheet|rule)`[ \t]+(.+)|([\w$.]+\([^\n]*\)))[ \t]*$/gm,
    ),
  ].map((match) => match[1] ?? match[2]);
  return [...inline, ...htmlCode, ...signatures].sort();
}

function assertProtectedCode(english: string, translated: string, context: string): void {
  if (JSON.stringify(protectedCode(english)) !== JSON.stringify(protectedCode(translated))) {
    throw new Error(
      `${context}: inline code, API identifiers, and signatures must remain unchanged`,
    );
  }
}

function assertApiTypeReferences(english: string, translated: string, context: string): void {
  const anchors = (text: string) =>
    [...JSDOM.fragment(text).querySelectorAll('a[href^="#"]')]
      .map((link) => `${link.getAttribute('href')}:${link.textContent}`)
      .sort();
  if (JSON.stringify(anchors(english)) !== JSON.stringify(anchors(translated))) {
    throw new Error(`${context}: API type references must remain unchanged`);
  }
  const typeHeadings = (text: string) =>
    [...text.matchAll(/^####\s+([a-zA-Z_$][\w$]*)\s*$/gm)].map((match) => match[1]).sort();
  if (JSON.stringify(typeHeadings(english)) !== JSON.stringify(typeHeadings(translated))) {
    throw new Error(`${context}: API type heading identifiers must remain unchanged`);
  }
}

/** A revision is recorded only after reviewing the translation against the exact English source. */
export function assertReviewedDocsTranslation(
  english: string,
  translated: string,
  context: string,
  options: { api?: boolean } = {},
): void {
  const parsed = fm<{ title?: string; sourceRevision?: string }>(translated);
  if (!parsed.attributes.title?.trim()) throw new Error(`${context}: translated title is required`);
  if (parsed.attributes.sourceRevision !== docsSourceRevision(english)) {
    throw new Error(
      `${context}: translation sourceRevision is missing or stale; review the translation before updating it`,
    );
  }
  const sourceBlocks = extractFencedCodeBlocks(fm(english).body).map(normalizeTranslationCode);
  const translatedBlocks = extractFencedCodeBlocks(parsed.body).map(normalizeTranslationCode);
  if (JSON.stringify(sourceBlocks) !== JSON.stringify(translatedBlocks)) {
    throw new Error(
      `${context}: translated code must preserve non-comment code and directives exactly`,
    );
  }
  const sourceBody = fm(english).body;
  const placeholders = (body: string) =>
    [...body.matchAll(/!::([a-zA-Z0-9_.-]+)::/g)].map((match) => match[1]);
  if (JSON.stringify(placeholders(sourceBody)) !== JSON.stringify(placeholders(parsed.body))) {
    throw new Error(`${context}: API placeholders must remain unchanged and in the same order`);
  }
  assertProtectedCode(sourceBody, parsed.body, context);
  const sourceDocgen = splitDocgenReadme(sourceBody);
  if (sourceDocgen) {
    const translatedDocgen = splitDocgenReadme(parsed.body);
    if (!translatedDocgen) throw new Error(`${context}: README docgen blocks must remain intact`);
    assertApiTypeReferences(sourceDocgen.api, translatedDocgen.api, context);
  }
  if (options.api) assertApiTypeReferences(sourceBody, parsed.body, context);
}

export function translateApiText(
  value: string,
  translations: Readonly<Record<string, string>>,
  context: string,
): string {
  if (!value.trim()) return value;
  const translated = translations[value];
  if (!translated?.trim()) throw new Error(`${context}: missing API translation for: ${value}`);
  assertProtectedCode(value, translated, context);
  assertApiTypeReferences(value, translated, context);
  return translated;
}
