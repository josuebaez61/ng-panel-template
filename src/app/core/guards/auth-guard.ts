import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthState } from '../services/auth/auth-state';
import { StorageService } from '../services/storage';
import { map, catchError, of } from 'rxjs';
import { RoutePath } from '../constants/routes';

// Helper function to handle user data validation
const handleUserValidation = (_authState: AuthState, router: Router, user: any) => {
  // Check if user must change password
  if (user?.mustChangePassword) {
    router.navigate([RoutePath.MUST_CHANGE_PASSWORD]);
    return false;
  }
  return true;
};

// Helper function to handle auth errors
const handleAuthError = (authState: AuthState, router: Router, error?: any) => {
  if (error) {
    console.error('Auth error:', error);
  }
  authState.logout();
  router.navigate([RoutePath.LOGIN]);
  return of(false);
};

// Functional guard using Angular 17+ syntax
export const authGuard: CanActivateFn = () => {
  const authState = inject(AuthState);
  const router = inject(Router);
  const storageService = inject(StorageService);

  // Check if user has valid tokens
  const token = storageService.getAuthToken();
  const refreshToken = storageService.getRefreshToken();

  if (!token || !refreshToken) {
    router.navigate([RoutePath.LOGIN]);
    return false;
  }

  // If token is expired, try to refresh
  if (authState.isTokenExpired()) {
    return authState.refreshAuthToken().pipe(
      map((response) => {
        if (response.success) {
          // User data is already updated in refreshAuthToken
          const currentUser = authState.currentUser();
          return handleUserValidation(authState, router, currentUser);
        }
        return false;
      }),
      catchError(() => handleAuthError(authState, router))
    );
  }

  // Get current user data to check mustChangePassword
  return authState.getCurrentUser().pipe(
    map((response) => {
      if (response.success) {
        return handleUserValidation(authState, router, response.data);
      }
      return false;
    }),
    catchError((error) => handleAuthError(authState, router, error))
  );
};
