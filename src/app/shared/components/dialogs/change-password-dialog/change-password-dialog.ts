import { Component, inject, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@shared/modules';
import { Password } from 'primeng/password';
import { NewPasswordRequirements } from '@shared/components/password/new-password-requirements/new-password-requirements';
import {
  FormControl,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { CustomValidators } from '@shared/utils';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { AuthApi } from '@core/services';
import { ChangePasswordRequest } from '@core/models';
import { FormFieldContainer } from '@shared/components/ui/form-field-container/form-field-container';
import { FormFieldError } from '@shared/components/ui/form-field-error/form-field-error';

@Component({
  selector: 'app-change-password-dialog',
  imports: [
    TranslateModule,
    SharedModule,
    Password,
    NewPasswordRequirements,
    FormsModule,
    FormFieldContainer,
    FormFieldError,
    ReactiveFormsModule,
  ],
  templateUrl: './change-password-dialog.html',
  styles: ``,
})
export class ChangePasswordDialog {
  private readonly dialogRef = inject(DynamicDialogRef<ChangePasswordDialog>);
  private readonly authApi = inject(AuthApi);
  public isLoading = signal(false);

  public form = new FormGroup(
    {
      currentPassword: new FormControl('', [Validators.required]),
      newPassword: new FormControl('', [CustomValidators.password]),
      confirmPassword: new FormControl('', [Validators.required]),
    },
    {
      validators: [CustomValidators.passwordMatch('newPassword', 'confirmPassword')],
    }
  );

  public cancel = () => this.dialogRef.close();

  public onSave() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.authApi.changePassword(this.form.value as ChangePasswordRequest).subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: () => {
        this.dialogRef.close(false);
        this.isLoading.set(false);
      },
      complete: () => {
        this.isLoading.set(false);
      },
    });
  }
}
