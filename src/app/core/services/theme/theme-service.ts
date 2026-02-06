import { Injectable, signal, computed, inject, DOCUMENT } from '@angular/core';
import { ThemeName } from '../../models/theme-models';
import { StorageService } from '../storage/storage-service';
import { THEME_DARK_CSS_CLASS_NAME, THEME_LIGHT_CSS_CLASS_NAME } from '@core/constants';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private _currentTheme = signal<ThemeName>('light');
  private storageService = inject(StorageService);

  // public signals
  public currentTheme = computed(() => this._currentTheme());
  public isDark = computed(() => this._currentTheme() === 'dark');

  private document = inject(DOCUMENT);

  constructor() {
    this.loadTheme();
  }

  /**
   * Load theme from storage or use default
   */
  public loadTheme(): void {
    const storageTheme = this.storageService.getTheme();

    if (this.isValidTheme(storageTheme)) {
      this.applyTheme(storageTheme);
    } else {
      this.applyTheme('light');
    }
  }

  /**
   * Check if theme name is valid
   */
  private isValidTheme(themeName: string | null): themeName is ThemeName {
    return themeName === 'light' || themeName === 'dark';
  }

  /**
   * Apply theme by switching the stylesheet bundle and CSS classes
   */
  public applyTheme(themeName: ThemeName): void {
    if (!this.isValidTheme(themeName)) {
      console.warn(`Invalid theme name: ${themeName}`);
      return;
    }

    const htmlElement = this.document.querySelector('html');

    if (themeName === 'dark') {
      htmlElement?.classList.add(THEME_DARK_CSS_CLASS_NAME);
      htmlElement?.classList.remove(THEME_LIGHT_CSS_CLASS_NAME);
    } else {
      htmlElement?.classList.remove(THEME_DARK_CSS_CLASS_NAME);
      htmlElement?.classList.add(THEME_LIGHT_CSS_CLASS_NAME);
    }

    // Update the current theme
    this._currentTheme.set(themeName);

    // Store the theme in the storage
    this.storageService.setTheme(themeName);

    console.log(`Theme applied: ${themeName}`);
  }

  /**
   * Toggle between light and dark themes
   */
  public toggleTheme(): void {
    const newTheme = this._currentTheme() === 'light' ? 'dark' : 'light';
    this.applyTheme(newTheme);
  }

  /**
   * Set light theme
   */
  public setLightTheme(): void {
    this.applyTheme('light');
  }

  /**
   * Set dark theme
   */
  public setDarkTheme(): void {
    this.applyTheme('dark');
  }
}
