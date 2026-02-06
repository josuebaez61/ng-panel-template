import { ChangeDetectionStrategy, Component, computed, contentChild } from '@angular/core';
import { NgControl, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-form-field-container',
  imports: [TranslateModule],
  templateUrl: './form-field-container.html',
  styleUrl: './form-field-container.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldContainer {
  public ngControl = contentChild<NgControl>(NgControl);
  public controlIsRequired = computed(() => {
    return this.ngControl()?.control?.hasValidator(Validators.required);
  });
}
