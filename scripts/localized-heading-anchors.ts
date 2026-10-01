import { JSDOM } from 'jsdom';

/** Keep links to source-language headings working after their visible text is translated. */
export function preserveSourceHeadingLinks(
  sourceHtml: string,
  translatedHtml: string,
  context: string,
): string {
  const sourceDom = new JSDOM(sourceHtml);
  const translatedDom = new JSDOM(translatedHtml);
  try {
    const source = sourceDom.window.document;
    const translated = translatedDom.window.document;
    const sourceHeadings = [...source.querySelectorAll('h2, h3, h4')];
    const translatedHeadings = [...translated.querySelectorAll('h2, h3, h4')];
    if (
      sourceHeadings.length !== translatedHeadings.length ||
      sourceHeadings.some((heading, index) => heading.tagName !== translatedHeadings[index].tagName)
    ) {
      throw new Error(`${context}: translated headings must preserve source levels and order`);
    }
    for (const [index, heading] of sourceHeadings.entries()) {
      const target = translatedHeadings[index];
      if (!heading.id || heading.id === target.id) continue;
      const existing = translated.getElementById(heading.id);
      if (existing) {
        throw new Error(
          `${context}: translated heading collides with source anchor #${heading.id}`,
        );
      }
      const alias = translated.createElement('span');
      alias.id = heading.id;
      alias.setAttribute('data-docs-heading-alias', '');
      alias.setAttribute('aria-hidden', 'true');
      target.prepend(alias);
    }
    return translated.body.innerHTML;
  } finally {
    sourceDom.window.close();
    translatedDom.window.close();
  }
}
