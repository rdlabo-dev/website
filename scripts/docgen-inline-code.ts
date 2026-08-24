import { JSDOM } from 'jsdom';

const TOKEN_PATTERN = /RDLABODOCGENCODE(\d+)PLACEHOLDER/g;

function findClosingBackticks(markdown: string, start: number, length: number): number {
  const marker = '`'.repeat(length);
  let index = markdown.indexOf(marker, start);
  while (index !== -1) {
    if (markdown[index - 1] !== '`' && markdown[index + length] !== '`') return index;
    index = markdown.indexOf(marker, index + length);
  }
  return -1;
}

function prepareUnfencedMarkdown(markdown: string, inlineCodes: string[]): string {
  const lower = markdown.toLowerCase();
  let output = '';
  let index = 0;

  while (index < markdown.length) {
    if (markdown[index] === '`') {
      let length = 1;
      while (markdown[index + length] === '`') length += 1;
      const closing = findClosingBackticks(markdown, index + length, length);
      if (closing !== -1) {
        const end = closing + length;
        output += markdown.slice(index, end);
        index = end;
        continue;
      }
    }

    if (lower.startsWith('<code>', index)) {
      const closing = lower.indexOf('</code>', index + 6);
      if (closing !== -1) {
        const content = markdown.slice(index + 6, closing);
        const codeIndex = inlineCodes.push(content) - 1;
        output += `RDLABODOCGENCODE${codeIndex}PLACEHOLDER`;
        index = closing + 7;
        continue;
      }
    }

    if (lower.startsWith('<a', index)) {
      const match = markdown.slice(index).match(/^<a\s+href=(['"])(#[^'"]+)\1>([\s\S]*?)<\/a>/i);
      if (match) {
        output += `[${JSDOM.fragment(match[3]).textContent ?? ''}](${match[2]})`;
        index += match[0].length;
        continue;
      }
    }

    output += markdown[index];
    index += 1;
  }

  return output;
}

function prepareOutsideFences(markdown: string, inlineCodes: string[]): string {
  const lines = markdown.match(/[^\n]*(?:\n|$)/g)?.filter(Boolean) ?? [];
  let output = '';
  let unfenced = '';
  let fence: { marker: '`' | '~'; length: number } | undefined;

  const flushUnfenced = (): void => {
    output += prepareUnfencedMarkdown(unfenced, inlineCodes);
    unfenced = '';
  };

  for (const line of lines) {
    const content = line.replace(/\r?\n$/, '');
    if (fence) {
      output += line;
      const closing = content.match(/^ {0,3}(`+|~+)[ \t]*$/);
      if (closing && closing[1][0] === fence.marker && closing[1].length >= fence.length) {
        fence = undefined;
      }
      continue;
    }

    const opening = content.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (opening && !(opening[1][0] === '`' && opening[2].includes('`'))) {
      flushUnfenced();
      fence = {
        marker: opening[1][0] as '`' | '~',
        length: opening[1].length,
      };
      output += line;
      continue;
    }

    unfenced += line;
  }

  flushUnfenced();
  return output;
}

export function prepareDocgenMarkdown(markdown: string): {
  markdown: string;
  inlineCodes: string[];
} {
  const inlineCodes: string[] = [];
  return {
    markdown: prepareOutsideFences(markdown, inlineCodes),
    inlineCodes,
  };
}

function appendCodeContent(document: Document, code: HTMLElement, content: string): void {
  const source = JSDOM.fragment(content);
  for (const node of Array.from(source.childNodes)) {
    if (node.nodeType === node.TEXT_NODE) {
      code.append(document.createTextNode(node.textContent ?? ''));
      continue;
    }
    if (node.nodeName === 'BR') {
      code.append(document.createTextNode(' '));
      continue;
    }
    if (node.nodeName === 'A') {
      const href = (node as HTMLAnchorElement).getAttribute('href');
      if (href?.startsWith('#')) {
        const link = document.createElement('a');
        link.setAttribute('href', href);
        link.textContent = node.textContent ?? '';
        code.append(link);
        continue;
      }
    }
    code.append(document.createTextNode(node.textContent ?? ''));
  }
}

export function restoreDocgenInlineCode(document: Document, inlineCodes: readonly string[]): void {
  if (!inlineCodes.length) return;

  const walker = document.createTreeWalker(
    document.body,
    document.defaultView!.NodeFilter.SHOW_TEXT,
  );
  const textNodes: Text[] = [];
  let current: Node | null;
  while ((current = walker.nextNode())) {
    if (current.nodeValue?.includes('RDLABODOCGENCODE')) textNodes.push(current as Text);
  }

  for (const textNode of textNodes) {
    const value = textNode.nodeValue ?? '';
    const fragment = document.createDocumentFragment();
    let offset = 0;

    for (const match of value.matchAll(TOKEN_PATTERN)) {
      const index = match.index ?? 0;
      const codeIndex = Number(match[1]);
      const content = inlineCodes[codeIndex];
      if (content === undefined) continue;

      fragment.append(document.createTextNode(value.slice(offset, index)));
      const code = document.createElement('code');
      appendCodeContent(document, code, content);
      fragment.append(code);
      offset = index + match[0].length;
    }

    fragment.append(document.createTextNode(value.slice(offset)));
    textNode.replaceWith(fragment);
  }
}
