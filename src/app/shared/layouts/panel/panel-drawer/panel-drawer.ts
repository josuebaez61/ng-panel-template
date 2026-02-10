import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DrawerModule } from 'primeng/drawer';
import { AvatarModule } from 'primeng/avatar';
import { SharedModule } from '@shared/modules';
import { AuthState, ThemeService } from '@core/services';
import { PanelDrawerState } from '@core/services/panel/panel-drawer-state';
import { RoutePath } from '@core/constants';
import { PanelMenuModule } from 'primeng/panelmenu';
import { MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
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
  private readonly drawerState = inject(PanelDrawerState);

  public isDark = computed(() => this.theme.isDark());

  public user = computed(() => this.authState.currentUser());
  public userName = computed(() => this.user()?.username);

  // Use drawer state from service - the computed signal will automatically react to changes
  public drawerVisible = computed(() => this.drawerState.isOpen());

  public modal = input<boolean>(false);

  public accountRoute = RoutePath.ACCOUNT;

  public closeCallback = (e: Event): void => {
    e.preventDefault();
    e.stopPropagation();
    this.drawerState.close();
  };

  public onVisibleChange(visible: boolean): void {
    if (visible) {
      this.drawerState.open();
    } else {
      this.drawerState.close();
    }
  }

  public menuItems$ = inject(PANEL_NAVIGATION_MENU_TOKEN);
}
