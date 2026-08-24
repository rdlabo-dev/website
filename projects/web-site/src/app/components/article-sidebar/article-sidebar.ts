import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { articleCategories, ArticleHeading } from '../../articles/article-data';
import { SITE } from '../../site-config';

@Component({
  selector: 'app-article-sidebar',
  imports: [RouterLink],
  template: `
    <aside class="article-sidebar" aria-label="Article navigation" data-pagefind-ignore>
      @if (tocHeadings().length) {
        <p class="article-sidebar__label">Contents</p>
        <nav aria-label="On this page">
          <ul class="article-sidebar__list">
            @for (heading of tocHeadings(); track heading.id) {
              <li>
                <a
                  class="article-sidebar__link"
                  [routerLink]="['/articles', articleSlug()]"
                  [fragment]="heading.id"
                  >{{ heading.text }}</a
                >
              </li>
            }
          </ul>
        </nav>
      }

      @if (categories.length) {
        <div
          class="article-sidebar__categories"
          [class.article-sidebar__section--separated]="tocHeadings().length"
        >
          <p class="article-sidebar__label">Category</p>
          <nav aria-label="Article categories">
            <ul class="article-sidebar__category-list">
              @for (category of categories; track category.id) {
                <li>
                  <a
                    class="article-sidebar__category-link"
                    routerLink="/articles"
                    [queryParams]="{ library: category.id }"
                    [class.article-sidebar__category-link--active]="
                      currentCategoryId() === category.id
                    "
                    [class.article-sidebar__category-link--related]="
                      relatedCategoryIds().includes(category.id) &&
                      currentCategoryId() !== category.id
                    "
                    [attr.aria-current]="currentCategoryId() === category.id ? 'page' : null"
                  >
                    {{ category.name }}
                    @if (
                      relatedCategoryIds().includes(category.id) &&
                      currentCategoryId() !== category.id
                    ) {
                      <span class="sr-only"> (related to this article)</span>
                    }
                  </a>
                </li>
              }
            </ul>
          </nav>
        </div>
      }

      <div
        class="article-sidebar__resources"
        [class.article-sidebar__resources--separated]="tocHeadings().length || categories.length"
      >
        <nav aria-label="Resources">
          <ul class="article-sidebar__resource-list">
            <li>
              <a class="article-sidebar__resource-link" [href]="site.docsUrl + '/support'">
                <svg
                  class="article-sidebar__resource-icon"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  />
                </svg>
                Support my OSS
              </a>
            </li>
            <li>
              <a
                class="article-sidebar__resource-link external-link"
                [href]="site.zennUrl"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  class="article-sidebar__resource-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M7 5h10v14H7V5Z"
                    stroke="currentColor"
                    stroke-width="1.75"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M9 9h6M9 12h6M9 15h4"
                    stroke="currentColor"
                    stroke-width="1.75"
                    stroke-linecap="round"
                  />
                </svg>
                Zenn
              </a>
            </li>
            <li>
              <a
                class="article-sidebar__resource-link external-link"
                [href]="site.xUrl"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  class="article-sidebar__resource-icon"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z"
                  />
                </svg>
                X / @rdlabo
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  `,
})
export class ArticleSidebar {
  readonly tocHeadings = input<readonly ArticleHeading[]>([]);
  readonly articleSlug = input<string | undefined>(undefined);
  readonly currentCategoryId = input<string | undefined>(undefined);
  readonly relatedCategoryIds = input<readonly string[]>([]);
  protected readonly categories = articleCategories;
  protected readonly site = SITE;
}
