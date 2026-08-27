import { formatDescription, formatType } from '@capacitor/docgen/dist/formatting';
import { MarkdownTable } from '@capacitor/docgen/dist/markdown';
import { JSDOM } from 'jsdom';

function stripHtml(value: string): string {
  const fragment = JSDOM.fragment(value);
  for (const code of fragment.querySelectorAll('code')) {
    code.replaceWith(`\`${code.textContent ?? ''}\``);
  }
  return fragment.textContent ?? '';
}

const tagText = (tags: any[], name: string) => tags?.find((tag) => tag.name === name)?.text ?? '';

function appendEntry(entries: Map<string, string>, key: string, markdown: string): void {
  const existing = entries.get(key);
  entries.set(key, existing ? `${existing}\n${markdown}` : markdown);
}

function methodSelectors(method: any): string[] {
  if (!method.parameters?.length) return [];
  const type = String(method.parameters[0].type).trim();
  const literal = type.match(/^(['"])([^'"]+)\1$/)?.[2];
  const selector =
    literal ?? (/^[a-zA-Z_$][\w$]*(?:\.[a-zA-Z_$][\w$]*)+$/.test(type) ? type : undefined);
  if (!selector) return [];
  const parts = selector.split('.');
  return parts.map((_, index) => `${method.name}.${parts.slice(0, index + 1).join('.')}`);
}

export function apiMarkdown(source: any): Map<string, string> {
  const entries = new Map<string, string>();
  for (const method of source.api?.methods ?? []) {
    const signature =
      method.name === 'addListener' && method.parameters?.length
        ? `addListener(${String(method.parameters[0].type).replace(/"/g, "'")}, ...)`
        : `${method.name}(${method.parameters?.length ? '...' : ''})`;
    const markdown = `#### \`method\` ${signature}\n${formatDescription(source, method.docs) || ''}\n\n\`${method.name}${method.signature}\`\n`;
    appendEntry(entries, method.name, markdown);
    for (const selector of methodSelectors(method)) appendEntry(entries, selector, markdown);
  }
  for (const item of source.interfaces ?? []) {
    const table = new MarkdownTable();
    table.addHeader(['Prop', 'Type', 'Description', 'Default', 'Since']);
    for (const property of item.properties ?? []) {
      table.addRow([
        `**\`${property.name}\`**`,
        formatType(source, property.type).formatted,
        formatDescription(source, property.docs),
        tagText(property.tags, 'default'),
        tagText(property.tags, 'since'),
      ]);
    }
    table.removeEmptyColumns();
    entries.set(
      item.name,
      `#### \`interface\` ${item.name}\n${formatDescription(source, item.docs) || ''}\n${stripHtml(table.toMarkdown().join('\n'))}\n`,
    );
  }
  for (const item of source.typeAliases ?? []) {
    const types = item.types
      .map((type: any) => formatType(source, type.text).formatted)
      .join(' | ');
    entries.set(item.name, `#### \`type alias\` ${item.name}\n${stripHtml(types)}\n`);
  }
  for (const item of source.enums ?? []) {
    const table = new MarkdownTable();
    table.addHeader(['Member', 'Value', 'Description', 'Since']);
    for (const member of item.members ?? []) {
      table.addRow([
        `**\`${member.name}\`**`,
        formatType(source, member.value).formatted,
        formatDescription(source, member.docs),
        tagText(member.tags, 'since'),
      ]);
    }
    table.removeEmptyColumns();
    entries.set(
      item.name,
      `#### \`enum\` ${item.name}\n${stripHtml(table.toMarkdown().join('\n'))}\n`,
    );
  }
  return entries;
}
