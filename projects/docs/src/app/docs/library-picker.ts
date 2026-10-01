import { Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProjectCategoryGroup, ProjectSummary } from './docs-data';

@Component({
  selector: 'app-library-picker',
  imports: [RouterLink],
  templateUrl: './library-picker.html',
  styleUrl: './library-picker.css',
})
export class LibraryPicker {
  readonly groups = input.required<readonly ProjectCategoryGroup[]>();
  readonly activeProjectId = input<string>();
  readonly activePath = input('/');
  readonly selected = output<ProjectSummary>();
  readonly category = input('');
  protected readonly visibleGroups = computed(() =>
    this.groups().filter((group) => !this.category() || group.id === this.category()),
  );
  protected readonly title = computed(() => this.visibleGroups()[0]?.label);

  protected choose(event: MouseEvent, project: ProjectSummary): void {
    if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    this.selected.emit(project);
  }
}
