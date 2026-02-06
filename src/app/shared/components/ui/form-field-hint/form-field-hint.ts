import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Message } from 'primeng/message';

@Component({
  selector: 'app-form-field-hint',
  imports: [Message],
  templateUrl: './form-field-hint.html',
  styleUrl: './form-field-hint.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldHint {}
