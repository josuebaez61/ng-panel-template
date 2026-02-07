import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { TranslateModule } from '@ngx-translate/core';
import { Button, ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { NotificationsApi } from '@core/services';
import { Notification } from '@core/models';
import { catchError, of } from 'rxjs';
import { PaginatedResourceLoader } from '@core/services/pagination/paginated-resource-loader';
import { RoutePath } from '@core/constants';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-notifications',
  imports: [CommonModule, InfiniteScrollDirective, TranslateModule, ButtonModule, TooltipModule],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Notifications implements OnInit {
  private readonly notificationsApi = inject(NotificationsApi);
  private readonly router = inject(Router);
  private readonly translateService = inject(TranslateService);

  // Paginated resource loader for notifications
  public paginatedNotifications = new PaginatedResourceLoader<Notification>({
    page: 1,
    pageSize: 20,
    infiniteScroll: true,
    fetchData: (request) => {
      return this.notificationsApi.getNotificationsPaginated(request);
    },
  });

  // State
  public unreadCount = signal<number>(0);

  // Computed
  public hasNotifications = computed(() => this.paginatedNotifications.items().length > 0);
  public hasUnreadNotifications = computed(() => this.unreadCount() > 0);

  ngOnInit(): void {
    // Load unread count on init
    this.loadUnreadCount();

    // Load initial data
    this.paginatedNotifications.loadData(1);
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
