import { Injectable, inject } from '@angular/core';
import { AUTH_TOKEN_KEY, LANG_KEY, REFRESH_TOKEN_KEY, THEME_KEY } from '../../constants';
import { CookieService } from './cookie-service';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private cookieService = inject(CookieService);

  // Use cookies for sensitive tokens, localStorage for non-sensitive data
  private readonly TOKEN_COOKIE_DAYS = 7; // Match refresh token expiration

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
    // Clear localStorage
    localStorage.clear();
    // Clear token cookies
    this.removeAuthToken();
    this.removeRefreshToken();
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

  /**
   * Get access token from localStorage
   * Note: Backend sets httpOnly cookies automatically, but we store tokens
   * in localStorage so the frontend can read them for expiration checks
   */
  public getAuthToken(): string | null {
    return this.getItem(AUTH_TOKEN_KEY);
  }

  /**
   * Set access token in localStorage
   * Backend also sets httpOnly cookies automatically, but we need tokens
   * in localStorage to verify expiration on the frontend
   */
  public setAuthToken(token: string): void {
    // Store in localStorage so frontend can read for expiration checks
    // Backend sets httpOnly cookies automatically for actual authentication
    this.setItem(AUTH_TOKEN_KEY, token);
  }

  /**
   * Get refresh token from localStorage
   * Note: Backend sets httpOnly cookies automatically, but we store tokens
   * in localStorage so the frontend can read them for expiration checks
   */
  public getRefreshToken(): string | null {
    return this.getItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Set refresh token in localStorage
   * Backend also sets httpOnly cookies automatically, but we need tokens
   * in localStorage to verify expiration on the frontend
   */
  public setRefreshToken(token: string): void {
    // Store in localStorage so frontend can read for expiration checks
    // Backend sets httpOnly cookies automatically for actual authentication
    this.setItem(REFRESH_TOKEN_KEY, token);
  }

  /**
   * Remove access token from localStorage
   * Backend httpOnly cookies are cleared via logout endpoint
   */
  public removeAuthToken(): void {
    this.removeItem(AUTH_TOKEN_KEY);
  }

  /**
   * Remove refresh token from localStorage
   * Backend httpOnly cookies are cleared via logout endpoint
   */
  public removeRefreshToken(): void {
    this.removeItem(REFRESH_TOKEN_KEY);
  }
}
