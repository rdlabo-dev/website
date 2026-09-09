import ts from 'typescript';

// Only remove comments recognized by the language parser, never comment-like
// text inside strings, template literals, regular expressions, or attributes.
export function normalizeTranslationCode(block: string): string {
  const opening = block.match(/^(\s*(?:`{3,}|~{3,}))([^\n]*)\n/);
  if (!opening) return block;
  const language = opening[2].trim().split(/[:\s]/)[0].toLowerCase();
  const closing = block.match(/\n\s*(?:`{3,}|~{3,})\s*$/);
  if (!closing || closing.index === undefined) return block;
  const code = block.slice(opening[0].length, closing.index);
  const ranges: { pos: number; end: number }[] = [];

  if (['ts', 'typescript', 'js', 'javascript', 'tsx', 'jsx'].includes(language)) {
    const file = ts.createSourceFile(
      'example.tsx',
      code,
      ts.ScriptTarget.Latest,
      true,
      ['tsx', 'jsx'].includes(language) ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    );
    const visit = (node: ts.Node): void => {
      ranges.push(...(ts.getLeadingCommentRanges(code, node.pos) ?? []));
      ranges.push(...(ts.getTrailingCommentRanges(code, node.end) ?? []));
      node.getChildren(file).forEach(visit);
    };
    visit(file);
  } else if (['xml', 'html'].includes(language)) {
    // Consume complete tags first so comment delimiters in attributes stay intact.
    const tokens =
      /<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<[^>"']*(?:(?:"[^"]*"|'[^']*')[^>"']*)*>/g;
    for (const match of code.matchAll(tokens)) {
      if (match[0].startsWith('<!--')) {
        ranges.push({ pos: match.index, end: match.index + match[0].length });
      }
    }
  }

  const unique = [...new Map(ranges.map((range) => [range.pos, range])).values()];
  let normalized = code;
  for (const { pos, end } of unique.sort((a, b) => b.pos - a.pos)) {
    if (
      /@ts-|@jsx|@license|@preserve|#__|@__|eslint|prettier|sourceMappingURL|sourceURL|^\/\/\//.test(
        code.slice(pos, end),
      )
    )
      continue;
    normalized = normalized.slice(0, pos) + normalized.slice(end);
  }
  return opening[0] + normalized + block.slice(closing.index);
}
