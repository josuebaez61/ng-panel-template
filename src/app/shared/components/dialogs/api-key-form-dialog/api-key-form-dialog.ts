import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SharedModule } from '@shared/modules';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ApiKeysApi } from '@core/services';
import { ApiKeyFormDialogData, CreateApiKeyRequest, UpdateApiKeyRequest } from '@core/models';
import { DialogActions } from '@shared/directives';
import { FormFieldContainer } from '@shared/components/ui/form-field-container/form-field-container';
import { FormFieldError } from '@shared/components/ui/form-field-error/form-field-error';

@Component({
  selector: 'app-api-key-form-dialog',
  imports: [FormFieldContainer, FormFieldError, SharedModule, ReactiveFormsModule, DialogActions],
  templateUrl: './api-key-form-dialog.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApiKeyFormDialog {
  private readonly apiKeysService = inject(ApiKeysApi);
  public readonly form = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(100),
    ]),
    description: new FormControl('', [Validators.maxLength(500)]),
  });

  public dialogRef = inject(DynamicDialogRef<ApiKeyFormDialog>);
  public dialogConfig = inject(DynamicDialogConfig<ApiKeyFormDialogData>);

  constructor() {
    const apiKey = this.dialogConfig.data?.apiKey;
    if (apiKey) {
      this.form.patchValue({
        name: apiKey.name,
        description: apiKey.description || '',
      });
    }
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const apiKey = this.dialogConfig.data?.apiKey;
    if (apiKey) {
      this.apiKeysService
        .updateApiKey(apiKey.id, this.form.value as UpdateApiKeyRequest)
        .subscribe({
          next: (res) => {
            this.dialogRef.close(res);
          },
          error: () => {
            this.dialogRef.close(false);
          },
        });
    } else {
      this.apiKeysService.createApiKey(this.form.value as CreateApiKeyRequest).subscribe({
        next: (res) => {
          this.dialogRef.close(res);
        },
        error: () => {
          this.dialogRef.close(false);
        },
      });
    }
  }
}
