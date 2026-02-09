import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Button } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';
import { NotificationsApi, NotificationWebSocketService } from '@core/services';
import { NotificationChannel } from '@core/models';
import { catchError, of } from 'rxjs';
import { TooltipModule } from 'primeng/tooltip';
import { RoutePath } from '@core/constants';
import { BadgeModule } from 'primeng/badge';
import { OverlayBadgeModule } from 'primeng/overlaybadge';

@Component({
  selector: 'app-user-notifications-button',
  imports: [Button, CommonModule, TranslateModule, TooltipModule, BadgeModule, OverlayBadgeModule],
  templateUrl: './user-notifications-button.html',
  styles: `
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
export class UserNotificationsButton implements OnInit, OnDestroy {
  private readonly notificationsApi = inject(NotificationsApi);
  private readonly router = inject(Router);
  private readonly websocketService = inject(NotificationWebSocketService);

  // WebSocket unsubscribe function
  private unsubscribeUnreadCount?: () => void;

  // State
  public unreadCount = signal<number>(0);

  // Computed
  public hasUnreadNotifications = computed(() => this.unreadCount() > 0);

  public ngOnInit(): void {
    // Load unread count on init
    this.loadUnreadCount();

    // Subscribe to WebSocket events for real-time updates
    this.setupWebSocketListeners();
  }

  public ngOnDestroy(): void {
    // Clean up WebSocket subscription
    this.unsubscribeUnreadCount?.();
  }

  /**
   * Setup WebSocket listeners for real-time unread count updates
   */
  private setupWebSocketListeners(): void {
    // Listen for unread count updates
    this.unsubscribeUnreadCount = this.websocketService.onUnreadCount(
      (count: number) => {
        this.unreadCount.set(count);
      }
    );
  }

  /**
   * Navigate to notifications page
   */
  public navigateToNotifications(): void {
    this.router.navigate([RoutePath.NOTIFICATIONS]);
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
}
