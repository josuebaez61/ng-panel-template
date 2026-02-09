import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import {} from '../../models/notification-models';
import { API_CONFIG } from '../../config/api.config';
import {
  ApiResponse,
  ApiPaginationResponse,
  Notification,
  UnreadNotificationsCount,
  PaginationRequest,
  NotificationChannel,
} from '../../models';

export interface GetNotificationsOptions {
  isRead?: boolean;
  channel?: NotificationChannel;
  type?: string;
  limit?: number;
  offset?: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationsApi {
  private readonly baseUrl = API_CONFIG.BASE_URL;
  private readonly http = inject(HttpClient);

  /**
   * Get all notifications for the current user with optional filters and pagination
   */
  public getNotifications(options?: GetNotificationsOptions): Observable<Notification[]> {
    let params = new HttpParams();

    if (options?.isRead !== undefined) {
      params = params.set('isRead', options.isRead.toString());
    }
    if (options?.channel) {
      params = params.set('channel', options.channel);
    }
    if (options?.type) {
      params = params.set('type', options.type);
    }
    if (options?.limit !== undefined) {
      params = params.set('limit', options.limit.toString());
    }
    if (options?.offset !== undefined) {
      params = params.set('offset', options.offset.toString());
    }

    return this.http
      .get<ApiResponse<Notification[]>>(
        `${this.baseUrl}${API_CONFIG.ENDPOINTS.NOTIFICATIONS.ALL}`,
        {
          params,
        }
      )
      .pipe(map((response) => response.data || []));
  }

  /**
   * Get paginated notifications for the current user
   */
  public getNotificationsPaginated(
    request: PaginationRequest
  ): Observable<ApiPaginationResponse<Notification>> {
    let params = new HttpParams()
      .set('page', request.page.toString())
      .set('pageSize', request.pageSize.toString());

    if (request.sortBy) {
      params = params.set('sortBy', request.sortBy);
    }
    if (request.sortDirection) {
      params = params.set('sortDirection', request.sortDirection.toUpperCase());
    }
    if (request.globalSearch) {
      params = params.set('globalSearch', request.globalSearch);
    }

    // Apply filters from request.filters
    if (request.filters) {
      if (request.filters['isRead'] !== undefined && request.filters['isRead'] !== null) {
        params = params.set('isRead', request.filters['isRead'].toString());
      }
      if (request.filters['channel']) {
        params = params.set('channel', request.filters['channel'].toString());
      }
      if (request.filters['type']) {
        params = params.set('type', request.filters['type'].toString());
      }
    }

    return this.http.get<ApiPaginationResponse<Notification>>(
      `${this.baseUrl}${API_CONFIG.ENDPOINTS.NOTIFICATIONS.PAGINATED}`,
      { params }
    );
  }

  /**
   * Get notification by ID
   */
  public getNotificationById(id: string): Observable<Notification> {
    return this.http
      .get<ApiResponse<Notification>>(
        `${this.baseUrl}${API_CONFIG.ENDPOINTS.NOTIFICATIONS.GET_BY_ID(id)}`
      )
      .pipe(map((response) => response.data!));
  }

  /**
   * Get unread notifications count
   * @param channel Optional channel filter. Defaults to IN_APP
   */
  public getUnreadCount(channel?: NotificationChannel): Observable<number> {
    let params = new HttpParams();
    if (channel) {
      params = params.set('channel', channel);
    }

    return this.http
      .get<ApiResponse<UnreadNotificationsCount>>(
        `${this.baseUrl}${API_CONFIG.ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT}`,
        { params }
      )
      .pipe(map((response) => response.data?.count || 0));
  }

  /**
   * Mark notification as read
   */
  public markAsRead(id: string): Observable<void> {
    return this.http
      .patch<ApiResponse<void>>(
        `${this.baseUrl}${API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_AS_READ(id)}`,
        {}
      )
      .pipe(map(() => undefined));
  }

  /**
   * Mark notification as unread
   */
  public markAsUnread(id: string): Observable<void> {
    return this.http
      .patch<ApiResponse<void>>(
        `${this.baseUrl}${API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_AS_UNREAD(id)}`,
        {}
      )
      .pipe(map(() => undefined));
  }

  /**
   * Mark all notifications as read
   */
  public markAllAsRead(): Observable<void> {
    return this.http
      .post<ApiResponse<void>>(
        `${this.baseUrl}${API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ}`,
        {}
      )
      .pipe(map(() => undefined));
  }
}
