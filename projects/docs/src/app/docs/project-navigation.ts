import {
  Component,
  Injector,
  afterNextRender,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { IsActiveMatchOptions, RouterLink, RouterLinkActive } from '@angular/router';
import { ProjectSummary, sectionsFor } from './docs-data';

@Component({
  selector: 'app-project-navigation',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './project-navigation.html',
  styleUrl: './project-navigation.css',
})
export class ProjectNavigation {
  readonly #injector = inject(Injector);
  readonly project = input.required<ProjectSummary>();
  readonly categoryLabel = input.required<string>();
  readonly backToLibraries = output<void>();
  protected readonly sections = computed(() => sectionsFor(this.project()));
  protected readonly activeLinkOptions: IsActiveMatchOptions = {
    paths: 'exact',
    queryParams: 'ignored',
    matrixParams: 'ignored',
    fragment: 'ignored',
  };

  protected revealCurrentPage(active: boolean, link: HTMLAnchorElement): void {
    if (!active) return;
    afterNextRender(
      () => {
        const navigation = link.parentElement;
        if (!navigation || !link.isConnected) return;
        const item = link.getBoundingClientRect();
        const viewport = navigation.getBoundingClientRect();
        const top = viewport.top + 12;
        const bottom = viewport.bottom - 12;
        if (item.top < top) navigation.scrollTop -= top - item.top;
        else if (item.bottom > bottom) navigation.scrollTop += item.bottom - bottom;
      },
      { injector: this.#injector },
    );
  }
}
