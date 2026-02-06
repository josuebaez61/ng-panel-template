/**
 * Route names enumeration for the application
 * These represent the logical names of routes, not the actual paths
 */
export const RouteName = {
  // Root
  ROOT: 'root',

  // Auth routes
  AUTH: 'auth',
  LOGIN: 'login',
  FORGOT_PASSWORD: 'forgot-password',
  MUST_CHANGE_PASSWORD: 'must-change-password',
  RESET_PASSWORD: 'reset-password',

  // Main panel routes
  PANEL: 'panel',
  HOME: 'home',
  USERS: 'users',
  USERS_CREATE: 'create',
  USERS_VIEW: (id: string) => `view/${id}`,
  USERS_EDIT: (id: string) => `edit/${id}`,
  USERS_EDIT_ROLES: (id: string) => `edit-roles/${id}`,
  ROLES: 'roles',
  ROLES_PERMISSIONS: (id: string) => `permissions/${id}`,
  ROLES_USERS: (id: string) => `users/${id}`,
  API_KEYS: 'api-keys',
  API_KEYS_PERMISSIONS: (id: string) => `permissions/${id}`,
  ORGANIZATION: 'organization',
  // Error routes
  NOT_FOUND: 'not-found',
  ACCOUNT: 'account',
  SETTINGS: 'settings',
};

/**
 * Route paths enumeration
 * These represent the actual URL paths used in the application
 * Built from RouteName values to ensure consistency
 */
export const RoutePath = {
  // Root
  ROOT: '/',

  // Auth routes
  AUTH: `/${RouteName.AUTH}`,
  LOGIN: `/${RouteName.AUTH}/${RouteName.LOGIN}`,
  FORGOT_PASSWORD: `/${RouteName.AUTH}/${RouteName.FORGOT_PASSWORD}`,
  MUST_CHANGE_PASSWORD: `/${RouteName.AUTH}/${RouteName.MUST_CHANGE_PASSWORD}`,
  RESET_PASSWORD: `/${RouteName.AUTH}/${RouteName.RESET_PASSWORD}`,

  // Main panel routes
  PANEL: `/${RouteName.PANEL}`,
  HOME: `/${RouteName.PANEL}/${RouteName.HOME}`,
  USERS: `/${RouteName.PANEL}/${RouteName.USERS}`,
  USERS_CREATE: `/${RouteName.PANEL}/${RouteName.USERS}/${RouteName.USERS_CREATE}`,
  USERS_VIEW: (id: string) => `/${RouteName.PANEL}/${RouteName.USERS}/${RouteName.USERS_VIEW(id)}`,
  USERS_EDIT: (id: string) => `/${RouteName.PANEL}/${RouteName.USERS}/${RouteName.USERS_EDIT(id)}`,
  USERS_EDIT_ROLES: (id: string) =>
    `/${RouteName.PANEL}/${RouteName.USERS}/${RouteName.USERS_EDIT_ROLES(id)}`,
  ROLES: `/${RouteName.PANEL}/${RouteName.ROLES}`,
  ROLES_PERMISSIONS: (id: string) =>
    `/${RouteName.PANEL}/${RouteName.ROLES}/${RouteName.ROLES_PERMISSIONS(id)}`,
  ROLES_USERS: (id: string) =>
    `/${RouteName.PANEL}/${RouteName.ROLES}/${RouteName.ROLES_USERS(id)}`,
  API_KEYS: `/${RouteName.PANEL}/${RouteName.API_KEYS}`,
  API_KEYS_PERMISSIONS: (id: string) =>
    `/${RouteName.PANEL}/${RouteName.API_KEYS}/${RouteName.API_KEYS_PERMISSIONS(id)}`,
  ORGANIZATION: `/${RouteName.PANEL}/${RouteName.ORGANIZATION}`,
  SETTINGS: `/${RouteName.PANEL}/${RouteName.SETTINGS}`,
  // Error routes
  NOT_FOUND: `/${RouteName.NOT_FOUND}`,
  ACCOUNT: `/${RouteName.PANEL}/${RouteName.ACCOUNT}`,
};
