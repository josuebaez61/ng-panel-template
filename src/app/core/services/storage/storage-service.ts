import { Injectable } from '@angular/core';
import { AUTH_TOKEN_KEY, LANG_KEY, REFRESH_TOKEN_KEY, THEME_KEY } from '../../constants';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor() {
    // Storage service constructor
  }

  private getItem(key: string): string | null {
    return localStorage.getItem(key);
  }

  private setItem(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  private removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  public clear(): void {
    localStorage.clear();
  }

  public getLang(): string | null {
    return this.getItem(LANG_KEY);
  }

  public setLang(lang: string): void {
    this.setItem(LANG_KEY, lang);
  }

  public getTheme(): string | null {
    return this.getItem(THEME_KEY);
  }

  public setTheme(theme: string): void {
    this.setItem(THEME_KEY, theme);
  }

  public getAuthToken(): string | null {
    return this.getItem(AUTH_TOKEN_KEY);
  }

  public setAuthToken(token: string): void {
    this.setItem(AUTH_TOKEN_KEY, token);
  }

  public getRefreshToken(): string | null {
    return this.getItem(REFRESH_TOKEN_KEY);
  }

  public setRefreshToken(token: string): void {
    this.setItem(REFRESH_TOKEN_KEY, token);
  }

  public removeAuthToken(): void {
    this.removeItem(AUTH_TOKEN_KEY);
  }

  public removeRefreshToken(): void {
    this.removeItem(REFRESH_TOKEN_KEY);
  }
}
