/** Drop editor annotations and redundant Shiki wrappers without changing code text or colors. */
export function compactDocsHtml(document: Document): void {
  for (const element of document.querySelectorAll('[data-line], .code-line')) {
    element.removeAttribute('data-line');
    element.classList.remove('code-line');
    if (element.getAttribute('class') === '') element.removeAttribute('class');
  }

  for (const code of document.querySelectorAll('pre.shiki > code')) {
    const color = code.parentElement
      ?.getAttribute('style')
      ?.match(/(?:^|;)\s*color:\s*(#[\da-f]{6})(?:;|$)/i)?.[1];
    if (!color || code.hasAttribute('style')) continue;

    // Zenn's CSS colors bare code white. Move the Shiki default onto <code> only
    // when every visible text node already has an explicit token color. Plain
    // text and diff blocks therefore retain their original inherited colors.
    const walker = document.createTreeWalker(code, 4 /* SHOW_TEXT */);
    let fullyColored = true;
    while (walker.nextNode()) {
      if (!walker.currentNode.textContent?.trim()) continue;
      let parent = walker.currentNode.parentElement;
      while (parent !== code && !parent?.style.color) parent = parent!.parentElement;
      if (parent === code) {
        fullyColored = false;
        break;
      }
    }
    if (!fullyColored) continue;

    const redundant = [...code.querySelectorAll(':scope > .line > span[style]')].filter(
      (span) =>
        span.attributes.length === 1 &&
        !span.children.length &&
        !span.parentElement?.hasAttribute('style') &&
        span.getAttribute('style')?.toLowerCase() === `color:${color.toLowerCase()}`,
    );
    if (!redundant.length) continue;
    code.setAttribute('style', `color:${color}`);
    for (const span of redundant) span.replaceWith(...span.childNodes);
  }
}
