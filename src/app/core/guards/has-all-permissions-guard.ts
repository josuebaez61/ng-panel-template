import { inject } from '@angular/core';
import { PermissionName } from '../models/permission-models';
import { AuthState } from '../services/auth/auth-state';
import { CanActivateFn, Router } from '@angular/router';
import { RoutePath } from '../constants';

export const hasAllPermissionsGuard: (permissions: PermissionName[]) => CanActivateFn =
  (permissions: PermissionName[]) => () => {
    const authState = inject(AuthState);
    const router = inject(Router);
    const user = authState.currentUser();

    if (!user) {
      return router.createUrlTree([RoutePath.LOGIN]);
    }

    if (!user?.hasAllPermissions(permissions)) {
      return router.createUrlTree([RoutePath.HOME]);
    }

    return true;
  };
