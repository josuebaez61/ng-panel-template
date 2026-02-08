import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { UnsavedChangesService } from '@core/services';

@Component({
  selector: 'app-panel-page-wrapper',
  imports: [CommonModule],
  template: `
    <main class="p-6" [ngClass]="{ 'pb-[16rem]': unsavedChanges() }">
      <div class="mx-auto" [class]="'max-w-' + maxW()"><ng-content></ng-content></div>
    </main>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelPageWrapper {
  public unsavedChangesService = inject(UnsavedChangesService);
  public unsavedChanges = computed(() => this.unsavedChangesService.unsavedChanges());
  public maxW = input<
    '7xl' | '6xl' | '5xl' | '4xl' | '3xl' | '2xl' | 'xl' | 'lg' | 'md' | 'sm' | 'xs' | string
  >('7xl');
}
