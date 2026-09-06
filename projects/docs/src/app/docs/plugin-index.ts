import { Component, LOCALE_ID, OnInit, inject } from '@angular/core';
import { projectGroupsForLocale } from './docs-data';
import { ProjectIconComponent } from './project-icon';
import { docsHomeStructuredData } from './seo-json-ld';
import { SeoService } from './seo.service';

@Component({
  selector: 'app-project-index',
  imports: [ProjectIconComponent],
  template: `
    <div class="catalog">
      <header class="catalog-hero">
        <p class="eyebrow" i18n="@@openSourceDocumentation">Open source documentation</p>
        <h1 i18n="@@documentationTitle">Documentation</h1>
        <p class="catalog-hero__lead" i18n="@@projectsIntro">Documentation for open source projects created and maintained by rdlabo.</p>
        <nav class="category-nav" aria-label="Project categories" i18n-aria-label="@@projectCategoriesNav">
          @for (group of projectGroups; track group.id) {
            <a [href]="'#category-' + group.id">
              {{ group.label }} <span>{{ group.projects.length }}</span>
            </a>
          }
        </nav>
      </header>

      @for (group of projectGroups; track group.id) {
        <section class="catalog-group" [id]="'category-' + group.id" [attr.aria-labelledby]="'heading-' + group.id">
          <header class="catalog-group__heading">
            <h2 [id]="'heading-' + group.id">{{ group.label }} <span>{{ group.projects.length }}</span></h2>
            <p>{{ group.description }}</p>
          </header>
          <ul class="catalog-grid">
            @for (project of group.projects; track project.id) {
              <li>
                <a class="catalog-card" [href]="project.hostedUrl ?? project.path"
                  [attr.target]="project.hostedUrl ? '_blank' : null"
                  [attr.rel]="project.hostedUrl ? 'noopener noreferrer' : null">
                  <span class="catalog-card__icon" aria-hidden="true"><app-project-icon [kind]="project.icon" /></span>
                  <span class="catalog-card__arrow" aria-hidden="true">{{ project.hostedUrl ? '↗' : '→' }}</span>
                  <h3>{{ project.shortName }}</h3>
                  <p class="catalog-card__package">{{ project.packageName }}</p>
                  <p class="catalog-card__description">{{ project.description }}</p>
                  <span class="catalog-card__cta" i18n="@@readDocumentation">Read documentation</span>
                </a>
              </li>
            }
          </ul>
        </section>
      }
      <footer class="catalog-footer">
        <p i18n="@@personalOwnershipNotice">Every OSS project listed here is developed and maintained personally by rdlabo. They are independent of the incorporated association that also uses the rdlabo name.</p>
        <a class="external-link" href="https://github.com/rdlabo-dev" target="_blank" rel="noopener noreferrer">GitHub</a>
      </footer>
    </div>
  `,
  styleUrl: './plugin-index.css',

})
export class PluginIndexComponent implements OnInit {
  readonly #seo = inject(SeoService);
  readonly #locale = inject(LOCALE_ID);
  protected readonly projectGroups = projectGroupsForLocale(this.#locale);

  ngOnInit(): void {
    const homeTitle =
      this.#locale.toLowerCase().startsWith('ja')
        ? 'Ionic・Angular・Capacitor OSSドキュメント | rdlabo'
        : 'Ionic, Angular, and Capacitor OSS Documentation | rdlabo';
    const description = $localize`:@@siteDescription:Documentation for personal open source projects created and maintained by rdlabo.`;
    this.#seo.setPage({
      title: homeTitle,
      description,
      path: '/',
      structuredData: docsHomeStructuredData(this.#locale, description),
    });
  }
}
