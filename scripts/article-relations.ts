import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import fm from 'front-matter';
import { projectDefinitions } from './project-manifest';

export interface RelatedArticle {
  slug: string;
  title: string;
  description: string;
  publishedDate: string;
  url: string;
}

export function parseRelatedLibraryIds(value: unknown, file: string): string[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== 'string')) {
    throw new Error(`${file} must declare relatedLibraries as an array of project IDs`);
  }
  const ids = [...new Set(value.map((entry) => entry.trim()))];
  if (ids.some((id) => !id)) {
    throw new Error(`${file} must not declare an empty relatedLibraries project ID`);
  }
  for (const id of ids) {
    if (!projectDefinitions.some((project) => project.id === id)) {
      throw new Error(`${file} declares unknown relatedLibraries project ID: ${id}`);
    }
  }
  return ids;
}

function requiredArticleField(value: unknown, field: string, file: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${file} with relatedLibraries must declare a non-empty ${field}`);
  }
  return value.trim();
}

export async function loadRelatedArticlesByLibrary(
  articlesDirectory: string,
): Promise<Map<string, RelatedArticle[]>> {
  const related = new Map<string, RelatedArticle[]>();
  const files = (await readdir(articlesDirectory))
    .filter((entry) => entry.endsWith('.md'))
    .sort((left, right) => left.localeCompare(right, 'en'));

  for (const file of files) {
    const parsed = fm<Record<string, unknown>>(
      await readFile(join(articlesDirectory, file), 'utf8'),
    );
    const libraryIds = parseRelatedLibraryIds(parsed.attributes['relatedLibraries'], file);
    if (!libraryIds.length) continue;

    const slug = requiredArticleField(
      parsed.attributes['slug'] ?? parsed.attributes['zennSlug'],
      'slug',
      file,
    );
    const title = requiredArticleField(parsed.attributes['title'], 'title', file);
    const description = requiredArticleField(parsed.attributes['description'], 'description', file);
    const publishedDate = requiredArticleField(
      parsed.attributes['publishedDate'],
      'publishedDate',
      file,
    );

    for (const libraryId of libraryIds) {
      const entries = related.get(libraryId) ?? [];
      entries.push({
        slug,
        title,
        description,
        publishedDate,
        url: `https://rdlabo.dev/articles/${slug}`,
      });
      related.set(libraryId, entries);
    }
  }
  for (const entries of related.values()) {
    entries.sort(
      (left, right) =>
        right.publishedDate.localeCompare(left.publishedDate, 'en') ||
        left.slug.localeCompare(right.slug, 'en'),
    );
  }
  return related;
}
