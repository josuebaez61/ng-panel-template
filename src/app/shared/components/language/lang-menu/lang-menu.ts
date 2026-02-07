import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LANGUAGE_OPTIONS_TOKEN } from '@core/providers';
import { CURRENT_LANG_TOKEN } from '@core/providers/current-lang-provider';
import { TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { ButtonDirective, ButtonIcon } from 'primeng/button';
import { Menu } from 'primeng/menu';
import { map } from 'rxjs';

@Component({
  selector: 'app-lang-menu',
  imports: [Menu, AsyncPipe, ButtonDirective, ButtonIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div #container class="relative">
      <button
        pButton
        text
        rounded
        (click)="menu.toggle($event)"
        (keyup.enter)="menu.toggle($event)"
        tabindex="0"
      >
        @if (selectedLang$ | async; as lang) {
        <img pButtonIcon [src]="lang.icon" [alt]="lang.label" />
        }
      </button>
      <p-menu
        #menu
        [model]="languageOptions"
        [popup]="true"
        styleClass="!left-[-10rem] !top-12 fixed"
        [appendTo]="container"
      >
        <ng-template #item let-lang>
          <div
            (click)="onChange(lang)"
            (keyup.enter)="onChange(lang)"
            tabindex="0"
            role="button"
            class="flex items-center gap-2 cursor-pointer py-2 px-4"
          >
            <img [src]="lang.icon" [alt]="lang.label" />
            <div>{{ lang.label }}</div>
          </div>
        </ng-template>
      </p-menu>
    </div>
  `,
  styles: `
  img {
    width: 1.6rem;
  }`,
})
export class LangMenu {
  public languageOptions = inject(LANGUAGE_OPTIONS_TOKEN).map<MenuItem>((el) => ({
    label: el.label,
    value: el.value,
    icon: el.src,
  }));
  public translateService = inject(TranslateService);
  public currentLang$ = inject(CURRENT_LANG_TOKEN);
  public selectedLang$ = this.currentLang$.pipe(
    map((lang) => this.languageOptions.find((el) => el['value'] === lang)!)
  );

  public onChange(event: any) {
    const lang = typeof event === 'string' ? event : event.value;
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
          },
          error: (error) => {
            console.error('Error reloading language:', error);
          },
        });
      },
      error: (error) => {
        console.error('Error loading language:', error);
      },
    });
  }
}
