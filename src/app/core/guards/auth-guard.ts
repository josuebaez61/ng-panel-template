import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthState } from '../services/auth/auth-state';
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

  // With httpOnly cookies, we can't read tokens from JavaScript
  // Instead, we verify authentication by attempting to get current user
  // The request will automatically include httpOnly cookies via credentialsInterceptor
  // If cookies are valid, the request succeeds; if not, it fails with 401
  
  // Get current user data - this will use httpOnly cookies automatically
  // If user is authenticated, this succeeds; if not, it fails
  return authState.getCurrentUser().pipe(
    map((response) => {
      if (response.success) {
        return handleUserValidation(authState, router, response.data);
      }
      return false;
    }),
    catchError((error) => {
      // If 401/403, user is not authenticated
      // If other error, still redirect to login for safety
      return handleAuthError(authState, router, error);
    })
  );
};
