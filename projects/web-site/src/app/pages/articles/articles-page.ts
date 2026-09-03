import { Component, computed, effect, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

import {
  articleCategories,
  ArticleSummary,
  articleSummaries,
  articleYears,
  formatArticleDate,
} from '../../articles/article-data';
import { ArticleSidebar } from '../../components/article-sidebar/article-sidebar';
import { articlesBreadcrumbStructuredData } from '../../seo-json-ld';
import { SeoService } from '../../seo.service';
import { SITE } from '../../site-config';

interface ArticleMonth {
  label: string;
  articles: readonly ArticleSummary[];
}

@Component({
  selector: 'app-articles-page',
  imports: [RouterLink, ArticleSidebar],
  templateUrl: './articles-page.html',
})
export class ArticlesPage {
  readonly #route = inject(ActivatedRoute);
  readonly #seo = inject(SeoService);
  protected readonly site = SITE;
  protected readonly years = articleYears;
  protected readonly selectedYear = toSignal(
    this.#route.paramMap.pipe(map((params) => params.get('year'))),
    { initialValue: this.#route.snapshot.paramMap.get('year') },
  );
  protected readonly requestedLibrary = toSignal(
    this.#route.queryParamMap.pipe(map((params) => params.get('library'))),
    { initialValue: this.#route.snapshot.queryParamMap.get('library') },
  );
  protected readonly selectedCategory = computed(() =>
    articleCategories.find((category) => category.id === this.requestedLibrary()),
  );
  protected readonly months = computed(() => {
    const selectedYear = this.selectedYear();
    const selectedLibrary = this.selectedCategory()?.id;
    const articles = selectedLibrary
      ? articleSummaries
      : selectedYear
        ? articleSummaries.filter((article) => article.publishedDate.startsWith(selectedYear))
        : articleSummaries.slice(0, 12);
    return this.#groupByMonth(
      selectedLibrary
        ? articles.filter((article) =>
            article.relatedLibraries?.some((library) => library.id === selectedLibrary),
          )
        : articles,
    );
  });
  protected readonly formatArticleDate = formatArticleDate;

  constructor() {
    effect(() => {
      const selectedYear = this.selectedYear();
      const selectedCategory = this.selectedCategory();
      const baseTitle =
        selectedYear && !selectedCategory
          ? `Engineering Notes from ${selectedYear}`
          : 'Engineering Notes';
      const title = selectedCategory ? `${baseTitle} for ${selectedCategory.name}` : baseTitle;
      const basePath =
        selectedYear && !selectedCategory ? `/articles/archive/${selectedYear}` : '/articles';
      const path = selectedCategory
        ? `${basePath}?library=${encodeURIComponent(selectedCategory.id)}`
        : basePath;
      this.#seo.setPage({
        title: `${title} — rdlabo.dev`,
        description: selectedCategory
          ? `Practical engineering notes from building and maintaining ${selectedCategory.name}.`
          : selectedYear
            ? `Engineering notes published in ${selectedYear} from real-world Ionic, Angular, Capacitor, Cloudflare, and OSS work.`
            : 'Engineering notes from building and maintaining real-world Ionic, Angular, Capacitor, Cloudflare, and open-source projects.',
        path,
        structuredData: articlesBreadcrumbStructuredData(title, path),
      });
    });
  }

  #groupByMonth(articles: readonly ArticleSummary[]): ArticleMonth[] {
    const groups = new Map<string, ArticleSummary[]>();
    for (const article of articles) {
      const month = article.publishedDate.slice(0, 7);
      groups.set(month, [...(groups.get(month) ?? []), article]);
    }
    return [...groups].map(([month, entries]) => ({
      label: new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Tokyo',
        year: 'numeric',
        month: 'long',
      }).format(new Date(`${month}-01T00:00:00+09:00`)),
      articles: entries,
    }));
  }
}
