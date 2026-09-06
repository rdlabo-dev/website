import { isPlatformBrowser } from '@angular/common';
import { Component, LOCALE_ID, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProjectIconComponent } from './project-icon';
import { ProjectDocs } from './docs-data';
import { GitHubStarsService } from './github-stars.service';
import { docsBreadcrumbStructuredData } from './seo-json-ld';
import { SeoService } from './seo.service';
import { SafeHtmlPipe } from './safe-html.pipe';

@Component({
  selector: 'app-landing-page',
  imports: [RouterLink, SafeHtmlPipe, ProjectIconComponent],
  styleUrl: './landing-page.css',
  template: `
    @if (project(); as p) {
      <article class="project-landing">
        <span aria-hidden="true" class="sr-only" [attr.data-pagefind-filter]="'project:' + p.id">{{ p.shortName }}</span>
        <span aria-hidden="true" class="sr-only" [attr.data-pagefind-filter]="'category:' + p.category">{{ p.category }}</span>
        <div class="project-identity">
          <div class="project-mark"><app-project-icon [kind]="p.icon" /></div>
          <div class="project-name">
            <strong>{{ p.shortName }}</strong>
            @if (p.version) { <span class="project-version">v{{ p.version }}</span> }
            <div class="project-package">{{ p.packageName }}</div>
          </div>
        </div>
        <div class="project-hero">
          <div>
            <h1>{{ p.headline }}</h1>
            <p class="project-summary">{{ p.overview }}</p>
            <div class="project-actions">
              @if (p.pages[0]; as firstPage) {
                <a class="project-button project-button--primary" [routerLink]="firstPage.path" i18n="@@getStarted">Get started</a>
              }
              @if (p.demoUrl) {
                <a class="project-button project-button--secondary external-link" [href]="p.demoUrl" target="_blank" rel="noopener noreferrer" i18n="@@viewDemo">Demo</a>
              }
            </div>
            <div class="project-resources">
              <a class="external-link" [href]="p.repositoryUrl" target="_blank" rel="noopener noreferrer">
                <ng-container i18n="@@viewSource">View source</ng-container>
              </a>
              <a class="project-stars" [href]="p.repositoryUrl" target="_blank" rel="noopener noreferrer">
                <span aria-hidden="true">☆</span>
                <ng-container i18n="@@starOnGitHub">Star on GitHub</ng-container>
                @if (formattedStarCount(); as count) { <span>{{ count }}</span> }
              </a>
            </div>
          </div>
          @if (entryGuides().length || apiPage()) {
            <nav class="entry-guide" aria-labelledby="project-documentation">
              <h2 id="project-documentation" i18n="@@projectDocumentation">Documentation</h2>
              <ul>
                @for (page of entryGuides(); track page.path) {
                  <li><a [routerLink]="page.path"><span>{{ page.navTitle || page.title }}</span><span aria-hidden="true">→</span></a></li>
                }
              </ul>
              @if (apiPage(); as api) {
                <a class="entry-reference" [routerLink]="api.path"><span i18n="@@projectApiReference">API reference</span><span aria-hidden="true">→</span></a>
              }
            </nav>
          }
        </div>
        @if (p.overviewHtml) {
          <div class="project-media znc [&_img]:mx-auto [&_img]:block [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-xl [&_p]:m-0" [innerHTML]="p.overviewHtml | safeHtml"></div>
        }
        <section class="project-section">
          <h2>{{ p.featuresHeading }}</h2>
          <ul class="feature-grid">
            @for (feature of p.features; track feature.title) {
              <li class="project-feature"><h3>{{ feature.title }}</h3><p>{{ feature.description }}</p></li>
            }
          </ul>
        </section>
        <aside class="project-support">
          <p i18n="@@projectSupportPrompt">Help keep this library maintained.</p>
          <a routerLink="/support"><span i18n="@@projectSponsorLink">Sponsor this project</span><span aria-hidden="true"> →</span></a>
        </aside>
        @if (p.relatedArticles?.length) {
          <section class="project-section project-section--articles">
            <h2 i18n="@@relatedArticles">Related articles</h2>
            <ul class="related-articles">
              @for (article of p.relatedArticles; track article.slug) {
                <li>
                  <a class="related-article-link" [href]="article.url">
                    @if (isJapanese) { <span class="related-article-lang" i18n="@@relatedArticleLanguage">English</span> }
                    <time [attr.datetime]="article.publishedDate">{{ formatArticleDate(article.publishedDate) }}</time>
                    <h3 lang="en">{{ article.title }}</h3>
                    <p lang="en">{{ article.description }}</p>
                  </a>
                </li>
              }
            </ul>
          </section>
        }
      </article>
    }
  `,
})
export class LandingPageComponent implements OnInit {
  readonly #route = inject(ActivatedRoute);
  readonly #seo = inject(SeoService);
  readonly #locale = inject(LOCALE_ID);
  readonly #stars = inject(GitHubStarsService);
  protected readonly formatArticleDate = (date: string): string =>
    new Intl.DateTimeFormat(this.#locale, {
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(`${date}T00:00:00+09:00`));
  protected readonly isJapanese = this.#locale.toLowerCase().startsWith('ja');
  readonly #platformId = inject(PLATFORM_ID);
  readonly #numberFormat = new Intl.NumberFormat(inject(LOCALE_ID), {
    notation: 'compact',
    maximumFractionDigits: 1,
  });
  readonly #starCount = signal<number | undefined>(undefined);
  protected readonly formattedStarCount = () => {
    const count = this.#starCount();
    return count === undefined ? undefined : this.#numberFormat.format(count);
  };
  protected readonly project = signal<ProjectDocs | undefined>(undefined);

  protected readonly entryGuides = computed(() => {
    const project = this.project();
    const pages = project?.pages ?? [];
    if (project?.entryGuideSlugs) {
      return project.entryGuideSlugs.flatMap((slug) => pages.filter((page) => page.slug === slug));
    }
    return pages.slice(1).filter((page) => page.slug !== 'api' && !page.slug.startsWith('rules/')).slice(0, 3);
  });
  protected readonly apiPage = computed(() => this.project()?.pages.find((page) => page.slug === 'api'));

  ngOnInit(): void {
    const project = this.#route.snapshot.data['project'] as ProjectDocs | undefined;
    this.project.set(project);
    if (!project) return;
    this.#seo.setPage({
      title: project.seoTitle ?? `${project.shortName} - rdlabo.dev`,
      description: project.description,
      path: project.path,
      structuredData: docsBreadcrumbStructuredData(this.#locale, [
        { name: 'rdlabo.dev', path: '/' },
        { name: project.shortName, path: project.path },
      ]),
    });
    if (isPlatformBrowser(this.#platformId)) {
      void this.#loadStarCount(project.repositoryUrl);
    }
  }

  async #loadStarCount(repositoryUrl: string): Promise<void> {
    this.#starCount.set(await this.#stars.count(repositoryUrl));
  }
}
