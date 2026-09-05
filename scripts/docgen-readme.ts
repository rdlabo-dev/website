const DOCGEN_SECTION =
  /(?:^#{1,6}[ \t]+API[ \t]*\r?\n[ \t]*\r?\n)?<docgen-index>[ \t]*\r?\n([\s\S]*?)\r?\n[ \t]*<\/docgen-index>(?:[ \t]*\r?\n)+(?:^#{1,6}[ \t]+API[ \t]*\r?\n(?:[ \t]*\r?\n)?)?<docgen-api>[ \t]*\r?\n([\s\S]*?)\r?\n[ \t]*<\/docgen-api>/m;

export interface SplitDocgenReadme {
  readme: string;
  api: string;
}

/** GitHub-style fragments used by Capacitor docgen's index links. */
export function docgenFragment(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^\p{L}\p{N}_\s-]/gu, '')
    .replace(/\s/g, '-');
}

/** Map README links and API names to the standalone docgen page's fragments. */
export function docgenApiAnchors(markdown: string): Map<string, string> {
  const anchors = new Map<string, string>();
  for (const [, heading] of markdown.matchAll(/^#{3,4} (.+)$/gm)) {
    const fragment = docgenFragment(heading);
    anchors.set(fragment, fragment);
    anchors.set(heading.replace(/\(.*$/, '').toLowerCase(), fragment);
  }
  return anchors;
}

/** Align heading IDs with docgen links while retaining the renderer's old IDs as aliases. */
export function normalizeDocgenAnchors(document: Document): void {
  for (const heading of Array.from(document.querySelectorAll('h3, h4'))) {
    const fragment = docgenFragment(heading.textContent?.trim() ?? '');
    const previous = heading.id;
    if (!fragment || previous === fragment || document.getElementById(fragment)) continue;
    heading.id = fragment;
    if (previous) {
      const alias = document.createElement('span');
      alias.id = previous;
      heading.before(alias);
    }
    const permalink = heading.querySelector('a.header-anchor-link');
    if (permalink) permalink.setAttribute('href', `#${fragment}`);
  }
}

/**
 * Turns the sections maintained by Capacitor docgen into a standalone API page.
 * A README without both docgen blocks is left alone.
 */
export function splitDocgenReadme(markdown: string): SplitDocgenReadme | undefined {
  const match = DOCGEN_SECTION.exec(markdown);
  if (!match) return undefined;

  const readme = `${markdown.slice(0, match.index).trimEnd()}\n${markdown
    .slice(match.index + match[0].length)
    .trimStart()}`.trimEnd();

  return {
    readme: `${readme}\n`,
    api: `${match[1].trim()}\n\n${match[2].trim()}\n`,
  };
}
