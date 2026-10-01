export function resolveGeneratedHeadingId(ids: readonly string[], id: string): string {
  if (ids.includes(id)) return id;
  return ids.find((generatedId) => decodeURIComponent(generatedId) === id) ?? id;
}

/** Preserve published fragments when an editorial correction renames a heading. */
export function addHeadingAliases(document: Document, aliases: unknown, context: string): void {
  if (aliases === undefined) return;
  if (!aliases || typeof aliases !== 'object' || Array.isArray(aliases)) {
    throw new Error(`${context}: headingAliases must map old IDs to current heading IDs`);
  }
  const headings = Array.from(document.querySelectorAll('h2, h3, h4'));
  const headingIds = headings.map((heading) => heading.id);
  for (const [alias, target] of Object.entries(aliases)) {
    if (!alias.trim() || typeof target !== 'string' || !target.trim()) {
      throw new Error(`${context}: headingAliases must contain non-empty string IDs`);
    }
    const targetId = resolveGeneratedHeadingId(headingIds, target);
    const heading = headings.find((entry) => entry.id === targetId);
    if (!heading) throw new Error(`${context}: missing alias target #${target}`);
    if (document.getElementById(alias)) throw new Error(`${context}: duplicate alias #${alias}`);
    const span = document.createElement('span');
    span.id = alias;
    span.setAttribute('data-docs-heading-alias', '');
    span.setAttribute('aria-hidden', 'true');
    heading.prepend(span);
  }
}

function replaceHeading(document: Document, heading: Element, level: number): Element {
  const replacement = document.createElement(`h${level}`);
  for (const attribute of Array.from(heading.attributes)) {
    replacement.setAttribute(attribute.name, attribute.value);
  }
  replacement.innerHTML = heading.innerHTML;
  heading.replaceWith(replacement);
  return replacement;
}

export function normalizeImportedReadmeHeadings(document: Document): void {
  const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  let foundDocumentTitle = false;
  let nestedRootOffset = 0;

  for (const heading of headings) {
    const level = Number(heading.tagName.slice(1));
    if (level === 1) {
      if (!foundDocumentTitle) {
        heading.remove();
        foundDocumentTitle = true;
        nestedRootOffset = 0;
        continue;
      }
      replaceHeading(document, heading, 2);
      nestedRootOffset = 1;
      continue;
    }

    if (nestedRootOffset > 0) {
      replaceHeading(document, heading, Math.min(6, level + nestedRootOffset));
    }
  }
}
