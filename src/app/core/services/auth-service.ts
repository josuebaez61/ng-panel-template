import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Observable,
  catchError,
  tap,
  finalize,
  timer,
  Subscription,
  switchMap,
} from 'rxjs';
import {
  AuthResponse as AuthData,
  LoginRequest,
  RegisterRequest,
  ChangePasswordRequest,
  PasswordResetRequest,
  ResetPasswordRequest,
  EmailChangeRequest,
  EmailVerificationRequest,
  CurrentUserResponse,
  AuthUser,
} from '../models/auth-models';
import { API_CONFIG } from '../config/api.config';
import { Router } from '@angular/router';
import { RoutePath } from '../constants/routes';
import { StorageService } from './storage-service';
import { ApiResponse } from '../models/api-response-models';
import { Toast } from './toast';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = API_CONFIG.BASE_URL;

  private router = inject(Router);
  private storageService = inject(StorageService);
  private toast = inject(Toast);

  // Signals for reactive state management
  private _currentUser = signal<AuthUser | null>(null);
  private _isAuthenticated = signal<boolean>(false);
  private _token = signal<string | null>(null);
  private _refreshToken = signal<string | null>(null);
  private _loggingIn = signal<boolean>(false);

  // Computed signals
  public currentUser = computed(() => this._currentUser());
  public isAuthenticated = computed(() => this._isAuthenticated());
  public token = computed(() => this._token());
  public refreshToken = computed(() => this._refreshToken());
  public loggingIn = computed(() => this._loggingIn());

  private http = inject(HttpClient);

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
    return this.http
      .post<ApiResponse<AuthData>>(`${this.baseUrl}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`, request)
      .pipe(
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
   * Register a new user
   */
  public register(request: RegisterRequest): Observable<ApiResponse<AuthData>> {
    return this.http
      .post<ApiResponse<AuthData>>(`${this.baseUrl}${API_CONFIG.ENDPOINTS.AUTH.REGISTER}`, request)
      .pipe(
        tap((response) => {
          if (response.success && response.data) {
            this.setAuthData(response.data);
          }
        }),
        catchError((error) => {
          console.error('Registration error:', error);
          throw error;
        })
      );
  }

  /**
   * Refresh authentication token
   */
  public refreshAuthToken(): Observable<ApiResponse<AuthData>> {
    return this.http
      .post<ApiResponse<AuthData>>(`${this.baseUrl}${API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN}`, {
        refreshToken: this.storageService.getRefreshToken() || '',
      })
      .pipe(
        tap((response) => {
          if (response.success && response.data) {
            this.setAuthData(response.data);
          }
        }),
        catchError((error) => {
          console.error('Token refresh error:', error);
          if (error.error && error.error.message) {
            this.toast.error(error.error.message);
          }
          this.logout();
          throw error;
        })
      );
  }

  /**
   * Get current user information
   */
  public getCurrentUser(): Observable<CurrentUserResponse> {
    return this.http
      .get<CurrentUserResponse>(`${this.baseUrl}${API_CONFIG.ENDPOINTS.AUTH.ME}`)
      .pipe(
        tap((response) => {
          if (response.success) {
            // Update user data with fresh data from API
            this._currentUser.set(new AuthUser(response.data));
          }
        }),
        catchError((error) => {
          console.error('Get current user error:', error);
          throw error;
        })
      );
  }

  /**
   * Change user password
   */
  public changePassword(request: ChangePasswordRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}${API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD}`, request);
  }

  /**
   * Request email change
   */
  public requestEmailChange(request: EmailChangeRequest): Observable<any> {
    return this.http.post(
      `${this.baseUrl}${API_CONFIG.ENDPOINTS.AUTH.REQUEST_EMAIL_CHANGE}`,
      request
    );
  }

  /**
   * Verify email change
   */
  public verifyEmailChange(request: EmailVerificationRequest): Observable<any> {
    return this.http.post(
      `${this.baseUrl}${API_CONFIG.ENDPOINTS.AUTH.VERIFY_EMAIL_CHANGE}`,
      request
    );
  }

  /**
   * Request password reset
   */
  public requestPasswordReset(request: PasswordResetRequest): Observable<any> {
    return this.http.post(
      `${this.baseUrl}${API_CONFIG.ENDPOINTS.AUTH.REQUEST_PASSWORD_RESET}`,
      request
    );
  }

  /**
   * Reset password with code
   */
  public resetPassword(request: ResetPasswordRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}${API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD}`, request);
  }

  /**
   * Logout user
   */
  public logout(): void {
    // Stop proactive token refresh
    this.stopProactiveTokenRefresh();

    this._currentUser.set(null);
    this._isAuthenticated.set(false);
    this._token.set(null);
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
    const token = this._token();
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
   * Check if token is close to expiring (within threshold seconds)
   * @param thresholdSeconds - Number of seconds before expiration to consider "close"
   * @returns true if token expires within threshold seconds
   */
  public isTokenCloseToExpiring(thresholdSeconds = 60): boolean {
    const token = this._token();
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

    const token = this._token();
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
    this._token.set(data.accessToken);
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
      this._token.set(token);
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

  /**
   * Hydrate user data from /api/v1/me endpoint
   */
  public hydrateUserData(): void {
    this.getCurrentUser().subscribe({
      next: (response) => {
        if (response.success) {
          this._currentUser.set(new AuthUser(response.data));
          console.log('User data hydrated from API');
        }
      },
      error: (error) => {
        console.error('Failed to hydrate user data:', error);
        this.logout();
      },
    });
  }
}
