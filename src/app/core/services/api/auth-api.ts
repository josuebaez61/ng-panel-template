import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../config/api.config';
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
} from '../../models/auth-models';
import { ApiResponse } from '../../models/api-response-models';
import { StorageService } from '../storage-service';

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
   * Register a new user
   */
  public register(request: RegisterRequest): Observable<ApiResponse<AuthData>> {
    return this.http.post<ApiResponse<AuthData>>(
      `${this.baseUrl}${API_CONFIG.ENDPOINTS.AUTH.REGISTER}`,
      request
    );
  }

  /**
   * Refresh authentication token
   */
  public refreshAuthToken(refreshToken: string): Observable<ApiResponse<AuthData>> {
    return this.http.post<ApiResponse<AuthData>>(
      `${this.baseUrl}${API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN}`,
      { refreshToken }
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
}
