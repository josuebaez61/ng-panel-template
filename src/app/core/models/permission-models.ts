export enum PermissionName {
  // Role permissions
  READ_ROLE = 'readRole',
  WRITE_ROLE = 'writeRole',
  ASSIGN_ROLE = 'assignRole',
  ASSIGN_PERMISSION = 'assignPermission',

  // Permission permissions
  READ_PERMISSION = 'readPermission',

  // User permissions
  READ_USER = 'readUser',
  WRITE_USER = 'writeUser',

  // User Address permissions
  READ_USER_ADDRESS = 'readUserAddress',
  WRITE_USER_ADDRESS = 'writeUserAddress',

  // API Key permissions
  READ_API_KEY = 'readApiKey',
  WRITE_API_KEY = 'writeApiKey',

  // Organization permissions
  READ_ORGANIZATION = 'readOrganization',
  WRITE_ORGANIZATION = 'writeOrganization',

  // Organization Settings permissions
  READ_ORGANIZATION_SETTINGS = 'readOrganizationSettings',
  WRITE_ORGANIZATION_SETTINGS = 'writeOrganizationSettings',

  // Notification permissions
  READ_NOTIFICATION = 'readNotification',
  WRITE_NOTIFICATION = 'writeNotification',

  // Notification Template permissions
  READ_NOTIFICATION_TEMPLATE = 'readNotificationTemplate',
  WRITE_NOTIFICATION_TEMPLATE = 'writeNotificationTemplate',
}

export interface Permission {
  id: string;
  name: PermissionName;
  description: string;
  resource: string;
  createdAt: string;
  updatedAt: string;
}
export interface ResourcePermissions {
  resource: string;
  order: number;
  permissions: Permission[];
}

export enum ResourceName {
  ROLE = 'role',
  PERMISSION = 'permission',
  USER = 'user',
  API_KEY = 'apiKey',
  ORGANIZATION_SETTINGS = 'organizationSettings',
  NOTIFICATION = 'notification',
  NOTIFICATION_TEMPLATE = 'notificationTemplate',
}
