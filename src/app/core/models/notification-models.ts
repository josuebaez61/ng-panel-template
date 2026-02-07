export enum NotificationChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  channel: NotificationChannel;
  isRead: boolean;
  readAt?: Date | null;
  templateId?: string | null;
  priority: NotificationPriority;
  actionUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UnreadNotificationsCount {
  count: number;
}
