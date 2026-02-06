import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EN_LANGUAGE } from '@core/constants';
import { LANGUAGE_OPTIONS_TOKEN } from '@core/providers';
import { StorageService, ThemeService } from '@core/services';
import { TranslateService } from '@ngx-translate/core';
import { ToastModule } from 'primeng/toast';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { GlobalLoading } from '@shared/components/utilities/global-loading/global-loading';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule, ConfirmPopupModule, ConfirmDialogModule, GlobalLoading],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private themeService = inject(ThemeService);
  private translateService = inject(TranslateService);
  private storageService = inject(StorageService);
  private languageOptions = inject(LANGUAGE_OPTIONS_TOKEN);
  private fallbackLang = EN_LANGUAGE;

  constructor() {
    this.themeService.loadTheme();
    this.initializeTranslations();
  }

  private initializeTranslations(): void {
    this.translateService.addLangs(this.languageOptions.map((option) => option.value));
    this.updateNgxTranslateFallbackLang();

    const storageLang = this.storageService.getLang();

    this.translateService.onLangChange.subscribe((lang) => {
      document.documentElement.lang = lang.lang;
      this.storageService.setLang(lang.lang);
    });

    this.translateService.reloadLang(
      storageLang || this.translateService.getFallbackLang() || this.fallbackLang
    );
    this.translateService.use(
      storageLang || this.translateService.getFallbackLang() || this.fallbackLang
    );
  }

  private isValidLang(lang: string): boolean {
    return this.translateService.getLangs().includes(lang);
  }

  private updateNgxTranslateFallbackLang(): void {
    const fallbackLang = navigator.language || navigator.languages[0] || this.fallbackLang;

    if (this.isValidLang(fallbackLang)) {
      this.translateService.setFallbackLang(fallbackLang);
    } else {
      this.translateService.setFallbackLang(this.fallbackLang);
    }
  }
}
