import { createHash } from 'node:crypto';
import { normalizeTranslationCode } from './translation-code';

/** A source hash records an explicit review that a text fence is prose, not executable code. */
export function articleProseBlockRevision(block: string): string {
  return createHash('sha256').update(block.replaceAll('\r\n', '\n').trim()).digest('hex');
}

function textFenceBody(block: string): string | undefined {
  return block.trim().match(/^(`{3,}|~{3,})text\r?\n([\s\S]*?)\r?\n\1$/)?.[2];
}

export function assertArticleTranslationCode(
  sourceBlocks: readonly string[],
  targetBlocks: readonly string[],
  translatedProseBlocks: unknown = [],
): string[] {
  if (
    !Array.isArray(translatedProseBlocks) ||
    translatedProseBlocks.some(
      (hash) => typeof hash !== 'string' || !/^[a-f0-9]{64}$/.test(hash),
    ) ||
    new Set(translatedProseBlocks).size !== translatedProseBlocks.length
  ) {
    throw new Error(
      'translatedProseBlocks must contain unique SHA-256 hashes of reviewed text fences',
    );
  }
  if (sourceBlocks.length !== targetBlocks.length) {
    throw new Error('fenced block count differs from the Japanese source');
  }
  const pending = new Set<string>(translatedProseBlocks);
  const reviewed = new Set<string>(translatedProseBlocks);
  const translatedProse: string[] = [];
  for (const [index, source] of sourceBlocks.entries()) {
    const target = targetBlocks[index];
    const hash = articleProseBlockRevision(source);
    if (reviewed.has(hash)) {
      const sourceBody = textFenceBody(source);
      const targetBody = textFenceBody(target);
      if (!sourceBody?.trim() || !targetBody?.trim()) {
        throw new Error('reviewed prose must remain a non-empty text fence in both languages');
      }
      pending.delete(hash);
      translatedProse.push(targetBody);
    } else if (normalizeTranslationCode(source) !== normalizeTranslationCode(target)) {
      throw new Error('fenced code differs from the Japanese source beyond comments');
    }
  }
  if (pending.size) {
    throw new Error(
      'a reviewed prose source changed or is missing; review it before updating its hash',
    );
  }
  return translatedProse;
}
