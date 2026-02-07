import { Injectable } from '@angular/core';

/**
 * Service for managing browser cookies
 * Provides secure cookie handling with SameSite and Secure flags
 */
@Injectable({
  providedIn: 'root',
})
export class CookieService {
  /**
   * Get a cookie value by name
   */
  getCookie(name: string): string | null {
    if (typeof document === 'undefined') {
      return null; // SSR safety
    }

    const nameEQ = name + '=';
    const cookies = document.cookie.split(';');

    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i];
      while (cookie.charAt(0) === ' ') {
        cookie = cookie.substring(1, cookie.length);
      }
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length, cookie.length));
      }
    }
    return null;
  }

  /**
   * Set a cookie with secure defaults
   * @param name Cookie name
   * @param value Cookie value
   * @param days Expiration in days (default: 7 days)
   * @param sameSite SameSite attribute ('Strict', 'Lax', or 'None')
   */
  setCookie(
    name: string,
    value: string,
    days: number = 7,
    sameSite: 'Strict' | 'Lax' | 'None' = 'Strict',
  ): void {
    if (typeof document === 'undefined') {
      return; // SSR safety
    }

    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

    // Build cookie string with security flags
    let cookieString = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=${sameSite}`;

    // Add Secure flag if using HTTPS (production)
    if (location.protocol === 'https:') {
      cookieString += ';Secure';
    }

    document.cookie = cookieString;
  }

  /**
   * Remove a cookie
   */
  removeCookie(name: string): void {
    if (typeof document === 'undefined') {
      return; // SSR safety
    }

    // Set expiration to past date to delete cookie
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Strict`;
  }

  /**
   * Check if cookies are enabled
   */
  areCookiesEnabled(): boolean {
    if (typeof document === 'undefined') {
      return false;
    }

    try {
      this.setCookie('__test_cookie__', 'test', 1);
      const exists = this.getCookie('__test_cookie__') === 'test';
      this.removeCookie('__test_cookie__');
      return exists;
    } catch {
      return false;
    }
  }
}
