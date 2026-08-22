import { Component, LOCALE_ID, OnInit, inject } from '@angular/core';
import { CURRENT_SPONSORS, PAST_SPONSORS } from '../generated/sponsors.generated';
import { docsBreadcrumbStructuredData } from './seo-json-ld';
import { SeoService } from './seo.service';

@Component({
  selector: 'app-support-page',
  template: `
    <article class="mx-auto max-w-4xl px-6 py-20 sm:px-10 sm:py-28">
      <p class="m-0 text-sm font-semibold tracking-[0.18em] text-[#c44320] uppercase">
        <ng-container i18n="@@supportEyebrow">Support open source</ng-container>
      </p>
      <h1
        class="mt-5 mb-0 max-w-3xl text-[clamp(2.5rem,6vw,5.25rem)] leading-[1.04] font-semibold tracking-[-0.045em] text-[#211d1b]"
      >
        <ng-container i18n="@@supportHeading">Help rdlabo projects keep moving</ng-container>
      </h1>
      <p class="mt-8 max-w-2xl text-xl leading-9 text-[#675e59]">
        <ng-container i18n="@@supportIntro"
          >The projects documented here are maintained personally by rdlabo. Sponsorship supports
          the collection as a whole, rather than one individual library.</ng-container
        >
      </p>

      @for (group of sponsorGroups; track group.id) {
        @if (group.sponsors.length > 0) {
          <section class="mt-14" [attr.aria-labelledby]="group.id + '-sponsors-heading'">
            <h2
              [id]="group.id + '-sponsors-heading'"
              class="m-0 text-2xl font-semibold tracking-[-0.035em] text-[#211d1b]"
            >
              @if (group.id === 'current') {
                <ng-container i18n="@@currentSponsorsHeading">Current sponsors</ng-container>
              } @else {
                <ng-container i18n="@@pastSponsorsHeading">Past sponsors</ng-container>
              }
            </h2>
            <p class="mt-3 mb-0 max-w-2xl leading-7 text-[#6f6661]">
              @if (group.id === 'current') {
                <ng-container i18n="@@currentSponsorsDescription"
                  >Thank you to the people and organizations supporting rdlabo's open source
                  work.</ng-container
                >
              } @else {
                <ng-container i18n="@@pastSponsorsDescription"
                  >Thank you also to everyone who has supported this work in the past.</ng-container
                >
              }
            </p>
            <ul class="mt-7 grid list-none gap-4 p-0 sm:grid-cols-3">
              @for (sponsor of group.sponsors; track sponsor.login) {
                <li>
                  <a
                    class="flex min-h-24 items-center gap-4 rounded-2xl border border-[#eadfd9] bg-white p-5 text-[#211d1b] no-underline transition hover:border-[#d8c4ba] hover:bg-[#fffaf7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ea572a]"
                    [href]="sponsor.profileUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      class="size-12 shrink-0 rounded-full bg-[#f3ebe7] object-cover"
                      [src]="sponsor.avatarUrl"
                      alt=""
                      width="48"
                      height="48"
                      loading="lazy"
                    />
                    <span class="min-w-0">
                      <strong class="block truncate font-semibold">{{ sponsor.name }}</strong>
                      <span class="mt-1 block truncate text-sm text-[#766b65]"
                        >&#64;{{ sponsor.login }}</span
                      >
                    </span>
                  </a>
                </li>
              }
            </ul>
          </section>
        }
      }

      <section
        class="mt-14 overflow-hidden rounded-3xl border border-[#eadfd9] bg-[#fffaf7] sm:grid sm:grid-cols-[1fr_auto] sm:items-center"
      >
        <div class="p-7 sm:p-10">
          <h2 class="m-0 text-2xl font-semibold tracking-[-0.035em] text-[#211d1b]">
            <ng-container i18n="@@supportSponsorHeading">Sponsor on GitHub</ng-container>
          </h2>
          <p class="mt-4 mb-0 max-w-xl leading-7 text-[#6f6661]">
            <ng-container i18n="@@supportSponsorDescription"
              >Your support helps fund maintenance, compatibility updates, documentation, and new
              features across rdlabo's open source projects.</ng-container
            >
          </p>
        </div>
        <div class="border-t border-[#eadfd9] p-7 sm:border-t-0 sm:border-l sm:p-10">
          <a
            class="external-link inline-flex min-h-12 items-center justify-center rounded-full bg-[#ea572a] px-6 py-3 text-sm font-semibold text-white no-underline transition hover:bg-[#c44320] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ea572a]"
            href="https://github.com/sponsors/rdlabo"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ng-container i18n="@@becomeSponsor">Become a sponsor</ng-container>
          </a>
        </div>
      </section>

      <p class="mt-10 max-w-2xl border-l-2 border-[#ea572a] pl-4 text-sm leading-6 text-[#675e59]">
        <ng-container i18n="@@supportIndependenceNotice"
          >Sponsorship supports open source work maintained personally by rdlabo.</ng-container
        >
      </p>
    </article>
  `,
})
export class SupportPageComponent implements OnInit {
  readonly #seo = inject(SeoService);
  readonly #locale = inject(LOCALE_ID);
  readonly sponsorGroups = [
    { id: 'current', sponsors: CURRENT_SPONSORS },
    { id: 'past', sponsors: PAST_SPONSORS },
  ] as const;

  ngOnInit(): void {
    const supportLabel = $localize`:@@supportPageTitle:Support open source - rdlabo.dev`.replace(
      / - rdlabo\.dev$/,
      '',
    );
    this.#seo.setPage({
      title: $localize`:@@supportPageTitle:Support open source - rdlabo.dev`,
      description: $localize`:@@supportPageDescription:Support maintenance, documentation, and development across rdlabo's open source projects.`,
      path: '/support',
      structuredData: docsBreadcrumbStructuredData(this.#locale, [
        { name: 'rdlabo.dev', path: '/' },
        { name: supportLabel, path: '/support' },
      ]),
    });
  }
}
