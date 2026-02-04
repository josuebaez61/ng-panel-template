import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { StorageService } from '../services/storage-service';
import { X_REFRESH_TOKEN_KEY } from '@core/constants';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next) => {
  const storageService = inject(StorageService);

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

  // Clone request with auth headers
  const accessToken = storageService.getAuthToken();
  if (!accessToken) {
    return next(req);
  }

  const bearerToken = `Bearer ${accessToken}`;
  const authReq = req.clone({
    setHeaders: {
      Authorization: bearerToken,
      [X_REFRESH_TOKEN_KEY]: storageService.getRefreshToken() || '',
    },
  });

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
