import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LANGUAGE_OPTIONS_TOKEN } from '@core/providers';
import { CURRENT_LANG_TOKEN } from '@core/providers/current-lang-provider';
import { TranslateService } from '@ngx-translate/core';
import { SharedModule } from '@shared/modules';

@Component({
  selector: 'app-lang-selector',
  imports: [SharedModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p-select
      (onChange)="onChange($event)"
      [ngModel]="currentLang$ | async"
      [options]="languageOptions"
      optionLabel="label"
      optionValue="value"
    >
      <ng-template #selectedItem let-selectedOption>
        @if (selectedOption) {
        <div class="flex items-center gap-2">
          <img [src]="selectedOption.src" [alt]="selectedOption.label" style="width: 18px" />
          <div>{{ selectedOption.value }}</div>
        </div>
        }
      </ng-template>
      <ng-template let-lang #item>
        <div class="flex items-center gap-2">
          <img [src]="lang.src" [alt]="lang.label" style="width: 18px" />
          <div>{{ lang.value }}</div>
        </div>
      </ng-template>
    </p-select>
  `,
  styles: ``,
})
export class LangSelector {
  public languageOptions = inject(LANGUAGE_OPTIONS_TOKEN);
  public translateService = inject(TranslateService);
  public currentLang$ = inject(CURRENT_LANG_TOKEN);
  private cdr = inject(ChangeDetectorRef);

  public onChange(event: any) {
    const lang = event.value;
    const currentLang = this.translateService.getCurrentLang();
    
    if (currentLang === lang) {
      // Language is already active, no need to change
      return;
    }

    // Use the language first to switch
    this.translateService.use(lang).subscribe({
      next: () => {
        // Force reload of the language to ensure translations are applied
        // This is necessary because use() might not always trigger proper translation updates
        this.translateService.reloadLang(lang).subscribe({
          next: () => {
            // Language reloaded successfully, translations should now be applied
            this.cdr.markForCheck();
          },
          error: (error) => {
            console.error('Error reloading language:', error);
            this.cdr.markForCheck();
          },
        });
      },
      error: (error) => {
        console.error('Error loading language:', error);
        this.cdr.markForCheck();
      },
    });
  }
}
