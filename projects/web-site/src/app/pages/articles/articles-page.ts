import { Component, computed, effect, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

import {
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
  protected readonly months = computed(() => {
    const selectedYear = this.selectedYear();
    return this.#groupByMonth(
      selectedYear
        ? articleSummaries.filter((article) => article.publishedDate.startsWith(selectedYear))
        : articleSummaries.slice(0, 12),
    );
  });
  protected readonly formatArticleDate = formatArticleDate;

  constructor() {
    effect(() => {
      const selectedYear = this.selectedYear();
      const title = selectedYear ? `Articles from ${selectedYear}` : 'Articles';
      const path = selectedYear ? `/articles/archive/${selectedYear}` : '/articles';
      this.#seo.setPage({
        title: `${title} — rdlabo.dev`,
        description: selectedYear
          ? `English translations of rdlabo articles published in ${selectedYear} about Ionic, Angular, and Capacitor.`
          : 'English translations of rdlabo articles about Ionic, Angular, and Capacitor.',
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
