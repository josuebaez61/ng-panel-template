import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-user-notifications-button',
  imports: [Button],
  template: ` <p-button icon="pi pi-bell" text rounded /> `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserNotificationsButton {}
