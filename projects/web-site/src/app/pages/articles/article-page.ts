import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ArticleDetail, formatArticleDate } from '../../articles/article-data';
import { SafeHtmlPipe } from '../../articles/safe-html.pipe';
import { ArticleSidebar } from '../../components/article-sidebar/article-sidebar';
import { articleStructuredData } from '../../seo-json-ld';
import { SeoService } from '../../seo.service';

@Component({
  selector: 'app-article-page',
  imports: [RouterLink, SafeHtmlPipe, ArticleSidebar],
  templateUrl: './article-page.html',
})
export class ArticlePage {
  readonly #route = inject(ActivatedRoute);
  readonly #seo = inject(SeoService);
  protected readonly article = this.#route.snapshot.data['article'] as ArticleDetail;
  protected readonly displayDate = formatArticleDate(this.article.publishedDate);
  protected readonly displayUpdatedDate = this.article.updatedAt
    ? formatArticleDate(this.article.updatedAt)
    : undefined;
  protected readonly tocHeadings = this.article.headings.filter((heading) => heading.level === 2);

  constructor() {
    this.#seo.setPage({
      title: `${this.article.title} — rdlabo.dev`,
      description: this.article.description,
      path: `/articles/${this.article.slug}`,
      type: 'article',
      publishedAt: this.article.publishedAt,
      image: this.article.image,
      imageWidth: this.article.imageWidth,
      imageHeight: this.article.imageHeight,
      structuredData: articleStructuredData(this.article),
    });
  }
}
