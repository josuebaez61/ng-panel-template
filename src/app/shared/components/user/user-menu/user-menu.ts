import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { UserAvatar } from '../user-avatar/user-avatar';
import { MenuModule } from 'primeng/menu';
import { AuthState, LocalizedMenuService } from '@core/services';
import { AsyncPipe, NgClass } from '@angular/common';
import { RippleModule } from 'primeng/ripple';
import { RoutePath } from '@core/constants';
@Component({
  selector: 'app-user-menu',
  imports: [NgClass, AsyncPipe, UserAvatar, MenuModule, RippleModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div #container class="relative">
      <div
        (click)="menu.toggle($event)"
        (keyup.enter)="menu.toggle($event)"
        tabindex="0"
        role="button"
        class="flex items-center"
        [ngClass]="class()"
        pRipple
      >
        <app-user-avatar [size]="3" [user]="user()" />
      </div>
      <p-menu
        #menu
        [model]="(items$ | async) || []"
        [popup]="true"
        [appendTo]="'body'"
        styleClass="fixed! top-12"
        [motionOptions]="{disabled: true}"
      />
    </div>
  `,
  styles: ``,
})
export class UserMenu {
  private readonly localizedMenuService = inject(LocalizedMenuService);
  private readonly authState = inject(AuthState);

  public user = computed(() => this.authState.currentUser());

  public class = input<string>();
  public items$ = this.localizedMenuService.createMenu([
    {
      label: 'userMenu.account',
      icon: 'pi pi-user',
      routerLink: RoutePath.ACCOUNT,
    },
    {
      label: 'userMenu.logout',
      icon: 'fa-solid fa-right-from-bracket',
      command: () => this.authState.logout(),
    },
  ]);
}
