import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { IfControlErrorDirective } from '@shared/directives';
import { MessageModule } from 'primeng/message';
import { FormErrorMessagePipe } from '@shared/pipes';

@Component({
  selector: 'app-form-field-error',
  templateUrl: './form-field-error.html',
  imports: [IfControlErrorDirective, MessageModule, FormErrorMessagePipe],
  styleUrl: './form-field-error.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldError {
  public control = input.required<AbstractControl>();
}
