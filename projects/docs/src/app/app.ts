import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  DestroyRef,
  ElementRef,
  HostListener,
  LOCALE_ID,
  PLATFORM_ID,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import {
  ProjectSummary,
  projectGroupsForLocale,
  projectsForLocale,
  sectionsFor,
} from './docs/docs-data';
import { canonicalHomePath, localizedPublicPath } from './locale-path';

type GoogleAnalyticsWindow = Window & {
  gtag?: (...args: unknown[]) => void;
};

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class App {
  readonly #router = inject(Router);
  readonly #destroyRef = inject(DestroyRef);
  readonly #locale = inject(LOCALE_ID);
  readonly #platformId = inject(PLATFORM_ID);
  readonly #document = inject(DOCUMENT);
  @ViewChild('menuButton') protected readonly menuButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('docsSidebar') protected readonly docsSidebar?: ElementRef<HTMLElement>;
  protected readonly menuOpen = signal(false);
  protected readonly mobileLayout = signal(false);
  protected readonly layoutReady = signal(false);
  protected readonly navigationHidden = computed(() => this.mobileLayout() && !this.menuOpen());
  protected readonly currentUrl = signal('/');
  protected readonly projects = projectsForLocale(this.#locale);
  protected readonly projectGroups = projectGroupsForLocale(this.#locale)
    .map((group) => ({
      ...group,
      projects: group.projects.filter((project) => !project.hostedUrl),
    }))
    .filter((group) => group.projects.length > 0);
  protected readonly expandedProjectId = signal<string | null>(null);
  protected readonly isJapanese = this.#locale.toLowerCase().startsWith('ja');
  protected readonly canonicalHomePath = canonicalHomePath(this.#locale);
  protected readonly sectionsFor = sectionsFor;
  protected readonly isIndex = computed(() => {
    const path = this.currentUrl().split(/[?#]/)[0];
    return path === '/' || path === '/projects';
  });
  protected readonly isSupport = computed(() => this.currentUrl().split(/[?#]/)[0] === '/support');
  protected readonly activeProject = computed(() => {
    const segments = this.currentUrl().split(/[?#]/)[0].split('/').filter(Boolean);
    const slug = segments[0] === 'projects' ? segments[1] : undefined;
    return this.projects.find((project) => project.slug === slug);
  });

  constructor() {
    if (isPlatformBrowser(this.#platformId)) {
      this.#loadSearchAssets();
    }
    if (isPlatformBrowser(this.#platformId) && typeof window.matchMedia === 'function') {
      const media = window.matchMedia('(max-width: 1023px)');
      const updateLayout = () => {
        this.mobileLayout.set(media.matches);
        if (media.matches) {
          this.closeMenu(this.#sidebarContainsFocus());
        } else {
          this.menuOpen.set(true);
        }
        this.layoutReady.set(true);
      };
      updateLayout();
      media.addEventListener('change', updateLayout);
      this.#destroyRef.onDestroy(() => media.removeEventListener('change', updateLayout));
    }
    this.#router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.#destroyRef),
      )
      .subscribe((event) => {
        this.currentUrl.set(event.urlAfterRedirects);
        const activeProject = this.activeProject();
        if (activeProject) this.expandedProjectId.set(activeProject.id);
        if (this.mobileLayout()) this.closeMenu(this.#sidebarContainsFocus());
        this.#sendPageView(event.urlAfterRedirects);
      });
  }

  #sendPageView(path: string): void {
    if (!isPlatformBrowser(this.#platformId)) return;
    const browserWindow = this.#document.defaultView as GoogleAnalyticsWindow | null;
    if (!browserWindow?.gtag) return;

    browserWindow.gtag('event', 'page_view', {
      page_title: this.#document.title,
      page_location: browserWindow.location.href,
      page_path: localizedPublicPath(this.#locale, path),
    });
  }

  #loadSearchAssets(): void {
    if (!this.#document.head.querySelector('link[data-pagefind-ui]')) {
      const stylesheet = this.#document.createElement('link');
      stylesheet.rel = 'stylesheet';
      stylesheet.href = '/pagefind/pagefind-component-ui.css';
      stylesheet.dataset['pagefindUi'] = '';
      this.#document.head.appendChild(stylesheet);
    }
    if (!this.#document.head.querySelector('script[data-pagefind-ui]')) {
      const script = this.#document.createElement('script');
      script.type = 'module';
      script.src = '/pagefind/pagefind-component-ui.js';
      script.dataset['pagefindUi'] = '';
      this.#document.head.appendChild(script);
    }
  }

  protected toggleMenu(): void {
    if (this.menuOpen()) {
      this.closeMenu();
      return;
    }
    this.menuOpen.set(true);
    queueMicrotask(() => this.docsSidebar?.nativeElement.querySelector<HTMLElement>('a')?.focus());
  }

  protected closeMenu(returnFocus = true): void {
    if (!this.menuOpen()) {
      if (returnFocus && this.#sidebarContainsFocus()) {
        queueMicrotask(() => this.menuButton?.nativeElement.focus());
      }
      return;
    }
    this.menuOpen.set(false);
    if (returnFocus) queueMicrotask(() => this.menuButton?.nativeElement.focus());
  }

  protected isProjectExpanded(project: ProjectSummary): boolean {
    return this.expandedProjectId() === project.id;
  }

  protected selectProject(project: ProjectSummary): void {
    if (this.isProjectExpanded(project)) {
      this.expandedProjectId.set(null);
      return;
    }
    this.expandedProjectId.set(project.id);
  }

  protected projectNavigationLabel(project: ProjectSummary): string {
    const action = this.isProjectExpanded(project)
      ? this.isJapanese
        ? '折りたたむ'
        : 'Collapse'
      : this.isJapanese
        ? '展開する'
        : 'Expand';
    return this.isJapanese
      ? `${project.shortName}のナビゲーションを${action}`
      : `${action} navigation for ${project.shortName}`;
  }

  #sidebarContainsFocus(): boolean {
    const activeElement = this.#document.activeElement;
    return (
      activeElement instanceof HTMLElement &&
      !!this.docsSidebar?.nativeElement.contains(activeElement)
    );
  }

  @HostListener('document:keydown.escape')
  protected closeMenuOnEscape(): void {
    if (this.mobileLayout()) this.closeMenu();
  }

  protected alternateLocaleUrl(): string {
    const url = this.currentUrl().split(/[?#]/)[0] || '/';
    return this.isJapanese ? url : localizedPublicPath('ja', url);
  }

  protected navigateHome(event: MouseEvent): void {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    // JA: follow canonical href `/ja`. SPA navigateByUrl('/') becomes `/ja/` under localized base.
    if (this.isJapanese) {
      return;
    }
    event.preventDefault();
    void this.#router.navigateByUrl('/');
  }

  protected projectPanelId(project: ProjectSummary): string {
    return `project-panel-${project.id}`;
  }
}
