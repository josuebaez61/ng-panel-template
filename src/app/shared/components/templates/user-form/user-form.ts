import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { InputText } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MessageModule } from 'primeng/message';
import { FormFieldContainer } from '@shared/components/ui/form-field-container/form-field-container';
import { FormFieldError } from '@shared/components/ui/form-field-error/form-field-error';

@Component({
  selector: 'app-user-form',
  imports: [
    ReactiveFormsModule,
    FormFieldContainer,
    FloatLabelModule,
    TranslateModule,
    InputText,
    MessageModule,
    FormFieldError,
  ],
  templateUrl: './user-form.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserForm {
  public form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email, Validators.maxLength(200)]),
    username: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(100),
    ]),
  });
}
