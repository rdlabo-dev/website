import { ARTICLE_SUMMARIES, ARTICLE_YEARS } from '../generated/article-catalog.generated';
import { ARTICLE_LOADERS } from '../generated/article-loaders.generated';

export interface ArticleSummary {
  slug: string;
  title: string;
  description: string;
  emoji: string;
  sourceName: 'Zenn' | 'note';
  originalUrl: string;
  publishedAt: string;
  publishedDate: string;
  updatedAt?: string;
  image: string;
  imageWidth?: number;
  imageHeight?: number;
}

export interface ArticleDetail extends ArticleSummary {
  html: string;
  headings: readonly ArticleHeading[];
}

export interface ArticleHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

export const articleSummaries = ARTICLE_SUMMARIES as readonly ArticleSummary[];
export const articleYears = ARTICLE_YEARS as readonly string[];

export async function loadArticle(slug: string): Promise<ArticleDetail | undefined> {
  const summary = articleSummaries.find((article) => article.slug === slug);
  const loader = ARTICLE_LOADERS[slug];
  if (!summary || !loader) return undefined;
  return { ...summary, ...(await loader()).default };
}

export function formatArticleDate(date: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(`${date}T00:00:00+09:00`));
}
