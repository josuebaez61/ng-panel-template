import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  ViewChild,
  computed,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Button } from 'primeng/button';
import { Popover, PopoverModule } from 'primeng/popover';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { TranslateModule } from '@ngx-translate/core';
import { NotificationsApi } from '@core/services';
import { Notification } from '@core/models';
import { catchError, of } from 'rxjs';
import { TooltipModule } from 'primeng/tooltip';
import { PaginatedResourceLoader } from '@core/services/pagination/paginated-resource-loader';

@Component({
  selector: 'app-user-notifications-button',
  imports: [
    Button,
    PopoverModule,
    CommonModule,
    InfiniteScrollDirective,
    TranslateModule,
    TooltipModule,
  ],
  templateUrl: './user-notifications-button.html',
  styles: `
    .notifications-popover {
      min-width: 400px;
      max-width: 500px;
      max-height: 600px;
    }
    .notifications-list {
      max-height: 500px;
      overflow-y: auto;
    }
    .notification-item {
      padding: 0.75rem;
      border-bottom: 1px solid var(--p-surface-border);
      cursor: pointer;
      transition: background-color 0.2s;
    }
    .notification-item:hover {
      background-color: var(--p-surface-hover);
    }
    .notification-item.unread {
      background-color: var(--p-highlight-bg);
    }
    .notification-item.unread:hover {
      background-color: var(--p-highlight-bg-hover);
    }
    .notification-title {
      font-weight: 600;
      margin-bottom: 0.25rem;
    }
    .notification-message {
      color: var(--p-text-color-secondary);
      font-size: 0.875rem;
    }
    .notification-time {
      color: var(--p-text-color-secondary);
      font-size: 0.75rem;
      margin-top: 0.25rem;
    }
    .badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background-color: var(--p-danger-color);
      color: white;
      border-radius: 50%;
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
      font-weight: 600;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserNotificationsButton {
  @ViewChild('popover') public popover!: Popover;

  private readonly notificationsApi = inject(NotificationsApi);

  // Paginated resource loader
  public paginatedNotifications = new PaginatedResourceLoader<Notification>({
    page: 1,
    pageSize: 20,
    infiniteScroll: true,
    fetchData: (request) => this.notificationsApi.getNotificationsPaginated(request),
  });

  // State
  public unreadCount = signal<number>(0);
  public popoverVisible = signal<boolean>(false);

  // Computed
  public hasUnreadNotifications = computed(() => this.unreadCount() > 0);
  public hasNotifications = computed(() => this.paginatedNotifications.items().length > 0);

  constructor() {
    // Load unread count on init
    this.loadUnreadCount();

    // Reload unread count when notifications change
    effect(() => {
      const notifs = this.paginatedNotifications.items();
      if (notifs.length > 0) {
        // Recalculate unread count based on current notifications
        const unread = notifs.filter((n) => !n.isRead).length;
        // Only update if we have all notifications loaded or if count decreased
        if (!this.paginatedNotifications.hasNextPage() || unread < this.unreadCount()) {
          this.unreadCount.set(unread);
        }
      }
    });
  }

  /**
   * Toggle popover visibility
   */
  public togglePopover(event: Event): void {
    if (this.popoverVisible()) {
      this.popover.hide();
    } else {
      this.popover.show(event);
    }
  }

  /**
   * Handle popover show event
   */
  public onPopoverShow(): void {
    this.popoverVisible.set(true);
    // Load data when opening popover if not already loaded
    if (this.paginatedNotifications.items().length === 0) {
      this.paginatedNotifications.loadData(1);
    }
  }

  /**
   * Handle popover hide event
   */
  public onPopoverHide(): void {
    this.popoverVisible.set(false);
  }

  /**
   * Load unread notifications count
   */
  private loadUnreadCount(): void {
    this.notificationsApi
      .getUnreadCount()
      .pipe(
        catchError(() => {
          return of(0);
        })
      )
      .subscribe((count) => {
        this.unreadCount.set(count);
      });
  }

  /**
   * Handle infinite scroll
   */
  public onScroll(): void {
    if (this.paginatedNotifications.hasNextPage() && !this.paginatedNotifications.loading()) {
      this.paginatedNotifications.loadNextPage();
    }
  }

  /**
   * Mark notification as read
   */
  public markAsRead(notification: Notification, event: Event): void {
    event.stopPropagation();

    if (notification.isRead) {
      return;
    }

    this.notificationsApi.markAsRead(notification.id).subscribe({
      next: () => {
        // Refresh the list to get updated notifications
        this.paginatedNotifications.refresh();

        // Update unread count
        const currentCount = this.unreadCount();
        if (currentCount > 0) {
          this.unreadCount.set(currentCount - 1);
        }
      },
      error: () => {
        // Error handling is done by the API interceptor
      },
    });
  }

  /**
   * Mark all notifications as read
   */
  public markAllAsRead(): void {
    this.notificationsApi.markAllAsRead().subscribe({
      next: () => {
        // Refresh the list to get updated notifications
        this.paginatedNotifications.refresh();
        this.unreadCount.set(0);
      },
      error: () => {
        // Error handling is done by the API interceptor
      },
    });
  }

  /**
   * Format date for display
   */
  public formatDate(date: Date | string): string {
    const notificationDate = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - notificationDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins}m`;
    } else if (diffHours < 24) {
      return `${diffHours}h`;
    } else if (diffDays < 7) {
      return `${diffDays}d`;
    } else {
      return notificationDate.toLocaleDateString();
    }
  }

  /**
   * Handle notification click
   */
  public onNotificationClick(notification: Notification): void {
    if (!notification.isRead) {
      this.markAsRead(notification, new Event('click'));
    }

    // Navigate to action URL if available
    if (notification.actionUrl) {
      // You might want to inject Router and navigate here
      // this.router.navigate([notification.actionUrl]);
    }
  }
}
