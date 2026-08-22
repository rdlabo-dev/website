import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  DestroyRef,
  LOCALE_ID,
  OnInit,
  PLATFORM_ID,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { CodePanel } from './code-panel';
import { DocsHeading, DocsPage, ProjectDocs } from './docs-data';
import { SafeHtmlPipe } from './safe-html.pipe';
import { ScrollSpyDirective } from './scroll-spy.directive';
import { docsBreadcrumbStructuredData } from './seo-json-ld';
import { SeoService } from './seo.service';

@Component({
  selector: 'app-docs-page',
  imports: [CodePanel, SafeHtmlPipe, ScrollSpyDirective],
  template: `
    @if (project(); as proj) {
      @if (page(); as doc) {
        <div class="mx-auto max-w-[1500px] pb-16">
          <div
            [class]="
              'grid items-start justify-center pt-[42px] max-[960px]:block max-[960px]:pt-7 ' +
              (doc.codes.length
                ? 'grid-cols-[minmax(420px,680px)_minmax(420px,1fr)] max-[1500px]:grid-cols-[minmax(420px,800px)_minmax(420px,1fr)] max-[1100px]:grid-cols-[minmax(380px,1fr)_minmax(380px,1fr)]'
                : tocHeadings().length
                  ? 'grid-cols-[minmax(0,3fr)_minmax(0,1fr)] max-[1500px]:grid-cols-[minmax(0,1fr)]'
                  : 'grid-cols-[minmax(0,1fr)]')
            "
          >
            <article
              [class]="
                'znc min-w-0 px-6 pt-1.5 max-[576px]:px-4 [&_a]:[overflow-wrap:anywhere] ' +
                (doc.codes.length
                  ? 'pb-[calc(100dvh-120px)] max-[960px]:pb-[72px] [&_.code-block-container]:hidden max-[960px]:[&_.code-block-container]:block'
                  : 'mx-auto w-full max-w-[800px] justify-self-center pb-[72px]')
              "
              [appScrollSpy]="headingKeys()"
              (activeHeadingChange)="activate($event)"
            >
              <span
                aria-hidden="true"
                class="sr-only"
                [attr.data-pagefind-filter]="'project:' + proj.id"
                >{{ proj.shortName }}</span
              >
              <span
                aria-hidden="true"
                class="sr-only"
                [attr.data-pagefind-filter]="'category:' + proj.category"
                >{{ proj.category }}</span
              >
              <h1 id="document-title">{{ doc.title }}</h1>
              <div [innerHTML]="doc.html | safeHtml"></div>
              @if (doc.codes.length) {
                <div class="hidden max-[960px]:block">
                  @for (code of doc.codes; track code.file) {
                    <div class="code-block-container">
                      <div class="code-block-filename-container">
                        <span class="code-block-filename">{{ code.file }}</span>
                      </div>
                      <pre
                        class="m-0 overflow-x-auto rounded-lg bg-[#151e2c] px-5 py-4 font-[ui-monospace,SFMono-Regular,Menlo,Consolas,monospace] text-[13px]/[1.3] text-[#e1e4e8]"
                      ><code>@for (line of code.lines; track $index) {<span
                            class="block min-h-[1.3em]"
                            [innerHTML]="line | safeHtml"
                          ></span>
}</code></pre>
                    </div>
                  }
                </div>
              }
              @if (!doc.codes.length && !tocHeadings().length) {
                <div class="mt-8 border-t border-slate-200 pt-4">
                  <a
                    class="external-link inline-flex items-center gap-2 text-[0.82rem] leading-5 font-normal text-[#333] no-underline hover:text-[#c44320]"
                    [href]="doc.editUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg class="size-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path
                        d="M12 .7a11.5 11.5 0 0 0-3.64 22.4c.58.1.79-.25.79-.56v-2.24c-3.22.7-3.9-1.37-3.9-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.72 1.27 3.38.97.1-.75.4-1.27.74-1.56-2.57-.29-5.27-1.29-5.27-5.69 0-1.26.45-2.29 1.19-3.1-.12-.3-.52-1.47.11-3.06 0 0 .97-.31 3.16 1.18a10.9 10.9 0 0 1 5.74 0c2.2-1.49 3.16-1.18 3.16-1.18.63 1.59.23 2.76.11 3.06.74.81 1.19 1.84 1.19 3.1 0 4.41-2.71 5.39-5.29 5.68.42.36.79 1.06.79 2.14v3.18c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .7Z"
                      />
                    </svg>
                    <ng-container i18n="@@editOnGitHub">Edit this page on GitHub</ng-container>
                  </a>
                </div>
              }
            </article>
            @if (doc.codes.length) {
              <app-code-panel [codes]="doc.codes" [activeLines]="activeLines()" />
            }
            @if (!doc.codes.length && tocHeadings().length) {
              <aside
                class="sticky top-8 w-full max-h-[calc(100dvh-64px)] min-w-0 overflow-y-auto px-5 pt-2 pb-8 max-[1500px]:hidden"
                i18n-aria-label="@@tableOfContents"
                aria-label="Table of contents"
              >
                <p
                  class="m-0 mb-3 text-[0.65rem] leading-none font-normal tracking-[0.16em] text-slate-400 uppercase"
                >
                  <ng-container i18n="@@contents">Contents</ng-container>
                </p>
                <nav i18n-aria-label="@@onThisPage" aria-label="On this page">
                  <ul class="m-0 list-none p-0">
                    @for (heading of tocHeadings(); track heading.id) {
                      <li [class.pl-3]="heading.level === 3">
                        <a
                          class="block py-1 text-[0.82rem] leading-5 font-normal break-words text-[#6b625d] no-underline transition-colors hover:text-[#c44320] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ea572a]"
                          [class.!text-[#c44320]]="activeToc() === heading.id"
                          [href]="'#' + heading.id"
                          >{{ heading.text }}</a
                        >
                      </li>
                    }
                  </ul>
                </nav>
                <div class="mt-5 border-t border-slate-200 pt-4">
                  <a
                    class="external-link inline-flex items-center gap-2 text-[0.82rem] leading-5 font-normal text-[#333] no-underline hover:text-[#c44320]"
                    [href]="doc.editUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg class="size-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path
                        d="M12 .7a11.5 11.5 0 0 0-3.64 22.4c.58.1.79-.25.79-.56v-2.24c-3.22.7-3.9-1.37-3.9-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.72 1.27 3.38.97.1-.75.4-1.27.74-1.56-2.57-.29-5.27-1.29-5.27-5.69 0-1.26.45-2.29 1.19-3.1-.12-.3-.52-1.47.11-3.06 0 0 .97-.31 3.16 1.18a10.9 10.9 0 0 1 5.74 0c2.2-1.49 3.16-1.18 3.16-1.18.63 1.59.23 2.76.11 3.06.74.81 1.19 1.84 1.19 3.1 0 4.41-2.71 5.39-5.29 5.68.42.36.79 1.06.79 2.14v3.18c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .7Z"
                      />
                    </svg>
                    <ng-container i18n="@@editOnGitHub">Edit this page on GitHub</ng-container>
                  </a>
                </div>
              </aside>
            }
          </div>
        </div>
      }
    }
  `,
})
export class DocsPageComponent implements OnInit, AfterViewInit {
  readonly #route = inject(ActivatedRoute);
  readonly #seo = inject(SeoService);
  readonly #locale = inject(LOCALE_ID);
  readonly #document = inject(DOCUMENT);
  readonly #platformId = inject(PLATFORM_ID);
  readonly #destroyRef = inject(DestroyRef);
  protected readonly project = signal<ProjectDocs | undefined>(undefined);
  protected readonly page = signal<DocsPage | undefined>(undefined);
  protected readonly headingKeys = signal<string[]>([]);
  protected readonly tocHeadings = signal<DocsHeading[]>([]);
  protected readonly activeToc = signal('');
  protected readonly activeLines = signal<Record<string, readonly number[]>>({});

  ngOnInit(): void {
    const slug = this.#route.snapshot.data['pageSlug'] as string;
    const project = this.#route.snapshot.data['project'] as ProjectDocs | undefined;
    const page = project?.pages.find((candidate) => candidate.slug === slug);
    this.project.set(project);
    this.page.set(page);
    if (!project || !page) return;
    this.headingKeys.set(['', ...page.headings.map((heading) => heading.id)]);
    this.tocHeadings.set(page.headings.filter((heading) => heading.level <= 3));
    this.activeLines.set({ ...(page.scrollMap[0]?.activeLine ?? {}) });
    this.#seo.setPage({
      title:
        page.seoTitle ?? `${page.title} - ${project.shortName} - rdlabo.dev`,
      description: `${page.title}. ${project.description}`,
      path: page.path,
      structuredData: docsBreadcrumbStructuredData(this.#locale, [
        { name: 'rdlabo.dev', path: '/' },
        { name: project.shortName, path: project.path },
        { name: page.title, path: page.path },
      ]),
    });
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.#platformId)) return;
    this.#route.fragment.pipe(takeUntilDestroyed(this.#destroyRef)).subscribe((fragment) => {
      if (!fragment) return;
      this.#document.defaultView?.requestAnimationFrame(() => {
        this.#document.getElementById(fragment)?.scrollIntoView();
      });
    });
  }

  activate(id: string): void {
    const page = this.page();
    const headingIndex = page?.headings.findIndex((heading) => heading.id === id) ?? -1;
    this.activeToc.set(
      headingIndex < 0
        ? ''
        : (page?.headings
            .slice(0, headingIndex + 1)
            .reverse()
            .find((heading) => heading.level <= 3)?.id ?? ''),
    );
    const entry = page?.scrollMap.find((candidate) => candidate.id === id);
    if (entry) this.activeLines.set({ ...entry.activeLine });
  }
}
