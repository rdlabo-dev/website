import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { articleSummaries, formatArticleDate } from '../../articles/article-data';
import { FeaturedProjectCard } from '../../components/featured-project-card/featured-project-card';
import { homeStructuredData } from '../../seo-json-ld';
import { SeoService } from '../../seo.service';
import { FEATURED_PROJECTS, SITE, WORKERS_PROJECTS } from '../../site-config';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, FeaturedProjectCard],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {
  readonly #seo = inject(SeoService);
  protected readonly site = SITE;
  protected readonly workersProjects = WORKERS_PROJECTS;
  protected readonly featuredProjects = FEATURED_PROJECTS;
  protected readonly heroArticle = articleSummaries[0];
  protected readonly latestArticles = articleSummaries.slice(1, 4);
  protected readonly formatArticleDate = formatArticleDate;

  constructor() {
    this.#seo.setPage({
      title: 'Cloudflare Workers, Ionic & Capacitor OSS and notes | rdlabo',
      description: SITE.description,
      path: '/',
      structuredData: homeStructuredData(SITE.description),
    });
  }
}
