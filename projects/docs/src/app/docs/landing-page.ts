import { isPlatformBrowser } from '@angular/common';
import { Component, LOCALE_ID, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProjectDocs } from './docs-data';
import { GitHubStarsService } from './github-stars.service';
import { docsBreadcrumbStructuredData } from './seo-json-ld';
import { SeoService } from './seo.service';
import { SafeHtmlPipe } from './safe-html.pipe';

@Component({
  selector: 'app-landing-page',
  imports: [RouterLink, SafeHtmlPipe],
  template: `
    @if (project(); as p) {
      <article class="mx-auto max-w-5xl px-6 pt-16 pb-24 sm:px-10 sm:pt-24">
        <span
          aria-hidden="true"
          class="sr-only"
          [attr.data-pagefind-filter]="'project:' + p.id"
          >{{ p.shortName }}</span
        >
        <span
          aria-hidden="true"
          class="sr-only"
          [attr.data-pagefind-filter]="'category:' + p.category"
          >{{ p.category }}</span
        >
        <div class="max-w-3xl">
          <div class="flex flex-wrap items-center gap-3 text-sm">
            <span
              class="rounded-full bg-[#fff0ea] px-3 py-1 font-semibold tracking-wide text-[#c44320]"
            >
              {{ p.packageName }}
            </span>
            @if (p.version) {
              <span class="text-[#80736d]">v{{ p.version }}</span>
            }
          </div>
          <h1
            class="mt-7 mb-0 text-[clamp(2.8rem,7vw,5.4rem)] leading-[0.98] font-semibold tracking-[-0.055em] text-[#211d1b]"
          >
            {{ p.headline }}
          </h1>
          <p class="mt-8 max-w-2xl text-xl leading-8 text-[#675e59] sm:text-2xl sm:leading-9">
            {{ p.overview }}
          </p>
          <div class="mt-9 flex flex-wrap gap-3">
            <a
              class="rounded-full bg-[#ea572a] px-6 py-3.5 font-semibold text-white no-underline transition hover:bg-[#c44320] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ea572a]"
              [routerLink]="p.pages[0].path"
            >
              <ng-container i18n="@@getStarted">Get started</ng-container>
            </a>
            @if (p.demoUrl) {
              <a
                class="external-link rounded-full border border-[#d9cec8] px-6 py-3.5 font-semibold text-[#3b3430] no-underline transition hover:border-[#ea572a] hover:text-[#c44320] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ea572a]"
                [href]="p.demoUrl"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ng-container i18n="@@viewDemo">Demo</ng-container>
              </a>
            }
            <a
              class="external-link rounded-full border border-[#d9cec8] px-6 py-3.5 font-semibold text-[#3b3430] no-underline transition hover:border-[#ea572a] hover:text-[#c44320] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ea572a]"
              [href]="p.repositoryUrl"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ng-container i18n="@@viewSource">View source</ng-container>
            </a>
            <a
              class="inline-flex items-center overflow-hidden rounded-full border border-[#d9cec8] font-semibold text-[#3b3430] no-underline transition hover:border-[#ea572a] hover:text-[#c44320] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ea572a]"
              [href]="p.repositoryUrl"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span class="flex items-center gap-2 px-5 py-3.5">
                <svg class="size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="m12 3 2.72 5.51 6.08.88-4.4 4.29 1.04 6.06L12 16.88l-5.44 2.86 1.04-6.06-4.4-4.29 6.08-.88L12 3Z"
                    stroke="currentColor"
                    stroke-linejoin="round"
                    stroke-width="1.7"
                  />
                </svg>
                <ng-container i18n="@@starOnGitHub">Star on GitHub</ng-container>
              </span>
              @if (formattedStarCount(); as count) {
                <span class="border-l border-[#d9cec8] bg-[#fffaf7] px-4 py-3.5">
                  {{ count }}
                </span>
              }
            </a>
          </div>
        </div>

        @if (p.overviewHtml) {
          <div
            class="znc mt-14 [&_img]:mx-auto [&_img]:block [&_img]:h-auto [&_img]:max-w-full [&_p]:m-0"
            [innerHTML]="p.overviewHtml | safeHtml"
          ></div>
        }

        <section class="mt-20 border-t border-[#eadfd9] pt-12">
          <h2 class="m-0 text-2xl font-semibold tracking-[-0.03em] text-[#211d1b]">
            {{ p.featuresHeading }}
          </h2>
          <ul class="mt-8 grid list-none grid-cols-1 gap-x-10 gap-y-8 p-0 sm:grid-cols-2 lg:grid-cols-3">
            @for (feature of p.features; track feature.title) {
              <li class="project-feature py-1">
                <h3
                  class="m-0 border-l-2 border-[#e6a48f] pl-4 text-lg font-semibold tracking-[-0.02em] text-[#292320]"
                >
                  {{ feature.title }}
                </h3>
                <p class="mt-3 mb-0 pl-[18px] leading-7 text-[#6f6661]">
                  {{ feature.description }}
                </p>
              </li>
            }
          </ul>
        </section>

        @if (p.relatedArticles?.length) {
          <section class="mt-16 border-t border-[#eadfd9] pt-12">
            <h2 class="m-0 text-2xl font-semibold tracking-[-0.03em] text-[#211d1b]">
              <ng-container i18n="@@relatedArticles">Related articles</ng-container>
            </h2>
            <ul class="mt-7 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2">
              @for (article of p.relatedArticles; track article.slug) {
                <li>
                  <a
                    class="related-article-link group block h-full rounded-[0.625rem] border border-[#eadfd9] bg-white px-5 py-5 text-[#292320] no-underline transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:border-[#e9aa96] hover:shadow-[0_10px_24px_rgba(44,34,29,.07)] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#f4b7a4]"
                    [href]="article.url"
                  >
                    @if (isJapanese) {
                      <span
                        class="related-article-lang inline-flex rounded-full bg-[#fff0ea] px-2.5 py-0.5 text-[0.72rem] font-semibold tracking-wide text-[#c44320]"
                        i18n="@@relatedArticleLanguage"
                        >English</span
                      >
                    }
                    <time
                      class="block text-[0.82rem] text-[#8a7f79]"
                      [class.mt-2]="isJapanese"
                      [attr.datetime]="article.publishedDate"
                    >
                      {{ formatArticleDate(article.publishedDate) }}
                    </time>
                    <h3
                      lang="en"
                      class="mt-1.5 mb-0 text-lg font-semibold tracking-[-0.02em] text-[#292320] group-hover:text-[#c44320]"
                    >
                      {{ article.title }}
                    </h3>
                    <p lang="en" class="mt-2 mb-0 leading-7 text-[#6f6661]">
                      {{ article.description }}
                    </p>
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
