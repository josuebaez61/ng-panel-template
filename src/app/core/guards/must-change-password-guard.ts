import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthState } from '../services/auth/auth-state';
import { RoutePath } from '../constants/routes';

// Guard for must-change-password route
export const mustChangePasswordGuard: CanActivateFn = () => {
  const authState = inject(AuthState);
  const router = inject(Router);

  // Check if user is authenticated
  if (!authState.isAuthenticated()) {
    router.navigate([RoutePath.LOGIN]);
    return false;
  }

  // Check if user data is available
  const currentUser = authState.currentUser();
  if (!currentUser) {
    // If no user data, try to hydrate it
    authState.hydrateUserData();
    return true; // Allow access while hydrating
  }

  // Check if user must change password
  if (!currentUser!.mustChangePassword) {
    // If user doesn't need to change password, redirect to dashboard
    router.navigate([RoutePath.HOME]);
    return false;
  }

  return true;
};
