import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  DestroyRef,
  ElementRef,
  Injector,
  HostListener,
  LOCALE_ID,
  PLATFORM_ID,
  TransferState,
  ViewChild,
  computed,
  afterNextRender,
  effect,
  inject,
  makeStateKey,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import {
  ProjectSummary,
  projectGroupsForLocale,
  projectsForLocale,
  ProjectCategory,
  ProjectIcon,
} from './docs/docs-data';
import { LibraryPicker } from './docs/library-picker';
import { ProjectNavigation } from './docs/project-navigation';
import { ProjectIconComponent } from './docs/project-icon';
import { canonicalHomePath, localizedPublicPath } from './locale-path';

type GoogleAnalyticsWindow = Window & {
  gtag?: (...args: unknown[]) => void;
};

export const INITIAL_DOCS_URL = makeStateKey<string>('rdlabo-docs-initial-url');

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, LibraryPicker, ProjectNavigation, ProjectIconComponent],
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
  readonly #injector = inject(Injector);
  readonly #transferState = inject(TransferState);
  #pendingProjectId: string | null = null;
  #pickerTrigger: HTMLElement | null = null;
  #bodyOverflow: string | null = null;
  #navigationInitialized = false;
  @ViewChild('menuButton') protected readonly menuButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('docsSidebar') protected readonly docsSidebar?: ElementRef<HTMLElement>;
  protected readonly menuOpen = signal(false);
  protected readonly mobileLayout = signal(false);
  protected readonly layoutReady = signal(false);
  protected readonly navigationHidden = computed(() => this.mobileLayout() && !this.menuOpen());
  protected readonly currentUrl = signal(
    this.#transferState.get(INITIAL_DOCS_URL, this.#router.url),
  );
  protected readonly projects = projectsForLocale(this.#locale);
  protected readonly projectGroups = projectGroupsForLocale(this.#locale)
    .map((group) => ({
      ...group,
      projects: group.projects.filter((project) => !project.hostedUrl),
    }))
    .filter((group) => group.projects.length > 0);
  protected readonly libraryPickerOpen = signal(false);
  protected readonly navigationAnimationReady = signal(false);
  protected readonly isJapanese = this.#locale.toLowerCase().startsWith('ja');
  protected readonly canonicalHomePath = canonicalHomePath(this.#locale);
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
  protected readonly libraryCategory = signal(this.activeProject()?.category ?? '');
  protected readonly showingLibraries = computed(
    () => !this.activeProject() || this.libraryPickerOpen(),
  );
  protected readonly selectedCategory = computed(() =>
    this.showingLibraries() ? this.libraryCategory() : (this.activeProject()?.category ?? ''),
  );

  constructor() {
    if (isPlatformBrowser(this.#platformId)) {
      this.#transferState.remove(INITIAL_DOCS_URL);
    } else {
      this.#transferState.onSerialize(INITIAL_DOCS_URL, () => this.currentUrl());
    }
    effect(() => {
      if (!isPlatformBrowser(this.#platformId)) return;
      if (this.mobileLayout() && this.menuOpen()) {
        this.#bodyOverflow ??= this.#document.body.style.overflow;
        this.#document.body.style.overflow = 'hidden';
      } else if (this.#bodyOverflow !== null) {
        this.#document.body.style.overflow = this.#bodyOverflow;
        this.#bodyOverflow = null;
      }
    });
    this.#destroyRef.onDestroy(() => {
      if (this.#bodyOverflow !== null) this.#document.body.style.overflow = this.#bodyOverflow;
    });
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
    this.#router.events.pipe(takeUntilDestroyed(this.#destroyRef)).subscribe((event) => {
      if (event instanceof NavigationCancel || event instanceof NavigationError) {
        this.#pendingProjectId = null;
        return;
      }
      if (!(event instanceof NavigationEnd)) return;
      const selectedFromPicker = this.#pendingProjectId;
      this.#pendingProjectId = null;
      this.currentUrl.set(event.urlAfterRedirects);
      const activeProject = this.activeProject();
      if (!selectedFromPicker) this.libraryCategory.set(activeProject?.category ?? '');
      this.libraryPickerOpen.set(false);
      if (!this.#navigationInitialized) {
        this.#navigationInitialized = true;
        afterNextRender(() => this.navigationAnimationReady.set(true), {
          injector: this.#injector,
        });
      }
      if (selectedFromPicker && activeProject?.id === selectedFromPicker) {
        this.#focusProjectNavigation();
      } else if (this.mobileLayout()) {
        this.closeMenu(this.#sidebarContainsFocus());
      }
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
    afterNextRender(
      () => {
        if (this.showingLibraries()) this.#focusLibraryList();
        else this.#focusNavigationLink(this.#currentProjectLink());
      },
      { injector: this.#injector },
    );
  }

  protected closeMenu(returnFocus = true): void {
    if (!this.menuOpen()) {
      if (returnFocus && this.#sidebarContainsFocus()) {
        queueMicrotask(() => this.menuButton?.nativeElement.focus());
      }
      return;
    }
    this.menuOpen.set(false);
    this.libraryPickerOpen.set(false);
    if (returnFocus) queueMicrotask(() => this.menuButton?.nativeElement.focus());
  }

  protected selectProject(project: ProjectSummary): void {
    if (this.activeProject()?.id === project.id) {
      this.libraryPickerOpen.set(false);
      this.#focusProjectNavigation();
      return;
    }
    this.#pendingProjectId = project.id;
  }

  protected openLibraryPicker(category = '', event?: MouseEvent): void {
    this.#pickerTrigger = event?.currentTarget instanceof HTMLElement ? event.currentTarget : null;
    this.libraryCategory.set(category);
    this.libraryPickerOpen.set(true);
    afterNextRender(() => this.#focusLibraryList(), { injector: this.#injector });
  }

  protected closeLibraryPicker(): void {
    this.libraryPickerOpen.set(false);
    afterNextRender(
      () => {
        if (this.#pickerTrigger?.isConnected) this.#pickerTrigger.focus({ preventScroll: true });
        else this.#focusNavigationLink(this.#currentProjectLink());
      },
      { injector: this.#injector },
    );
  }

  #focusProjectNavigation(): void {
    afterNextRender(() => this.#focusNavigationLink(this.#currentProjectLink()), {
      injector: this.#injector,
    });
  }

  #currentProjectLink(): HTMLAnchorElement | null | undefined {
    const sidebar = this.docsSidebar?.nativeElement;
    return (
      sidebar?.querySelector<HTMLAnchorElement>(
        '.project-navigation-pages [aria-current="page"]',
      ) ?? sidebar?.querySelector<HTMLAnchorElement>('.project-navigation-pages a')
    );
  }

  #focusLibraryList(): void {
    const sidebar = this.docsSidebar?.nativeElement;
    const currentProject = this.activeProject();
    const selected = currentProject
      ? sidebar?.querySelector<HTMLAnchorElement>(`#project-link-${currentProject.id}`)
      : null;
    const link = selected ?? sidebar?.querySelector<HTMLAnchorElement>('.library-picker-list a');
    this.#focusNavigationLink(link);
  }

  #focusNavigationLink(link: HTMLAnchorElement | null | undefined): void {
    link?.focus({ preventScroll: true });
    const list = link?.closest('nav');
    if (!link || !list) return;
    const item = link.getBoundingClientRect();
    const viewport = list.getBoundingClientRect();
    if (item.top < viewport.top + 12) list.scrollTop -= viewport.top + 12 - item.top;
    else if (item.bottom > viewport.bottom - 12)
      list.scrollTop += item.bottom - viewport.bottom + 12;
  }

  protected categoryTitle(category: ProjectCategory): string {
    return this.projectGroups.find((group) => group.id === category)?.label ?? '';
  }

  protected categoryIcon(category: ProjectCategory): ProjectIcon {
    return category === 'capacitor-plugins'
      ? 'app'
      : category === 'frontend-tools'
        ? 'theme'
        : 'server';
  }

  protected categoryLabel(category: ProjectCategory): string {
    return category === 'capacitor-plugins'
      ? 'Capacitor'
      : category === 'frontend-tools'
        ? 'UI'
        : $localize`:@@developerToolsRail:Dev`;
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
    if (this.#document.querySelector('dialog[open]')) return;
    if (this.activeProject() && this.libraryPickerOpen()) this.closeLibraryPicker();
    else if (this.mobileLayout()) this.closeMenu();
  }

  @HostListener('document:keydown', ['$event'])
  protected containMobileFocus(event: Event): void {
    if (
      !(event instanceof KeyboardEvent) ||
      event.key !== 'Tab' ||
      !this.mobileLayout() ||
      !this.menuOpen() ||
      this.#document.querySelector('dialog[open]')
    )
      return;
    const sidebar = this.docsSidebar?.nativeElement;
    const button = this.menuButton?.nativeElement;
    if (!sidebar || !button) return;
    const elements = [
      button,
      ...Array.from(sidebar.querySelectorAll<HTMLElement>('a[href], button, input')).filter(
        (element) => !element.closest('[inert], [hidden]'),
      ),
    ];
    const index = elements.indexOf(this.#document.activeElement as HTMLElement);
    if (
      index === -1 ||
      (!event.shiftKey && index === elements.length - 1) ||
      (event.shiftKey && index === 0)
    ) {
      event.preventDefault();
      elements[event.shiftKey ? elements.length - 1 : 0]?.focus();
    }
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
}
