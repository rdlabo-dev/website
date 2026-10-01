import ts from 'typescript';
import { parse as parseCss } from 'postcss';

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
  } else if (language === 'diff') {
    // Only standalone comments in simple source diffs are translatable.
    // Preserve diff markers and indentation; complex literals stay exact.
    if (/^(?:\s*\n)*[+ -]?[ \t]*</.test(code)) {
      if (/<(?:script|style)\b/i.test(code)) return block;
      let stripped = '';
      const positions: number[] = [];
      let offset = 0;
      for (const line of code.split(/(?<=\n)/)) {
        const start = /^[+ -]/.test(line) ? 1 : 0;
        for (let pos = start; pos < line.length; pos += 1) {
          stripped += line[pos];
          positions.push(offset + pos);
        }
        offset += line.length;
      }
      const tokens =
        /<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<[^>"']*(?:(?:"[^"]*"|'[^']*')[^>"']*)*>/g;
      for (const match of stripped.matchAll(tokens)) {
        if (match[0].startsWith('<!--') && !match[0].includes('\n')) {
          const before = stripped.slice(stripped.lastIndexOf('\n', match.index) + 1, match.index);
          const nextLine = stripped.indexOf('\n', match.index + match[0].length);
          const after = stripped.slice(
            match.index + match[0].length,
            nextLine < 0 ? undefined : nextLine,
          );
          if (!before.trim() && !after.trim()) {
            ranges.push({
              pos: positions[match.index],
              end: positions[match.index + match[0].length - 1] + 1,
            });
          }
        }
      }
    } else {
      let offset = 0;
      for (const line of code.split(/(?<=\n)/)) {
        const text = line.replace(/\r?\n$/, '');
        const start = /^[+ -]/.test(text) ? 1 : 0;
        let quote: string | undefined;
        for (let pos = start; pos < text.length; pos += 1) {
          const char = text[pos];
          if (quote) {
            if (char === '\\') pos += 1;
            else if (char === quote) quote = undefined;
          } else if (text.startsWith('//', pos)) {
            if (!text.slice(start, pos).trim()) {
              ranges.push({ pos: offset + pos, end: offset + text.length });
            }
            break;
          } else if (char === '"' || char === "'") {
            if (text.startsWith('"""', pos) || text[pos - 1] === '#') return block;
            quote = char;
          } else if (char === '/' || char === '`') return block;
        }
        if (quote) return block;
        offset += line.length;
      }
    }
  } else if (['sh', 'bash'].includes(language)) {
    // Support standalone comments and trailing comments in simple commands.
    // Expansion, heredocs, continuations, and multiline quoting stay exact.
    if (/<<|\$(?:[({'"]|\[)|\(\(|\[\[|[?*+@!]\(|`|\\(?:[ \t]|\r?\n)/.test(code)) return block;
    let offset = 0;
    for (const line of code.split(/(?<=\n)/)) {
      const text = line.replace(/\r?\n$/, '');
      const comment = text.match(/^[ \t]*(#.*)$/);
      if (comment) {
        ranges.push({ pos: offset + text.indexOf('#'), end: offset + text.length });
      } else {
        let quote: string | undefined;
        for (let pos = 0; pos < text.length; pos += 1) {
          const char = text[pos];
          if (char === '\\' && quote !== "'") pos += 1;
          else if (quote && char === quote) quote = undefined;
          else if (!quote && (char === '"' || char === "'")) quote = char;
          else if (!quote && char === '#' && /[ \t]/.test(text[pos - 1] ?? '')) {
            ranges.push({ pos: offset + pos, end: offset + text.length });
            break;
          }
        }
        if (quote) return block;
      }
      offset += line.length;
    }
  } else if (language === 'css') {
    // PostCSS distinguishes real comments from strings and unquoted URL values.
    // Unsupported or malformed syntax keeps exact comparison.
    try {
      parseCss(code).walkComments((comment) => {
        const pos = comment.source?.start?.offset;
        const end = comment.source?.end?.offset;
        if (pos !== undefined && end !== undefined) ranges.push({ pos, end });
      });
    } catch {
      return block;
    }
  } else if (language === 'swift') {
    // Support ordinary strings and line comments. Keep exact comparison for
    // raw/multiline/interpolated strings, regex literals, and block comments.
    for (let pos = 0; pos < code.length; pos += 1) {
      if (code.startsWith('//', pos)) {
        const newline = code.indexOf('\n', pos);
        const end = newline === -1 ? code.length : newline;
        ranges.push({ pos, end });
        pos = end - 1;
      } else if (code[pos] === '"') {
        if (code.startsWith('"""', pos) || code[pos - 1] === '#') return block;
        let closed = false;
        for (pos += 1; pos < code.length; pos += 1) {
          if (code.startsWith('\\(', pos)) return block;
          if (code[pos] === '\\') pos += 1;
          else if (code[pos] === '"') {
            closed = true;
            break;
          } else if (code[pos] === '\n') return block;
        }
        if (!closed) return block;
      } else if (code[pos] === '/') return block;
    }
  } else if (['xml', 'html'].includes(language)) {
    // Embedded JavaScript/CSS needs its own parser; comment-like literals stay exact.
    if (/<(?:script|style)\b/i.test(code)) return block;
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
    const comment = code.slice(pos, end);
    if (
      /@ts-|@jsx|@license|@preserve|#__|@__|eslint|prettier|swiftlint|swiftformat|sourcery|sourceMappingURL|sourceURL|^\/\/\//.test(
        comment,
      )
    )
      continue;
    if (
      ['sh', 'bash'].includes(language) &&
      /shellcheck|shfmt|shellfmt|^#(?:!|SBATCH\b|PBS\b|BSUB\b)/.test(comment)
    )
      continue;
    if (
      language === 'css' &&
      /\\|^\/\*!|\b(?:stylelint|csslint|cssnano|postcss|purgecss|tailwind|clean-css)\b|@noflip|rtl:|ltr:/.test(
        comment,
      )
    )
      continue;
    normalized = normalized.slice(0, pos) + normalized.slice(end);
  }
  return opening[0] + normalized + block.slice(closing.index);
}

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
