import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { articleSummaries, formatArticleDate } from '../../articles/article-data';
import { FeaturedProjectCard } from '../../components/featured-project-card/featured-project-card';
import { homeStructuredData } from '../../seo-json-ld';
import { SeoService } from '../../seo.service';
import { FEATURED_PROJECTS, SITE } from '../../site-config';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, FeaturedProjectCard],
  templateUrl: './home-page.html',
})
export class HomePage {
  readonly #seo = inject(SeoService);
  protected readonly site = SITE;
  protected readonly featuredProjects = FEATURED_PROJECTS;
  protected readonly latestArticles = articleSummaries.slice(0, 3);
  protected readonly formatArticleDate = formatArticleDate;

  constructor() {
    this.#seo.setPage({
      title: 'rdlabo.dev — Engineering notes and open source for application teams',
      description: SITE.description,
      path: '/',
      structuredData: homeStructuredData(SITE.description),
    });
  }
}
