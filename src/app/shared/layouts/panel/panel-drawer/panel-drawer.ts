import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { DrawerModule } from 'primeng/drawer';
import { AvatarModule } from 'primeng/avatar';
import { SharedModule } from '@shared/modules';
import { AuthState, ThemeService } from '@core/services';
import { RoutePath } from '@core/constants';
import { PanelMenuModule } from 'primeng/panelmenu';
import { MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { UserAvatar } from '@shared/components/user/user-avatar/user-avatar';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { PANEL_NAVIGATION_MENU_TOKEN, providePanelNavigationMenu } from '@core/providers';

@Component({
  selector: 'app-panel-drawer',
  imports: [
    DrawerModule,
    AvatarModule,
    BadgeModule,
    SharedModule,
    PanelMenuModule,
    MenuModule,
    UserAvatar,
    RouterLink,
    RouterLinkActive,
  ],
  providers: [providePanelNavigationMenu()],
  templateUrl: './panel-drawer.html',
  styleUrl: './panel-drawer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelDrawer {
  private readonly theme = inject(ThemeService);
  private readonly authState = inject(AuthState);

  public isDark = computed(() => this.theme.isDark());

  public user = computed(() => this.authState.currentUser());
  public userName = computed(() => this.user()?.username);
  public drawerVisible = input<boolean>(true);
  public drawerVisibleChange = output<boolean>();
  public drawerWidth = input<string>('200px');
  public modal = input<boolean>(false);

  public accountRoute = RoutePath.ACCOUNT;

  public closeCallback = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    this.drawerVisibleChange.emit(false);
  };

  public menuItems$ = inject(PANEL_NAVIGATION_MENU_TOKEN);
}
