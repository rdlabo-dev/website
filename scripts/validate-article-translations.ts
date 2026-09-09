import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import fm from 'front-matter';
import { isTranslationArticle } from './import-zenn-articles';
import { normalizeTranslationCode } from './translation-code';

interface TranslationFrontMatter {
  title?: string;
  description?: string;
  zennSlug?: string;
  emoji?: string;
}

const root = resolve(process.cwd());
const stagedRoot = join(root, 'tmp/zenn-import');
const translatedRoot = join(root, 'projects/web-site/src/articles');

export function extractFencedCodeBlocks(markdown: string): string[] {
  const lines = markdown.split(/(?<=\n)/);
  const blocks: string[] = [];
  let current: string[] | undefined;
  let marker = '';
  let markerLength = 0;

  for (const line of lines) {
    if (!current) {
      const opening = line.match(/^\s*(`{3,}|~{3,})/);
      if (!opening) continue;
      marker = opening[1][0];
      markerLength = opening[1].length;
      current = [line];
      continue;
    }

    current.push(line);
    const closing = line.match(/^\s*(`+|~+)\s*(?:\r?\n)?$/);
    if (closing && closing[1][0] === marker && closing[1].length >= markerLength) {
      blocks.push(current.join(''));
      current = undefined;
    }
  }

  if (current) blocks.push(current.join(''));
  return blocks;
}

export function restoreFencedCodeBlocks(markdown: string, sourceBlocks: readonly string[]): string {
  let index = 0;
  const restored = markdown.replace(
    /^\s*(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\s*\1\s*(?:\r?\n|$)/gm,
    () => sourceBlocks[index++] ?? '',
  );
  if (index !== sourceBlocks.length) {
    throw new Error(`expected ${sourceBlocks.length} fenced blocks but found ${index}`);
  }
  return restored;
}

export function extractHeadingLevels(markdown: string): number[] {
  const withoutCode = markdown.replace(/^\s*(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\s*\1\s*$/gm, '');
  return Array.from(withoutCode.matchAll(/^(#{1,6})\s+/gm), (match) => match[1].length);
}

export function countJapaneseProseCharacters(markdown: string): number {
  const withoutCode = markdown
    .replace(/^\s*(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\s*\1\s*$/gm, ' ')
    .replace(/`[^`\n]+`/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ');
  return (withoutCode.match(/[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff]/g) ?? []).length;
}

async function validate(): Promise<void> {
  const fixCode = process.argv.includes('--fix-code');
  const stagedSlugs = (await readdir(stagedRoot))
    .filter((file) => file.endsWith('.md'))
    .map((file) => file.slice(0, -3))
    .sort();
  const errors: string[] = [];
  const untranslated: { slug: string; japaneseCharacters: number }[] = [];
  let validated = 0;
  let skippedTranslations = 0;

  for (const slug of stagedSlugs) {
    const sourcePath = join(stagedRoot, `${slug}.md`);
    const targetPath = join(translatedRoot, `${slug}.md`);
    const source = fm<TranslationFrontMatter>(await readFile(sourcePath, 'utf8'));
    if (isTranslationArticle(source.attributes.title ?? '', source.body)) {
      skippedTranslations += 1;
      continue;
    }
    let targetRaw: string;
    try {
      targetRaw = await readFile(targetPath, 'utf8');
    } catch {
      continue;
    }

    let target = fm<TranslationFrontMatter>(targetRaw);
    validated += 1;

    if (target.attributes.zennSlug !== slug) errors.push(`${slug}: zennSlug changed`);
    if (!target.attributes.title?.trim()) errors.push(`${slug}: missing translated title`);
    if (!target.attributes.description?.trim() || /TODO/i.test(target.attributes.description)) {
      errors.push(`${slug}: missing translated description`);
    }
    if (target.attributes.emoji !== source.attributes.emoji) errors.push(`${slug}: emoji changed`);

    const sourceCode = extractFencedCodeBlocks(source.body);
    const matchesCode = (blocks: string[]): boolean =>
      JSON.stringify(sourceCode.map(normalizeTranslationCode)) ===
      JSON.stringify(blocks.map(normalizeTranslationCode));
    let targetCode = extractFencedCodeBlocks(target.body);
    if (fixCode && sourceCode.length === targetCode.length && !matchesCode(targetCode)) {
      const restoredBody = restoreFencedCodeBlocks(target.body, sourceCode);
      targetRaw = targetRaw.slice(0, targetRaw.length - target.body.length) + restoredBody;
      await writeFile(targetPath, targetRaw, 'utf8');
      target = fm<TranslationFrontMatter>(targetRaw);
      targetCode = extractFencedCodeBlocks(target.body);
    }
    if (!matchesCode(targetCode)) {
      errors.push(`${slug}: fenced code differs from the Japanese source beyond comments`);
    }

    if (
      JSON.stringify(extractHeadingLevels(source.body)) !==
      JSON.stringify(extractHeadingLevels(target.body))
    ) {
      errors.push(`${slug}: heading levels/order changed`);
    }

    const japaneseCharacters = countJapaneseProseCharacters(target.body);
    if (japaneseCharacters > 0) untranslated.push({ slug, japaneseCharacters });
  }

  console.log(
    JSON.stringify(
      {
        expected: stagedSlugs.length - skippedTranslations,
        validated,
        missing: stagedSlugs.length - skippedTranslations - validated,
        skippedTranslations,
        errors,
        untranslated,
      },
      null,
      2,
    ),
  );
  if (errors.length) process.exitCode = 1;
}

validate().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
