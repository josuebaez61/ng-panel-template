import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { AuthUser } from '@core/models';
import { DialogService } from '@core/services';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-account-info',
  standalone: true,
  imports: [TranslateModule, ButtonModule, PanelModule, TooltipModule],
  templateUrl: './account-info.html',
  styleUrl: './account-info.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountInfo {
  private readonly dialogService = inject(DialogService);

  // Input signal for the current user
  public user = input.required<AuthUser | null>();

  public openChangePasswordDialog(): void {
    this.dialogService.openChangePasswordDialog();
  }

  public openChangeEmailDialog(): void {
    this.dialogService.openChangeEmailDialog();
  }
}
