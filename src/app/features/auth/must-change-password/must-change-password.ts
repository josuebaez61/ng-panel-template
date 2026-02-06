import { Component, inject, signal, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/modules';
import { RoutePath } from '@core/constants';
import { Auth } from '@shared/layouts/auth/auth';
import { AuthApi } from '@core/services';
import { ChangePasswordRequest } from '@core/models';
import { Router } from '@angular/router';
import { NewPasswordForm } from '@shared/components/templates/new-password-form/new-password-form';

@Component({
  selector: 'app-must-change-password',
  imports: [TranslateModule, ReactiveFormsModule, SharedModule, Auth, NewPasswordForm],
  templateUrl: './must-change-password.html',
  styleUrl: './must-change-password.scss',
})
export class MustChangePassword {
  private readonly router = inject(Router);
  private readonly authApi = inject(AuthApi);
  public loading = signal(false);

  @ViewChild(NewPasswordForm)
  public passwordFormComponent!: NewPasswordForm;

  public onSubmit() {
    if (this.passwordFormComponent.form.invalid) {
      this.passwordFormComponent.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.authApi
      .changePassword(this.passwordFormComponent.form.value as ChangePasswordRequest)
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate([RoutePath.HOME]);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }
}
