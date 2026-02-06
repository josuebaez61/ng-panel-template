import { ChangeDetectionStrategy, Component, inject, signal, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SharedModule } from '@shared/modules';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { RoutePath } from '@core/constants';
import { Auth } from '@shared/layouts/auth/auth';
import { AuthApi } from '@core/services';
import { Router } from '@angular/router';
import { NewPasswordForm } from '@shared/components/templates/new-password-form/new-password-form';
import { FormFieldContainer } from '@shared/components/ui/form-field-container/form-field-container';
import { FormFieldError } from '@shared/components/ui/form-field-error/form-field-error';
import { FormFieldHint } from '@shared/components/ui/form-field-hint/form-field-hint';

@Component({
  selector: 'app-reset-password',
  imports: [
    SharedModule,
    TranslateModule,
    ReactiveFormsModule,
    ToastModule,
    Auth,
    NewPasswordForm,
    FormFieldContainer,
    FormFieldError,
    FormFieldHint,
  ],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPassword {
  public isLoading = signal(false);
  private readonly authApi = inject(AuthApi);
  @ViewChild(NewPasswordForm)
  public resetPasswordFormComponent!: NewPasswordForm;

  public codeForm = new FormGroup({
    code: new FormControl<string | null>(null, [Validators.required]),
  });
  public readonly backRoute = RoutePath.FORGOT_PASSWORD;

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  public onSubmit() {
    if (this.resetPasswordFormComponent.form.invalid || this.codeForm.invalid) {
      this.codeForm.markAllAsTouched();
      this.resetPasswordFormComponent.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const payload = {
      code: this.codeForm.value.code || '',
      newPassword: this.resetPasswordFormComponent.form.value.newPassword || '',
    };
    this.authApi.resetPassword(payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate([RoutePath.LOGIN]);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }
}
