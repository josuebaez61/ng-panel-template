import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import {
  switchMap,
  BehaviorSubject,
  filter,
  take,
  catchError,
  throwError,
  finalize,
} from 'rxjs';
import { StorageService } from '../services/storage';
import { AuthState } from '../services/auth';

// Flag and subject to handle multiple simultaneous refresh attempts
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next) => {
  const storageService = inject(StorageService);
  const authState = inject(AuthState);

  const requestUrl = req.url;

  // For refresh token endpoint, cookies are sent automatically via credentialsInterceptor
  // The backend will read from cookies first, then fallback to body
  if (isRefreshTokenEndpoint(requestUrl)) {
    return next(req);
  }

  // Skip auth for login, register, and password reset endpoints
  if (isAuthEndpoint(requestUrl)) {
    return next(req);
  }

  // Clone request with auth headers helper
  // With httpOnly cookies, tokens are sent automatically via cookies
  // But we still support Authorization header for backward compatibility
  const cloneRequestWithToken = (token: string | null) => {
    const bearerToken = token ? `Bearer ${token}` : '';
    return req.clone({
      setHeaders: {
        Authorization: bearerToken,
      },
    });
  };

  // Try to get token from storage (for backward compatibility)
  // If not found, rely on httpOnly cookies which are sent automatically via credentialsInterceptor
  const accessToken = storageService.getAuthToken();
  
  // If no token in storage, cookies will handle authentication
  // But we still need to check token expiration for refresh logic
  if (!accessToken) {
    // No token in storage - rely on httpOnly cookies
    // Cookies are sent automatically via credentialsInterceptor
    return next(req);
  }

  // Check if token is close to expiring (less than 60 seconds)
  // If so, refresh it before sending the request
  if (authState.isTokenCloseToExpiring(60)) {
    if (!isRefreshing) {
      // Start refresh process
      isRefreshing = true;
      refreshTokenSubject.next(null);

      return authState.refreshAuthToken().pipe(
        switchMap((_response) => {
          const newToken = authState.accessToken();
          if (newToken) {
            refreshTokenSubject.next(newToken);
            const retryRequest = cloneRequestWithToken(newToken);
            return next(retryRequest);
          }
          refreshTokenSubject.next(null);
          return throwError(() => new Error('Failed to get new token'));
        }),
        catchError((err) => {
          refreshTokenSubject.next(null);
          authState.logout();
          return throwError(() => err);
        }),
        finalize(() => {
          isRefreshing = false;
        })
      );
    } else {
      // Wait for the ongoing refresh to complete
      return refreshTokenSubject.pipe(
        filter((token): token is string => token !== null),
        take(1),
        switchMap((token) => {
          const retryRequest = cloneRequestWithToken(token);
          return next(retryRequest);
        }),
        catchError((err) => {
          // If waiting for refresh fails, logout
          authState.logout();
          return throwError(() => err);
        })
      );
    }
  }

  // Token is not close to expiring, proceed with current token
  const authReq = cloneRequestWithToken(accessToken);
  return next(authReq);
};

// Removed addRefreshTokenHeader - cookies are sent automatically via withCredentials

function isRefreshTokenEndpoint(url: string): boolean {
  return url.includes('/auth/refresh-token');
}

function isAuthEndpoint(url: string): boolean {
  const authEndpoints = [
    '/auth/login',
    '/auth/register',
    '/auth/request-password-reset',
    '/auth/reset-password',
  ];

  return authEndpoints.some((endpoint) => url.includes(endpoint));
}
