export function resolveGeneratedHeadingId(ids: readonly string[], id: string): string {
  if (ids.includes(id)) return id;
  return ids.find((generatedId) => decodeURIComponent(generatedId) === id) ?? id;
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
