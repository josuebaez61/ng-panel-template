import { environment } from '../../../environments/environment';

export const API_CONFIG = {
  BASE_URL: environment.apiUrl,
  ENDPOINTS: {
    CURRENCIES: {
      ALL: '/currencies',
      GET_BY_ID: (id: string): string => `/currencies/${id}`,
    },
    ORGANIZATIONS: {
      GET_BY_ID: (id: string): string => `/organizations/${id}`,
      UPDATE: (id: string): string => `/organizations/${id}`,
      GET_SETTINGS: (id: string): string => `/organizations/${id}/settings`,
      UPDATE_SETTINGS: (id: string): string => `/organizations/${id}/settings`,
      UPLOAD_LOGO: (id: string): string => `/organizations/${id}/logo`,
    },
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      REFRESH_TOKEN: '/auth/refresh-token',
      CHANGE_PASSWORD: '/auth/change-password',
      ME: '/auth/me',
      REQUEST_EMAIL_CHANGE: '/auth/request-email-change',
      VERIFY_EMAIL_CHANGE: '/auth/verify-email-change',
      REQUEST_PASSWORD_RESET: '/auth/request-password-reset',
      RESET_PASSWORD: '/auth/reset-password',
    },
    USERS: {
      UPDATE_CURRENT_USER_DATA: '/users/me',
      REGENERATE_TEMPORARY_PASSWORD: (userId: string): string =>
        `/users/${userId}/regenerate-temporary-password`,
      GET_CURRENT_USER_ADDRESSES: '/users/addresses',
      CREATE_CURRENT_USER_ADDRESS: '/users/addresses',
      DELETE_CURRENT_USER_ADDRESS: (id: string): string => `/users/addresses/${id}`,
      UPDATE_CURRENT_USER_ADDRESS: (id: string): string => `/users/addresses/${id}`,
      LIST_ADDRESSES_BY_USER_ID: (userId: string): string => `/users/addresses/${userId}`,
      UPDATE_USER_PERSON: (id: string): string => `/users/${id}/person`,
      UPDATE_CURRENT_USER_PERSON: '/users/me/person',
      FIND_ALL_IDENTIFICATION_TYPES: '/users/identification-types',
      LIST: '/users',
      PAGINATED: '/users/paginated',
      CREATE: '/users',
      UPDATE: (id: string): string => `/users/${id}`,
      DELETE: '/users',
      GET_BY_ID: '/users/id',
      ACTIVATE: (id: string): string => `/users/${id}/activate`,
      DEACTIVATE: (id: string): string => `/users/${id}/deactivate`,
      GET_ROLES_BY_USER_ID(id: string): string {
        return `/users/id/${id}/roles`;
      },
      UPDATE_ROLES_BY_USER_ID(id: string): string {
        return `/users/${id}/roles`;
      },
      ASSIGN_ROLE_BY_USER_ID: (id: string): string => {
        return `/users/id/${id}/roles`;
      },
    },
    PERMISSIONS: {
      BY_RESOURCE: '/permissions/grouped-by-resource',
    },
    ROLES: {
      ALL: '/roles',
      PAGINATED: '/roles/paginated',
      CREATE: '/roles',
      UPDATE: (id: string): string => `/roles/${id}`,
      ROLE_PERMISSION: (id: string): string => `/roles/${id}/permissions`,
      ASSIGN_USERS: (id: string): string => `/roles/${id}/users/assign-multiple`,
      ASSIGN_USER: (id: string): string => `/roles/${id}/users`,
      UNASSIGN_USER: (id: string): string => `/roles/${id}/users`,
      DELETE: (id: string): string => `/roles/${id}`,
      GET_BY_ID: (id: string): string => `/roles/${id}`,
      USER_COUNT: '/roles/stats/user-count',
      OPTIONS: '/roles/options',
      UNASSIGNED_ROLES_BY_USER_ID: (userId: string): string => `/roles/users/${userId}/unassigned`,
      UNASSIGNED_USERS: (roleId: string): string => `/roles/${roleId}/users/unassigned`,
    },
    GEOGRAPHY: {
      PHONE_CODES: '/geography/phone-codes',
      COUNTRIES: '/geography/countries',
      LOCALITIES_BY_STATE_ID: (stateId: string): string =>
        `/geography/states/${stateId}/localities`,
      STATES: (countryId: string): string => `/geography/countries/${countryId}/states`,
      COUNTIES: (stateId: string): string => `/geography/states/${stateId}/counties`,
    },
    API_KEYS: {
      ALL: '/api-keys',
      CREATE: '/api-keys',
      GET_BY_ID: (id: string): string => `/api-keys/${id}`,
      UPDATE: (id: string): string => `/api-keys/${id}`,
      DELETE: (id: string): string => `/api-keys/${id}`,
      TOGGLE: (id: string): string => `/api-keys/${id}/toggle`,
      PERMISSIONS_GROUPED_BY_RESOURCE: '/api-keys/permissions/grouped-by-resource',
    },
    NOTIFICATIONS: {
      ALL: '/notifications',
      PAGINATED: '/notifications/paginated',
      GET_BY_ID: (id: string): string => `/notifications/${id}`,
      MARK_AS_READ: (id: string): string => `/notifications/${id}/read`,
      MARK_AS_UNREAD: (id: string): string => `/notifications/${id}/unread`,
      MARK_ALL_READ: '/notifications/mark-all-read',
      UNREAD_COUNT: '/notifications/unread/count',
    },
  },
} as const;
