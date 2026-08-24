import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { OssResourceLinksComponent } from '../../../../../../shared/oss-resource-links';
import { articleCategories, ArticleHeading } from '../../articles/article-data';

@Component({
  selector: 'app-article-sidebar',
  imports: [OssResourceLinksComponent, RouterLink],
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
                    <span class="article-sidebar__category-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M20 13 11 4H4v7l9 9 7-7Z" />
                        <circle cx="7.5" cy="7.5" r="1.25" />
                      </svg>
                    </span>
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
        <app-oss-resource-links supportHref="https://docs.rdlabo.dev/support" />
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
}
