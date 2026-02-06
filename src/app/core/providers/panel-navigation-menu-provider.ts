import { InjectionToken, Provider } from '@angular/core';
import { RoutePath } from '@core/constants';
import { PermissionName } from '@core/models';
import { AuthService, LocalizedMenuService } from '@core/services';
import { MenuItem } from 'primeng/api';
import { Observable } from 'rxjs';

export const PANEL_NAVIGATION_MENU_TOKEN = new InjectionToken<Observable<MenuItem[]>>(
  'PANEL_NAVIGATION_MENU_TOKEN'
);

export const providePanelNavigationMenu = (): Provider => {
  return {
    provide: PANEL_NAVIGATION_MENU_TOKEN,
    useFactory: (localizedMenu: LocalizedMenuService, authService: AuthService) => {
      return localizedMenu.createMenu([
        {
          label: 'navigation.dashboard',
          items: [
            {
              label: 'navigation.home',
              icon: 'pi pi-home',
              routerLink: RoutePath.HOME,
            },
            {
              label: 'navigation.organization',
              icon: 'pi pi-building',
              visible: authService
                .currentUser()
                ?.hasAnyPermission([PermissionName.READ_ORGANIZATION, PermissionName.WRITE_ORGANIZATION]),
              routerLink: RoutePath.ORGANIZATION,
            },
            {
              label: 'navigation.users',
              icon: 'pi pi-users',
              visible: authService
                .currentUser()
                ?.hasAnyPermission([PermissionName.READ_USER, PermissionName.WRITE_USER]),
              routerLink: RoutePath.USERS,
            },
            {
              label: 'navigation.roles',
              icon: 'pi pi-circle',
              visible: authService
                .currentUser()
                ?.hasAnyPermission([PermissionName.READ_ROLE, PermissionName.WRITE_ROLE]),
              routerLink: RoutePath.ROLES,
            },
            {
              label: 'navigation.apiKeys',
              icon: 'pi pi-key',
              visible: authService
                .currentUser()
                ?.hasAnyPermission([PermissionName.READ_API_KEY, PermissionName.WRITE_API_KEY]),
              routerLink: RoutePath.API_KEYS,
            },
            {
              label: 'navigation.settings',
              icon: 'pi pi-cog',
              visible: authService
                .currentUser()
                ?.hasAnyPermission([
                  PermissionName.READ_ORGANIZATION_SETTINGS,
                  PermissionName.WRITE_ORGANIZATION_SETTINGS,
                ]),
              routerLink: RoutePath.SETTINGS,
            },
          ],
        },
      ]);
    },
    deps: [LocalizedMenuService, AuthService],
  };
};
