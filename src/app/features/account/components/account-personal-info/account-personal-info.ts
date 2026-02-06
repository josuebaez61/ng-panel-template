import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { AuthUser, UpdatePersonRequest } from '@core/models';
import { DialogService, UsersApi } from '@core/services';
import { TranslateModule } from '@ngx-translate/core';
import { UserAvatar } from '@shared/components/user/user-avatar/user-avatar';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { of, switchMap } from 'rxjs';

@Component({
  selector: 'app-account-personal-info',
  standalone: true,
  imports: [UserAvatar, TranslateModule, ButtonModule, PanelModule],
  templateUrl: './account-personal-info.html',
  styleUrl: './account-personal-info.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountPersonalInfo {
  // Input signal for the current user
  public user = input.required<AuthUser | null>();

  public dialogService = inject(DialogService);
  public readonly usersApi = inject(UsersApi);

  public openPersonalInfoDialog(): void {
    this.dialogService
      .openPersonFormDialog(this.user()!, this.user()?.person || undefined)
      ?.onClose.pipe(
        switchMap((data) =>
          data ? this.usersApi.updateCurrentUserPerson(data as UpdatePersonRequest) : of(null)
        )
      )
      .subscribe();
  }
}
