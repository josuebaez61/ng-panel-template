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
   * Get access token from secure cookie
   */
  public getAuthToken(): string | null {
    return this.cookieService.getCookie(AUTH_TOKEN_KEY);
  }

  /**
   * Set access token in secure cookie
   */
  public setAuthToken(token: string): void {
    // Store in cookie with SameSite=Strict for security
    // Access tokens expire quickly (5 minutes), so we use shorter expiration
    this.cookieService.setCookie(AUTH_TOKEN_KEY, token, 1, 'Strict'); // 1 day max
  }

  /**
   * Get refresh token from secure cookie
   */
  public getRefreshToken(): string | null {
    return this.cookieService.getCookie(REFRESH_TOKEN_KEY);
  }

  /**
   * Set refresh token in secure cookie
   */
  public setRefreshToken(token: string): void {
    // Store in cookie with SameSite=Strict for security
    // Refresh tokens expire in 7 days
    this.cookieService.setCookie(REFRESH_TOKEN_KEY, token, this.TOKEN_COOKIE_DAYS, 'Strict');
  }

  /**
   * Remove access token cookie
   */
  public removeAuthToken(): void {
    this.cookieService.removeCookie(AUTH_TOKEN_KEY);
    // Also remove from localStorage for backward compatibility during migration
    this.removeItem(AUTH_TOKEN_KEY);
  }

  /**
   * Remove refresh token cookie
   */
  public removeRefreshToken(): void {
    this.cookieService.removeCookie(REFRESH_TOKEN_KEY);
    // Also remove from localStorage for backward compatibility during migration
    this.removeItem(REFRESH_TOKEN_KEY);
  }
}
