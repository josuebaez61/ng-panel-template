import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthState } from '../services/auth/auth-state';
import { RoutePath } from '../constants/routes';

// Functional guard using Angular 17+ syntax
export const guestGuard: CanActivateFn = () => {
  const authState = inject(AuthState);
  const router = inject(Router);

  // Check if user is authenticated
  if (!authState.isAuthenticated()) {
    return true; // Allow access to auth routes
  }

  // If authenticated, check user data
  const currentUser = authState.currentUser();
  if (!currentUser) {
    // If no user data, try to hydrate it
    authState.hydrateUserData();
    return true; // Allow access while hydrating
  }

  // If user must change password, redirect to must-change-password
  if (currentUser.mustChangePassword) {
    router.navigate([RoutePath.MUST_CHANGE_PASSWORD]);
    return false;
  }

  // If user is authenticated and doesn't need to change password, redirect to dashboard
  router.navigate([RoutePath.HOME]);
  return false;
};
