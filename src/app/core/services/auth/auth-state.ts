import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, tap, finalize, timer, Subscription, switchMap } from 'rxjs';
import {
  AuthResponse as AuthData,
  LoginRequest,
  CurrentUserResponse,
  AuthUser,
  ApiResponse
} from '../../models';
import { RoutePath } from '../../constants/routes';
import { StorageService } from '../storage';
import { ToastService } from '../messages/toast-service';
import { AuthApi } from '../api/auth-api';

@Injectable({
  providedIn: 'root',
})
export class AuthState {
  private router = inject(Router);
  private storageService = inject(StorageService);
  private toast = inject(ToastService);
  private authApi = inject(AuthApi);

  // Signals for reactive state management
  private _currentUser = signal<AuthUser | null>(null);
  private _isAuthenticated = signal<boolean>(false);
  private _accessToken = signal<string | null>(null);
  private _refreshToken = signal<string | null>(null);
  private _loggingIn = signal<boolean>(false);

  // Computed signals
  public currentUser = this._currentUser.asReadonly();
  public isAuthenticated = this._isAuthenticated.asReadonly();
  public accessToken = this._accessToken.asReadonly();
  public refreshToken = this._refreshToken.asReadonly();
  public loggingIn = this._loggingIn.asReadonly();

  // Proactive token refresh subscription
  private refreshTokenSubscription?: Subscription;
  private readonly REFRESH_BUFFER_TIME = 60 * 1000; // 1 minute before expiration
  private readonly MIN_TOKEN_LIFETIME = 2 * 60 * 1000; // Minimum 2 minutes before scheduling refresh (tokens expire every 5 minutes)
  private isProactiveRefreshInProgress = false; // Flag to prevent multiple simultaneous proactive refreshes

  constructor() {
    // Initialize auth state from localStorage without making HTTP calls
    this.initializeAuthState();
  }

  /**
   * Login with email/username and password
   */
  public login(request: LoginRequest): Observable<ApiResponse<AuthData>> {
    this._loggingIn.set(true);
    return this.authApi.login(request).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.setAuthData(response.data);
          this.router.navigate([RoutePath.HOME]);
        }
      }),
      finalize(() => {
        this._loggingIn.set(false);
      })
    );
  }

  /**
   * Refresh authentication token
   */
  public refreshAuthToken(): Observable<ApiResponse<AuthData>> {
    const refreshToken = this.storageService.getRefreshToken() || '';
    return this.authApi.refreshAuthToken(refreshToken).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.setAuthData(response.data);
        }
      }),
      catchError((error) => {
        this.logout();
        throw error;
      })
    );
  }

  /**
   * Get current user information
   */
  public getCurrentUser(): Observable<CurrentUserResponse> {
    return this.authApi.getCurrentUser().pipe(
      tap((response) => {
        if (response.success) {
          // Update user data with fresh data from API
          this._currentUser.set(new AuthUser(response.data));
        }
      }),
      catchError((error) => {
        throw error;
      })
    );
  }

  /**
   * Logout user
   */
  public logout(): void {
    // Stop proactive token refresh
    this.stopProactiveTokenRefresh();

    this._currentUser.set(null);
    this._isAuthenticated.set(false);
    this._accessToken.set(null);
    this._refreshToken.set(null);

    // Clear only tokens from storage
    this.storageService.removeAuthToken();
    this.storageService.removeRefreshToken();

    this.router.navigate([RoutePath.LOGIN]);
  }

  /**
   * Check if token is expired
   */
  public isTokenExpired(): boolean {
    const token = this._accessToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }

  /**
   * Check if token is close to expiring (within threshold seconds)
   * @param thresholdSeconds - Number of seconds before expiration to consider "close"
   * @returns true if token expires within threshold seconds
   */
  public isTokenCloseToExpiring(thresholdSeconds = 60): boolean {
    const token = this._accessToken();
    if (!token) return true;

    try {
      const expirationTime = this.getTokenExpirationTime(token);
      if (!expirationTime) return true;

      const currentTime = Date.now();
      const timeUntilExpiration = expirationTime - currentTime;
      const thresholdMs = thresholdSeconds * 1000;

      return timeUntilExpiration <= thresholdMs;
    } catch {
      return true;
    }
  }

  /**
   * Hydrate user data from /api/v1/me endpoint
   */
  public hydrateUserData(): void {
    this.getCurrentUser().subscribe({
      next: (response) => {
        if (response.success) {
          this._currentUser.set(new AuthUser(response.data));
        }
      },
      error: () => {
        this.logout();
      },
    });
  }

  /**
   * Get token expiration time in milliseconds
   */
  private getTokenExpirationTime(token: string): number | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload.exp) return null;
      // exp is in seconds, convert to milliseconds
      return payload.exp * 1000;
    } catch {
      return null;
    }
  }

  /**
   * Start proactive token refresh
   * Schedules a token refresh before the token expires using RxJS timer
   */
  private startProactiveTokenRefresh(): void {
    // Clear any existing subscription
    this.stopProactiveTokenRefresh();

    // Prevent multiple simultaneous proactive refreshes
    if (this.isProactiveRefreshInProgress) {
      return;
    }

    const token = this._accessToken();
    if (!token) return;

    const expirationTime = this.getTokenExpirationTime(token);
    if (!expirationTime) return;

    const currentTime = Date.now();
    const timeUntilExpiration = expirationTime - currentTime;

    // Don't schedule refresh if token has less than MIN_TOKEN_LIFETIME remaining
    // This prevents immediate refreshes after login with a fresh token
    if (timeUntilExpiration < this.MIN_TOKEN_LIFETIME) {
      // Token expires very soon, but don't refresh proactively
      // Let the interceptor handle it reactively if needed
      return;
    }

    // Calculate timeout: refresh REFRESH_BUFFER_TIME before expiration
    const refreshTime = timeUntilExpiration - this.REFRESH_BUFFER_TIME;

    // Only schedule refresh if there's enough time before expiration
    if (refreshTime > 0) {
      // Set flag to prevent multiple simultaneous refreshes
      this.isProactiveRefreshInProgress = true;

      // Use RxJS timer to schedule the refresh
      this.refreshTokenSubscription = timer(refreshTime)
        .pipe(
          switchMap(() => {
            console.log('Proactive token refresh triggered');
            return this.refreshAuthToken();
          })
        )
        .subscribe({
          next: () => {
            console.log('Token refreshed proactively');
            this.isProactiveRefreshInProgress = false;
          },
          error: (error) => {
            console.error('Proactive token refresh failed:', error);
            this.isProactiveRefreshInProgress = false;
            // Error handling is already done in refreshAuthToken
          },
        });
    }
  }

  /**
   * Stop proactive token refresh
   */
  private stopProactiveTokenRefresh(): void {
    if (this.refreshTokenSubscription) {
      this.refreshTokenSubscription.unsubscribe();
      this.refreshTokenSubscription = undefined;
    }
    this.isProactiveRefreshInProgress = false;
  }

  /**
   * Set authentication data after successful login/register
   */
  private setAuthData(data: AuthData): void {
    // Set user data from login response
    this._currentUser.set(new AuthUser(data.user));
    this._isAuthenticated.set(true);
    this._accessToken.set(data.accessToken);
    this._refreshToken.set(data.refreshToken);

    // Store only tokens in storage
    this.storageService.setAuthToken(data.accessToken);
    this.storageService.setRefreshToken(data.refreshToken);

    // Start proactive token refresh
    this.startProactiveTokenRefresh();
  }

  /**
   * Initialize auth state from storage without making HTTP calls
   */
  private initializeAuthState(): void {
    const token = this.storageService.getAuthToken();
    const refreshToken = this.storageService.getRefreshToken();

    if (token && refreshToken) {
      // Set tokens and auth state
      this._accessToken.set(token);
      this._refreshToken.set(refreshToken);
      this._isAuthenticated.set(true);

      // Start proactive token refresh if token is not expired
      // Only schedule if token has enough lifetime remaining
      if (!this.isTokenExpired()) {
        const expirationTime = this.getTokenExpirationTime(token);
        if (expirationTime) {
          const timeUntilExpiration = expirationTime - Date.now();
          // Only start proactive refresh if token has at least MIN_TOKEN_LIFETIME remaining
          if (timeUntilExpiration >= this.MIN_TOKEN_LIFETIME) {
            this.startProactiveTokenRefresh();
          }
          // If token expires soon but is not expired, let interceptor handle it reactively
        }
      }
      // If token is expired, don't refresh here - let the interceptor or guard handle it
      // This prevents multiple refresh attempts on initialization
    }
  }
}
