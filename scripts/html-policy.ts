import { JSDOM } from 'jsdom';

const ALLOWED_TAGS = new Set([
  'a',
  'aside',
  'blockquote',
  'br',
  'code',
  'div',
  'details',
  'del',
  'em',
  'figcaption',
  'figure',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'img',
  'li',
  'mark',
  'ol',
  'p',
  'pre',
  'section',
  'span',
  'strong',
  'sub',
  'summary',
  'sup',
  'table',
  'tbody',
  'td',
  'th',
  'thead',
  'tr',
  'ul',
]);

const ALLOWED_ATTRIBUTES = new Set([
  'alt',
  'aria-hidden',
  'class',
  'colspan',
  'data-line',
  'data-docs-heading-alias',
  'fetchpriority',
  'height',
  'href',
  'id',
  'loading',
  'rel',
  'rowspan',
  'src',
  'start',
  'style',
  'target',
  'title',
  'width',
]);

const SAFE_URL = /^(?:https?:|mailto:|\/|\.\/|\.\.\/|#)/i;

function hasOnlySafeStyles(value: string): boolean {
  return value
    .split(';')
    .map((declaration) => declaration.trim())
    .filter(Boolean)
    .every(
      (declaration) =>
        /^(?:background-color|color):#[0-9a-f]{6}$/i.test(declaration) ||
        declaration === 'display:none' ||
        /^font-weight:(?:bold|normal|[1-9]00)$/.test(declaration) ||
        /^font-style:(?:italic|normal)$/.test(declaration) ||
        /^text-align:(?:left|right|center)$/.test(declaration),
    );
}

export function enforceGeneratedHtmlPolicy(html: string, context: string): string {
  const document = new JSDOM('<!doctype html><body></body>').window.document;
  document.body.innerHTML = html;
  for (const element of Array.from(document.body.querySelectorAll('*'))) {
    const tag = element.tagName.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) {
      throw new Error(`${context} generated a disallowed <${tag}> element`);
    }
    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase();
      if (!ALLOWED_ATTRIBUTES.has(name)) {
        throw new Error(`${context} generated a disallowed ${name} attribute on <${tag}>`);
      }
      if (name === 'style' && !hasOnlySafeStyles(attribute.value.replace(/\s/g, ''))) {
        throw new Error(
          `${context} generated an unsafe style attribute on <${tag}>: ${attribute.value}`,
        );
      }
      if ((name === 'href' || name === 'src') && !SAFE_URL.test(attribute.value.trim())) {
        throw new Error(`${context} generated an unsafe ${name} URL on <${tag}>`);
      }
      if (name === 'target' && attribute.value !== '_blank') {
        throw new Error(`${context} generated an unsupported link target`);
      }
      if (name === 'start' && (tag !== 'ol' || !/^-?\d+$/.test(attribute.value))) {
        throw new Error(`${context} generated an invalid start attribute on <${tag}>`);
      }
    }
    if (tag === 'a' && element.getAttribute('target') === '_blank') {
      const rel = new Set((element.getAttribute('rel') ?? '').split(/\s+/).filter(Boolean));
      if (!rel.has('noopener') || !rel.has('noreferrer')) {
        throw new Error(`${context} generated an external link without noopener noreferrer`);
      }
    }
  }
  return document.body.innerHTML;
}
