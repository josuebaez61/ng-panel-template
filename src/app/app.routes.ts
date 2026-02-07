import { Routes } from '@angular/router';
import { RouteName, RoutePath } from '@core/constants';
import { authGuard, hasAnyPermissionGuard, unsavedChangesGuard } from '@core/guards';
import { PermissionName } from '@core/models';

export const routes: Routes = [
  // Redirect root to dashboard
  {
    path: '',
    redirectTo: RoutePath.HOME,
    pathMatch: 'full',
  },
  // Auth routes (guest only)
  {
    path: RouteName.AUTH,
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.routes),
  },
  // Main application routes (protected)
  {
    path: RouteName.PANEL,
    canActivate: [authGuard],
    loadComponent: () => import('./shared/layouts/panel/panel').then((m) => m.Panel),
    children: [
      {
        path: RouteName.HOME,
        loadComponent: () => import('./features/home/home').then((m) => m.Home),
        title: 'Dashboard - Admin Panel',
        children: [],
      },
      {
        path: RouteName.USERS,
        canActivate: [hasAnyPermissionGuard([PermissionName.READ_USER])],
        loadChildren: () => import('./features/users/users.routes').then((m) => m.routes),
      },
      {
        path: RouteName.ROLES,
        canActivate: [
          hasAnyPermissionGuard([PermissionName.READ_ROLE, PermissionName.ASSIGN_ROLE]),
        ],
        loadChildren: () => import('./features/roles/roles.routes').then((m) => m.routes),
        title: 'Roles - Admin Panel',
      },
      {
        path: RouteName.API_KEYS,
        canActivate: [hasAnyPermissionGuard([PermissionName.READ_API_KEY])],
        loadChildren: () => import('./features/api-keys/api-keys.routes').then((m) => m.routes),
        title: 'API Keys - Admin Panel',
      },
      {
        path: RouteName.ORGANIZATION,
        canDeactivate: [unsavedChangesGuard],
        loadComponent: () => import('./features/organization/organization').then((m) => m.Organization),
        title: 'Organization - Admin Panel',
      },
      {
        path: RouteName.SETTINGS,
        loadComponent: () => import('./features/settings/settings').then((m) => m.Settings),
        title: 'Settings - Admin Panel',
      },
      {
        path: RouteName.ACCOUNT,
        canDeactivate: [unsavedChangesGuard],
        loadComponent: () => import('./features/account/account').then((m) => m.Account),
        title: 'Account - Admin Panel',
      },
    ],
  },

  // 404 - Page not found
  {
    path: '**',
    loadComponent: () =>
      import('./shared/components/utilities/not-found/not-found').then((m) => m.NotFound),
    title: 'Page Not Found - Admin Panel',
  },
];
