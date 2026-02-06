import { ChangeDetectionStrategy, Component, effect, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@shared/modules';
import { Password } from 'primeng/password';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NewPasswordRequirements } from '@shared/components/password/new-password-requirements/new-password-requirements';
import { CustomValidators } from '@shared/utils/custom-validators';
import { FormFieldContainer } from '@shared/components/ui/form-field-container/form-field-container';
import { FormFieldError } from '@shared/components/ui/form-field-error/form-field-error';
import { FormFieldHint } from '@shared/components/ui/form-field-hint/form-field-hint';

@Component({
  selector: 'app-new-password-form',
  imports: [
    TranslateModule,
    SharedModule,
    Password,
    NewPasswordRequirements,
    FormsModule,
    ReactiveFormsModule,
    FormFieldContainer,
    FormFieldError,
    FormFieldHint,
  ],
  templateUrl: './new-password-form.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewPasswordForm {
  public form = new FormGroup<{
    currentPassword?: FormControl<string | null>;
    newPassword: FormControl<string | null>;
    confirmPassword: FormControl<string | null>;
  }>(
    {
      newPassword: new FormControl<string | null>('', [
        Validators.required,
        CustomValidators.password,
      ]),
      confirmPassword: new FormControl<string | null>('', [Validators.required]),
    },
    {
      validators: [CustomValidators.passwordMatch('newPassword', 'confirmPassword')],
    }
  );

  public requireCurrentPassword = input<boolean>(false);
  public currentPasswordHint = input<string | null>(null);
  public newPasswordHint = input<string | null>(null);
  public confirmPasswordHint = input<string | null>(null);

  constructor() {
    effect(() => {
      if (this.requireCurrentPassword()) {
        this.form.addControl('currentPassword', new FormControl('', [Validators.required]));
      } else {
        this.form.removeControl('currentPassword');
      }
    });
  }
}
