import { splitDocgenReadme } from './docgen-readme';

const LANDING_START = /^## Overview[ \t]*$/m;
const LANDING_END = /^## Index[ \t]*$/m;
const OVERVIEW_HEADING = /^## (?:Overview|概要)[ \t]*$/m;
const OMIT_OPEN = /<!--\s*rdlabo-docs-omit\s*-->/;
const OMIT_CLOSE = /<!--\s*\/rdlabo-docs-omit\s*-->/;

function firstMatch(
  pattern: RegExp,
  markdown: string,
  from: number,
): { index: number; length: number } | undefined {
  const match = markdown.slice(from).match(pattern);
  if (!match || match.index === undefined) return undefined;
  return { index: from + match.index, length: match[0].length };
}

/**
 * Drops README regions wrapped in `<!-- rdlabo-docs-omit -->` … `<!-- /rdlabo-docs-omit -->`.
 * The markers are HTML comments, so GitHub still shows the content between them.
 * Markers inside fenced code blocks are ignored; omit regions may contain fences.
 */
export function stripRdlaboDocsOmit(markdown: string): string {
  let i = 0;
  let inFence = false;
  let output = '';
  while (i < markdown.length) {
    if (inFence) {
      const end = markdown.indexOf('```', i);
      if (end < 0) {
        output += markdown.slice(i);
        break;
      }
      output += markdown.slice(i, end + 3);
      i = end + 3;
      inFence = false;
      continue;
    }

    const fenceAt = markdown.indexOf('```', i);
    const open = firstMatch(OMIT_OPEN, markdown, i);
    const close = firstMatch(OMIT_CLOSE, markdown, i);
    const nextFence = fenceAt < 0 ? Number.POSITIVE_INFINITY : fenceAt;
    const nextOpen = open?.index ?? Number.POSITIVE_INFINITY;
    const nextClose = close?.index ?? Number.POSITIVE_INFINITY;
    const next = Math.min(nextFence, nextOpen, nextClose);
    if (next === Number.POSITIVE_INFINITY) {
      output += markdown.slice(i);
      break;
    }
    if (next === nextFence) {
      output += markdown.slice(i, nextFence + 3);
      i = nextFence + 3;
      inFence = true;
      continue;
    }
    if (next === nextClose) {
      throw new Error('rdlabo-docs-omit close marker without an open marker');
    }
    output += markdown.slice(i, nextOpen);
    const afterOpen = nextOpen + (open?.length ?? 0);
    const closeInner = firstMatch(OMIT_CLOSE, markdown, afterOpen);
    if (!closeInner) {
      throw new Error('unclosed rdlabo-docs-omit block');
    }
    i = closeInner.index + closeInner.length;
  }
  return output
    .replace(/^\s+/, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s+$/, '\n');
}

/**
 * Extracts README regions that should be moved into the documentation Overview.
 * GitHub still renders the selected content at its original position because the
 * markers themselves are HTML comments. Markers inside fenced code are ignored.
 */
export function extractRdlaboDocsPick(markdown: string): {
  markdown: string;
  picked: string[];
} {
  let output = '';
  const picked: string[] = [];
  let currentPick = '';
  let fence: { marker: '`' | '~'; length: number } | undefined;

  for (const line of markdown.match(/[^\n]*(?:\n|$)/g)?.filter(Boolean) ?? []) {
    const content = line.replace(/\r?\n$/, '');
    const append = (): void => {
      if (currentPick) currentPick += line;
      else output += line;
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

    if (/^\s*<!--\s*rdlabo-docs-pick\s*-->\s*$/.test(content)) {
      if (currentPick) throw new Error('nested rdlabo-docs-pick block');
      currentPick = '\n';
      continue;
    }
    if (/^\s*<!--\s*\/rdlabo-docs-pick\s*-->\s*$/.test(content)) {
      if (!currentPick) {
        throw new Error('rdlabo-docs-pick close marker without an open marker');
      }
      const pickedContent = currentPick.trim();
      if (pickedContent) picked.push(pickedContent);
      currentPick = '';
      continue;
    }
    append();
  }
  if (currentPick) throw new Error('unclosed rdlabo-docs-pick block');
  return { markdown: output, picked };
}

function landingFromOverview(markdown: string): string | undefined {
  const start = markdown.search(LANDING_START);
  if (start < 0) return undefined;
  const rest = markdown.slice(start);
  const end = rest.search(LANDING_END);
  return (end < 0 ? rest : rest.slice(0, end)).trim();
}

function addPickedContentToOverview(markdown: string, picked: readonly string[]): string {
  if (!picked.length) return markdown;
  const overview = markdown.match(OVERVIEW_HEADING);
  const content = picked.join('\n\n');
  if (!overview || overview.index === undefined) return `${content}\n\n${markdown}`;
  const insertion = overview.index + overview[0].length;
  return `${markdown.slice(0, insertion)}\n\n${content}${markdown.slice(insertion)}`;
}

export function moveRdlaboDocsPickToOverview(markdown: string): string {
  const { markdown: withoutPick, picked } = extractRdlaboDocsPick(markdown);
  return addPickedContentToOverview(withoutPick, picked);
}

export function extractPackageReadmeParts(markdown: string): { readme: string; api?: string } {
  const withoutOmit = stripRdlaboDocsOmit(markdown);
  const { markdown: withoutPick, picked } = extractRdlaboDocsPick(withoutOmit);
  const stripped = stripLeadingH1(withoutPick);
  const selected = (landingFromOverview(stripped) ?? stripped).trim();
  const landing = addPickedContentToOverview(selected, picked).trim();
  if (!landing) {
    throw new Error('package README is empty after rdlabo-docs-omit');
  }
  const splitLanding = splitDocgenReadme(`${landing}\n`);
  const splitFull = splitDocgenReadme(markdown);
  return {
    readme: `${(splitLanding?.readme ?? landing).trim()}\n`,
    api: splitLanding?.api ?? splitFull?.api,
  };
}

export function extractPackageReadme(markdown: string): string {
  return extractPackageReadmeParts(markdown).readme;
}

export function stripLeadingH1(markdown: string): string {
  return markdown.replace(/^# [^\n]+\r?\n+/, '');
}

const API_PLACEHOLDER = /^(?:<!--\s*)?!::([a-zA-Z0-9]+)::(?:\s*-->)?[ \t]*$/gm;

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

    if (!path || path === '../README.md' || path === './README.md') {
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
