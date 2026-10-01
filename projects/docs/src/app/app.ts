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
  NavigationCancellationCode,
  NavigationEnd,
  NavigationError,
  NavigationSkipped,
  NavigationStart,
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

interface LibrarySelection {
  projectId: string;
  category: string;
  pickerOpen: boolean;
  revision: number;
}

interface PendingNavigation {
  id: number;
  url: string;
  selection: LibrarySelection | null;
  revision: number;
}

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
  #librarySelection: LibrarySelection | null = null;
  #navigationId = 0;
  #menuRevision = 0;
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
  protected readonly pendingNavigation = signal<PendingNavigation | null>(null);
  protected readonly navigationError = signal<string | null>(null);
  protected readonly reloadDocumentationUrl = computed(() =>
    localizedPublicPath(this.#locale, this.navigationError() ?? this.currentUrl()),
  );
  protected readonly navigationUrl = computed(
    () => this.pendingNavigation()?.url ?? this.currentUrl(),
  );
  protected readonly navigationAnimationReady = signal(false);
  protected readonly isJapanese = this.#locale.toLowerCase().startsWith('ja');
  protected readonly canonicalHomePath = canonicalHomePath(this.#locale);
  protected readonly isIndex = computed(() => {
    const path = this.currentUrl().split(/[?#]/)[0];
    return path === '/' || path === '/projects';
  });
  protected readonly isSupport = computed(() => this.currentUrl().split(/[?#]/)[0] === '/support');
  protected readonly activeProject = computed(() => this.#projectForUrl(this.currentUrl()));
  protected readonly navigationProject = computed(() => this.#projectForUrl(this.navigationUrl()));
  protected readonly libraryCategory = signal(this.activeProject()?.category ?? '');
  protected readonly showingLibraries = computed(
    () => !this.navigationProject() || this.libraryPickerOpen(),
  );
  protected readonly selectedCategory = computed(() =>
    this.showingLibraries() ? this.libraryCategory() : (this.navigationProject()?.category ?? ''),
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
      if (event instanceof NavigationStart) {
        this.#navigationId = event.id;
        const selection = this.#librarySelection;
        this.#librarySelection = null;
        const project = this.#projectForUrl(event.url);
        const selectedFromPicker = selection?.projectId === project?.id ? selection : null;
        // Keep prerendered content intact during its initial hydration navigation.
        if (!this.#navigationInitialized && !selectedFromPicker) return;
        if (!selectedFromPicker && this.mobileLayout()) {
          this.closeMenu(this.#sidebarContainsFocus());
        }
        this.pendingNavigation.set({
          id: event.id,
          url: event.url,
          selection: selectedFromPicker,
          revision: this.#menuRevision,
        });
        this.navigationError.set(null);
        this.libraryPickerOpen.set(false);
        if (selectedFromPicker) this.#focusProjectNavigation(this.#menuRevision);
        else this.libraryCategory.set(project?.category ?? '');
        return;
      }
      if (event instanceof NavigationSkipped) {
        if (event.id < this.#navigationId) return;
        this.#navigationId = event.id;
        this.pendingNavigation.set(null);
        this.navigationError.set(null);
        const selection = this.#librarySelection;
        this.#librarySelection = null;
        if (selection?.revision === this.#menuRevision) {
          this.libraryPickerOpen.set(false);
          this.#focusProjectNavigation(this.#menuRevision);
        }
        return;
      }
      if (event instanceof NavigationCancel || event instanceof NavigationError) {
        if (event.id !== this.#navigationId) return;
        if (
          event instanceof NavigationCancel &&
          (event.code === NavigationCancellationCode.SupersededByNewNavigation ||
            event.code === NavigationCancellationCode.Redirect)
        )
          return;
        const pending = this.pendingNavigation();
        this.pendingNavigation.set(null);
        this.navigationError.set(event instanceof NavigationError ? event.url : null);
        if (pending?.selection && pending.revision === this.#menuRevision) {
          this.libraryPickerOpen.set(pending.selection.pickerOpen);
          this.libraryCategory.set(pending.selection.category);
          const projectId = pending.selection.projectId;
          afterNextRender(
            () => {
              if (
                pending.revision !== this.#menuRevision ||
                this.navigationHidden() ||
                !this.showingLibraries()
              )
                return;
              this.#focusNavigationLink(
                this.docsSidebar?.nativeElement.querySelector(`#project-link-${projectId}`),
              );
            },
            { injector: this.#injector },
          );
        }
        if (event instanceof NavigationError && this.mobileLayout()) this.closeMenu();
        return;
      }
      if (!(event instanceof NavigationEnd) || event.id !== this.#navigationId) return;
      const pending = this.pendingNavigation();
      this.currentUrl.set(event.urlAfterRedirects);
      this.pendingNavigation.set(null);
      this.navigationError.set(null);
      if (!this.#navigationInitialized) {
        this.#navigationInitialized = true;
        afterNextRender(() => this.navigationAnimationReady.set(true), {
          injector: this.#injector,
        });
      }
      if (!pending || pending.revision === this.#menuRevision) {
        this.libraryPickerOpen.set(false);
        if (!pending?.selection) this.libraryCategory.set(this.activeProject()?.category ?? '');
        if (
          this.mobileLayout() &&
          (!pending?.selection || this.activeProject()?.id !== pending.selection.projectId)
        ) {
          this.closeMenu(this.#sidebarContainsFocus());
        }
      }
      this.#sendPageView(event.urlAfterRedirects);
    });
  }

  #projectForUrl(url: string): ProjectSummary | undefined {
    const segments = url.split(/[?#]/)[0].split('/').filter(Boolean);
    const slug = segments[0] === 'projects' ? segments[1] : undefined;
    return this.projects.find((project) => project.slug === slug);
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
    this.#menuRevision++;
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
    this.#menuRevision++;
    this.menuOpen.set(false);
    this.libraryPickerOpen.set(false);
    if (returnFocus) queueMicrotask(() => this.menuButton?.nativeElement.focus());
  }

  protected selectProject(project: ProjectSummary): void {
    this.#menuRevision++;
    if (this.navigationProject()?.id === project.id) {
      this.libraryPickerOpen.set(false);
      this.#focusProjectNavigation();
      return;
    }
    this.#librarySelection = {
      projectId: project.id,
      category: this.libraryCategory(),
      pickerOpen: this.libraryPickerOpen(),
      revision: this.#menuRevision,
    };
    // Selection must be recorded before the router emits NavigationStart.
    // NavigationError restores the committed view and offers a full-page reload.
    void this.#router.navigateByUrl(project.path).catch(() => false);
  }

  protected dismissNavigationError(): void {
    this.navigationError.set(null);
    if (this.mobileLayout()) this.menuButton?.nativeElement.focus({ preventScroll: true });
    else if (this.showingLibraries()) this.#focusLibraryList();
    else this.#focusNavigationLink(this.#currentProjectLink());
  }

  protected openLibraryPicker(category = '', event?: MouseEvent): void {
    this.#menuRevision++;
    this.#pickerTrigger = event?.currentTarget instanceof HTMLElement ? event.currentTarget : null;
    this.libraryCategory.set(category);
    this.libraryPickerOpen.set(true);
    afterNextRender(() => this.#focusLibraryList(), { injector: this.#injector });
  }

  protected closeLibraryPicker(): void {
    this.#menuRevision++;
    this.libraryPickerOpen.set(false);
    afterNextRender(
      () => {
        if (this.#pickerTrigger?.isConnected) this.#pickerTrigger.focus({ preventScroll: true });
        else this.#focusNavigationLink(this.#currentProjectLink());
      },
      { injector: this.#injector },
    );
  }

  #focusProjectNavigation(revision = this.#menuRevision): void {
    afterNextRender(
      () => {
        if (revision !== this.#menuRevision || this.navigationHidden() || this.showingLibraries())
          return;
        this.#focusNavigationLink(this.#currentProjectLink());
      },
      { injector: this.#injector },
    );
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
    const currentProject = this.navigationProject();
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
    if (this.navigationProject() && this.libraryPickerOpen()) this.closeLibraryPicker();
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
    const url = this.navigationUrl().split(/[?#]/)[0] || '/';
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
