import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Button } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';
import { NotificationsApi } from '@core/services';
import { catchError, of } from 'rxjs';
import { TooltipModule } from 'primeng/tooltip';
import { RoutePath } from '@core/constants';

@Component({
  selector: 'app-user-notifications-button',
  imports: [Button, CommonModule, TranslateModule, TooltipModule],
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
export class UserNotificationsButton {
  private readonly notificationsApi = inject(NotificationsApi);
  private readonly router = inject(Router);

  // State
  public unreadCount = signal<number>(0);

  // Computed
  public hasUnreadNotifications = computed(() => this.unreadCount() > 0);

  constructor() {
    // Load unread count on init
    this.loadUnreadCount();
  }

  /**
   * Navigate to notifications page
   */
  public navigateToNotifications(): void {
    this.router.navigate([RoutePath.NOTIFICATIONS]);
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
}
