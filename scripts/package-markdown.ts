import { splitDocgenReadme } from './docgen-readme';

const LANDING_START = /^## Overview[ \t]*$/m;
const LANDING_END = /^## Index[ \t]*$/m;

function extractMarkedRegions(
  markdown: string,
  name: 'rdlabo-docs-omit' | 'rdlabo-docs-pick',
): { markdown: string; selected: string[] } {
  let output = '';
  const selected: string[] = [];
  let current: string | undefined;
  let fence: { marker: '`' | '~'; length: number } | undefined;
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const openMarker = new RegExp(`^\\s*<!--\\s*${escapedName}\\s*-->\\s*$`);
  const closeMarker = new RegExp(`^\\s*<!--\\s*\\/${escapedName}\\s*-->\\s*$`);

  for (const line of markdown.match(/[^\n]*(?:\n|$)/g)?.filter(Boolean) ?? []) {
    const content = line.replace(/\r?\n$/, '');
    const append = (): void => {
      if (current === undefined) output += line;
      else current += line;
    };

    if (fence) {
      append();
      const closing = content.match(/^ {0,3}(`+|~+)[ \t]*$/);
      if (closing && closing[1][0] === fence.marker && closing[1].length >= fence.length) {
        fence = undefined;
      }
      continue;
    }

    const openingFence = content.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (openingFence && !(openingFence[1][0] === '`' && openingFence[2].includes('`'))) {
      fence = {
        marker: openingFence[1][0] as '`' | '~',
        length: openingFence[1].length,
      };
      append();
      continue;
    }

    if (openMarker.test(content)) {
      if (current !== undefined) throw new Error(`nested ${name} block`);
      current = '';
      continue;
    }
    if (closeMarker.test(content)) {
      if (current === undefined) throw new Error(`${name} close marker without an open marker`);
      const selectedContent = current.trim();
      if (selectedContent) selected.push(selectedContent);
      current = undefined;
      continue;
    }
    append();
  }

  if (current !== undefined) throw new Error(`unclosed ${name} block`);
  return { markdown: output, selected };
}

/**
 * Drops README regions wrapped in `<!-- rdlabo-docs-omit -->` … `<!-- /rdlabo-docs-omit -->`.
 * The markers are HTML comments, so GitHub still shows the content between them.
 * Markers inside fenced code blocks are ignored; omit regions may contain fences.
 */
export function stripRdlaboDocsOmit(markdown: string): string {
  return extractMarkedRegions(markdown, 'rdlabo-docs-omit')
    .markdown.replace(/^\s+/, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s+$/, '\n');
}

/**
 * Extracts README regions that should be shown on the project Overview.
 * GitHub still renders the selected content at its original position because the
 * markers themselves are HTML comments. Markers inside fenced code are ignored.
 */
export function extractRdlaboDocsPick(markdown: string): {
  markdown: string;
  picked: string[];
} {
  const { markdown: withoutPick, selected } = extractMarkedRegions(markdown, 'rdlabo-docs-pick');
  return { markdown: withoutPick, picked: selected };
}

function landingFromOverview(markdown: string): string | undefined {
  const start = markdown.search(LANDING_START);
  if (start < 0) return undefined;
  const rest = markdown.slice(start);
  const end = rest.search(LANDING_END);
  return (end < 0 ? rest : rest.slice(0, end)).trim();
}

export function extractPackageReadmeParts(markdown: string): {
  readme: string;
  overview?: string;
  api?: string;
} {
  const withoutOmit = stripRdlaboDocsOmit(markdown);
  const { markdown: withoutPick, picked } = extractRdlaboDocsPick(withoutOmit);
  const stripped = stripLeadingH1(withoutPick);
  const selected = (landingFromOverview(stripped) ?? stripped).trim();
  const landing = selected.trim();
  if (!landing) {
    throw new Error('package README is empty after rdlabo-docs-omit');
  }
  const splitLanding = splitDocgenReadme(`${landing}\n`);
  const splitFull = splitDocgenReadme(markdown);
  return {
    readme: `${(splitLanding?.readme ?? landing).trim()}\n`,
    ...(picked.length ? { overview: picked.join('\n\n') } : {}),
    api: splitLanding?.api ?? splitFull?.api,
  };
}

export function extractPackageReadme(markdown: string): string {
  return extractPackageReadmeParts(markdown).readme;
}

export function stripLeadingH1(markdown: string): string {
  return markdown.replace(/^# [^\n]+\r?\n+/, '');
}

const API_PLACEHOLDER = /^(?:<!--\s*)?!::([a-zA-Z0-9_.-]+)::(?:\s*-->)?[ \t]*$/gm;

export function expandApiPlaceholders(
  markdown: string,
  api: Map<string, string>,
): { expanded: string; missing: string[] } {
  const missing: string[] = [];
  const expanded = markdown.replace(API_PLACEHOLDER, (_, id: string) => {
    const entry = api.get(id);
    if (!entry) missing.push(id);
    return entry ?? '';
  });
  return { expanded, missing };
}

export function apiAnchorFragments(api: Map<string, string>): Map<string, string> {
  const fragments = new Map<string, string>();
  for (const [name, markdown] of api) {
    const heading = markdown.match(/^#### `([^`]+)` (.+)$/m);
    if (!heading) continue;
    const kindSlug = heading[1].replaceAll(' ', '-');
    fragments.set(name.toLowerCase(), `${kindSlug}-${heading[2]}`.toLowerCase());
  }
  return fragments;
}

const LEGACY_GITHUB_OWNER = ['rdlabo', 'team'].join('-');

export function normalizePackageMarkdown(markdown: string): string {
  return markdown
    .replaceAll(`https://github.com/${LEGACY_GITHUB_OWNER}/`, 'https://github.com/rdlabo-dev/')
    .replaceAll(`${LEGACY_GITHUB_OWNER}/`, 'rdlabo-dev/');
}

export function rewritePackageDocLinks(
  markdown: string,
  apiAnchors: Map<string, string>,
  landingSlug = 'readme',
): string {
  return markdown.replace(/\]\((?!https?:|mailto:)([^)]+)\)/g, (match, target: string) => {
    const hashIndex = target.indexOf('#');
    const path = hashIndex < 0 ? target : target.slice(0, hashIndex);
    const hash = hashIndex < 0 ? '' : target.slice(hashIndex);
    const hashId = hash.slice(1).toLowerCase();

    if (
      !path ||
      path === '../README.md' ||
      path === './README.md' ||
      path === `/docs/${landingSlug}`
    ) {
      if (hashId === 'api') return '](/docs/api)';
      const apiFragment = hashId ? apiAnchors.get(hashId) : undefined;
      if (apiFragment) return `](/docs/api#${apiFragment})`;
      return `](/docs/${landingSlug}${hash})`;
    }

    const docFile = path.match(
      /^(?:\.\.\/)?(?:\.\/)?(?:docs\/)?((?:[a-z0-9-]+\/)*[a-z0-9-]+)\.md$/i,
    );
    if (docFile) return `](/docs/${docFile[1]}${hash})`;
    return match;
  });
}
