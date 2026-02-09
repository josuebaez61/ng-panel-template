import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';

import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { SharedModule } from '@shared/modules';
import { RouterLink } from '@angular/router';
import { RoutePath } from '@core/constants';
import { Auth } from '@shared/layouts/auth/auth';
import { AuthState } from '@core/services';
import { FormFieldContainer } from '@shared/components/ui/form-field-container/form-field-container';
import { FormFieldError } from '@shared/components/ui/form-field-error/form-field-error';
@Component({
  selector: 'app-login',
  imports: [
    SharedModule,
    ReactiveFormsModule,
    TranslateModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CheckboxModule,
    ToastModule,
    RouterLink,
    Auth,
    FormFieldContainer,
    FormFieldError
],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login implements OnInit {
  public loginForm!: FormGroup;
  public isLoading = signal(false);
  private readonly authState = inject(AuthState);

  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly translate = inject(TranslateService);

  public passwordVisible = signal(false);

  public readonly forgotPasswordRoutePath = RoutePath.FORGOT_PASSWORD;

  public ngOnInit(): void {
    this.loginForm = this.fb.group({
      usernameOrEmail: ['', [Validators.required]],
      password: ['', [Validators.required]],
      rememberMe: [false],
    });
  }

  public onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const { password, usernameOrEmail } = this.loginForm.value;
    this.authState.login({ password, usernameOrEmail }).subscribe({
      next: () => {
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  public loginWithGoogle(): void {
    this.messageService.add({
      severity: 'info',
      summary: this.translate.instant('auth.login.google'),
      detail: this.translate.instant('auth.common.info'),
    });
  }

  public loginWithMicrosoft(): void {
    this.messageService.add({
      severity: 'info',
      summary: this.translate.instant('auth.login.microsoft'),
      detail: this.translate.instant('auth.common.info'),
    });
  }
}
