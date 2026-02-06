import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-new-password-requirements',
  imports: [TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul class="pl-2 my-0 leading-normal">
      <li>{{ 'password.atLeastOneLowercase' | translate }}</li>
      <li>{{ 'password.atLeastOneUppercase' | translate }}</li>
      <li>{{ 'password.atLeastOneNumeric' | translate }}</li>
      <li>{{ 'password.minimum8Characters' | translate }}</li>
    </ul>
  `,
  styles: ``,
})
export class NewPasswordRequirements {}
