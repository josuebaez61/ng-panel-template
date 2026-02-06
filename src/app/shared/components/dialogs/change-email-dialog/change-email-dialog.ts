import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmailChangeRequest, EmailVerificationRequest } from '@core/models';
import { AuthApi } from '@core/services';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@shared/modules';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormFieldContainer } from '@shared/components/ui/form-field-container/form-field-container';
import { FormFieldError } from '@shared/components/ui/form-field-error/form-field-error';
import { mergeMap } from 'rxjs';
import { FormFieldHint } from '@shared/components/ui/form-field-hint/form-field-hint';

@Component({
  selector: 'app-change-email-dialog',
  imports: [
    ReactiveFormsModule,
    TranslateModule,
    SharedModule,
    FormFieldContainer,
    FormFieldError,
    FormFieldHint,
  ],
  templateUrl: './change-email-dialog.html',
  styles: ``,
})
export class ChangeEmailDialog {
  private readonly authApi = inject(AuthApi);
  private readonly dialogRef = inject(DynamicDialogRef<ChangeEmailDialog>);
  public step = signal<'request' | 'verify'>('request');
  public isLoading = signal(false);

  public requestForm = new FormGroup({
    newEmail: new FormControl('', [
      Validators.required,
      Validators.email,
      Validators.maxLength(200),
    ]),
  });

  public verifyForm = new FormGroup({
    verificationCode: new FormControl('', [Validators.required]),
  });

  public onSubmit(): void {
    if (this.step() === 'request') {
      this.onRequest();
    } else {
      this.onVerify();
    }
  }

  public resetSteps(): void {
    this.step.set('request');
    this.requestForm.reset();
    this.verifyForm.reset();
  }

  public onRequest(): void {
    if (this.requestForm.invalid) {
      this.requestForm.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    this.authApi.requestEmailChange(this.requestForm.value as EmailChangeRequest).subscribe({
      next: () => {
        this.step.set('verify');
      },
      error: () => {
        this.requestForm.markAllAsTouched();
        this.isLoading.set(false);
      },
      complete: () => {
        this.isLoading.set(false);
      },
    });
  }

  public onVerify(): void {
    if (this.verifyForm.invalid) {
      this.verifyForm.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    this.authApi
      .verifyEmailChange(this.verifyForm.value as EmailVerificationRequest)
      .pipe(mergeMap(() => this.authApi.getCurrentUser()))
      .subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: () => {
          this.verifyForm.markAllAsTouched();
          this.isLoading.set(false);
        },
        complete: () => {
          this.isLoading.set(false);
        },
      });
  }

  public onCancel(): void {
    this.dialogRef.close(false);
  }

  public onResend(): void {
    this.step.set('request');
    this.requestForm.reset();
    this.verifyForm.reset();
  }
}
