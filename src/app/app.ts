import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EN_LANGUAGE } from '@core/constants';
import { LANGUAGE_OPTIONS_TOKEN } from '@core/providers';
import { OrganizationState, StorageService, ThemeService } from '@core/services';
import { TranslateService } from '@ngx-translate/core';
import { ToastModule } from 'primeng/toast';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { GlobalSpinner } from '@shared/components/utilities/global-spinner/global-spinner';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule, ConfirmPopupModule, ConfirmDialogModule, GlobalSpinner],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  private themeService = inject(ThemeService);
  private translateService = inject(TranslateService);
  private storageService = inject(StorageService);
  private languageOptions = inject(LANGUAGE_OPTIONS_TOKEN);
  private organizationState = inject(OrganizationState);
  private fallbackLang = EN_LANGUAGE;

  constructor() {
    this.themeService.loadTheme();
    this.initializeTranslations();
  }

  public ngOnInit(): void {
    // Initialize organization data on app startup
    this.organizationState.initialize().subscribe();
  }

  private initializeTranslations(): void {
    this.translateService.addLangs(this.languageOptions.map((option) => option.value));

    // Set fallback lang first (use default fallback, not browser lang)
    this.translateService.setFallbackLang(this.fallbackLang);

    // Subscribe to language changes
    this.translateService.onLangChange.subscribe((lang) => {
      document.documentElement.lang = lang.lang;
      this.storageService.setLang(lang.lang);
    });

    // Determine the language to use - prioritize storage over fallback
    const storageLang = this.storageService.getLang();
    const langToUse = storageLang && this.isValidLang(storageLang) 
      ? storageLang 
      : this.fallbackLang;

    // Use the language and reload to ensure translations are applied
    this.translateService.use(langToUse).subscribe({
      next: () => {
        // Force reload to ensure translations are applied on initial load
        this.translateService.reloadLang(langToUse).subscribe();
      },
      error: (error) => {
        console.error('Error loading initial language:', error);
      },
    });
  }

  private isValidLang(lang: string): boolean {
    return this.translateService.getLangs().includes(lang);
  }
}
