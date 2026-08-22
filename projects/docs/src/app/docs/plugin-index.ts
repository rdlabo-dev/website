import { Component, LOCALE_ID, OnInit, inject } from '@angular/core';
import { projectGroupsForLocale } from './docs-data';
import { ProjectIconComponent } from './project-icon';
import { docsHomeStructuredData } from './seo-json-ld';
import { SeoService } from './seo.service';

@Component({
  selector: 'app-project-index',
  imports: [ProjectIconComponent],
  template: `
    <section class="overflow-hidden border-b border-[#eadfd9] bg-[#fffaf7]">
      <div
        class="mx-auto grid max-w-6xl gap-12 px-6 py-20 sm:px-10 sm:py-28 lg:grid-cols-[1fr_280px] lg:items-center"
      >
        <div>
          <p class="m-0 text-sm font-semibold tracking-[0.18em] text-[#c44320] uppercase">
            <ng-container i18n="@@openSourceDocumentation">Open source documentation</ng-container>
          </p>
          <h1
            class="mt-5 mb-0 max-w-4xl text-[clamp(3.4rem,8vw,7rem)] leading-[0.9] font-semibold tracking-[-0.07em] text-[#211d1b]"
          >
            rdlabo<span class="text-[#ea572a]">.dev</span>
          </h1>
          <p class="mt-8 max-w-2xl text-xl leading-8 text-[#675e59] sm:text-2xl sm:leading-9">
            <ng-container i18n="@@projectsIntro"
              >Documentation for open source projects created and maintained by
              rdlabo.</ng-container
            >
          </p>
          <p
            class="mt-5 max-w-2xl border-l-2 border-[#ea572a] pl-4 text-sm leading-6 text-[#675e59]"
            i18n="@@personalOwnershipNotice"
          >
            Every OSS project listed here is developed and maintained personally by rdlabo. They are
            independent of the incorporated association that also uses the rdlabo name.
          </p>
        </div>
        <img
          class="mx-auto w-full max-w-[260px] opacity-95"
          src="/assets/brand/rdlabo-logo.svg"
          alt=""
          width="324"
          height="163"
        />
      </div>
    </section>

    <section class="mx-auto max-w-6xl px-6 py-20 sm:px-10 sm:py-24">
      <p class="m-0 text-sm font-semibold tracking-[0.16em] text-[#c44320] uppercase">
        <ng-container i18n="@@currentCollection">Current collection</ng-container>
      </p>
      @for (group of projectGroups; track group.id) {
        <section class="mt-8 first:mt-6">
          <div>
            <h2 class="m-0 text-3xl font-semibold tracking-[-0.04em] text-[#211d1b] sm:text-4xl">
              {{ group.label }}
            </h2>
            <p class="mt-3 mb-0 max-w-2xl leading-7 text-[#746a65]">{{ group.description }}</p>
          </div>

          <ul class="mt-8 grid list-none grid-cols-1 gap-5 p-0 md:grid-cols-2">
            @for (project of group.projects; track project.id) {
              <li>
                <a
                  class="group flex h-full min-h-[260px] flex-col rounded-3xl border border-[#e5d9d3] bg-white p-7 text-[#292320] no-underline transition hover:-translate-y-1 hover:border-[#ea572a] hover:shadow-[0_18px_50px_rgba(72,43,30,0.1)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ea572a]"
                  [href]="project.hostedUrl ?? project.path"
                  [attr.target]="project.hostedUrl ? '_blank' : null"
                  [attr.rel]="project.hostedUrl ? 'noopener noreferrer' : null"
                >
                  <span
                    class="flex size-14 items-center justify-center rounded-2xl bg-[#fff0ea] text-[#d64a23] transition group-hover:bg-[#ea572a] group-hover:text-white"
                  >
                    <app-project-icon [kind]="project.icon" />
                  </span>
                  <h3 class="mt-7 mb-0 text-2xl font-semibold tracking-[-0.035em]">
                    {{ project.shortName }}
                  </h3>
                  <p class="mt-2 mb-0 font-mono text-xs leading-5 text-[#c44320]">
                    {{ project.packageName }}
                  </p>
                  <p class="mt-4 mb-0 leading-7 text-[#6f6661]">{{ project.description }}</p>
                  <span class="mt-auto pt-7 text-sm font-semibold text-[#c44320]">
                    <ng-container i18n="@@readDocumentation">Read documentation</ng-container> →
                  </span>
                </a>
              </li>
            }
          </ul>
        </section>
      }

      <aside
        class="mt-16 rounded-3xl bg-[#27211e] px-7 py-8 text-white sm:flex sm:items-center sm:justify-between sm:gap-8 sm:px-10"
      >
        <div>
          <p class="m-0 text-sm font-semibold tracking-[0.15em] text-[#ff936f] uppercase">
            <ng-container i18n="@@growingCollection">Growing collection</ng-container>
          </p>
          <h2 class="mt-3 mb-0 text-2xl font-semibold tracking-[-0.03em]">
            <ng-container i18n="@@upcomingProjects"
              >More rdlabo projects will be documented here as they are released.</ng-container
            >
          </h2>
        </div>
        <a
          class="external-link mt-6 inline-flex shrink-0 rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white no-underline transition hover:border-[#ff936f] hover:text-[#ff936f] sm:mt-0"
          href="https://github.com/rdlabo-dev"
          target="_blank"
          rel="noopener noreferrer"
          >GitHub</a
        >
      </aside>
    </section>
  `,
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
