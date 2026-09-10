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
        </div>
        @if (p.overviewHtml) {
          <div class="project-media znc [&_img]:mx-auto [&_img]:block [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-xl [&_p]:m-0 [&_p:has(>img+img)]:flex [&_p:has(>img+img)]:items-start" [innerHTML]="p.overviewHtml | safeHtml"></div>
        }
        <section class="project-section">
          <h2>{{ p.featuresHeading }}</h2>
          <ul class="feature-grid">
            @for (feature of p.features; track feature.title) {
              <li class="project-feature">
                <div class="feature-icon" aria-hidden="true">
                  @if (feature.icon || p.icon === 'theme') {
                    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                      <use [attr.href]="'/feature-icons.svg#' + (feature.icon || ['layout', 'motion', 'dark'][$index])" />
                    </svg>
                  } @else {
                    <app-project-icon [kind]="p.icon" />
                  }
                </div>
                <h3>{{ feature.title }}</h3><p>{{ feature.description }}</p>
              </li>
            }
          </ul>
        </section>
        @if (p.pages.length) {
          <section id="documentation" class="project-section scroll-mt-8" aria-labelledby="all-documentation">
            <h2 id="all-documentation" i18n="@@allDocumentation">All documentation</h2>
            <div class="mt-6 border-t border-[var(--rd-line)]">
              @for (group of documentationGroups(); track group.section) {
                <div class="grid gap-4 border-b border-[var(--rd-line)] py-5 sm:grid-cols-[160px_1fr]">
                  <h3 class="m-0 pt-3 text-sm font-semibold text-slate-500">{{ group.section }}</h3>
                  <ul class="m-0 grid list-none gap-x-6 p-0 lg:grid-cols-2">
                    @for (page of group.pages; track page.path) {
                      <li class="min-w-0"><a class="flex min-h-12 items-center justify-between gap-4 rounded-md px-3 py-3 text-sm no-underline hover:bg-[#fcf3ee] hover:text-[var(--rd-accent)] focus-visible:outline" [routerLink]="page.path"><span class="[overflow-wrap:anywhere]">{{ page.navTitle || page.title }}</span><span class="shrink-0 text-slate-400" aria-hidden="true">→</span></a></li>
                    }
                  </ul>
                </div>
              }
            </div>
          </section>
        }
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

  protected readonly documentationGroups = computed(() => {
    const pages = this.project()?.pages ?? [];
    return [...new Set(pages.map((page) => page.section))].map((section) => ({
      section,
      pages: pages.filter((page) => page.section === section),
    }));
  });

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
