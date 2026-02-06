import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import {
  from,
  switchMap,
  BehaviorSubject,
  filter,
  take,
  catchError,
  throwError,
  finalize,
} from 'rxjs';
import { StorageService } from '../services/storage-service';
import { AuthService } from '../services/auth-service';
import { X_REFRESH_TOKEN_KEY } from '@core/constants';

// Flag and subject to handle multiple simultaneous refresh attempts
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next) => {
  const storageService = inject(StorageService);
  const authService = inject(AuthService);

  const requestUrl = req.url;

  // For refresh token endpoint, add X-Refresh-Token header
  if (isRefreshTokenEndpoint(requestUrl)) {
    return from(addRefreshTokenHeader(req, storageService)).pipe(
      switchMap((authReq) => next(authReq))
    );
  }

  // Skip auth for login, register, and password reset endpoints
  if (isAuthEndpoint(requestUrl)) {
    return next(req);
  }

  // Clone request with auth headers helper
  const cloneRequestWithToken = (token: string | null) => {
    const bearerToken = token ? `Bearer ${token}` : '';
    return req.clone({
      setHeaders: {
        Authorization: bearerToken,
        [X_REFRESH_TOKEN_KEY]: storageService.getRefreshToken() || '',
      },
    });
  };

  const accessToken = storageService.getAuthToken();
  if (!accessToken) {
    return next(req);
  }

  // Check if token is close to expiring (less than 60 seconds)
  // If so, refresh it before sending the request
  if (authService.isTokenCloseToExpiring(60)) {
    if (!isRefreshing) {
      // Start refresh process
      isRefreshing = true;
      refreshTokenSubject.next(null);

      return authService.refreshAuthToken().pipe(
        switchMap((_response) => {
          const newToken = authService.token();
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
          authService.logout();
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
          authService.logout();
          return throwError(() => err);
        })
      );
    }
  }

  // Token is not close to expiring, proceed with current token
  const authReq = cloneRequestWithToken(accessToken);
  return next(authReq);
};

async function addRefreshTokenHeader(
  req: HttpRequest<any>,
  storageService: StorageService
): Promise<HttpRequest<any>> {
  const refreshToken = storageService.getRefreshToken();
  const bearerToken = refreshToken ? `Bearer ${refreshToken}` : '';
  return req.clone({
    setHeaders: {
      Authorization: bearerToken,
      [X_REFRESH_TOKEN_KEY]: refreshToken || '',
    },
  });
}

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
