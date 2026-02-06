import { Component, inject } from '@angular/core';
import { SharedModule } from '@shared/modules';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { RoutePath } from '@core/constants';
import { Auth } from '@shared/layouts/auth/auth';
import { AuthApi } from '@core/services';
import { PasswordResetRequest } from '@core/models';
import { FormFieldContainer } from '@shared/components/ui/form-field-container/form-field-container';
import { FormFieldError } from '@shared/components/ui/form-field-error/form-field-error';

@Component({
  selector: 'app-forgot-password',
  imports: [
    SharedModule,
    ReactiveFormsModule,
    TranslateModule,
    Auth,
    FormFieldContainer,
    FormFieldError,
  ],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPassword {
  private readonly router = inject(Router);
  private readonly authApi = inject(AuthApi);

  public backRoute = RoutePath.LOGIN;

  public forgotPasswordForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  public isLoading = false;

  public onSubmit() {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.authApi
      .requestPasswordReset(this.forgotPasswordForm.value as PasswordResetRequest)
      .subscribe({
        next: () => {
          this.router.navigate([RoutePath.RESET_PASSWORD]);
        },
      });
  }
}
