import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { UnsavedChangesService } from '@core/services';

@Component({
  selector: 'app-panel-page-wrapper',
  imports: [CommonModule],
  template: `
    <main
      [class]="'p-[var(--panel-content-padding)]' + (existsUnsavedChanges() ? ' pb-[16rem]' : '')"
    >
      <div class="mx-auto" [class]="maxWClass()"><ng-content></ng-content></div>
    </main>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelPageWrapper {
  public unsavedChangesService = inject(UnsavedChangesService);
  public existsUnsavedChanges = computed(() => this.unsavedChangesService.existsUnsavedChanges());
  public maxW = input<
    '7xl' | '6xl' | '5xl' | '4xl' | '3xl' | '2xl' | 'xl' | 'lg' | 'md' | 'sm' | 'xs' | string
  >('7xl');

  // Map of max-width classes - using complete class names so Tailwind can detect them
  private readonly maxWClasses: Record<string, string> = {
    xs: 'max-w-xs!',
    sm: 'max-w-sm!',
    md: 'max-w-md!',
    lg: 'max-w-lg!',
    xl: 'max-w-xl!',
    '2xl': 'max-w-2xl!',
    '3xl': 'max-w-3xl!',
    '4xl': 'max-w-4xl!',
    '5xl': 'max-w-5xl!',
    '6xl': 'max-w-6xl!',
    '7xl': 'max-w-7xl!',
  };

  public maxWClass = computed(() => {
    const value = this.maxW();
    return this.maxWClasses[value] || `max-w-${value}!`;
  });
}
