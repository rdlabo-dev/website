import { Component, LOCALE_ID, OnInit, inject } from '@angular/core';
import { CURRENT_SPONSORS, PAST_SPONSORS } from '../generated/sponsors.generated';
import { docsBreadcrumbStructuredData } from './seo-json-ld';
import { SeoService } from './seo.service';

@Component({
  selector: 'app-support-page',
  template: `
    <article class="mx-auto max-w-4xl px-6 py-20 sm:px-10 sm:py-28">
      <p class="m-0 text-sm font-semibold tracking-[0.18em] text-[#c44320] uppercase">
        <ng-container i18n="@@supportEyebrow">Community-supported open source</ng-container>
      </p>
      <h1
        class="mt-5 mb-0 max-w-3xl text-[clamp(2.5rem,6vw,5.25rem)] leading-[1.04] font-semibold tracking-[-0.045em] text-[#211d1b]"
      >
        <ng-container i18n="@@supportHeading"
          >Help build a community around independent OSS</ng-container
        >
      </h1>
      <p class="mt-8 max-w-2xl text-xl leading-9 text-[#675e59]">
        <ng-container i18n="@@supportIntro"
          >Monthly sponsorships start at $5 and support ongoing public OSS work. The long-term vision
          is a community of 100 monthly sponsors supporting the collection broadly rather than
          depending on any single organization.</ng-container
        >
      </p>

      <section class="mt-14 rounded-3xl border border-[#eadfd9] bg-[#fffaf7] p-7 sm:p-10">
        <p class="m-0 text-sm font-semibold tracking-[0.16em] text-[#c44320] uppercase">
          <ng-container i18n="@@supportMilestoneEyebrow">Current milestone</ng-container>
        </p>
        <h2 class="mt-4 mb-0 text-2xl font-semibold tracking-[-0.035em] text-[#211d1b]">
          <ng-container i18n="@@supportMilestoneHeading"
            >The first 10 monthly sponsors</ng-container
          >
        </h2>
        <p class="mt-4 mb-0 max-w-2xl leading-7 text-[#6f6661]">
          <ng-container i18n="@@supportMilestoneDescription"
            >Small, recurring contributions create a broad base for independent open-source work.
            Every sponsorship supports the same public projects. Choose an amount that feels
            comfortable. Individual sponsors who opt to be public are recognized equally here,
            regardless of amount.</ng-container
          >
        </p>
      </section>

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
            <ng-container i18n="@@supportSponsorHeading">Join from $5 a month</ng-container>
          </h2>
          <p class="mt-4 mb-0 max-w-xl leading-7 text-[#6f6661]">
            <ng-container i18n="@@supportSponsorDescription"
              >Individual sponsorships do not unlock exclusive features, priority support, or a
              private roadmap. Your support helps keep the same libraries, documentation,
              compatibility updates, and releases available to everyone.</ng-container
            >
          </p>
        </div>
        <div class="border-t border-[#eadfd9] p-7 sm:border-t-0 sm:border-l sm:p-10">
          <a
            class="external-link inline-flex min-h-12 items-center justify-center rounded-full bg-[#c44320] px-6 py-3 text-sm font-semibold text-white no-underline transition hover:bg-[#9f3417] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c44320]"
            href="https://github.com/sponsors/rdlabo?metadata_campaign=docs-support"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ng-container i18n="@@becomeSponsor">Sponsor from $5/month</ng-container>
          </a>
        </div>
      </section>

      <p class="mt-10 max-w-2xl border-l-2 border-[#ea572a] pl-4 text-sm leading-6 text-[#675e59]">
        <ng-container i18n="@@supportIndependenceNotice"
          >Sponsorship supports independent open-source work maintained personally by
          rdlabo.</ng-container
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
      description: $localize`:@@supportPageDescription:Join the community supporting independent open-source projects maintained by rdlabo.`,
      path: '/support',
      structuredData: docsBreadcrumbStructuredData(this.#locale, [
        { name: 'rdlabo.dev', path: '/' },
        { name: supportLabel, path: '/support' },
      ]),
    });
  }
}
