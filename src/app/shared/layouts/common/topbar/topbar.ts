import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthState } from '@core/services';
import { ThemeButton } from '@shared/components/theme/theme-button/theme-button';
import { SharedModule } from '@shared/modules';
import { ToolbarModule } from 'primeng/toolbar';
import { UserMenu } from '@shared/components/user/user-menu/user-menu';
import { UserNotificationsButton } from '@shared/components/user/user-notifications-button/user-notifications-button';
import { LangMenu } from '@shared/components/language/lang-menu/lang-menu';

@Component({
  selector: 'app-topbar',
  imports: [
    SharedModule,
    ToolbarModule,
    ThemeButton,
    RouterLink,
    UserMenu,
    UserNotificationsButton,
    LangMenu,
  ],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Topbar {
  private readonly authState = inject(AuthState);

  public toggleSidenav = output<void>();
  public backRoute = input<string | null>(null);
  public showSidenavToggleButton = input<boolean>(false);

  public isAuthenticated = computed(() => this.authState.isAuthenticated());
}
