import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  computed,
  OnInit,
  OnDestroy,
} from '@angular/core';

import { Router } from '@angular/router';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { NotificationsApi, NotificationWebSocketService } from '@core/services';
import { Notification, NotificationChannel } from '@core/models';
import { catchError, of, Subscription } from 'rxjs';
import { PaginatedResourceLoader } from '@core/services/pagination/paginated-resource-loader';
import { TranslateService } from '@ngx-translate/core';
import { PanelPageWrapper } from '@shared/components/layout/panel-page-wrapper/panel-page-wrapper';

@Component({
  selector: 'app-notifications',
  imports: [
    InfiniteScrollDirective,
    TranslateModule,
    ButtonModule,
    TooltipModule,
    PanelPageWrapper
],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Notifications implements OnInit, OnDestroy {
  private readonly notificationsApi = inject(NotificationsApi);
  private readonly router = inject(Router);
  private readonly translateService = inject(TranslateService);
  private readonly websocketService = inject(NotificationWebSocketService);

  // WebSocket unsubscribe functions
  private unsubscribeNotification?: () => void;
  private unsubscribeUnreadCount?: () => void;

  // Language change subscription
  private langChangeSubscription?: Subscription;

  // Paginated resource loader for notifications
  public paginatedNotifications = new PaginatedResourceLoader<Notification>({
    page: 1,
    pageSize: 20,
    infiniteScroll: true,
    fetchData: (request) => {
      // Always filter by in_app channel
      const requestWithChannelFilter = {
        ...request,
        filters: {
          ...request.filters,
          channel: NotificationChannel.IN_APP,
        },
      };
      return this.notificationsApi.getNotificationsPaginated(requestWithChannelFilter);
    },
  });

  // State
  public unreadCount = signal<number>(0);

  // Computed
  public hasNotifications = computed(() => this.paginatedNotifications.items().length > 0);
  public hasUnreadNotifications = computed(() => this.unreadCount() > 0);

  public ngOnInit(): void {
    // Load unread count on init
    this.loadUnreadCount();

    // Load initial data
    this.paginatedNotifications.loadData(1);

    // Subscribe to WebSocket events for real-time updates
    this.setupWebSocketListeners();

    // Subscribe to language changes to reload notifications
    this.setupLanguageChangeListener();
  }

  public ngOnDestroy(): void {
    // Clean up WebSocket subscriptions
    this.unsubscribeNotification?.();
    this.unsubscribeUnreadCount?.();

    // Clean up language change subscription
    this.langChangeSubscription?.unsubscribe();
  }

  /**
   * Setup WebSocket listeners for real-time notification updates
   */
  private setupWebSocketListeners(): void {
    // Listen for new notifications
    this.unsubscribeNotification = this.websocketService.onNotification(
      (notification: Notification) => {
        // Only process in-app notifications
        if (notification.channel !== NotificationChannel.IN_APP) {
          return;
        }

        // Add new notification to the beginning of the list
        // Refresh from page 1 to ensure consistency and get the latest data
        this.paginatedNotifications.loadData(1);
      }
    );

    // Listen for unread count updates
    this.unsubscribeUnreadCount = this.websocketService.onUnreadCount(
      (count: number) => {
        this.unreadCount.set(count);
      }
    );
  }

  /**
   * Setup language change listener to reload notifications when language changes
   */
  private setupLanguageChangeListener(): void {
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(() => {
      // Reload notifications from page 1 when language changes
      // This ensures notifications are fetched with the new language header
      this.paginatedNotifications.loadData(1);
    });
  }

  /**
   * Load unread notifications count
   * Only counts in-app notifications
   */
  private loadUnreadCount(): void {
    this.notificationsApi
      .getUnreadCount(NotificationChannel.IN_APP)
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
      return this.translateService.instant('notifications.justNow');
    } else if (diffMins < 60) {
      return `${diffMins}min`;
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
      this.router.navigate([notification.actionUrl]);
    }
  }
}
