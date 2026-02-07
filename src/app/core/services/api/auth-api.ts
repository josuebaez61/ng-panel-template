import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../config/api.config';
import {
  AuthResponse as AuthData,
  LoginRequest,
  ChangePasswordRequest,
  PasswordResetRequest,
  ResetPasswordRequest,
  EmailChangeRequest,
  EmailVerificationRequest,
  CurrentUserResponse,
  ApiResponse
} from '../../models';
import { StorageService } from '../storage';

@Injectable({
  providedIn: 'root',
})
export class AuthApi {
  private baseUrl = API_CONFIG.BASE_URL;
  private http = inject(HttpClient);
  private storageService = inject(StorageService);

  /**
   * Login with email/username and password
   */
  public login(request: LoginRequest): Observable<ApiResponse<AuthData>> {
    return this.http.post<ApiResponse<AuthData>>(
      `${this.baseUrl}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`,
      request
    );
  }

  /**
   * Refresh authentication token
   * With httpOnly cookies, the refresh token is sent automatically via cookies
   * The body parameter is optional and used for backward compatibility
   */
  public refreshAuthToken(refreshToken?: string): Observable<ApiResponse<AuthData>> {
    // Send refresh token in body if provided (backward compatibility)
    // Otherwise, backend will read from httpOnly cookie
    const body = refreshToken ? { refreshToken } : {};
    return this.http.post<ApiResponse<AuthData>>(
      `${this.baseUrl}${API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN}`,
      body
    );
  }

  /**
   * Get current user information
   */
  public getCurrentUser(): Observable<CurrentUserResponse> {
    return this.http.get<CurrentUserResponse>(`${this.baseUrl}${API_CONFIG.ENDPOINTS.AUTH.ME}`);
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
   * Clears httpOnly cookies on the backend
   */
  public logout(): Observable<ApiResponse<undefined>> {
    return this.http.post<ApiResponse<undefined>>(
      `${this.baseUrl}${API_CONFIG.ENDPOINTS.AUTH.LOGOUT}`,
      {}
    );
  }
}
