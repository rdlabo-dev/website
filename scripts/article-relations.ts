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

interface RelatedArticleSummary {
  slug: string;
  title: string;
  description: string;
  publishedDate: string;
  relatedLibraries?: readonly { id: string }[];
}

function requiredArticleField(value: unknown, field: string, article: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${article} with relatedLibraries must declare a non-empty ${field}`);
  }
  return value.trim();
}

export function groupRelatedArticlesByLibrary(
  summaries: readonly RelatedArticleSummary[],
): Map<string, RelatedArticle[]> {
  const related = new Map<string, RelatedArticle[]>();
  for (const summary of summaries) {
    const libraryIds = parseRelatedLibraryIds(
      summary.relatedLibraries?.map(({ id }) => id),
      summary.slug,
    );
    if (!libraryIds.length) continue;

    const slug = requiredArticleField(summary.slug, 'slug', summary.slug);
    const title = requiredArticleField(summary.title, 'title', slug);
    const description = requiredArticleField(summary.description, 'description', slug);
    const publishedDate = requiredArticleField(summary.publishedDate, 'publishedDate', slug);

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
