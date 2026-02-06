import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
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
} from '../models/auth-models';
import { ApiResponse } from '../models/api-response-models';
import { AuthState } from './auth/auth-state';

/**
 * AuthService - Wrapper service that delegates to AuthState
 * This maintains backward compatibility while the codebase migrates to use AuthState directly
 * @deprecated Use AuthState directly instead
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authState = inject(AuthState);

  // Expose computed signals
  public currentUser = this.authState.currentUser;
  public isAuthenticated = this.authState.isAuthenticated;
  public token = this.authState.token;
  public refreshToken = this.authState.refreshToken;
  public loggingIn = this.authState.loggingIn;

  public login(request: LoginRequest): Observable<ApiResponse<AuthData>> {
    return this.authState.login(request);
  }

  public register(request: RegisterRequest): Observable<ApiResponse<AuthData>> {
    return this.authState.register(request);
  }

  public refreshAuthToken(): Observable<ApiResponse<AuthData>> {
    return this.authState.refreshAuthToken();
  }

  public getCurrentUser(): Observable<CurrentUserResponse> {
    return this.authState.getCurrentUser();
  }

  public changePassword(request: ChangePasswordRequest): Observable<any> {
    return this.authState.changePassword(request);
  }

  public requestEmailChange(request: EmailChangeRequest): Observable<any> {
    return this.authState.requestEmailChange(request);
  }

  public verifyEmailChange(request: EmailVerificationRequest): Observable<any> {
    return this.authState.verifyEmailChange(request);
  }

  public requestPasswordReset(request: PasswordResetRequest): Observable<any> {
    return this.authState.requestPasswordReset(request);
  }

  public resetPassword(request: ResetPasswordRequest): Observable<any> {
    return this.authState.resetPassword(request);
  }

  public logout(): void {
    this.authState.logout();
  }

  public isTokenExpired(): boolean {
    return this.authState.isTokenExpired();
  }

  public isTokenCloseToExpiring(thresholdSeconds = 60): boolean {
    return this.authState.isTokenCloseToExpiring(thresholdSeconds);
  }

  public hydrateUserData(): void {
    this.authState.hydrateUserData();
  }
}
